'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Heart, TrendingUp, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';

interface Campaign {
    id: string;
    title: string;
    description: string;
    creator: string;
    goal: string;
    raised: string;
    contributors: number;
    trustScore: number;
    aiVerified: boolean;
    communityApproved: boolean;
    ipfsHash?: string;
}

export default function CrowdfundingView() {
    const { address, isConnected } = useWalletStore();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        setError(null);

        try {
            // TODO: Replace with real contract call
            // const factory = getCampaignFactoryContract();
            // const campaignData = await factory.getAllCampaigns();

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // For now, set empty array - will be populated from blockchain
            setCampaigns([]);
        } catch (err) {
            console.error('Failed to fetch campaigns:', err);
            setError('Failed to load campaigns. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getTrustColor = (score: number) => {
        if (score >= 70) return '#22c55e';
        if (score >= 40) return '#eab308';
        return '#ef4444';
    };

    return (
        <main className="container mx-auto px-4 py-12">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <h1 className="text-5xl font-bold mb-4">Aletheia Raise</h1>
                <p className="text-xl text-[hsl(var(--text-secondary))]">
                    Gemini AI & Community Verified Campaigns
                </p>
            </motion.div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {/* Create Campaign Card */}
                <Link href="/create">
                    <motion.div
                        className="card glass-hover cursor-pointer group"
                        style={{
                            background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.08), rgba(168, 85, 247, 0.08))',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -5, boxShadow: '0 0 30px rgba(96, 165, 250, 0.15)' }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center">
                                <Plus className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-1">Start an Aletheia Campaign</h3>
                                <p className="text-sm text-[hsl(var(--text-secondary))]">
                                    Create your truth-verified campaign
                                </p>
                            </div>
                        </div>
                        <p className="text-[hsl(var(--text-muted))] mb-4">
                            Upload documents, get Gemini AI verification, and receive community approval to launch your campaign with full transparency.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-[hsl(var(--primary))] group-hover:gap-3 transition-all">
                            <span className="font-semibold">Create Campaign</span>
                            <span>→</span>
                        </div>
                    </motion.div>
                </Link>

                {/* Contribute Card */}
                <motion.div
                    className="card glass-hover cursor-pointer group"
                    style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(96, 165, 250, 0.08))',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -5, boxShadow: '0 0 30px rgba(34, 197, 94, 0.15)' }}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                            <Heart className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-1">Support with Trust</h3>
                            <p className="text-sm text-[hsl(var(--text-secondary))]">
                                Support verified causes
                            </p>
                        </div>
                    </div>
                    <p className="text-[hsl(var(--text-muted))] mb-4">
                        Browse Aletheia-verified campaigns, vote on legitimacy, and contribute with automatic fraud protection and refund guarantees.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-green-400 group-hover:gap-3 transition-all">
                        <span className="font-semibold">Explore Campaigns</span>
                        <span>→</span>
                    </div>
                </motion.div>
            </div>


            {/* Campaign Feed Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold">Active Campaigns</h2>
                    {!loading && campaigns.length > 0 && (
                        <button
                            onClick={fetchCampaigns}
                            className="glass glass-hover px-4 py-2 rounded-lg text-sm"
                        >
                            Refresh
                        </button>
                    )}
                </div>
            </div>

            {/* Campaign Grid - Only shown when campaigns exist */}
            {!loading && !error && campaigns.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign, i) => (
                        <motion.div
                            key={campaign.id}
                            className="card glass-hover cursor-pointer group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            {/* Trust Score Badge */}
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="px-3 py-1 rounded-full text-xs font-bold"
                                    style={{
                                        backgroundColor: `${getTrustColor(campaign.trustScore)}20`,
                                        color: getTrustColor(campaign.trustScore),
                                    }}
                                >
                                    <TrendingUp className="w-3 h-3 inline mr-1" />
                                    Trust: {campaign.trustScore}
                                </div>
                                {campaign.aiVerified && (
                                    <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 bg-blue-500/20 text-blue-400">
                                        <Shield className="w-3 h-3" />
                                        Aletheia Verified
                                    </div>
                                )}
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-xl font-bold mb-2 group-hover:text-[hsl(var(--primary))] transition-colors">
                                {campaign.title}
                            </h3>
                            <p className="text-sm text-[hsl(var(--text-muted))] mb-4 line-clamp-2">
                                {campaign.description}
                            </p>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-[hsl(var(--text-secondary))]">Raised</span>
                                    <span className="font-semibold">
                                        {campaign.raised} / {campaign.goal} TAO
                                    </span>
                                </div>
                                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(parseFloat(campaign.raised) / parseFloat(campaign.goal)) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="flex items-center gap-2">
                                    {campaign.communityApproved && (
                                        <div className="flex items-center gap-1 text-xs text-green-400">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            <span>Community Approved</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 font-semibold">
                                    Refund Protected by Code
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </main>
    );
}
