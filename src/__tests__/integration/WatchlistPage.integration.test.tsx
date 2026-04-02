import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WatchlistPage from '@/app/watchlist/page';
import * as watchlistService from '@/services/watchlist';
import * as tvShowsService from '@/services/tvshows';
import * as seasonsService from '@/services/seasons';
import * as episodesService from '@/services/episodes';
import type { Watchlist, TvShow } from '@/types';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/services/watchlist');
jest.mock('@/services/tvshows');
jest.mock('@/services/seasons');
jest.mock('@/services/episodes');
jest.mock('@/lib/tmdb', () => ({
    searchTvShow: jest.fn().mockResolvedValue([]),
    posterUrl: jest.fn().mockReturnValue(null),
}));
jest.mock('@/lib/posterCache', () => ({
    getPoster: jest.fn().mockReturnValue(null),
    setPoster: jest.fn(),
    removePoster: jest.fn(),
}));

// ─── Typed mock handles ───────────────────────────────────────────────────────

const mockedWatchlist = watchlistService as jest.Mocked<typeof watchlistService>;
const mockedTvShows = tvShowsService as jest.Mocked<typeof tvShowsService>;
const mockedSeasons = seasonsService as jest.Mocked<typeof seasonsService>;
const mockedEpisodes = episodesService as jest.Mocked<typeof episodesService>;

// ─── Fixture data ─────────────────────────────────────────────────────────────

const lostShow: TvShow = {
    '@assetType': 'tvShows',
    '@key': 'ts-lost',
    '@lastTouchBy': 'user',
    '@lastTx': 'tx1',
    '@lastTxID': 'txid1',
    '@lastUpdated': '2024-01-01',
    title: 'Lost',
    description: 'Island',
    recommendedAge: 14,
};

const makeWatchlist = (title: string, key: string): Watchlist => ({
    '@assetType': 'watchlist',
    '@key': key,
    '@lastTouchBy': 'user',
    '@lastTx': 'tx1',
    '@lastTxID': 'txid1',
    '@lastUpdated': '2024-01-01',
    title,
    description: `${title} description`,
    tvShows: [],
});

const favoritesWatchlist = makeWatchlist('Favorites', 'wl-fav');
const watchLaterWatchlist = makeWatchlist('Watch Later', 'wl-later');

// ─── Setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();

    mockedTvShows.getTvShows.mockResolvedValue({ result: [lostShow], metadata: null });
    mockedSeasons.getSeasons.mockResolvedValue({ result: [], metadata: null });
    mockedSeasons.getSeasonsByTvShow.mockResolvedValue({ result: [], metadata: null });
    mockedEpisodes.getEpisodes.mockResolvedValue({ result: [], metadata: null });
    mockedEpisodes.getEpisodesBySeason.mockResolvedValue({ result: [], metadata: null });
    mockedWatchlist.deleteWatchlist.mockResolvedValue(undefined);
    mockedWatchlist.createWatchlist.mockResolvedValue([favoritesWatchlist]);
    mockedWatchlist.updateWatchlist.mockResolvedValue(favoritesWatchlist);
});

// ─── List rendering ───────────────────────────────────────────────────────────

describe('WatchlistPage — list rendering', () => {
    it('renders watchlists after loading', async () => {
        mockedWatchlist.getWatchlists.mockResolvedValue({
            result: [favoritesWatchlist, watchLaterWatchlist],
            metadata: null,
        });

        render(<WatchlistPage />);

        await waitFor(() => {
            expect(screen.getByText('Favorites')).toBeInTheDocument();
            expect(screen.getByText('Watch Later')).toBeInTheDocument();
        });
    });

    it('shows empty-state message when no watchlists exist', async () => {
        mockedWatchlist.getWatchlists.mockResolvedValue({ result: [], metadata: null });

        render(<WatchlistPage />);

        await waitFor(() => {
            expect(
                screen.getByText('Nenhuma watchlist cadastrada ainda'),
            ).toBeInTheDocument();
        });
    });

    it('shows error message when fetch fails', async () => {
        mockedWatchlist.getWatchlists.mockRejectedValue(new Error('network error'));

        render(<WatchlistPage />);

        await waitFor(() => {
            expect(screen.getByText(/erro ao carregar watchlists/i)).toBeInTheDocument();
        });
    });

    it('renders the count of watchlists', async () => {
        mockedWatchlist.getWatchlists.mockResolvedValue({
            result: [favoritesWatchlist, watchLaterWatchlist],
            metadata: null,
        });

        render(<WatchlistPage />);

        await waitFor(() => {
            expect(screen.getByText(/2 listas cadastradas/i)).toBeInTheDocument();
        });
    });
});

// ─── Search filter ────────────────────────────────────────────────────────────

describe('WatchlistPage — search', () => {
    beforeEach(() => {
        mockedWatchlist.getWatchlists.mockResolvedValue({
            result: [favoritesWatchlist, watchLaterWatchlist],
            metadata: null,
        });
    });

    it('filters watchlists by title', async () => {
        render(<WatchlistPage />);
        await waitFor(() => screen.getByText('Favorites'));

        await userEvent.type(
            screen.getByPlaceholderText('Buscar por título ou descrição...'),
            'fav',
        );

        await waitFor(() => {
            expect(screen.getByText('Favorites')).toBeInTheDocument();
            expect(screen.queryByText('Watch Later')).not.toBeInTheDocument();
        });
    });

    it('shows no-results message when no match', async () => {
        render(<WatchlistPage />);
        await waitFor(() => screen.getByText('Favorites'));

        await userEvent.type(
            screen.getByPlaceholderText('Buscar por título ou descrição...'),
            'xyz',
        );

        await waitFor(() => {
            expect(screen.getByText(/nenhum resultado para "xyz"/i)).toBeInTheDocument();
        });
    });
});

