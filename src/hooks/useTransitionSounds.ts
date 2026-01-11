import { useCallback, useRef } from "react";
import { useAvatarPreferences } from "./useAvatarPreferences";

// Pre-generated base64 encoded short sound effects
// These are tiny audio clips to avoid API calls for common transitions
const SOUNDS = {
  // Soft chime for connection
  connect: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2PmpyZj3tpYGJvgpCWlI+Ed2xnZ29/jJWWko2BdW5rbXR/ipKTkIqAd3JtbnR8hYyQj4qDe3VxcHR6gYiMjYqFgHp1c3N3fIKHiouJhYF8eHV1eHyChouKh4SAe3h2dnh7f4OGh4aEgH15d3Z3eXyAg4WFg4F+e3h3d3l7fYGCg4OBf3x5eHd4eXt9gIGCgYB+fHp4d3h5e31/gIGAgH58e3l4eHl6fH5/gIB/fnx7enh4eXp7fX5/f39+fXt6eXl5ent8fn9/f358e3p5eXl6e3x9fn9/fn18e3p5eXl6e3x9fn5+fX18e3p5eXl6e3x8fX5+fX18e3p5eXl5ent8fH1+fX18fHt6eXl5ent7fH19fX18fHt6enp6ent7fHx9fX19fHx7e3p6enp7e3x8fH19fXx8e3t6enp6e3t8fHx8fX18fHt7e3t6ent7e3x8fHx8fHx7e3t7e3t7e3t8fHx8fHx8e3t7e3t7e3t7fHx8fHx8fHt7e3t7e3t7e3x8fHx8fHx7e3t7e3t7e3t7fHx8fHx8e3t7e3t7e3t7e3t8fHx8fHt7e3t7e3t7e3t7e3x8fHx7e3t7e3t7e3t7e3t7fHx8e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7",
  // Soft disconnect tone
  disconnect: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAB7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7fHx8fHt7e3t7e3t7e3t7e3x8fHx8fHt7e3t7e3t7e3t8fHx8fHx8e3t7e3t7e3t7e3x8fHx8fHx7e3t7e3t7e3t8fHx8fHx8fHt7e3t7e3t7fHx8fHx8fHx8e3t7e3t7e3x8fHx8fHx8fHt7e3t7e3t8fHx8fHx8fHx7e3t7e3t8fHx8fHx9fXx8e3t7e3t8fHx8fH19fX18e3t6ent8fHx8fX19fX18e3p6e3x8fH19fX19fHt6enp7fHx9fX5+fX18enp6e3x9fX5+fn18e3p5ent8fX5+fn59fHp5eXp8fX5/f399fHt5eXl7fH5/gIB/fXt5eHl6fH6AgYGAfnx5eHh5e32AgoKBf3x5d3d4en2Ag4OCgH15d3Z3eXyAg4WEgn94dXR1eHuAhIaGg4B7dnNzdXl9goaIh4SAfHZycXN3fIGGiYmGgn14c3Fxc3h9goiKiYaCfXhzcG9xdXuBh4uLiIR/eXRvbW9zeoCGi4yKhoF7dXBtbW90e4GIjI2Kh4J8dnFtbG5zeoCHjI6MiYN+eHNubWxvdHuCiI2PjYqEfnl0b21sb3R7goiNj46LhX96dG9tbG90e4KIjY+OjIaAfXdybmttcnl/hYuPkI6LhYB7dnFtbG1yeX+GjJCQjouFgHt2cW1sbXJ4f4aMkJCOi4aAfHdycG1tcnl/hoyQkI+MhoF8d3JwbW1yeX+GjJCQj4yHgXx3cnBtbXJ5f4aMkJCPjIeBfHdycG1tcnl/hoyQkI+Mh4F8d3JwbW1yeX+GjI+Qj4yHgXx3cnBtbXJ5f4aMj5CPjIeBfHdycG1tcnl/hoyPkI+Mh4F8d3JwbW1yeX+GjI+Qj4yHgXx3cnBtbXJ5f4aMj5CPjIeBfHdycG1tcnl/",
  // Speaking start sound
  speakStart: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAB7e3t7e3t7e3x8fHx9fX19fn5+fn9/f3+AgICAgYGBgYKCgoKDg4ODhISEhIWFhYWGhoaGh4eHh4iIiIiJiYmJioqKiouLi4uMjIyMjY2NjY6Ojo6Pj4+PkJCQkJGRkZGSkpKSk5OTk5SUlJSVlZWVlpaWlpeXl5eYmJiYmZmZmZqampqbm5ubnJycnJ2dnZ2enp6en5+fn6CgoKChoaGhoqKioqOjo6OkpKSkpaWlpaampqanp6enqKioqKmpqamqqqqrq6urrKysrK2tra2urq6ur6+vr7CwsLCxsbGxsrKysrOzs7O0tLS0tbW1tba2tra3t7e3uLi4uLm5ubm6urq6u7u7u7y8vLy9vb29vr6+vr+/v7/AwMDA",
  // Listening indicator
  listenStart: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAB/f39/fn5+fn19fX18fHx8e3t7e3p6enp5eXl5eHh4eHd3d3d2dnZ2dXV1dXR0dHRzc3NzcnJycnFxcXFwcHBwb29vb25ubm5tbW1tbGxsbGtra2tqampqaWlpaWhoaGhnZ2dnZmZmZmVlZWVkZGRkY2NjY2JiYmJhYWFhYGBgYF9fX19eXl5eXV1dXVxcXFxbW1tbWlpaWllZWVlYWFhYV1dXV1ZWVlZVVVVVVFRUVFNTU1NSUlJSUVFRUVBQUFBPT09PTk5OTk1NTU1MTExMS0tLS0pKSkpJSUlJSEhISEdHR0dGRkZGRUVFRURERERDQ0NDQkJCQkFBQUFAQEBAQEBAQEBAQEBBQUFBQkJCQkNDQ0NERERERU",
};

