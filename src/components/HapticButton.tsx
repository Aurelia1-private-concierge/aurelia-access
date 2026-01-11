import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

interface HapticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hapticType?: HapticType;
  enableHaptic?: boolean;
  variant?: 'default' | 'ghost' | 'outline' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  asMotion?: boolean;
}

const variantStyles = {
  default: 'bg-secondary text-foreground hover:bg-secondary/80',
  ghost: 'bg-transparent hover:bg-secondary/50',
  outline: 'border border-border bg-transparent hover:bg-secondary/30',
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  (
    {
      children,
      hapticType = 'light',
      enableHaptic = true,
      variant = 'default',
      size = 'md',
      asMotion = true,
      className,
      onClick,
      onTouchStart,
      ...props
    },
    ref
  ) => {
    const { trigger } = useHapticFeedback();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableHaptic) {
        trigger(hapticType);
      }
      onClick?.(e);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
      if (enableHaptic) {
        trigger('selection');
      }
      onTouchStart?.(e);
    };

    const buttonClasses = cn(
      'rounded-xl font-medium transition-all duration-200 active:scale-[0.98]',
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    if (asMotion) {
      return (
        <motion.button
          ref={ref as any}
          whileTap={{ scale: 0.98 }}
          className={buttonClasses}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          {...(props as any)}
        >
          {children}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        {...props}
      >
        {children}
      </button>
    );
  }
);

HapticButton.displayName = 'HapticButton';

export default HapticButton;
