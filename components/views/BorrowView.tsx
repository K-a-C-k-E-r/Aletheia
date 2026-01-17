'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';
import TrustScoreRing from '@/components/TrustScoreRing';
import { useWalletStore } from '@/store/walletStore';
import { useTrustScoreStore } from '@/store/trustScoreStore';

export default function BorrowView() {
    const { address, balance } = useWalletStore();
    const { score, getInterestRate } = useTrustScoreStore();

    const [collateralAmount, setCollateralAmount] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [duration, setDuration] = useState(30);
    const [loading, setLoading] = useState(false);

    const interestRate = getInterestRate();
    const maxLTV = 0.75;
    const maxLoan = collateralAmount ? (parseFloat(collateralAmount) * maxLTV).toFixed(4) : '0';

    const calculateRepayment = () => {
        if (!loanAmount) return { principal: 0, interest: 0, total: 0 };

        const principal = parseFloat(loanAmount);
        const interest = principal * (interestRate / 100) * (duration / 365);
        const total = principal + interest;

        return { principal, interest, total };
    };

    const repayment = calculateRepayment();

    const handleBorrow = async () => {
        if (!collateralAmount || !loanAmount) {
            alert('Please enter collateral and loan amounts');
            return;
        }

        if (parseFloat(loanAmount) > parseFloat(maxLoan)) {
            alert(`Loan amount exceeds maximum LTV of 75%`);
            return;
        }

        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        alert('Loan created successfully! (Mock transaction)');
        setLoading(false);
    };

    return (
        <main className="container mx-auto px-4 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <h1 className="text-5xl font-bold mb-4">Aletheia Lending</h1>
                <p className="text-xl text-[hsl(var(--text-secondary))]">
                    Truth-based lending with dynamic interest rates
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Trust Score & Wallet */}
                <div className="space-y-6">
                    <motion.div className="card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <TrustScoreRing size="lg" showLabel showBreakdown />
                    </motion.div>

                    <motion.div className="card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <h3 className="text-lg font-bold mb-4">Wallet Summary</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm text-[hsl(var(--text-muted))] mb-1">Address</div>
                                <div className="font-mono text-sm text-[hsl(var(--text-secondary))]">
                                    {address?.slice(0, 10)}...{address?.slice(-8)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-[hsl(var(--text-muted))] mb-1">Balance</div>
                                <div className="text-2xl font-bold">{balance} ETH</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Borrow Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Interest Rate */}
                    <motion.div
                        className="card"
                        style={{
                            background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.05), rgba(168, 85, 247, 0.05))',
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-[hsl(var(--text-muted))] mb-1">Your Interest Rate</div>
                                <div className="text-4xl font-bold gradient-text">{interestRate}% APR</div>
                                <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">
                                    Based on your trust score of {score}
                                </div>
                            </div>
                            <TrendingUp className="w-12 h-12 text-[hsl(var(--primary))]" />
                        </div>
                    </motion.div>

                    {/* Collateral */}
                    <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <h3 className="text-lg font-bold mb-4">Collateral</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[hsl(var(--text-secondary))]">
                                    Collateral Amount (ETH)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={collateralAmount}
                                        onChange={(e) => setCollateralAmount(e.target.value)}
                                        placeholder="0.0"
                                        step="0.01"
                                        className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] bg-black/20"
                                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                                    />
                                    <button
                                        onClick={() => setCollateralAmount(balance)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))] font-semibold"
                                    >
                                        MAX
                                    </button>
                                </div>
                            </div>
                            <div className="glass p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[hsl(var(--text-muted))]">Max Loan (75% LTV)</span>
                                    <span className="font-semibold">{maxLoan} ETH</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Loan Amount */}
                    <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <h3 className="text-lg font-bold mb-4">Loan Amount</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[hsl(var(--text-secondary))]">
                                    Amount to Borrow (ETH)
                                </label>
                                <input
                                    type="number"
                                    value={loanAmount}
                                    onChange={(e) => setLoanAmount(e.target.value)}
                                    placeholder="0.0"
                                    step="0.01"
                                    max={maxLoan}
                                    className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] bg-black/20"
                                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                                />
                            </div>

                            <div>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxLoan}
                                    step="0.01"
                                    value={loanAmount || 0}
                                    onChange={(e) => setLoanAmount(e.target.value)}
                                    className="w-full accent-[hsl(var(--primary))]"
                                />
                                <div className="flex justify-between text-xs text-[hsl(var(--text-muted))] mt-1">
                                    <span>0 ETH</span>
                                    <span>{maxLoan} ETH</span>
                                </div>
                            </div>

                            {parseFloat(loanAmount) > parseFloat(maxLoan) && (
                                <div className="flex items-center gap-2 text-sm text-red-400 p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Loan amount exceeds maximum LTV ratio</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Duration */}
                    <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
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
                    <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <h3 className="text-lg font-bold mb-4">Repayment Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[hsl(var(--text-secondary))]">Principal</span>
                                <span className="font-semibold">{repayment.principal.toFixed(4)} ETH</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[hsl(var(--text-secondary))]">
                                    Interest ({interestRate}% for {duration} days)
                                </span>
                                <span className="font-semibold">{repayment.interest.toFixed(4)} ETH</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                <span className="font-bold">Total Repayment</span>
                                <span className="text-2xl font-bold gradient-text">{repayment.total.toFixed(4)} ETH</span>
                            </div>
                            <div className="text-sm text-[hsl(var(--text-muted))]">Due in {duration} days</div>
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
    );
}
