import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'whatsapp' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  let variantStyles = 'bg-[#c62828] text-white hover:bg-[#b71c1c] shadow-sm';
  let sizeStyles = 'h-10 px-4 py-2 text-sm';

  switch (variant) {
    case 'whatsapp':
      variantStyles = 'bg-[#25D366] text-white hover:bg-[#20ba5a] shadow-md font-bold';
      break;
    case 'secondary':
      variantStyles = 'bg-[#f5f5f5] text-[#333333] hover:bg-[#eaeaea] border border-[#e0e0e0]';
      break;
    case 'outline':
      variantStyles = 'bg-white text-[#333333] border border-[#d0d0d0] hover:bg-[#f9f9f9]';
      break;
    case 'ghost':
      variantStyles = 'bg-transparent text-[#333333] hover:bg-[#f0f0f0] shadow-none';
      break;
    case 'danger':
      variantStyles = 'bg-[#ba1a1a] text-white hover:bg-[#93000a] shadow-sm';
      break;
    default:
      variantStyles = 'bg-[#c62828] text-white hover:bg-[#a20513] shadow-sm';
  }

  switch (size) {
    case 'sm':
      sizeStyles = 'h-8 px-3 text-xs';
      break;
    case 'lg':
      sizeStyles = 'h-12 px-6 text-base font-bold';
      break;
    case 'icon':
      sizeStyles = 'h-9 w-9 p-0 flex items-center justify-center';
      break;
    default:
      sizeStyles = 'h-10 px-4 py-2 text-sm';
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none whitespace-nowrap ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Cargando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
