import { useState, useEffect, useRef, useCallback } from "react";

export interface FaceData {
  // Head rotation (in degrees)
  headRotationX: number; // Pitch - nodding up/down
  headRotationY: number; // Yaw - turning left/right
  headRotationZ: number; // Roll - tilting left/right
  
  // Eye tracking
  leftEyeOpenness: number; // 0-1
  rightEyeOpenness: number; // 0-1
  eyeGazeX: number; // -1 to 1
  eyeGazeY: number; // -1 to 1
  
  // Mouth
  mouthOpenness: number; // 0-1
  mouthWidth: number; // 0-1 (smile width)
  
  // Eyebrows
  leftEyebrowRaise: number; // 0-1
  rightEyebrowRaise: number; // 0-1
  
  // Expressions
  isSmiling: boolean;
  isTalking: boolean;
  isBlinking: boolean;
  
  // Face detection
  faceDetected: boolean;
  confidence: number;
}

const DEFAULT_FACE_DATA: FaceData = {
  headRotationX: 0,
  headRotationY: 0,
  headRotationZ: 0,
  leftEyeOpenness: 1,
  rightEyeOpenness: 1,
  eyeGazeX: 0,
  eyeGazeY: 0,
  mouthOpenness: 0,
  mouthWidth: 0.5,
  leftEyebrowRaise: 0.5,
  rightEyebrowRaise: 0.5,
  isSmiling: false,
  isTalking: false,
  isBlinking: false,
  faceDetected: false,
  confidence: 0,
};

// Face mesh landmark indices
const LANDMARKS = {
  // Nose tip for head pose
  NOSE_TIP: 1,
  FOREHEAD: 10,
  CHIN: 152,
  LEFT_EAR: 234,
  RIGHT_EAR: 454,
  
  // Eyes
  LEFT_EYE_TOP: 159,
  LEFT_EYE_BOTTOM: 145,
  RIGHT_EYE_TOP: 386,
  RIGHT_EYE_BOTTOM: 374,
  LEFT_EYE_INNER: 133,
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_OUTER: 263,
  LEFT_IRIS: 468,
  RIGHT_IRIS: 473,
  
  // Mouth
  MOUTH_TOP: 13,
  MOUTH_BOTTOM: 14,
  MOUTH_LEFT: 61,
  MOUTH_RIGHT: 291,
  UPPER_LIP: 0,
  LOWER_LIP: 17,
  
  // Eyebrows
  LEFT_EYEBROW_INNER: 107,
  LEFT_EYEBROW_OUTER: 70,
  RIGHT_EYEBROW_INNER: 336,
  RIGHT_EYEBROW_OUTER: 300,
};

