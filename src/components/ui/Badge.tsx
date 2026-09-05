import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'warning' | 'success' | 'bulk';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  let variantStyles = 'bg-[#c62828] text-white';

  switch (variant) {
    case 'secondary':
      variantStyles = 'bg-[#f5f5f5] text-[#333333] border border-[#e0e0e0]';
      break;
    case 'outline':
      variantStyles = 'border border-[#d0d0d0] text-[#555555] bg-transparent';
      break;
    case 'warning':
      variantStyles = 'bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2] font-bold';
      break;
    case 'success':
      variantStyles = 'bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] font-bold';
      break;
    case 'bulk':
      variantStyles = 'bg-[#c62828] text-white font-bold tracking-wide shadow-sm';
      break;
    default:
      variantStyles = 'bg-[#c62828] text-white font-semibold';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
