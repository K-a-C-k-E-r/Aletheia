'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTrustScoreStore } from '@/store/trustScoreStore';

interface TrustScoreRingProps {
    score?: number; // Optional override score
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    showBreakdown?: boolean;
    animated?: boolean;
}

const sizeMap = {
    sm: { ring: 80, stroke: 6, text: 'text-xl' },
    md: { ring: 120, stroke: 8, text: 'text-3xl' },
    lg: { ring: 160, stroke: 10, text: 'text-5xl' },
};

export default function TrustScoreRing({
    score: propScore,
    size = 'md',
    showLabel = true,
    showBreakdown = false,
    animated = true,
}: TrustScoreRingProps) {
    const { score: storeScore, level, metrics, getColor } = useTrustScoreStore();
    const score = propScore !== undefined ? propScore : storeScore;

    const [displayScore, setDisplayScore] = useState(0);
    const { ring, stroke, text } = sizeMap[size];
    const radius = (ring - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayScore / 100) * circumference;
    const color = getColor();

    // Animate score count-up
    useEffect(() => {
        if (!animated) {
            setDisplayScore(score);
            return;
        }

        let start = 0;
        const duration = 1500; // 1.5 seconds
        const increment = score / (duration / 16); // 60fps

        const timer = setInterval(() => {
            start += increment;
            if (start >= score) {
                setDisplayScore(score);
                clearInterval(timer);
            } else {
                setDisplayScore(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [score, animated]);

    const getLevelBadge = () => {
        const badges = {
            high: { text: 'High Trust', bg: 'bg-green-500/20', textColor: 'text-green-400' },
            medium: { text: 'Medium Trust', bg: 'bg-yellow-500/20', textColor: 'text-yellow-400' },
            low: { text: 'Low Trust', bg: 'bg-red-500/20', textColor: 'text-red-400' },
        };

        const badge = badges[level];
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.textColor}`}>
                {badge.text}
            </span>
        );
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Trust Score Ring */}
            <div className="relative" style={{ width: ring, height: ring }}>
                <svg className="transform -rotate-90" width={ring} height={ring}>
                    {/* Background circle */}
                    <circle
                        cx={ring / 2}
                        cy={ring / 2}
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={stroke}
                        fill="none"
                    />

                    {/* Progress circle */}
                    <motion.circle
                        cx={ring / 2}
                        cy={ring / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={stroke}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                </svg>

                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        className={`${text} font-bold`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                    >
                        {displayScore}
                    </motion.div>
                </div>
            </div>

            {/* Label */}
            {showLabel && (
                <div className="text-center">
                    <div className="text-sm text-[hsl(var(--text-secondary))] mb-2">Trust Score</div>
                    {getLevelBadge()}
                </div>
            )}

            {/* Breakdown */}
            {showBreakdown && (
                <motion.div
                    className="glass p-4 rounded-lg w-full max-w-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                >
                    <div className="text-sm font-semibold mb-3">Score Breakdown</div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[hsl(var(--text-secondary))]">Wallet Age</span>
                            <span>{metrics.walletAge} days</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[hsl(var(--text-secondary))]">Transactions</span>
                            <span>{metrics.txCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[hsl(var(--text-secondary))]">Loans Repaid</span>
                            <span>
                                {metrics.loanHistory.repaid}/{metrics.loanHistory.total}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[hsl(var(--text-secondary))]">Total Volume</span>
                            <span>{metrics.volume} ETH</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
