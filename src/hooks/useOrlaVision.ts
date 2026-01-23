import { useState, useEffect, useRef, useCallback } from "react";
import { useFaceTracking, FaceData } from "./useFaceTracking";

export interface GestureData {
  gesture: "none" | "wave" | "thumbs_up" | "thumbs_down" | "peace" | "pointing" | "open_palm" | "fist";
  confidence: number;
  handPosition: { x: number; y: number } | null;
}

export interface PresenceData {
  isPresent: boolean;
  isLookingAtScreen: boolean;
  attentionLevel: number; // 0-1
  distanceFromScreen: "close" | "medium" | "far" | "unknown";
  lastSeenAt: Date | null;
  sessionDuration: number; // seconds
}

export interface EmotionData {
  primary: "neutral" | "happy" | "sad" | "surprised" | "angry" | "fearful" | "disgusted";
  confidence: number;
  valence: number; // -1 to 1 (negative to positive)
  arousal: number; // 0 to 1 (calm to excited)
  secondaryEmotions: Array<{ emotion: string; confidence: number }>;
}

export interface OrlaVisionState {
  faceData: FaceData;
  gestureData: GestureData;
  presenceData: PresenceData;
  emotionData: EmotionData;
  isVisionEnabled: boolean;
  isProcessing: boolean;
  capabilities: {
    faceTracking: boolean;
    gestureRecognition: boolean;
    emotionDetection: boolean;
    presenceAwareness: boolean;
  };
}

const DEFAULT_GESTURE: GestureData = {
  gesture: "none",
  confidence: 0,
  handPosition: null,
};

const DEFAULT_PRESENCE: PresenceData = {
  isPresent: false,
  isLookingAtScreen: false,
  attentionLevel: 0,
  distanceFromScreen: "unknown",
  lastSeenAt: null,
  sessionDuration: 0,
};

const DEFAULT_EMOTION: EmotionData = {
  primary: "neutral",
  confidence: 0,
  valence: 0,
  arousal: 0.5,
  secondaryEmotions: [],
};

