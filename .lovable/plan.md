
# Fix: Orla Bot Video Black Screen

## Problem Identified

The Orla Video Bot shows a black screen because of improper video element handling that doesn't follow browser autoplay policies. Specifically:

1. **Missing `play()` call** - After setting `videoRef.current.srcObject`, the code never calls `play()` to start the video
2. **Missing mobile autoplay attributes** - Mobile browsers require `muted` and `playsInline` to be set **before** playback
3. **No error handling** - No catch block for video playback failures

## Root Cause

From the stack overflow guidance: *"Browsers enforce a security policy that requires media playback to be initiated by a direct user action. Asynchronous operations before playback can break this user gesture context."*

The current code in `UltraPremiumVideoBot.tsx` (lines 98-111):
```typescript
const startCamera = useCallback(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({...});
    setLocalStream(stream);
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      // ❌ Missing: play() call
      // ❌ Missing: error handling for playback
    }
    setIsVideoEnabled(true);
  } catch (error) {...}
}, []);
```

## Solution

### File: `src/components/video/UltraPremiumVideoBot.tsx`

**Change 1: Fix the `startCamera` function** (lines 98-111)

Add proper video playback with mobile support:
```typescript
const startCamera = useCallback(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        width: { ideal: 1280 }, 
        height: { ideal: 720 },
        facingMode: 'user'
      },
    });
    setLocalStream(stream);
    if (videoRef.current) {
      // Set mobile-required attributes before assigning source
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.srcObject = stream;
      
      // Explicitly play the video
      try {
        await videoRef.current.play();
      } catch (playError) {
        console.error("Video playback failed:", playError);
        // Video will still show, just won't autoplay
      }
    }
    setIsVideoEnabled(true);
  } catch (error) {
    console.error("Camera access error:", error);
    toast.error("Camera access required for video features");
  }
}, []);
```

**Change 2: Fix the video element attributes** (around line 286-291)

Add explicit attributes to the video element:
```tsx
<video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  className="w-full h-full object-cover transform scale-x-[-1]"
  onLoadedMetadata={() => {
    // Ensure video plays when metadata is loaded
    videoRef.current?.play().catch(() => {});
  }}
/>
```

## Technical Details

| Issue | Current | Fixed |
|-------|---------|-------|
| `play()` call | Missing | Added with await and error handling |
| `muted` attribute | Only in JSX | Set programmatically before srcObject |
| `playsInline` attribute | Only in JSX | Set programmatically for Safari |
| Error handling | None | Catch block for playback failures |
| `onLoadedMetadata` | Missing | Added as fallback trigger |

## Testing Checklist

After implementation:
1. Open the Orla Video Bot trigger button
2. Click to enable camera
3. Verify video preview shows your camera feed (not black)
4. Test on mobile device (iOS Safari especially)
5. Test the voice connection still works alongside video

## Risk Assessment

- **Low risk** - Changes are isolated to the camera start function
- **No breaking changes** - Voice features remain unchanged
- **Backward compatible** - Desktop browsers already work with these additions
