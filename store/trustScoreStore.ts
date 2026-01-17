import { create } from 'zustand';

interface LoanHistory {
    total: number;
    repaid: number;
    defaulted: number;
}

interface TrustMetrics {
    walletAge: number; // in days
    txCount: number;
    loanHistory: LoanHistory;
    volume: string; // Total ETH transacted
}

interface TrustScoreState {
    score: number; // 0-100
    level: 'low' | 'medium' | 'high';
    metrics: TrustMetrics;
    loading: boolean;
    calculateScore: (address: string) => Promise<void>;
    getInterestRate: () => number;
    getColor: () => string;
}

// Mock function to simulate on-chain data fetching
const fetchOnChainData = async (address: string): Promise<TrustMetrics> => {
    // In production, this would call blockchain indexer/subgraph
    // For now, generate mock data based on address
    await new Promise(resolve => setTimeout(resolve, 1000));

    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return {
        walletAge: Math.floor((hash % 365) + 30), // 30-395 days
        txCount: Math.floor((hash % 500) + 10), // 10-510 transactions
        loanHistory: {
            total: Math.floor(hash % 10),
            repaid: Math.floor((hash % 10) * 0.8),
            defaulted: Math.floor((hash % 10) * 0.2),
        },
        volume: ((hash % 100) / 10).toFixed(2), // 0-10 ETH
    };
};

const calculateTrustScore = (metrics: TrustMetrics): number => {
    let score = 0;

    // Wallet Age (0-25 points)
    // Older wallets get more points, max at 365 days
    const ageScore = Math.min((metrics.walletAge / 365) * 25, 25);
    score += ageScore;

    // Transaction Count (0-25 points)
    // More transactions = more trust, max at 500 tx
    const txScore = Math.min((metrics.txCount / 500) * 25, 25);
    score += txScore;

    // Loan Repayment Rate (0-30 points)
    // Perfect repayment = 30 points
    if (metrics.loanHistory.total > 0) {
        const repaymentRate = metrics.loanHistory.repaid / metrics.loanHistory.total;
        score += repaymentRate * 30;
    } else {
        // No loan history = neutral (15 points)
        score += 15;
    }

    // Transaction Volume (0-20 points)
    // Higher volume = more trust, max at 50 ETH
    const volumeScore = Math.min((parseFloat(metrics.volume) / 50) * 20, 20);
    score += volumeScore;

    return Math.round(Math.min(score, 100));
};

const getTrustLevel = (score: number): 'low' | 'medium' | 'high' => {
    if (score >= 67) return 'high';
    if (score >= 34) return 'medium';
    return 'low';
};

export const useTrustScoreStore = create<TrustScoreState>((set, get) => ({
    score: 0,
    level: 'low',
    metrics: {
        walletAge: 0,
        txCount: 0,
        loanHistory: { total: 0, repaid: 0, defaulted: 0 },
        volume: '0',
    },
    loading: false,

    calculateScore: async (address: string) => {
        set({ loading: true });

        try {
            const metrics = await fetchOnChainData(address);
            const score = calculateTrustScore(metrics);
            const level = getTrustLevel(score);

            set({
                score,
                level,
                metrics,
                loading: false,
            });
        } catch (error) {
            console.error('Failed to calculate trust score:', error);
            set({ loading: false });
        }
    },

    getInterestRate: () => {
        const { score } = get();

        // Interest rate formula:
        // Base rate: 10%
        // Trust multiplier: (100 - score) / 100
        // Final rate: Base + (Base * Multiplier * 2)
        // 
        // Examples:
        // Score 100 → 10%
        // Score 50 → 20%
        // Score 0 → 30%

        const baseRate = 10;
        const trustMultiplier = (100 - score) / 100;
        const finalRate = baseRate + (baseRate * trustMultiplier * 2);

        return Math.round(finalRate * 100) / 100; // Round to 2 decimals
    },

    getColor: () => {
        const { level } = get();

        switch (level) {
            case 'high':
                return 'hsl(150, 100%, 50%)'; // Green
            case 'medium':
                return 'hsl(45, 100%, 50%)'; // Yellow
            case 'low':
                return 'hsl(0, 100%, 60%)'; // Red
            default:
                return 'hsl(var(--text-secondary))';
        }
    },
}));
