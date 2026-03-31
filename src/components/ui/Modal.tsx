'use client';

import { useEffect, useCallback } from 'react';
import Button from './Button';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
    const handleKey = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose],
    );

    useEffect(() => {
        if (!open) return;
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [open, handleKey]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div className={`relative w-full ${maxWidth} bg-[#1f1f1f] rounded-lg shadow-2xl border border-[#2a2a2a]`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
                    <h2 id="modal-title" className="text-lg font-semibold text-white">
                        {title}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar modal">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </div>

                {/* Body */}
                <div className="px-6 py-4">{children}</div>
            </div>
        </div>
    );
}
