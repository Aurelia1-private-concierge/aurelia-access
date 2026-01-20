import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";

const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true); // Default to true to prevent flash

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  
  // Use refs to avoid re-renders
  const isHoveringRef = useRef(false);

  // Memoized handlers to prevent recreation
  const moveCursor = useCallback((e: MouseEvent) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
    setIsVisible(true);
  }, [cursorX, cursorY]);

  const handleMouseEnter = useCallback(() => setIsVisible(true), []);
  const handleMouseLeave = useCallback(() => setIsVisible(false), []);
  const handleMouseDown = useCallback(() => setIsClicking(true), []);
  const handleMouseUp = useCallback(() => setIsClicking(false), []);

  const handleHoverStart = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const shouldHover = !!(
      target.tagName === 'A' ||
      target.tagName === 'BUTTON' ||
      target.closest('a') ||
      target.closest('button') ||
      target.classList.contains('cursor-pointer')
    );
    
    if (shouldHover !== isHoveringRef.current) {
      isHoveringRef.current = shouldHover;
      setIsHovering(shouldHover);
    }
  }, []);

  const handleHoverEnd = useCallback(() => {
    if (isHoveringRef.current) {
      isHoveringRef.current = false;
      setIsHovering(false);
    }
  }, []);

  useEffect(() => {
    // Check for touch device only once
    const isTouchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouchCapable);

    if (isTouchCapable) return;

    // Use passive listeners for better performance
    const options = { passive: true };
    
    window.addEventListener('mousemove', moveCursor, options);
    window.addEventListener('mouseenter', handleMouseEnter, options);
    window.addEventListener('mouseleave', handleMouseLeave, options);
    window.addEventListener('mousedown', handleMouseDown, options);
    window.addEventListener('mouseup', handleMouseUp, options);
    window.addEventListener('mouseover', handleHoverStart, options);
    window.addEventListener('mouseout', handleHoverEnd, options);

    // Add global cursor style
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleHoverStart);
      window.removeEventListener('mouseout', handleHoverEnd);
      document.body.style.cursor = 'auto';
    };
  }, [moveCursor, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp, handleHoverStart, handleHoverEnd]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Main cursor ring - simplified for performance */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          x: '-50%',
          y: '-50%',
        }}
      >
        <motion.div
          animate={{
            scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
            opacity: isHovering ? 0.8 : 0.6,
          }}
          transition={{ duration: 0.15 }}
          className="relative"
        >
          {/* Outer ring */}
          <div
            className={`rounded-full border transition-all duration-200 ${
              isHovering 
                ? 'w-12 h-12 border-primary bg-primary/10' 
                : 'w-8 h-8 border-primary/60'
            }`}
          />
          
          {/* Center dot */}
          <motion.div
            animate={{ scale: isHovering ? 0 : 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-primary"
          />
        </motion.div>
      </motion.div>

      {/* Glow effect on hover */}
      {isHovering && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed pointer-events-none z-[9997]"
          style={{
            left: cursorXSpring,
            top: cursorYSpring,
            x: '-50%',
            y: '-50%',
          }}
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 blur-xl" />
        </motion.div>
      )}
    </>
  );
};

export default CustomCursor;