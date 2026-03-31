import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { label, error, className = '', ...props },
    ref,
) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label className="text-sm font-medium text-[#b3b3b3]">
                    {label}
                    {props.required && <span className="text-[#e50914] ml-1">*</span>}
                </label>
            )}
            <input
                ref={ref}
                {...props}
                className={`
                    bg-[#2a2a2a] border rounded px-3 py-2 text-white text-sm
                    placeholder-[#808080] outline-none transition-colors
                    focus:border-white
                    ${error ? 'border-[#e50914]' : 'border-[#808080]'}
                    ${className}
                `}
            />
            {error && <span className="text-xs text-[#e50914]">{error}</span>}
        </div>
    );
});

export default Input;
