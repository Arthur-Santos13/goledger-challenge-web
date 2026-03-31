import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
    primary: 'bg-[#e50914] hover:bg-[#f40612] text-white',
    secondary: 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border border-[#808080]',
    danger: 'bg-transparent hover:bg-red-900/20 text-[#e50914] border border-[#e50914]',
    ghost: 'bg-transparent hover:bg-[#2a2a2a] text-[#b3b3b3] hover:text-white',
};

const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    className = '',
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center gap-2 rounded font-medium
                transition-colors duration-150 cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variantClasses[variant]} ${sizeClasses[size]} ${className}
            `}
        >
            {loading && (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
}