// ─── Create modal ─────────────────────────────────────────────────────────────

describe('WatchlistPage — create flow', () => {
    it('opens create modal when "New Watchlist" is clicked', async () => {
        mockedWatchlist.getWatchlists.mockResolvedValue({ result: [], metadata: null });
        render(<WatchlistPage />);
        await waitFor(() => screen.getByText('Nenhuma watchlist cadastrada ainda'));

        await userEvent.click(screen.getByRole('button', { name: /new watchlist/i }));

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText('New Watchlist')).toBeInTheDocument();
    });

    it('closes modal on cancel', async () => {
        mockedWatchlist.getWatchlists.mockResolvedValue({ result: [], metadata: null });
        render(<WatchlistPage />);
        await waitFor(() => screen.getByText('Nenhuma watchlist cadastrada ainda'));

        await userEvent.click(screen.getByRole('button', { name: /new watchlist/i }));
        await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('creates a watchlist and closes the modal', async () => {
        mockedWatchlist.getWatchlists
            .mockResolvedValueOnce({ result: [], metadata: null })
            .mockResolvedValueOnce({ result: [favoritesWatchlist], metadata: null });

        const { container } = render(<WatchlistPage />);
        await waitFor(() => screen.getByText('Nenhuma watchlist cadastrada ainda'));

        await userEvent.click(screen.getByRole('button', { name: /new watchlist/i }));

        const dialog = screen.getByRole('dialog');
        await userEvent.type(within(dialog).getByPlaceholderText('Minha lista'), 'Favorites');
        fireEvent.submit(container.querySelector('[role="dialog"] form')!);

        await waitFor(() => {
            expect(mockedWatchlist.createWatchlist).toHaveBeenCalledWith(
                expect.objectContaining({ '@assetType': 'watchlist', title: 'Favorites' }),
            );
        });
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
});

// ─── Edit modal ───────────────────────────────────────────────────────────────

describe('WatchlistPage — edit flow', () => {
    it('opens edit modal with pre-filled data when edit button is clicked', async () => {
        mockedWatchlist.getWatchlists.mockResolvedValue({
            result: [favoritesWatchlist],
            metadata: null,
        });

        render(<WatchlistPage />);
        await waitFor(() => screen.getByText('Favorites'));

        await userEvent.click(screen.getByRole('button', { name: /editar watchlist/i }));

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Favorites')).toBeInTheDocument();
        });
    });

    it('calls updateWatchlist and closes modal on save', async () => {
        mockedWatchlist.getWatchlists.mockResolvedValue({
            result: [favoritesWatchlist],
            metadata: null,
        });

        const { container } = render(<WatchlistPage />);
        await waitFor(() => screen.getByText('Favorites'));

        await userEvent.click(screen.getByRole('button', { name: /editar watchlist/i }));
        await waitFor(() => screen.getByRole('dialog'));

        const dialog = screen.getByRole('dialog');
        const descInput = within(dialog).getByPlaceholderText('Séries que quero assistir...');
        await userEvent.clear(descInput);
        await userEvent.type(descInput, 'Updated description');

        fireEvent.submit(container.querySelector('[role="dialog"] form')!);

        await waitFor(() => {
            expect(mockedWatchlist.updateWatchlist).toHaveBeenCalledWith(
                expect.objectContaining({ title: 'Favorites' }),
            );
        });
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
});

// ─── Delete flow ──────────────────────────────────────────────────────────────

describe('WatchlistPage — delete flow', () => {
    it('opens confirm dialog when delete button is clicked', async () => {
        mockedWatchlist.getWatchlists.mockResolvedValue({
            result: [favoritesWatchlist],
            metadata: null,
        });

        render(<WatchlistPage />);
        await waitFor(() => screen.getByText('Favorites'));

        await userEvent.click(screen.getByRole('button', { name: /excluir watchlist/i }));

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText(/excluir a watchlist "favorites"/i)).toBeInTheDocument();
        });
    });

    it('calls deleteWatchlist and closes dialog on confirm', async () => {
        mockedWatchlist.getWatchlists.mockResolvedValue({
            result: [favoritesWatchlist],
            metadata: null,
        });

        render(<WatchlistPage />);
        await waitFor(() => screen.getByText('Favorites'));

        await userEvent.click(screen.getByRole('button', { name: /excluir watchlist/i }));
        await waitFor(() => screen.getByRole('dialog'));

        const dialog = screen.getByRole('dialog');
        await userEvent.click(within(dialog).getByRole('button', { name: /excluir/i }));

        await waitFor(() => {
            expect(mockedWatchlist.deleteWatchlist).toHaveBeenCalledWith('Favorites');
        });
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('cancels delete when cancel is clicked in confirm dialog', async () => {
        mockedWatchlist.getWatchlists.mockResolvedValue({
            result: [favoritesWatchlist],
            metadata: null,
        });

        render(<WatchlistPage />);
        await waitFor(() => screen.getByText('Favorites'));

        await userEvent.click(screen.getByRole('button', { name: /excluir watchlist/i }));
        await waitFor(() => screen.getByRole('dialog'));

        const dialog = screen.getByRole('dialog');
        await userEvent.click(within(dialog).getByRole('button', { name: /cancelar/i }));

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
        expect(mockedWatchlist.deleteWatchlist).not.toHaveBeenCalled();
    });
});
