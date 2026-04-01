import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { label, error, className = '', ...props },
    ref,
) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label className="text-sm font-medium text-[#b3b3b3]">
                    {label}
                    {props.required && <span className="text-[#7C3AED] ml-1">*</span>}
                </label>
            )}
            <textarea
                ref={ref}
                {...props}
                className={`
                    bg-[#2a2a2a] border rounded px-3 py-2 text-white text-sm
                    placeholder-[#808080] outline-none transition-colors resize-none
                    focus:border-white
                    ${error ? 'border-[#7C3AED]' : 'border-[#808080]'}
                    ${className}
                `}
            />
            {error && <span className="text-xs text-[#7C3AED]">{error}</span>}
        </div>
    );
});

export default Textarea;
