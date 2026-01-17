'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TrendingUp, Wallet, Clock, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import TrustScoreRing from '@/components/TrustScoreRing';
import { useWalletStore } from '@/store/walletStore';
import { useTrustScoreStore } from '@/store/trustScoreStore';

export default function BorrowPage() {
    const { address, isConnected, balance } = useWalletStore();
    const { score, calculateScore, getInterestRate } = useTrustScoreStore();

    const [collateralAmount, setCollateralAmount] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [duration, setDuration] = useState(30); // days
    const [loading, setLoading] = useState(false);

    // Calculate trust score when wallet connects
    useEffect(() => {
        if (isConnected && address) {
            calculateScore(address);
        }
    }, [isConnected, address, calculateScore]);

    const interestRate = getInterestRate();
    const maxLTV = 0.75; // 75% Loan-to-Value ratio
    const maxLoan = collateralAmount ? (parseFloat(collateralAmount) * maxLTV).toFixed(4) : '0';

    const calculateRepayment = () => {
        if (!loanAmount) return { principal: 0, interest: 0, total: 0 };

        const principal = parseFloat(loanAmount);
        const interest = (principal * (interestRate / 100) * (duration / 365));
        const total = principal + interest;

        return {
            principal,
            interest,
            total,
        };
    };

    const repayment = calculateRepayment();

    const handleBorrow = async () => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }

        if (!collateralAmount || !loanAmount) {
            alert('Please enter collateral and loan amounts');
            return;
        }

        if (parseFloat(loanAmount) > parseFloat(maxLoan)) {
            alert(`Loan amount exceeds maximum LTV of 75%`);
            return;
        }

        setLoading(true);
        // Simulate transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('Loan created successfully! (Mock transaction)');
        setLoading(false);
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-[hsl(var(--background))]">
                <Navbar mode="app" />
                <main className="container mx-auto px-4 py-20">
                    <motion.div
                        className="max-w-md mx-auto text-center card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Wallet className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--primary))]" />
                        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                        <p className="text-[hsl(var(--text-secondary))] mb-6">
                            Please connect your wallet to access the borrowing platform
                        </p>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            <Navbar mode="app" />

            <main className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-5xl font-bold mb-4">Borrow Platform</h1>
                    <p className="text-xl text-[hsl(var(--text-secondary))]">
                        Trust-based lending with dynamic interest rates
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Trust Score & Wallet */}
                    <div className="space-y-6">
                        {/* Trust Score */}
                        <motion.div
                            className="card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <TrustScoreRing size="lg" showLabel showBreakdown />
                        </motion.div>

                        {/* Wallet Summary */}
                        <motion.div
                            className="card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="text-lg font-bold mb-4">Wallet Summary</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-[hsl(var(--text-secondary))] mb-1">Address</div>
                                    <div className="font-mono text-sm">{address?.slice(0, 10)}...{address?.slice(-8)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-[hsl(var(--text-secondary))] mb-1">Balance</div>
                                    <div className="text-2xl font-bold">{balance} ETH</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Middle Column - Borrow Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Interest Rate Display */}
                        <motion.div
                            className="card bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--secondary))]/10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-[hsl(var(--text-secondary))] mb-1">Your Interest Rate</div>
                                    <div className="text-4xl font-bold gradient-text">{interestRate}% APR</div>
                                    <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">
                                        Based on your trust score of {score}
                                    </div>
                                </div>
                                <TrendingUp className="w-12 h-12 text-[hsl(var(--primary))]" />
                            </div>
                        </motion.div>

                        {/* Collateral Input */}
                        <motion.div
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h3 className="text-lg font-bold mb-4">Collateral</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Collateral Amount (ETH)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={collateralAmount}
                                            onChange={(e) => setCollateralAmount(e.target.value)}
                                            placeholder="0.0"
                                            step="0.01"
                                            className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                        />
                                        <button
                                            onClick={() => setCollateralAmount(balance)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))]"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>
                                <div className="glass p-3 rounded-lg">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[hsl(var(--text-secondary))]">Max Loan (75% LTV)</span>
                                        <span className="font-semibold">{maxLoan} ETH</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Loan Amount */}
                        <motion.div
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3 className="text-lg font-bold mb-4">Loan Amount</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Amount to Borrow (ETH)</label>
                                    <input
                                        type="number"
                                        value={loanAmount}
                                        onChange={(e) => setLoanAmount(e.target.value)}
                                        placeholder="0.0"
                                        step="0.01"
                                        max={maxLoan}
                                        className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                    />
                                </div>

                                {/* Loan Amount Slider */}
                                <div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={maxLoan}
                                        step="0.01"
                                        value={loanAmount || 0}
                                        onChange={(e) => setLoanAmount(e.target.value)}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-[hsl(var(--text-secondary))] mt-1">
                                        <span>0 ETH</span>
                                        <span>{maxLoan} ETH</span>
                                    </div>
                                </div>

                                {parseFloat(loanAmount) > parseFloat(maxLoan) && (
                                    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>Loan amount exceeds maximum LTV ratio</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Duration */}
                        <motion.div
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h3 className="text-lg font-bold mb-4">Loan Duration</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {[7, 14, 30].map((days) => (
                                    <button
                                        key={days}
                                        onClick={() => setDuration(days)}
                                        className={`p-4 rounded-lg font-semibold transition-all ${duration === days
                                                ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white'
                                                : 'glass glass-hover'
                                            }`}
                                    >
                                        <Clock className="w-5 h-5 mx-auto mb-2" />
                                        {days} Days
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Repayment Summary */}
                        <motion.div
                            className="card bg-gradient-to-br from-[hsl(var(--card-bg))] to-[hsl(var(--background))]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <h3 className="text-lg font-bold mb-4">Repayment Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-[hsl(var(--text-secondary))]">Principal</span>
                                    <span className="font-semibold">{repayment.principal.toFixed(4)} ETH</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[hsl(var(--text-secondary))]">Interest ({interestRate}% for {duration} days)</span>
                                    <span className="font-semibold">{repayment.interest.toFixed(4)} ETH</span>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex justify-between">
                                    <span className="font-bold">Total Repayment</span>
                                    <span className="text-2xl font-bold gradient-text">{repayment.total.toFixed(4)} ETH</span>
                                </div>
                                <div className="text-sm text-[hsl(var(--text-secondary))]">
                                    Due in {duration} days
                                </div>
                            </div>
                        </motion.div>

                        {/* Borrow Button */}
                        <motion.button
                            onClick={handleBorrow}
                            disabled={loading || !collateralAmount || !loanAmount || parseFloat(loanAmount) > parseFloat(maxLoan)}
                            className="gradient-button w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                        >
                            {loading ? 'Processing...' : 'Borrow Now'}
                        </motion.button>
                    </div>
                </div>
            </main>
        </div>
    );
}
