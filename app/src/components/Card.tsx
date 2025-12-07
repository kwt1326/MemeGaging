import { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  noBorder?: boolean;
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Card component with consistent styling
 * Default: white background, rounded corners, gray border, medium padding
 */
export function Card({ 
  children, 
  className = '', 
  padding = 'md',
  noBorder = false,
}: CardProps) {
  const borderClass = noBorder ? '' : 'border border-gray-200';
  
  return (
    <div className={`bg-white rounded-lg ${borderClass} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}
