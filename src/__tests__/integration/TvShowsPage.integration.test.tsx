import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import TvShowsPage from '@/app/tv-shows/page';
import * as tvShowsService from '@/services/tvshows';
import * as seasonsService from '@/services/seasons';
import * as episodesService from '@/services/episodes';
import * as watchlistService from '@/services/watchlist';
import type { TvShow } from '@/types';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

jest.mock('@/services/tvshows');
jest.mock('@/services/seasons');
jest.mock('@/services/episodes');
jest.mock('@/services/watchlist');

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

const mockedRouter = { push: jest.fn() };
const mockedTvShows = tvShowsService as jest.Mocked<typeof tvShowsService>;
const mockedSeasons = seasonsService as jest.Mocked<typeof seasonsService>;
const mockedEpisodes = episodesService as jest.Mocked<typeof episodesService>;
const mockedWatchlist = watchlistService as jest.Mocked<typeof watchlistService>;

// ─── Fixture data ─────────────────────────────────────────────────────────────

const makeShow = (title: string, key: string): TvShow => ({
    '@assetType': 'tvShows',
    '@key': key,
    '@lastTouchBy': 'user',
    '@lastTx': 'tx1',
    '@lastTxID': 'txid1',
    '@lastUpdated': '2024-01-01',
    title,
    description: `Description of ${title}`,
    recommendedAge: 14,
});

const lostShow = makeShow('Lost', 'ts-lost');
const breakingBadShow = makeShow('Breaking Bad', 'ts-bb');

// ─── Setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockedRouter);

    // Default service responses
    mockedSeasons.getSeasons.mockResolvedValue({ result: [], metadata: null });
    mockedSeasons.getSeasonsByTvShow.mockResolvedValue({ result: [], metadata: null });
    mockedEpisodes.getEpisodes.mockResolvedValue({ result: [], metadata: null });
    mockedEpisodes.getEpisodesBySeason.mockResolvedValue({ result: [], metadata: null });
    mockedWatchlist.getWatchlists.mockResolvedValue({ result: [], metadata: null });
    mockedTvShows.deleteTvShow.mockResolvedValue(undefined);
    mockedSeasons.deleteSeason.mockResolvedValue(undefined);
    mockedEpisodes.deleteEpisode.mockResolvedValue(undefined);
    mockedWatchlist.updateWatchlist.mockResolvedValue({} as ReturnType<typeof mockedWatchlist.updateWatchlist> extends Promise<infer T> ? T : never);
});

// ─── Loading → list ───────────────────────────────────────────────────────────

describe('TvShowsPage — list rendering', () => {
    it('renders TV shows after loading', async () => {
        mockedTvShows.getTvShows.mockResolvedValue({
            result: [lostShow, breakingBadShow],
            metadata: null,
        });

        render(<TvShowsPage />);

        await waitFor(() => {
            expect(screen.getByText('Lost')).toBeInTheDocument();
            expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
        });
    });

    it('shows empty-state message when no shows exist', async () => {
        mockedTvShows.getTvShows.mockResolvedValue({ result: [], metadata: null });

        render(<TvShowsPage />);

        await waitFor(() => {
            expect(
                screen.getByText('Nenhum TV show cadastrado ainda'),
            ).toBeInTheDocument();
        });
    });

    it('shows error message when fetch fails', async () => {
        mockedTvShows.getTvShows.mockRejectedValue(new Error('network error'));

        render(<TvShowsPage />);

        await waitFor(() => {
            expect(screen.getByText(/erro ao carregar tv shows/i)).toBeInTheDocument();
        });
    });

    it('shows the count of TV shows', async () => {
        mockedTvShows.getTvShows.mockResolvedValue({
            result: [lostShow, breakingBadShow],
            metadata: null,
        });

        render(<TvShowsPage />);

        await waitFor(() => {
            expect(screen.getByText(/2 séries cadastradas/i)).toBeInTheDocument();
        });
    });
});

// ─── Search filter ────────────────────────────────────────────────────────────

