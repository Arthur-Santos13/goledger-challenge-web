import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EpisodeForm from '@/components/episodes/EpisodeForm';
import type { Episode } from '@/types';

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

beforeEach(() => {
    mockOnSubmit.mockReset();
    mockOnCancel.mockReset();
    mockOnSubmit.mockResolvedValue(undefined);
});

// ─── Create mode ──────────────────────────────────────────────────────────────

describe('EpisodeForm — create mode', () => {
    it('renders all form fields', () => {
        render(
            <EpisodeForm
                tvShowTitle="Lost"
                seasonNumber={1}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        expect(screen.getByPlaceholderText('1')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Nome do episódio')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('dd/mm/aaaa')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Descreva o episódio...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /criar episódio/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('shows error when episode number is missing', async () => {
        const { container } = render(
            <EpisodeForm
                tvShowTitle="Lost"
                seasonNumber={1}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        // Fill title but leave episode number empty; use fireEvent.submit to bypass HTML5 validation
        await userEvent.type(screen.getByPlaceholderText('Nome do episódio'), 'Pilot');
        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(
                screen.getByText(/número do episódio deve ser um inteiro positivo/i),
            ).toBeInTheDocument();
        });
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows error when title is empty', async () => {
        const { container } = render(
            <EpisodeForm
                tvShowTitle="Lost"
                seasonNumber={1}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '1' } });
        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
        });
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with correct payload', async () => {
        const { container } = render(
            <EpisodeForm
                tvShowTitle="Lost"
                seasonNumber={1}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '3' } });
        await userEvent.type(screen.getByPlaceholderText('Nome do episódio'), 'Tabula Rasa');
        await userEvent.type(screen.getByPlaceholderText('Descreva o episódio...'), 'Kate flashback');

        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    '@assetType': 'episodes',
                    episodeNumber: 3,
                    title: 'Tabula Rasa',
                    description: 'Kate flashback',
                    season: {
                        '@assetType': 'seasons',
                        number: 1,
                        tvShow: { '@assetType': 'tvShows', title: 'Lost' },
                    },
                }),
            );
        });
    });

    it('includes optional rating when provided', async () => {
        const { container } = render(
            <EpisodeForm
                tvShowTitle="Lost"
                seasonNumber={1}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '1' } });
        await userEvent.type(screen.getByPlaceholderText('Nome do episódio'), 'Pilot');
        fireEvent.change(screen.getByPlaceholderText('Opcional'), { target: { value: '9.5' } });

        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ rating: 9.5 }),
            );
        });
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(
            <EpisodeForm
                tvShowTitle="Lost"
                seasonNumber={1}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
});

// ─── Edit mode ────────────────────────────────────────────────────────────────

describe('EpisodeForm — edit mode', () => {
    const existingEpisode: Episode = {
        '@assetType': 'episodes',
        '@key': 'ep-key',
        '@lastTouchBy': 'user',
        '@lastTx': 'tx1',
        '@lastTxID': 'txid1',
        '@lastUpdated': '2024-01-01',
        episodeNumber: 2,
        title: 'Tabula Rasa',
        description: 'Kate flashback',
        releaseDate: '2004-10-06T00:00:00.000Z',
        rating: 8.5,
        season: {
            '@assetType': 'seasons',
            '@key': 's-key',
            number: 1,
            tvShow: { '@assetType': 'tvShows', '@key': 'ts-key' },
        },
    };

    it('pre-fills form fields from initial data', () => {
        render(
            <EpisodeForm
                tvShowTitle="Lost"
                seasonNumber={1}
                initial={existingEpisode}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // episode number
        expect(screen.getByDisplayValue('Tabula Rasa')).toBeInTheDocument();
        expect(screen.getByDisplayValue('8.5')).toBeInTheDocument();
    });

    it('episode number is disabled in edit mode', () => {
        render(
            <EpisodeForm
                tvShowTitle="Lost"
                seasonNumber={1}
                initial={existingEpisode}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );
        expect(screen.getByDisplayValue('2')).toBeDisabled();
    });

    it('submit button reads "Salvar alterações" in edit mode', () => {
        render(
            <EpisodeForm
                tvShowTitle="Lost"
                seasonNumber={1}
                initial={existingEpisode}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );
        expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
    });
});
