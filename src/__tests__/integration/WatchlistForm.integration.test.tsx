import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WatchlistForm from '@/components/watchlist/WatchlistForm';
import type { TvShow, Watchlist } from '@/types';

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

const mockTvShows: TvShow[] = [
    {
        '@assetType': 'tvShows',
        '@key': 'ts-1',
        '@lastTouchBy': 'user',
        '@lastTx': 'tx1',
        '@lastTxID': 'txid1',
        '@lastUpdated': '2024-01-01',
        title: 'Lost',
        description: 'Island',
        recommendedAge: 14,
    },
    {
        '@assetType': 'tvShows',
        '@key': 'ts-2',
        '@lastTouchBy': 'user',
        '@lastTx': 'tx2',
        '@lastTxID': 'txid2',
        '@lastUpdated': '2024-01-01',
        title: 'Breaking Bad',
        description: 'Chemistry',
        recommendedAge: 18,
    },
];

beforeEach(() => {
    mockOnSubmit.mockReset();
    mockOnCancel.mockReset();
    mockOnSubmit.mockResolvedValue(undefined);
});

// ─── Create mode ──────────────────────────────────────────────────────────────

describe('WatchlistForm — create mode', () => {
    it('renders title field and available TV shows as checkboxes', () => {
        render(
            <WatchlistForm
                availableTvShows={mockTvShows}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        expect(screen.getByPlaceholderText('Minha lista')).toBeInTheDocument();
        expect(screen.getByLabelText('Lost')).toBeInTheDocument();
        expect(screen.getByLabelText('Breaking Bad')).toBeInTheDocument();
    });

    it('shows validation error when title is empty on submit', async () => {
        const { container } = render(
            <WatchlistForm
                availableTvShows={mockTvShows}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        // fireEvent.submit bypasses JSDOM's HTML5 required-field constraint validation
        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(screen.getByText('Título obrigatório')).toBeInTheDocument();
        });
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('toggles TV show selection when checkbox is clicked', async () => {
        render(
            <WatchlistForm
                availableTvShows={mockTvShows}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        const lostCheckbox = screen.getByLabelText('Lost');
        expect(lostCheckbox).not.toBeChecked();

        await userEvent.click(lostCheckbox);
        expect(lostCheckbox).toBeChecked();

        await userEvent.click(lostCheckbox);
        expect(lostCheckbox).not.toBeChecked();
    });

    it('calls onSubmit with selected TV shows', async () => {
        render(
            <WatchlistForm
                availableTvShows={mockTvShows}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        await userEvent.type(screen.getByPlaceholderText('Minha lista'), 'Favorites');
        await userEvent.click(screen.getByLabelText('Lost'));
        await userEvent.click(screen.getByLabelText('Breaking Bad'));

        fireEvent.click(screen.getByRole('button', { name: /criar/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                '@assetType': 'watchlist',
                title: 'Favorites',
                description: undefined,
                tvShows: [
                    { '@assetType': 'tvShows', title: 'Lost' },
                    { '@assetType': 'tvShows', title: 'Breaking Bad' },
                ],
            });
        });
    });

    it('submits without TV shows when none selected', async () => {
        render(
            <WatchlistForm
                availableTvShows={mockTvShows}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        await userEvent.type(screen.getByPlaceholderText('Minha lista'), 'Empty List');

        fireEvent.click(screen.getByRole('button', { name: /criar/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    '@assetType': 'watchlist',
                    title: 'Empty List',
                    tvShows: [],
                }),
            );
        });
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(
            <WatchlistForm
                availableTvShows={mockTvShows}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('shows message when no TV shows are available', () => {
        render(
            <WatchlistForm
                availableTvShows={[]}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );
        expect(screen.getByText('Nenhuma série disponível.')).toBeInTheDocument();
    });
});

// ─── Edit mode ────────────────────────────────────────────────────────────────

describe('WatchlistForm — edit mode', () => {
    const existingWatchlist: Watchlist = {
        '@assetType': 'watchlist',
        '@key': 'wl-key',
        '@lastTouchBy': 'user',
        '@lastTx': 'tx1',
        '@lastTxID': 'txid1',
        '@lastUpdated': '2024-01-01',
        title: 'Favorites',
        description: 'My favs',
        tvShows: [{ '@assetType': 'tvShows', '@key': 'ts-1' }],
    };

    it('pre-fills title, description and selected TV shows', () => {
        render(
            <WatchlistForm
                initial={existingWatchlist}
                availableTvShows={mockTvShows}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        expect(screen.getByDisplayValue('Favorites')).toBeInTheDocument();
        expect(screen.getByDisplayValue('My favs')).toBeInTheDocument();
        expect(screen.getByLabelText('Lost')).toBeChecked();
        expect(screen.getByLabelText('Breaking Bad')).not.toBeChecked();
    });

    it('title field is disabled in edit mode', () => {
        render(
            <WatchlistForm
                initial={existingWatchlist}
                availableTvShows={mockTvShows}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );
        expect(screen.getByDisplayValue('Favorites')).toBeDisabled();
    });

    it('submit button reads "Salvar" in edit mode', () => {
        render(
            <WatchlistForm
                initial={existingWatchlist}
                availableTvShows={mockTvShows}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );
        expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    });
});