describe('TvShowsPage — search', () => {
    beforeEach(() => {
        mockedTvShows.getTvShows.mockResolvedValue({
            result: [lostShow, breakingBadShow],
            metadata: null,
        });
    });

    it('filters TV shows by title when searching', async () => {
        render(<TvShowsPage />);
        await waitFor(() => screen.getByText('Lost'));

        await userEvent.type(
            screen.getByPlaceholderText('Buscar por título ou descrição...'),
            'lost',
        );

        await waitFor(() => {
            expect(screen.getByText('Lost')).toBeInTheDocument();
            expect(screen.queryByText('Breaking Bad')).not.toBeInTheDocument();
        });
    });

    it('shows no-results message when no match', async () => {
        render(<TvShowsPage />);
        await waitFor(() => screen.getByText('Lost'));

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

describe('TvShowsPage — create flow', () => {
    it('opens create modal when "New TV Show" is clicked', async () => {
        mockedTvShows.getTvShows.mockResolvedValue({ result: [], metadata: null });
        render(<TvShowsPage />);
        await waitFor(() => screen.queryByText('Nenhum TV show cadastrado ainda'));

        await userEvent.click(screen.getByRole('button', { name: /new tv show/i }));

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText('New TV Show')).toBeInTheDocument();
    });

    it('closes modal on cancel', async () => {
        mockedTvShows.getTvShows.mockResolvedValue({ result: [], metadata: null });
        render(<TvShowsPage />);
        await waitFor(() => screen.queryByText('Nenhum TV show cadastrado ainda'));

        await userEvent.click(screen.getByRole('button', { name: /new tv show/i }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('creates a TV show and redirects to its detail page', async () => {
        const newShow = makeShow('TheWire', 'ts-wire');
        mockedTvShows.getTvShows
            .mockResolvedValueOnce({ result: [], metadata: null })
            .mockResolvedValueOnce({ result: [newShow], metadata: null });
        mockedTvShows.createTvShow.mockResolvedValueOnce([newShow]);

        const { container } = render(<TvShowsPage />);
        await waitFor(() => screen.queryByText('Nenhum TV show cadastrado ainda'));

        await userEvent.click(screen.getByRole('button', { name: /new tv show/i }));

        const dialog = screen.getByRole('dialog');
        await userEvent.type(within(dialog).getByPlaceholderText('Breaking Bad'), 'TheWire');
        await userEvent.type(
            within(dialog).getByPlaceholderText('Descreva a série...'),
            'Baltimore crime drama',
        );
        fireEvent.submit(container.querySelector('[role="dialog"] form')!);

        await waitFor(() => {
            expect(mockedTvShows.createTvShow).toHaveBeenCalledWith(
                expect.objectContaining({ '@assetType': 'tvShows', title: 'TheWire' }),
            );
            expect(mockedRouter.push).toHaveBeenCalledWith(
                `/tv-shows/${encodeURIComponent('TheWire')}`,
            );
        });
    });
});

// ─── Edit modal ───────────────────────────────────────────────────────────────

describe('TvShowsPage — edit flow', () => {
    it('opens edit modal with pre-filled data when edit button is clicked', async () => {
        mockedTvShows.getTvShows.mockResolvedValue({ result: [lostShow], metadata: null });

        render(<TvShowsPage />);
        await waitFor(() => screen.getByText('Lost'));

        await userEvent.click(screen.getByRole('button', { name: /editar tv show/i }));

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Lost')).toBeInTheDocument();
        });
    });

    it('calls updateTvShow and closes modal on save', async () => {
        mockedTvShows.getTvShows.mockResolvedValue({ result: [lostShow], metadata: null });
        mockedTvShows.updateTvShow.mockResolvedValueOnce(lostShow);

        const { container } = render(<TvShowsPage />);
        await waitFor(() => screen.getByText('Lost'));

        await userEvent.click(screen.getByRole('button', { name: /editar tv show/i }));
        await waitFor(() => screen.getByRole('dialog'));

        const dialog = screen.getByRole('dialog');
        const descInput = within(dialog).getByPlaceholderText('Descreva a série...');
        await userEvent.clear(descInput);
        await userEvent.type(descInput, 'Updated island drama');

        fireEvent.submit(container.querySelector('[role="dialog"] form')!);

        await waitFor(() => {
            expect(mockedTvShows.updateTvShow).toHaveBeenCalledWith(
                expect.objectContaining({ title: 'Lost', description: 'Updated island drama' }),
            );
        });
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
});

// ─── Delete flow ──────────────────────────────────────────────────────────────

describe('TvShowsPage — delete flow', () => {
    it('opens confirm dialog when delete button is clicked', async () => {
        mockedTvShows.getTvShows.mockResolvedValue({ result: [lostShow], metadata: null });

        render(<TvShowsPage />);
        await waitFor(() => screen.getByText('Lost'));

        await userEvent.click(screen.getByRole('button', { name: /excluir tv show/i }));

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText(/excluir "lost"/i)).toBeInTheDocument();
        });
    });

    it('calls remove cascade and closes dialog on confirm', async () => {
        mockedTvShows.getTvShows
            .mockResolvedValue({ result: [lostShow], metadata: null });
        mockedTvShows.deleteTvShow.mockResolvedValueOnce(undefined);

        render(<TvShowsPage />);
        await waitFor(() => screen.getByText('Lost'));

        await userEvent.click(screen.getByRole('button', { name: /excluir tv show/i }));
        await waitFor(() => screen.getByRole('dialog'));

        const dialog = screen.getByRole('dialog');
        await userEvent.click(within(dialog).getByRole('button', { name: /excluir/i }));

        await waitFor(() => {
            expect(mockedTvShows.deleteTvShow).toHaveBeenCalledWith('Lost');
        });
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('cancels delete when cancel is clicked in confirm dialog', async () => {
        mockedTvShows.getTvShows.mockResolvedValue({ result: [lostShow], metadata: null });

        render(<TvShowsPage />);
        await waitFor(() => screen.getByText('Lost'));

        await userEvent.click(screen.getByRole('button', { name: /excluir tv show/i }));
        await waitFor(() => screen.getByRole('dialog'));

        const dialog = screen.getByRole('dialog');
        await userEvent.click(within(dialog).getByRole('button', { name: /cancelar/i }));

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
        expect(mockedTvShows.deleteTvShow).not.toHaveBeenCalled();
    });
});
