import React, { type ReactNode } from 'react';

interface BlurMaskProps {
  children: ReactNode;
  shouldBlur: boolean;
  blurIntensity?: 'light' | 'medium' | 'heavy';
  className?: string;
}

/**
 * BlurMask Component
 * 
 * A wrapper component that applies a blur filter to its children content.
 * Useful for masking content from trial users.
 * 
 * @param children - The content to be potentially blurred
 * @param shouldBlur - Boolean flag to control blur effect (true = blur, false = clear)
 * @param blurIntensity - Optional blur intensity level (default: 'medium')
 * @param className - Optional additional CSS classes
 * 
 * @example
 * <BlurMask shouldBlur={isTrialUser}>
 *   <div>Sensitive content here</div>
 * </BlurMask>
 */
const BlurMask: React.FC<BlurMaskProps> = ({
  children,
  shouldBlur,
  blurIntensity = 'medium',
  className = '',
}) => {
  const blurLevels = {
    light: 'blur-[3px]',
    medium: 'blur-[6px]',
    heavy: 'blur-[10px]',
  };

  const blurClass = blurLevels[blurIntensity];

  return (
    <div
      className={`relative ${className}`}
      style={shouldBlur ? { userSelect: 'none', pointerEvents: 'none' } : {}}
    >
      <div className={shouldBlur ? blurClass : ''}>
        {children}
      </div>
      {shouldBlur && (
        <div
          className="absolute inset-0 cursor-not-allowed"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default BlurMask;
