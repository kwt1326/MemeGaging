import { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gray-400 text-white hover:bg-gray-500',
  secondary: 'bg-white border border-gray-300 hover:bg-gray-50',
  outline: 'border border-gray-300 text-gray-500 hover:bg-gray-50',
  ghost: 'text-gray-400 underline hover:text-gray-500',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-2',
};

/**
 * Button component with consistent styling
 * Supports multiple variants: primary, secondary, outline, ghost
 */
export function Button({ 
  children, 
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      className={`rounded ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
