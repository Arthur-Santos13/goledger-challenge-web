interface EmptyStateProps {
    message: string;
    action?: React.ReactNode;
}

export default function EmptyState({ message, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <svg
                className="w-16 h-16 text-[#808080]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
            </svg>
            <p className="text-[#808080] text-sm">{message}</p>
            {action}
        </div>
    );
}
