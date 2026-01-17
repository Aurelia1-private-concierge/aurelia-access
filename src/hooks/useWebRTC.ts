import { useState, useCallback, useRef, useEffect } from "react";

export interface PeerConnection {
  peerId: string;
  connection: RTCPeerConnection;
  stream: MediaStream | null;
}

export interface UseWebRTCOptions {
  onRemoteStream?: (peerId: string, stream: MediaStream) => void;
  onPeerDisconnect?: (peerId: string) => void;
  onError?: (error: Error) => void;
}

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export const useWebRTC = (options: UseWebRTCOptions = {}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const getLocalStream = useCallback(async (video = true, audio = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Failed to get local stream:", error);
      options.onError?.(error as Error);
      throw error;
    }
  }, [options]);

  const createPeerConnection = useCallback((peerId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate for", peerId, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log("Remote track received from", peerId);
      const [remoteStream] = event.streams;
      setPeers((prev) => {
        const newPeers = new Map(prev);
        const existing = newPeers.get(peerId);
        if (existing) {
          existing.stream = remoteStream;
        } else {
          newPeers.set(peerId, { peerId, connection: pc, stream: remoteStream });
        }
        return newPeers;
      });
      options.onRemoteStream?.(peerId, remoteStream);
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state for", peerId, pc.connectionState);
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        options.onPeerDisconnect?.(peerId);
        removePeer(peerId);
      }
    };

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnectionsRef.current.set(peerId, pc);
    setPeers((prev) => {
      const newPeers = new Map(prev);
      newPeers.set(peerId, { peerId, connection: pc, stream: null });
      return newPeers;
    });

    return pc;
  }, [localStream, options]);

  const createOffer = useCallback(async (peerId: string): Promise<RTCSessionDescriptionInit> => {
    const pc = peerConnectionsRef.current.get(peerId) || createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }, [createPeerConnection]);

  const createAnswer = useCallback(async (
    peerId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> => {
    const pc = peerConnectionsRef.current.get(peerId) || createPeerConnection(peerId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }, [createPeerConnection]);

  const handleAnswer = useCallback(async (peerId: string, answer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }, []);

  const addIceCandidate = useCallback(async (peerId: string, candidate: RTCIceCandidateInit) => {
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  const removePeer = useCallback((peerId: string) => {
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(peerId);
    }
    setPeers((prev) => {
      const newPeers = new Map(prev);
      newPeers.delete(peerId);
      return newPeers;
    });
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled((prev) => !prev);
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled((prev) => !prev);
    }
  }, [localStream]);

  const cleanup = useCallback(() => {
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    setPeers(new Map());
    
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  }, [localStream]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    localStream,
    peers,
    isAudioEnabled,
    isVideoEnabled,
    getLocalStream,
    createPeerConnection,
    createOffer,
    createAnswer,
    handleAnswer,
    addIceCandidate,
    removePeer,
    toggleAudio,
    toggleVideo,
    cleanup,
  };
};