export const useFaceTracking = (enabled: boolean = false) => {
  const [faceData, setFaceData] = useState<FaceData>(DEFAULT_FACE_DATA);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const faceMeshRef = useRef<any>(null);
  const lastBlinkTimeRef = useRef<number>(0);
  const smoothedDataRef = useRef<FaceData>(DEFAULT_FACE_DATA);

  // Smooth data to reduce jitter
  const smoothData = useCallback((newData: Partial<FaceData>, factor: number = 0.3) => {
    const current = smoothedDataRef.current;
    const smoothed: FaceData = {
      ...current,
      headRotationX: current.headRotationX + (newData.headRotationX! - current.headRotationX) * factor,
      headRotationY: current.headRotationY + (newData.headRotationY! - current.headRotationY) * factor,
      headRotationZ: current.headRotationZ + (newData.headRotationZ! - current.headRotationZ) * factor,
      leftEyeOpenness: current.leftEyeOpenness + ((newData.leftEyeOpenness ?? 1) - current.leftEyeOpenness) * factor,
      rightEyeOpenness: current.rightEyeOpenness + ((newData.rightEyeOpenness ?? 1) - current.rightEyeOpenness) * factor,
      eyeGazeX: current.eyeGazeX + ((newData.eyeGazeX ?? 0) - current.eyeGazeX) * factor,
      eyeGazeY: current.eyeGazeY + ((newData.eyeGazeY ?? 0) - current.eyeGazeY) * factor,
      mouthOpenness: current.mouthOpenness + ((newData.mouthOpenness ?? 0) - current.mouthOpenness) * factor,
      mouthWidth: current.mouthWidth + ((newData.mouthWidth ?? 0.5) - current.mouthWidth) * factor,
      leftEyebrowRaise: current.leftEyebrowRaise + ((newData.leftEyebrowRaise ?? 0.5) - current.leftEyebrowRaise) * factor,
      rightEyebrowRaise: current.rightEyebrowRaise + ((newData.rightEyebrowRaise ?? 0.5) - current.rightEyebrowRaise) * factor,
      isSmiling: newData.isSmiling ?? current.isSmiling,
      isTalking: newData.isTalking ?? current.isTalking,
      isBlinking: newData.isBlinking ?? current.isBlinking,
      faceDetected: newData.faceDetected ?? current.faceDetected,
      confidence: newData.confidence ?? current.confidence,
    };
    smoothedDataRef.current = smoothed;
    return smoothed;
  }, []);

  // Calculate distance between two 3D points
  const distance3D = (p1: any, p2: any) => {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) + 
      Math.pow(p1.y - p2.y, 2) + 
      Math.pow(p1.z - p2.z, 2)
    );
  };

  // Process face mesh results
  const processFaceMesh = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) {
      setFaceData(prev => ({ ...prev, faceDetected: false }));
      return;
    }

    const face = landmarks;
    
    // Head rotation estimation
    const noseTip = face[LANDMARKS.NOSE_TIP];
    const forehead = face[LANDMARKS.FOREHEAD];
    const chin = face[LANDMARKS.CHIN];
    const leftEar = face[LANDMARKS.LEFT_EAR];
    const rightEar = face[LANDMARKS.RIGHT_EAR];
    
    // Calculate head pose
    const headRotationY = (leftEar.x - rightEar.x) * 100; // Yaw
    const headRotationX = (noseTip.y - (forehead.y + chin.y) / 2) * 100; // Pitch
    const headRotationZ = Math.atan2(leftEar.y - rightEar.y, leftEar.x - rightEar.x) * (180 / Math.PI); // Roll
    
    // Eye openness
    const leftEyeTop = face[LANDMARKS.LEFT_EYE_TOP];
    const leftEyeBottom = face[LANDMARKS.LEFT_EYE_BOTTOM];
    const rightEyeTop = face[LANDMARKS.RIGHT_EYE_TOP];
    const rightEyeBottom = face[LANDMARKS.RIGHT_EYE_BOTTOM];
    
    const leftEyeHeight = distance3D(leftEyeTop, leftEyeBottom);
    const rightEyeHeight = distance3D(rightEyeTop, rightEyeBottom);
    
    const leftEyeOpenness = Math.min(1, Math.max(0, leftEyeHeight * 30));
    const rightEyeOpenness = Math.min(1, Math.max(0, rightEyeHeight * 30));
    
    // Blink detection
    const isBlinking = leftEyeOpenness < 0.2 || rightEyeOpenness < 0.2;
    const now = Date.now();
    if (isBlinking && now - lastBlinkTimeRef.current > 100) {
      lastBlinkTimeRef.current = now;
    }
    
    // Eye gaze (using iris if available)
    let eyeGazeX = 0;
    let eyeGazeY = 0;
    if (face.length > 468) {
      const leftIris = face[LANDMARKS.LEFT_IRIS];
      const rightIris = face[LANDMARKS.RIGHT_IRIS];
      const leftEyeInner = face[LANDMARKS.LEFT_EYE_INNER];
      const leftEyeOuter = face[LANDMARKS.LEFT_EYE_OUTER];
      const rightEyeInner = face[LANDMARKS.RIGHT_EYE_INNER];
      const rightEyeOuter = face[LANDMARKS.RIGHT_EYE_OUTER];
      
      const leftEyeCenter = {
        x: (leftEyeInner.x + leftEyeOuter.x) / 2,
        y: (leftEyeTop.y + leftEyeBottom.y) / 2,
      };
      const rightEyeCenter = {
        x: (rightEyeInner.x + rightEyeOuter.x) / 2,
        y: (rightEyeTop.y + rightEyeBottom.y) / 2,
      };
      
      eyeGazeX = ((leftIris.x - leftEyeCenter.x) + (rightIris.x - rightEyeCenter.x)) * 10;
      eyeGazeY = ((leftIris.y - leftEyeCenter.y) + (rightIris.y - rightEyeCenter.y)) * 10;
    }
    
    // Mouth
    const mouthTop = face[LANDMARKS.MOUTH_TOP];
    const mouthBottom = face[LANDMARKS.MOUTH_BOTTOM];
    const mouthLeft = face[LANDMARKS.MOUTH_LEFT];
    const mouthRight = face[LANDMARKS.MOUTH_RIGHT];
    
    const mouthHeight = distance3D(mouthTop, mouthBottom);
    const mouthWidthDist = distance3D(mouthLeft, mouthRight);
    
    const mouthOpenness = Math.min(1, Math.max(0, mouthHeight * 15));
    const mouthWidth = Math.min(1, Math.max(0, mouthWidthDist * 5));
    
    // Eyebrows
    const leftEyebrowInner = face[LANDMARKS.LEFT_EYEBROW_INNER];
    const leftEyebrowOuter = face[LANDMARKS.LEFT_EYEBROW_OUTER];
    const rightEyebrowInner = face[LANDMARKS.RIGHT_EYEBROW_INNER];
    const rightEyebrowOuter = face[LANDMARKS.RIGHT_EYEBROW_OUTER];
    
    const leftEyebrowHeight = (leftEyeTop.y - (leftEyebrowInner.y + leftEyebrowOuter.y) / 2);
    const rightEyebrowHeight = (rightEyeTop.y - (rightEyebrowInner.y + rightEyebrowOuter.y) / 2);
    
    const leftEyebrowRaise = Math.min(1, Math.max(0, leftEyebrowHeight * 20 + 0.5));
    const rightEyebrowRaise = Math.min(1, Math.max(0, rightEyebrowHeight * 20 + 0.5));
    
    // Expression detection
    const isSmiling = mouthWidth > 0.6;
    const isTalking = mouthOpenness > 0.15;
    
    const newData: FaceData = {
      headRotationX: Math.max(-30, Math.min(30, headRotationX)),
      headRotationY: Math.max(-45, Math.min(45, headRotationY)),
      headRotationZ: Math.max(-20, Math.min(20, headRotationZ)),
      leftEyeOpenness,
      rightEyeOpenness,
      eyeGazeX: Math.max(-1, Math.min(1, eyeGazeX)),
      eyeGazeY: Math.max(-1, Math.min(1, eyeGazeY)),
      mouthOpenness,
      mouthWidth,
      leftEyebrowRaise,
      rightEyebrowRaise,
      isSmiling,
      isTalking,
      isBlinking,
      faceDetected: true,
      confidence: 0.95,
    };
    
    const smoothedData = smoothData(newData);
    setFaceData(smoothedData);
  }, [smoothData]);

  // Initialize face mesh
  const initializeFaceMesh = useCallback(async () => {
    if (isInitialized || isLoading || faceMeshRef.current === "failed") return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Dynamic import with explicit default handling for MediaPipe
      const faceMeshModule = await import("@mediapipe/face_mesh");
      
      // Handle different module export formats
      const FaceMeshClass = faceMeshModule.FaceMesh || (faceMeshModule as any).default?.FaceMesh;
      
      if (!FaceMeshClass) {
        throw new Error("FaceMesh class not found in module");
      }
      
      const faceMesh = new FaceMeshClass({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`;
        },
      });
      
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      
      faceMesh.onResults((results: any) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          processFaceMesh(results.multiFaceLandmarks[0]);
        } else {
          setFaceData(prev => ({ ...prev, faceDetected: false }));
        }
      });
      
      faceMeshRef.current = faceMesh;
      setIsInitialized(true);
    } catch (err) {
      console.error("Failed to initialize FaceMesh:", err);
      // Mark as failed to prevent infinite retry loop
      faceMeshRef.current = "failed";
      setError("Face tracking is not available in this environment. The feature will be disabled.");
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, isLoading, processFaceMesh]);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!enabled || cameraActive) return;
    
    // Don't attempt if FaceMesh already failed
    if (faceMeshRef.current === "failed") {
      setError("Face tracking is not available in this environment.");
      return;
    }
    
    try {
      await initializeFaceMesh();
      
      // Check again after init attempt
      if (faceMeshRef.current === "failed") {
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
      
      streamRef.current = stream;
      
      // Create hidden video element
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;
      videoRef.current = video;
      
      // Create canvas for processing
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      canvasRef.current = canvas;
      
      await video.play();
      setCameraActive(true);
      
      // Start processing loop
      const processFrame = async () => {
        if (!faceMeshRef.current || faceMeshRef.current === "failed" || !videoRef.current || !cameraActive) return;
        
        if (videoRef.current.readyState === 4) {
          await faceMeshRef.current.send({ image: videoRef.current });
        }
        
        animationRef.current = requestAnimationFrame(processFrame);
      };
      
      processFrame();
    } catch (err) {
      console.error("Failed to start camera:", err);
      setError("Camera access denied. Please allow camera access for face tracking.");
    }
  }, [enabled, cameraActive, initializeFaceMesh]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }
    
    setCameraActive(false);
    setFaceData(DEFAULT_FACE_DATA);
    smoothedDataRef.current = DEFAULT_FACE_DATA;
  }, []);

  // Auto-start/stop based on enabled prop
  useEffect(() => {
    if (enabled && !cameraActive) {
      startCamera();
    } else if (!enabled && cameraActive) {
      stopCamera();
    }
    
    return () => {
      if (cameraActive) {
        stopCamera();
      }
    };
  }, [enabled, cameraActive, startCamera, stopCamera]);

  return {
    faceData,
    isInitialized,
    isLoading,
    error,
    cameraActive,
    startCamera,
    stopCamera,
  };
};

export default useFaceTracking;
