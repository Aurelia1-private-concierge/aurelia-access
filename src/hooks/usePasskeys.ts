/**
 * Hook for WebAuthn/Passkey authentication
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PasskeyCredential {
  id: string;
  credential_id: string;
  device_type: string | null;
  device_name: string | null;
  created_at: string;
  last_used_at: string | null;
  backed_up: boolean;
}

// Helper to convert ArrayBuffer to base64url
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Helper to convert base64url to ArrayBuffer
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export const usePasskeys = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<PasskeyCredential[]>([]);

  // Check if WebAuthn is supported
  const isSupported = typeof window !== "undefined" && 
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === "function";

  // Fetch user's passkeys
  const fetchPasskeys = useCallback(async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from("passkey_credentials")
      .select("id, credential_id, device_type, device_name, created_at, last_used_at, backed_up")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching passkeys:", error);
      return [];
    }
    
    setCredentials(data || []);
    return data || [];
  }, [user]);

  // Register a new passkey
  const registerPasskey = useCallback(async (deviceName?: string): Promise<boolean> => {
    if (!user || !isSupported) {
      toast.error("Passkeys are not supported on this device");
      return false;
    }

    setIsLoading(true);
    try {
      // Generate challenge
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = new TextEncoder().encode(user.id);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Aurelia Private Concierge",
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: user.email || "User",
          displayName: user.email?.split("@")[0] || "User",
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },   // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "preferred",
          residentKey: "preferred",
        },
        timeout: 60000,
        attestation: "none",
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error("Failed to create credential");
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      
      // Extract public key
      const publicKeyBuffer = response.getPublicKey?.();
      if (!publicKeyBuffer) {
        throw new Error("Failed to get public key");
      }

      // Detect device type
      const transports = response.getTransports?.() || [];
      let deviceType = "unknown";
      if (transports.includes("internal")) {
        deviceType = "platform";
      } else if (transports.includes("usb")) {
        deviceType = "usb";
      } else if (transports.includes("nfc")) {
        deviceType = "nfc";
      } else if (transports.includes("ble")) {
        deviceType = "bluetooth";
      }

      // Store credential
      const { error } = await supabase.from("passkey_credentials").insert({
        user_id: user.id,
        credential_id: bufferToBase64url(credential.rawId),
        public_key: bufferToBase64url(publicKeyBuffer),
        counter: 0,
        device_type: deviceType,
        device_name: deviceName || `${deviceType} authenticator`,
        transports,
        backed_up: false,
      });

      if (error) throw error;

      toast.success("Passkey registered successfully");
      await fetchPasskeys();
      return true;
    } catch (error) {
      console.error("Passkey registration error:", error);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          toast.error("Passkey registration was cancelled");
        } else if (error.name === "InvalidStateError") {
          toast.error("A passkey already exists for this device");
        } else {
          toast.error(`Failed to register passkey: ${error.message}`);
        }
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, fetchPasskeys]);

  // Authenticate with passkey
  const authenticateWithPasskey = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error("Passkeys are not supported on this device");
      return false;
    }

    setIsLoading(true);
    try {
      // Get available credentials for this RP
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname,
        userVerification: "preferred",
        timeout: 60000,
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error("Authentication cancelled");
      }

      const credentialId = bufferToBase64url(credential.rawId);

      // Verify credential exists in database
      const { data: storedCred, error } = await supabase
        .from("passkey_credentials")
        .select("id, user_id, counter")
        .eq("credential_id", credentialId)
        .single();

      if (error || !storedCred) {
        toast.error("Passkey not recognized. Please use a registered passkey.");
        return false;
      }

      // Update last used timestamp
      await supabase
        .from("passkey_credentials")
        .update({ 
          last_used_at: new Date().toISOString(),
          counter: storedCred.counter + 1,
        })
        .eq("id", storedCred.id);

      toast.success("Authenticated with passkey");
      return true;
    } catch (error) {
      console.error("Passkey authentication error:", error);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          toast.error("Passkey authentication was cancelled");
        } else {
          toast.error(`Authentication failed: ${error.message}`);
        }
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Delete a passkey
  const deletePasskey = useCallback(async (credentialId: string): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("passkey_credentials")
        .delete()
        .eq("id", credentialId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Passkey removed");
      await fetchPasskeys();
      return true;
    } catch (error) {
      console.error("Delete passkey error:", error);
      toast.error("Failed to remove passkey");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchPasskeys]);

  // Rename a passkey
  const renamePasskey = useCallback(async (credentialId: string, newName: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("passkey_credentials")
        .update({ device_name: newName })
        .eq("id", credentialId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Passkey renamed");
      await fetchPasskeys();
      return true;
    } catch (error) {
      console.error("Rename passkey error:", error);
      toast.error("Failed to rename passkey");
      return false;
    }
  }, [user, fetchPasskeys]);

  return {
    isSupported,
    isLoading,
    credentials,
    fetchPasskeys,
    registerPasskey,
    authenticateWithPasskey,
    deletePasskey,
    renamePasskey,
  };
};

export default usePasskeys;
