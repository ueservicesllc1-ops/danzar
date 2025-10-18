'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { ButtonProps } from './button';

interface AnimatedButtonProps extends ButtonProps {
  animate?: boolean;
  pulseColor?: string;
  glowColor?: string;
  hoverScale?: number;
  tapScale?: number;
  animationType?: 'pulse' | 'glow' | 'bounce' | 'shake' | 'none';
  animationDuration?: number;
  delay?: number;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({
    animate = false,
    pulseColor = '#ef4444',
    glowColor = '#ef4444',
    hoverScale = 1.05,
    tapScale = 0.95,
    animationType = 'pulse',
    animationDuration = 2,
    delay = 0,
    className,
    children,
    ...props
  }, ref) => {
    
    const getAnimationVariants = () => {
      switch (animationType) {
        case 'pulse':
          return {
            initial: { scale: 1 },
            animate: {
              scale: [1, 1.02, 1],
              boxShadow: animate ? [
                `0 4px 6px rgba(0, 0, 0, 0.05)`,
                `0 0 20px ${pulseColor}40`,
                `0 4px 6px rgba(0, 0, 0, 0.05)`
              ] : undefined,
            },
            hover: {
              scale: hoverScale,
              boxShadow: `0 8px 25px ${glowColor}30`,
              transition: { duration: 0.2 }
            },
            tap: {
              scale: tapScale,
              transition: { duration: 0.1 }
            }
          };
        
        case 'glow':
          return {
            initial: { scale: 1 },
            animate: {
              boxShadow: animate ? [
                `0 4px 6px rgba(0, 0, 0, 0.05)`,
                `0 0 25px ${glowColor}60`,
                `0 4px 6px rgba(0, 0, 0, 0.05)`
              ] : undefined,
            },
            hover: {
              scale: hoverScale,
              boxShadow: `0 0 30px ${glowColor}80`,
              transition: { duration: 0.2 }
            },
            tap: {
              scale: tapScale,
              transition: { duration: 0.1 }
            }
          };
        
        case 'bounce':
          return {
            initial: { y: 0 },
            animate: {
              y: animate ? [0, -5, 0] : 0,
            },
            hover: {
              y: -3,
              scale: hoverScale,
              transition: { duration: 0.2 }
            },
            tap: {
              y: 0,
              scale: tapScale,
              transition: { duration: 0.1 }
            }
          };
        
        case 'shake':
          return {
            initial: { x: 0 },
            animate: {
              x: animate ? [0, -2, 2, -2, 2, 0] : 0,
            },
            hover: {
              scale: hoverScale,
              transition: { duration: 0.2 }
            },
            tap: {
              scale: tapScale,
              transition: { duration: 0.1 }
            }
          };
        
        default:
          return {
            initial: { scale: 1 },
            animate: { scale: 1 },
            hover: {
              scale: hoverScale,
              transition: { duration: 0.2 }
            },
            tap: {
              scale: tapScale,
              transition: { duration: 0.1 }
            }
          };
      }
    };

    const variants = getAnimationVariants();

    return (
      <motion.div
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        variants={variants}
        transition={{
          duration: animationDuration,
          repeat: animate && animationType !== 'none' ? Infinity : 0,
          ease: "easeInOut",
          delay: delay
        }}
      >
        <Button
          ref={ref}
          className={className}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export { AnimatedButton };


