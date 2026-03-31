'use client';

import { useState, useCallback } from 'react';
import Button from './Button';
import Modal from './Modal';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    message: string;
    confirmLabel?: string;
}

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Excluir',
}: ConfirmDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = useCallback(async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } finally {
            setLoading(false);
        }
    }, [onConfirm, onClose]);

    return (
        <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
            <div className="flex flex-col gap-5">
                <p className="text-[#b3b3b3] text-sm">{message}</p>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleConfirm} loading={loading}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
