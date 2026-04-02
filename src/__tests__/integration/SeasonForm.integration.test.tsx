import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SeasonForm from '@/components/seasons/SeasonForm';
import type { Season } from '@/types';

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

beforeEach(() => {
    mockOnSubmit.mockReset();
    mockOnCancel.mockReset();
    mockOnSubmit.mockResolvedValue(undefined);
});

// ─── Create mode ──────────────────────────────────────────────────────────────

describe('SeasonForm — create mode', () => {
    it('renders fields with the TV show title', () => {
        render(<SeasonForm tvShowTitle="Lost" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        expect(screen.getByText('Lost')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('1')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('shows error when season number is 0', async () => {
        const { container } = render(
            <SeasonForm tvShowTitle="Lost" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
        );

        // fireEvent.change is reliable for number inputs; fireEvent.submit bypasses HTML5 constraint validation
        fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '0' } });
        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(
                screen.getByText('Número da temporada deve ser maior que 0'),
            ).toBeInTheDocument();
        });
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows error for invalid year (below 1900)', async () => {
        const { container } = render(
            <SeasonForm tvShowTitle="Lost" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
        );

        fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '1' } });
        fireEvent.change(
            screen.getByDisplayValue(String(new Date().getFullYear())),
            { target: { value: '1800' } },
        );
        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(screen.getByText('Ano inválido')).toBeInTheDocument();
        });
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with correct payload', async () => {
        const { container } = render(
            <SeasonForm tvShowTitle="Lost" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
        );

        fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '2' } });
        fireEvent.change(
            screen.getByDisplayValue(String(new Date().getFullYear())),
            { target: { value: '2005' } },
        );

        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                '@assetType': 'seasons',
                number: 2,
                year: 2005,
                tvShow: { '@assetType': 'tvShows', title: 'Lost' },
            });
        });
    });

    it('calls onCancel when cancel is clicked', () => {
        render(<SeasonForm tvShowTitle="Lost" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
        fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('displays API error when onSubmit rejects with 409', async () => {
        mockOnSubmit.mockRejectedValueOnce({ response: { status: 409 } });

        const { container } = render(
            <SeasonForm tvShowTitle="Lost" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
        );

        fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '1' } });
        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(screen.getByText('A temporada 1 já existe')).toBeInTheDocument();
        });
    });
});

// ─── Edit mode ────────────────────────────────────────────────────────────────

describe('SeasonForm — edit mode', () => {
    const existingSeason: Season = {
        '@assetType': 'seasons',
        '@key': 's-key',
        '@lastTouchBy': 'user',
        '@lastTx': 'tx1',
        '@lastTxID': 'txid1',
        '@lastUpdated': '2024-01-01',
        number: 3,
        year: 2006,
        tvShow: { '@assetType': 'tvShows', '@key': 'ts-key' },
    };

    it('pre-fills form fields from initial data', () => {
        render(
            <SeasonForm
                tvShowTitle="Lost"
                initial={existingSeason}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        expect(screen.getByDisplayValue('3')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2006')).toBeInTheDocument();
    });

    it('season number input is disabled in edit mode', () => {
        render(
            <SeasonForm
                tvShowTitle="Lost"
                initial={existingSeason}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );

        expect(screen.getByDisplayValue('3')).toBeDisabled();
    });

    it('submit button reads "Salvar" in edit mode', () => {
        render(
            <SeasonForm
                tvShowTitle="Lost"
                initial={existingSeason}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />,
        );
        expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    });
});
