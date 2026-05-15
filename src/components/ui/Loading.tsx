import React from 'react'
import { cn } from '@/utils/cn'
import Loader from '@/assets/loader.svg';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  className,
  text
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
     <img src={Loader} alt="Loading..." className={cn(sizes[size] || sizes.md)} />
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  )

}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-gray-200 border-t-primary-600',
      sizes[size],
      className
    )} />
  )
}
