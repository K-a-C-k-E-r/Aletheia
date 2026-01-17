'use client';

import { motion } from 'framer-motion';
import { Search, Filter, Plus, Heart, Shield, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Mock campaign data
const mockCampaigns = [
    {
        id: 1,
        title: 'Medical Aid for Children',
        description: 'Help provide medical care for underprivileged children',
        goal: '10',
        raised: '7.5',
        creator: '0x1234...5678',
        image: '/api/placeholder/400/300',
        trustScore: 85,
        aiVerified: true,
        communityApproved: true,
    },
    {
        id: 2,
        title: 'Education for Rural Kids',
        description: 'Building a school in remote village',
        goal: '15',
        raised: '12.3',
        creator: '0xabcd...efgh',
        image: '/api/placeholder/400/300',
        trustScore: 92,
        aiVerified: true,
        communityApproved: true,
    },
    {
        id: 3,
        title: 'Clean Water Project',
        description: 'Providing clean water access to 1000 families',
        goal: '20',
        raised: '5.8',
        creator: '0x9876...4321',
        image: '/api/placeholder/400/300',
        trustScore: 78,
        aiVerified: true,
        communityApproved: false,
    },
];

export default function CrowdfundingView() {
    const [searchQuery, setSearchQuery] = useState('');

    const getTrustColor = (score: number) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#eab308';
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

            {/* Two Main Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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

            {/* Search & Filter */}
            <motion.div
                className="flex flex-col md:flex-row gap-4 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--text-muted))]" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass w-full pl-12 pr-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] bg-black/20"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                    />
                </div>
                <button className="glass glass-hover px-6 py-3 rounded-lg flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    <span>Filters</span>
                </button>
            </motion.div>

            {/* Campaign Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockCampaigns.map((campaign, i) => (
                    <Link key={campaign.id} href={`/campaign/${campaign.id}`}>
                        <motion.div
                            className="card glass-hover cursor-pointer group overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            whileHover={{ y: -8, boxShadow: '0 8px 32px rgba(96, 165, 250, 0.1)' }}
                        >
                            {/* Image Placeholder */}
                            <div className="w-full h-48 rounded-lg mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <div className="w-full h-full flex items-center justify-center text-[hsl(var(--text-muted))]">
                                    <Heart className="w-12 h-12" />
                                </div>
                            </div>

                            {/* Trust Score Badge */}
                            <div className="flex items-center gap-2 mb-3">
                                <div
                                    className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
                                    style={{
                                        background: `${getTrustColor(campaign.trustScore)}20`,
                                        color: getTrustColor(campaign.trustScore),
                                    }}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: getTrustColor(campaign.trustScore) }} />
                                    Trust {campaign.trustScore}
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
                                        {campaign.raised} / {campaign.goal} ETH
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
                    </Link>
                ))}
            </div>
        </main>
    );
}