export const useOrlaVision = (enabled: boolean = false) => {
  const { faceData, isInitialized, isLoading, error, cameraActive, startCamera, stopCamera } = useFaceTracking(enabled);
  
  const [gestureData, setGestureData] = useState<GestureData>(DEFAULT_GESTURE);
  const [presenceData, setPresenceData] = useState<PresenceData>(DEFAULT_PRESENCE);
  const [emotionData, setEmotionData] = useState<EmotionData>(DEFAULT_EMOTION);
  const [isVisionEnabled, setIsVisionEnabled] = useState(enabled);
  
  const sessionStartRef = useRef<Date | null>(null);
  const lastFaceSeenRef = useRef<Date | null>(null);
  const emotionHistoryRef = useRef<EmotionData[]>([]);
  const gestureHistoryRef = useRef<string[]>([]);

  // Analyze face data for emotions
  const analyzeEmotion = useCallback((face: FaceData): EmotionData => {
    if (!face.faceDetected) {
      return DEFAULT_EMOTION;
    }

    // Emotion detection based on facial features
    const mouthSmile = face.mouthWidth > 0.6;
    const mouthOpen = face.mouthOpenness > 0.3;
    const eyebrowsRaised = (face.leftEyebrowRaise + face.rightEyebrowRaise) / 2 > 0.6;
    const eyebrowsFurrowed = (face.leftEyebrowRaise + face.rightEyebrowRaise) / 2 < 0.35;
    const eyesWide = (face.leftEyeOpenness + face.rightEyeOpenness) / 2 > 0.85;
    const eyesSquinted = (face.leftEyeOpenness + face.rightEyeOpenness) / 2 < 0.5;

    let primary: EmotionData["primary"] = "neutral";
    let valence = 0;
    let arousal = 0.5;
    let confidence = face.confidence;
    const secondaryEmotions: Array<{ emotion: string; confidence: number }> = [];

    // Happy detection
    if (mouthSmile && !eyebrowsFurrowed) {
      primary = "happy";
      valence = 0.7 + (face.mouthWidth - 0.6) * 0.5;
      arousal = 0.6;
      confidence = Math.min(1, face.mouthWidth * 1.2);
    }
    // Surprised detection
    else if (eyebrowsRaised && mouthOpen && eyesWide) {
      primary = "surprised";
      valence = 0.1;
      arousal = 0.9;
      confidence = Math.min(1, (eyebrowsRaised ? 0.5 : 0) + (mouthOpen ? 0.3 : 0) + (eyesWide ? 0.2 : 0));
    }
    // Angry detection
    else if (eyebrowsFurrowed && !mouthSmile) {
      primary = "angry";
      valence = -0.6;
      arousal = 0.7;
      confidence = 0.7;
      secondaryEmotions.push({ emotion: "frustrated", confidence: 0.5 });
    }
    // Sad detection
    else if (!mouthSmile && !eyebrowsRaised && eyesSquinted) {
      primary = "sad";
      valence = -0.5;
      arousal = 0.3;
      confidence = 0.6;
    }
    // Neutral with variations
    else {
      primary = "neutral";
      valence = face.isSmiling ? 0.2 : 0;
      arousal = face.isTalking ? 0.6 : 0.4;
      
      // Add subtle secondary emotions
      if (eyebrowsRaised) {
        secondaryEmotions.push({ emotion: "curious", confidence: 0.4 });
      }
      if (face.isTalking) {
        secondaryEmotions.push({ emotion: "engaged", confidence: 0.5 });
      }
    }

    return {
      primary,
      confidence,
      valence: Math.max(-1, Math.min(1, valence)),
      arousal: Math.max(0, Math.min(1, arousal)),
      secondaryEmotions,
    };
  }, []);

  // Analyze presence from face data
  const analyzePresence = useCallback((face: FaceData): PresenceData => {
    const now = new Date();
    
    if (!face.faceDetected) {
      return {
        isPresent: false,
        isLookingAtScreen: false,
        attentionLevel: 0,
        distanceFromScreen: "unknown",
        lastSeenAt: lastFaceSeenRef.current,
        sessionDuration: sessionStartRef.current 
          ? Math.floor((now.getTime() - sessionStartRef.current.getTime()) / 1000)
          : 0,
      };
    }

    lastFaceSeenRef.current = now;
    if (!sessionStartRef.current) {
      sessionStartRef.current = now;
    }

    // Calculate if looking at screen based on gaze
    const gazeThreshold = 0.3;
    const isLookingAtScreen = 
      Math.abs(face.eyeGazeX) < gazeThreshold && 
      Math.abs(face.eyeGazeY) < gazeThreshold &&
      Math.abs(face.headRotationY) < 20;

    // Calculate attention level
    let attentionLevel = 1;
    attentionLevel -= Math.abs(face.headRotationY) / 90 * 0.5; // Head turn reduces attention
    attentionLevel -= Math.abs(face.eyeGazeX) * 0.3; // Looking away reduces attention
    attentionLevel -= face.isBlinking ? 0.1 : 0; // Blinking slightly reduces
    attentionLevel += face.isTalking ? 0.2 : 0; // Talking shows engagement
    attentionLevel = Math.max(0, Math.min(1, attentionLevel));

    // Estimate distance (based on face size - this would need calibration)
    // For now, use a simple heuristic based on head rotation sensitivity
    const rotationMagnitude = Math.abs(face.headRotationX) + Math.abs(face.headRotationY);
    let distanceFromScreen: PresenceData["distanceFromScreen"] = "medium";
    if (rotationMagnitude < 10) {
      distanceFromScreen = "close";
    } else if (rotationMagnitude > 30) {
      distanceFromScreen = "far";
    }

    return {
      isPresent: true,
      isLookingAtScreen,
      attentionLevel,
      distanceFromScreen,
      lastSeenAt: now,
      sessionDuration: sessionStartRef.current 
        ? Math.floor((now.getTime() - sessionStartRef.current.getTime()) / 1000)
        : 0,
    };
  }, []);

  // Detect gestures from face movement patterns
  // Note: Full gesture recognition would require hand tracking (e.g., MediaPipe Hands)
  // This is a simplified version based on face/head movements
  const analyzeGestures = useCallback((face: FaceData): GestureData => {
    if (!face.faceDetected) {
      return DEFAULT_GESTURE;
    }

    // Track head movement patterns for gesture-like behaviors
    const movements = gestureHistoryRef.current;
    
    // Nodding detection (yes)
    const isNodding = face.headRotationX > 10 || face.headRotationX < -10;
    
    // Head shake detection (no)
    const isShaking = Math.abs(face.headRotationY) > 15;

    let gesture: GestureData["gesture"] = "none";
    let confidence = 0;

    if (isNodding && !isShaking) {
      // Could be interpreted as agreement
      gesture = "thumbs_up"; // Symbolic - nodding = approval
      confidence = 0.5;
    } else if (isShaking && !isNodding) {
      // Could be interpreted as disagreement
      gesture = "thumbs_down"; // Symbolic - shaking = disapproval
      confidence = 0.4;
    }

    // Track for pattern detection
    movements.push(gesture);
    if (movements.length > 10) {
      movements.shift();
    }

    return {
      gesture,
      confidence,
      handPosition: null, // Would need hand tracking for this
    };
  }, []);

  // Process face data into all vision outputs
  useEffect(() => {
    if (!enabled || !cameraActive) return;

    const emotion = analyzeEmotion(faceData);
    const presence = analyzePresence(faceData);
    const gesture = analyzeGestures(faceData);

    setEmotionData(emotion);
    setPresenceData(presence);
    setGestureData(gesture);

    // Store emotion history for trend analysis
    emotionHistoryRef.current.push(emotion);
    if (emotionHistoryRef.current.length > 30) {
      emotionHistoryRef.current.shift();
    }
  }, [faceData, enabled, cameraActive, analyzeEmotion, analyzePresence, analyzeGestures]);

  // Enable/disable vision
  const enableVision = useCallback(() => {
    setIsVisionEnabled(true);
    sessionStartRef.current = new Date();
    startCamera();
  }, [startCamera]);

  const disableVision = useCallback(() => {
    setIsVisionEnabled(false);
    stopCamera();
    setGestureData(DEFAULT_GESTURE);
    setPresenceData(DEFAULT_PRESENCE);
    setEmotionData(DEFAULT_EMOTION);
    sessionStartRef.current = null;
  }, [stopCamera]);

  // Get emotion trend
  const getEmotionTrend = useCallback(() => {
    const history = emotionHistoryRef.current;
    if (history.length < 5) return "stable";

    const recentValence = history.slice(-5).reduce((sum, e) => sum + e.valence, 0) / 5;
    const olderValence = history.slice(0, 5).reduce((sum, e) => sum + e.valence, 0) / Math.min(5, history.length);

    const diff = recentValence - olderValence;
    if (diff > 0.2) return "improving";
    if (diff < -0.2) return "declining";
    return "stable";
  }, []);

  // Get dominant emotion over time
  const getDominantEmotion = useCallback(() => {
    const history = emotionHistoryRef.current;
    if (history.length === 0) return "neutral";

    const counts: Record<string, number> = {};
    history.forEach(e => {
      counts[e.primary] = (counts[e.primary] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";
  }, []);

  return {
    // Core data
    faceData,
    gestureData,
    presenceData,
    emotionData,
    
    // State
    isVisionEnabled,
    isInitialized,
    isProcessing: isLoading,
    cameraActive,
    error,
    
    // Capabilities
    capabilities: {
      faceTracking: true,
      gestureRecognition: true, // Limited without hand tracking
      emotionDetection: true,
      presenceAwareness: true,
    },
    
    // Controls
    enableVision,
    disableVision,
    
    // Analytics
    getEmotionTrend,
    getDominantEmotion,
    sessionDuration: presenceData.sessionDuration,
  };
};

export default useOrlaVision;