export const useTransitionSounds = () => {
  const { transitionSoundEnabled } = useAvatarPreferences();
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);
  
  const playSound = useCallback((soundType: keyof typeof SOUNDS, volume = 0.3) => {
    if (!transitionSoundEnabled) return;
    
    try {
      // Stop any currently playing sound
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      
      const audio = new Audio(SOUNDS[soundType]);
      audio.volume = volume;
      activeAudioRef.current = audio;
      
      audio.play().catch(err => {
        console.log("Audio play failed:", err);
      });
      
      audio.onended = () => {
        activeAudioRef.current = null;
      };
    } catch (error) {
      console.log("Sound playback error:", error);
    }
  }, [transitionSoundEnabled]);
  
  const playConnect = useCallback(() => {
    playSound("connect", 0.25);
  }, [playSound]);
  
  const playDisconnect = useCallback(() => {
    playSound("disconnect", 0.2);
  }, [playSound]);
  
  const playSpeakStart = useCallback(() => {
    playSound("speakStart", 0.15);
  }, [playSound]);
  
  const playListenStart = useCallback(() => {
    playSound("listenStart", 0.15);
  }, [playSound]);
  
  // Generate a custom tone programmatically
  const playTone = useCallback((frequency: number, duration: number, volume = 0.2) => {
    if (!transitionSoundEnabled) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.log("Tone playback error:", error);
    }
  }, [transitionSoundEnabled, getAudioContext]);
  
  // Play a pleasant connection chime
  const playConnectionChime = useCallback(() => {
    if (!transitionSoundEnabled) return;
    
    playTone(523.25, 0.15, 0.15); // C5
    setTimeout(() => playTone(659.25, 0.15, 0.12), 100); // E5
    setTimeout(() => playTone(783.99, 0.2, 0.1), 200); // G5
  }, [playTone, transitionSoundEnabled]);
  
  // Play a gentle disconnect tone
  const playDisconnectChime = useCallback(() => {
    if (!transitionSoundEnabled) return;
    
    playTone(783.99, 0.15, 0.1); // G5
    setTimeout(() => playTone(659.25, 0.15, 0.08), 100); // E5
    setTimeout(() => playTone(523.25, 0.2, 0.06), 200); // C5
  }, [playTone, transitionSoundEnabled]);
  
  return {
    playConnect,
    playDisconnect,
    playSpeakStart,
    playListenStart,
    playTone,
    playConnectionChime,
    playDisconnectChime,
  };
};

export default useTransitionSounds;
