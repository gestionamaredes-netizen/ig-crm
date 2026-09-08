import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  isLoading = false,
  disabled,
  className,
  ...props
}) => (
  <button
    className={`
      inline-flex items-center gap-2 font-medium rounded-lg transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className || ''}
    `}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading && (
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    )}
    {!isLoading && icon && icon}
    {children}
  </button>
);
