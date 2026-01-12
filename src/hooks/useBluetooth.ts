/// <reference path="../types/web-bluetooth.d.ts" />
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

// Standard Bluetooth GATT Service UUIDs
const HEART_RATE_SERVICE = 0x180d;
const HEART_RATE_MEASUREMENT = 0x2a37;
const BATTERY_SERVICE = 0x180f;
const BATTERY_LEVEL = 0x2a19;
const DEVICE_INFORMATION_SERVICE = 0x180a;

export interface ConnectedBluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
  batteryLevel: number | null;
  rssi: number | null;
  services: string[];
  device: BluetoothDevice | null;
}

export interface HealthData {
  heartRate: number | null;
  heartRateVariability: number | null;
  rrIntervals: number[];
  energyExpended: number | null;
  contactDetected: boolean;
  timestamp: Date;
}

export interface BluetoothState {
  isSupported: boolean;
  isScanning: boolean;
  devices: ConnectedBluetoothDevice[];
  connectedDevice: ConnectedBluetoothDevice | null;
  healthData: HealthData | null;
  error: string | null;
}

export function useBluetooth() {
  const [state, setState] = useState<BluetoothState>({
    isSupported: typeof navigator !== "undefined" && "bluetooth" in navigator,
    isScanning: false,
    devices: [],
    connectedDevice: null,
    healthData: null,
    error: null,
  });

  const heartRateCharacteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const serverRef = useRef<BluetoothRemoteGATTServer | null>(null);
  const rrIntervalsBufferRef = useRef<number[]>([]);

  // Calculate HRV from RR intervals (RMSSD method)
  const calculateHRV = useCallback((rrIntervals: number[]): number | null => {
    if (rrIntervals.length < 2) return null;
    
    let sumSquaredDiffs = 0;
    for (let i = 1; i < rrIntervals.length; i++) {
      const diff = rrIntervals[i] - rrIntervals[i - 1];
      sumSquaredDiffs += diff * diff;
    }
    
    return Math.round(Math.sqrt(sumSquaredDiffs / (rrIntervals.length - 1)));
  }, []);

  // Parse heart rate measurement data
  const parseHeartRateData = useCallback((value: DataView): Partial<HealthData> => {
    const flags = value.getUint8(0);
    const is16Bit = (flags & 0x01) !== 0;
    const hasContactStatus = (flags & 0x02) !== 0;
    const contactDetected = hasContactStatus ? (flags & 0x04) !== 0 : true;
    const hasEnergyExpended = (flags & 0x08) !== 0;
    const hasRRIntervals = (flags & 0x10) !== 0;

    let offset = 1;
    
    // Heart rate value
    const heartRate = is16Bit ? value.getUint16(offset, true) : value.getUint8(offset);
    offset += is16Bit ? 2 : 1;

    // Energy expended
    let energyExpended: number | null = null;
    if (hasEnergyExpended) {
      energyExpended = value.getUint16(offset, true);
      offset += 2;
    }

    // RR intervals
    const rrIntervals: number[] = [];
    if (hasRRIntervals) {
      while (offset + 2 <= value.byteLength) {
        const rrInterval = value.getUint16(offset, true);
        // Convert from 1/1024 seconds to milliseconds
        rrIntervals.push(Math.round((rrInterval / 1024) * 1000));
        offset += 2;
      }
    }

    return {
      heartRate,
      contactDetected,
      energyExpended,
      rrIntervals,
    };
  }, []);

  // Handle heart rate notifications
  const handleHeartRateNotification = useCallback((event: Event) => {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    
    if (!value) return;

    const parsed = parseHeartRateData(value);
    
    // Update RR intervals buffer for HRV calculation
    if (parsed.rrIntervals && parsed.rrIntervals.length > 0) {
      rrIntervalsBufferRef.current = [
        ...rrIntervalsBufferRef.current.slice(-30), // Keep last 30 intervals
        ...parsed.rrIntervals,
      ];
    }

    const hrv = calculateHRV(rrIntervalsBufferRef.current);

    setState((prev) => ({
      ...prev,
      healthData: {
        heartRate: parsed.heartRate ?? null,
        heartRateVariability: hrv,
        rrIntervals: rrIntervalsBufferRef.current.slice(-10),
        energyExpended: parsed.energyExpended ?? prev.healthData?.energyExpended ?? null,
        contactDetected: parsed.contactDetected ?? true,
        timestamp: new Date(),
      },
    }));
  }, [parseHeartRateData, calculateHRV]);

  // Read battery level
  const readBatteryLevel = useCallback(async (server: BluetoothRemoteGATTServer): Promise<number | null> => {
    try {
      const batteryService = await server.getPrimaryService(BATTERY_SERVICE);
      const batteryChar = await batteryService.getCharacteristic(BATTERY_LEVEL);
      const value = await batteryChar.readValue();
      return value.getUint8(0);
    } catch {
      return null;
    }
  }, []);

  // Scan and connect to a heart rate device
  const scanAndConnect = useCallback(async () => {
    if (!state.isSupported) {
      toast.error("Bluetooth not supported", {
        description: "Your browser doesn't support Web Bluetooth",
      });
      return;
    }

    setState((prev) => ({ ...prev, isScanning: true, error: null }));

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [HEART_RATE_SERVICE] },
          { namePrefix: "Polar" },
          { namePrefix: "Garmin" },
          { namePrefix: "Wahoo" },
          { namePrefix: "WHOOP" },
          { namePrefix: "Oura" },
        ],
        optionalServices: [BATTERY_SERVICE, DEVICE_INFORMATION_SERVICE],
      });

      if (!device) {
        setState((prev) => ({ ...prev, isScanning: false }));
        return;
      }

      toast.info(`Connecting to ${device.name || "device"}...`);

      // Connect to GATT server
      const server = await device.gatt!.connect();
      serverRef.current = server;

      // Get heart rate service
      const heartRateService = await server.getPrimaryService(HEART_RATE_SERVICE);
      const heartRateChar = await heartRateService.getCharacteristic(HEART_RATE_MEASUREMENT);
      heartRateCharacteristicRef.current = heartRateChar;

      // Start notifications
      await heartRateChar.startNotifications();
      heartRateChar.addEventListener("characteristicvaluechanged", handleHeartRateNotification);

      // Read battery level
      const batteryLevel = await readBatteryLevel(server);

      const connectedDeviceInfo: ConnectedBluetoothDevice = {
        id: device.id,
        name: device.name || "Unknown Device",
        connected: true,
        batteryLevel,
        rssi: null,
        services: ["Heart Rate"],
        device,
      };

      // Handle disconnection
      device.addEventListener("gattserverdisconnected", () => {
        toast.warning(`${device.name || "Device"} disconnected`);
        setState((prev) => ({
          ...prev,
          connectedDevice: null,
          healthData: null,
        }));
        heartRateCharacteristicRef.current = null;
        serverRef.current = null;
        rrIntervalsBufferRef.current = [];
      });

      setState((prev) => ({
        ...prev,
        isScanning: false,
        connectedDevice: connectedDeviceInfo,
        devices: [...prev.devices.filter((d) => d.id !== device.id), connectedDeviceInfo],
      }));

      toast.success(`Connected to ${device.name}`, {
        description: "Real-time health data streaming",
      });
    } catch (error: any) {
      console.error("Bluetooth error:", error);
      
      let errorMessage = "Failed to connect";
      if (error.name === "NotFoundError") {
        errorMessage = "No devices found or selection cancelled";
      } else if (error.name === "SecurityError") {
        errorMessage = "Bluetooth access denied";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Device doesn't support required services";
      }

      setState((prev) => ({
        ...prev,
        isScanning: false,
        error: errorMessage,
      }));

      if (error.name !== "NotFoundError") {
        toast.error(errorMessage);
      }
    }
  }, [state.isSupported, handleHeartRateNotification, readBatteryLevel]);

  // Disconnect from device
  const disconnect = useCallback(async () => {
    if (heartRateCharacteristicRef.current) {
      try {
        await heartRateCharacteristicRef.current.stopNotifications();
        heartRateCharacteristicRef.current.removeEventListener(
          "characteristicvaluechanged",
          handleHeartRateNotification
        );
      } catch (error) {
        console.error("Error stopping notifications:", error);
      }
    }

    if (serverRef.current?.connected) {
      serverRef.current.disconnect();
    }

    setState((prev) => ({
      ...prev,
      connectedDevice: null,
      healthData: null,
    }));

    heartRateCharacteristicRef.current = null;
    serverRef.current = null;
    rrIntervalsBufferRef.current = [];

    toast.info("Device disconnected");
  }, [handleHeartRateNotification]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (serverRef.current?.connected) {
        serverRef.current.disconnect();
      }
    };
  }, []);

  return {
    ...state,
    scanAndConnect,
    disconnect,
  };
}
