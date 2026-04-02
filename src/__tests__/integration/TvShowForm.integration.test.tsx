import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TvShowForm from '@/components/tv-shows/TvShowForm';
import type { TvShow } from '@/types';

jest.mock('@/lib/tmdb', () => ({
    searchTvShow: jest.fn().mockResolvedValue([]),
    posterUrl: jest.fn().mockReturnValue(null),
}));

jest.mock('@/lib/posterCache', () => ({
    getPoster: jest.fn().mockReturnValue(null),
    setPoster: jest.fn(),
    removePoster: jest.fn(),
}));

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

beforeEach(() => {
    mockOnSubmit.mockReset();
    mockOnCancel.mockReset();
    mockOnSubmit.mockResolvedValue(undefined);
});

// ─── Create mode ──────────────────────────────────────────────────────────────

describe('TvShowForm — create mode', () => {
    it('renders all form fields and action buttons', () => {
        render(<TvShowForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        expect(screen.getByPlaceholderText('Breaking Bad')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Descreva a série...')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('shows validation error when title is empty on submit', async () => {
        const { container } = render(<TvShowForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        // Use fireEvent.submit to bypass JSDOM's HTML5 constraint validation
        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(screen.getByText('Título obrigatório')).toBeInTheDocument();
        });
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows validation error when description is empty', async () => {
        const { container } = render(<TvShowForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        await userEvent.type(screen.getByPlaceholderText('Breaking Bad'), 'Lost');
        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(screen.getByText('Descrição obrigatória')).toBeInTheDocument();
        });
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with correct payload on valid input', async () => {
        render(<TvShowForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        await userEvent.type(screen.getByPlaceholderText('Breaking Bad'), 'Lost');
        await userEvent.type(
            screen.getByPlaceholderText('Descreva a série...'),
            'Survivors on a mysterious island.',
        );
        await userEvent.selectOptions(screen.getByRole('combobox'), '14');

        fireEvent.click(screen.getByRole('button', { name: /criar/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                '@assetType': 'tvShows',
                title: 'Lost',
                description: 'Survivors on a mysterious island.',
                recommendedAge: 14,
            });
        });
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<TvShowForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
        fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('displays API error message when onSubmit rejects', async () => {
        mockOnSubmit.mockRejectedValueOnce({ response: { status: 409 } });

        const { container } = render(<TvShowForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        await userEvent.type(screen.getByPlaceholderText('Breaking Bad'), 'Lost');
        await userEvent.type(screen.getByPlaceholderText('Descreva a série...'), 'Island show');

        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(screen.getByText('A série "Lost" já existe')).toBeInTheDocument();
        });
    });
});

// ─── Edit mode ────────────────────────────────────────────────────────────────

describe('TvShowForm — edit mode', () => {
    const existingShow: TvShow = {
        '@assetType': 'tvShows',
        '@key': 'ts-key',
        '@lastTouchBy': 'user',
        '@lastTx': 'tx1',
        '@lastTxID': 'txid1',
        '@lastUpdated': '2024-01-01',
        title: 'Lost',
        description: 'Island',
        recommendedAge: 14,
    };

    it('pre-fills form fields from initial data', () => {
        render(<TvShowForm initial={existingShow} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        expect(screen.getByPlaceholderText('Breaking Bad')).toHaveValue('Lost');
        expect(screen.getByPlaceholderText('Descreva a série...')).toHaveValue('Island');
        expect(screen.getByRole('combobox')).toHaveValue('14');
    });

    it('title field is disabled in edit mode', () => {
        render(<TvShowForm initial={existingShow} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
        expect(screen.getByPlaceholderText('Breaking Bad')).toBeDisabled();
    });

    it('submit button reads "Salvar" in edit mode', () => {
        render(<TvShowForm initial={existingShow} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
        expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    });

    it('calls onSubmit with updated description', async () => {
        render(<TvShowForm initial={existingShow} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const desc = screen.getByPlaceholderText('Descreva a série...');
        await userEvent.clear(desc);
        await userEvent.type(desc, 'Updated description');

        fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    '@assetType': 'tvShows',
                    title: 'Lost',
                    description: 'Updated description',
                }),
            );
        });
    });
});
