'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp, ThumbsDown, Heart, Shield, Users, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useWalletStore } from '@/store/walletStore';
import { getCampaignContract, formatEther, parseEther, loadDeploymentAddresses } from '@/lib/contracts';
import { fetchFromIPFS } from '@/lib/ipfs';

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
    const { address, isConnected } = useWalletStore();
    const [donationAmount, setDonationAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [campaignData, setCampaignData] = useState<any>(null);
    const [voting, setVoting] = useState(false);
    const [contributing, setContributing] = useState(false);

    useEffect(() => {
        fetchCampaignData();
    }, [params.id]);

    const fetchCampaignData = async () => {
        setLoading(true);
        try {
            await loadDeploymentAddresses();
            const campaign = await getCampaignContract(params.id);

            if (!campaign) {
                throw new Error('Campaign not found');
            }

            const [
                creator,
                fundingGoal,
                totalRaised,
                deadline,
                aiVerified,
                communityApproved,
                fraudDetected,
                withdrawn,
                yesVotes,
                noVotes,
                contributorCount
            ] = await campaign.getCampaignStatus();

            const ipfsHash = await campaign.ipfsHash();
            const trustScore = await campaign.getTrustScore();
            const userContribution = isConnected && address ? await campaign.contributions(address) : 0n;
            const hasVoted = isConnected && address ? await campaign.hasVoted(address) : false;

            // Fetch metadata from IPFS
            let title = 'Campaign';
            let description = 'No description available';

            if (ipfsHash) {
                try {
                    const metadata = await fetchFromIPFS(ipfsHash);
                    if (metadata) {
                        title = metadata.title || title;
                        description = metadata.description || description;
                    }
                } catch (e) {
                    console.log('Failed to fetch IPFS metadata');
                }
            }

            const now = Math.floor(Date.now() / 1000);
            const daysLeft = Math.max(0, Math.floor((Number(deadline) - now) / (24 * 60 * 60)));

            setCampaignData({
                address: params.id,
                title,
                description,
                creator,
                goal: formatEther(fundingGoal),
                raised: formatEther(totalRaised),
                backers: Number(contributorCount),
                daysLeft,
                trustScore: Number(trustScore),
                aiVerified,
                communityApproved,
                yesVotes: Number(yesVotes),
                noVotes: Number(noVotes),
                fraudDetected,
                withdrawn,
                userContribution: formatEther(userContribution),
                hasVoted,
                ipfsHash
            });
        } catch (error) {
            console.error('Failed to fetch campaign:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContribute = async () => {
        if (!donationAmount || !isConnected) {
            alert('Please connect wallet and enter amount');
            return;
        }

        setContributing(true);
        try {
            const campaign = await getCampaignContract(params.id);
            if (!campaign) throw new Error('Campaign not found');

            const tx = await campaign.contribute({ value: parseEther(donationAmount) });
            await tx.wait();

            alert('Contribution successful!');
            setDonationAmount('');
            fetchCampaignData();
        } catch (error: any) {
            console.error('Contribution failed:', error);
            alert(`Contribution failed: ${error.message || 'Unknown error'}`);
        } finally {
            setContributing(false);
        }
    };

    const handleVote = async (approve: boolean) => {
        if (!isConnected) {
            alert('Please connect your wallet');
            return;
        }

        setVoting(true);
        try {
            const campaign = await getCampaignContract(params.id);
            if (!campaign) throw new Error('Campaign not found');

            const tx = await campaign.vote(approve);
            await tx.wait();

            alert(`Vote ${approve ? 'approved' : 'rejected'} successfully!`);
            fetchCampaignData();
        } catch (error: any) {
            console.error('Vote failed:', error);
            alert(`Vote failed: ${error.message || 'Unknown error'}`);
        } finally {
            setVoting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ background: '#000' }}>
                <Navbar mode="app" activeTab="crowdfunding" />
                <div className="flex items-center justify-center h-[80vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[hsl(var(--text-secondary))]">Loading campaign...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!campaignData) {
        return (
            <div className="min-h-screen" style={{ background: '#000' }}>
                <Navbar mode="app" activeTab="crowdfunding" />
                <div className="flex items-center justify-center h-[80vh]">
                    <div className="text-center">
                        <p className="text-xl">Campaign not found</p>
                        <Link href="/app" className="gradient-button inline-block mt-4">
                            Back to Campaigns
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const campaign = campaignData;
    const progress = (parseFloat(campaign.raised) / parseFloat(campaign.goal)) * 100;

    return (
        <div className="min-h-screen" style={{ background: '#000' }}>
            {/* Navbar */}
            <Navbar mode="app" activeTab="crowdfunding" />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Campaign Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Campaign Hero */}
                        <motion.div
                            className="card p-0 overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="w-full h-96 bg-gradient-to-br from-[hsl(var(--primary))]/20 to-[hsl(var(--secondary))]/20 flex items-center justify-center">
                                <span className="text-9xl">🏥</span>
                            </div>
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-4">
                                    <h1 className="text-4xl font-bold">{campaign.title}</h1>
                                    {/* Trust Score Ring */}
                                    <div className="flex flex-col items-center">
                                        <div className="relative w-16 h-16">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle
                                                    cx="32"
                                                    cy="32"
                                                    r="28"
                                                    stroke="hsl(var(--card-bg))"
                                                    strokeWidth="8"
                                                    fill="none"
                                                />
                                                <circle
                                                    cx="32"
                                                    cy="32"
                                                    r="28"
                                                    stroke="url(#gradient)"
                                                    strokeWidth="8"
                                                    fill="none"
                                                    strokeDasharray={`${(campaign.trustScore / 100) * 176} 176`}
                                                    strokeLinecap="round"
                                                />
                                                <defs>
                                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                                                        <stop offset="100%" stopColor="hsl(var(--secondary))" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-lg font-bold">{campaign.trustScore}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-[hsl(var(--text-secondary))] mt-1">Trust Score</span>
                                    </div>
                                </div>

                                <p className="text-lg text-[hsl(var(--text-secondary))] mb-6">
                                    {campaign.description}
                                </p>

                                {/* Status Badges */}
                                <div className="flex gap-2 flex-wrap">
                                    {campaign.aiVerified && (
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center gap-1">
                                            <Shield className="w-4 h-4" />
                                            AI Verified
                                        </span>
                                    )}
                                    {campaign.communityApproved && (
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            Community Approved
                                        </span>
                                    )}
                                    {campaign.fraudDetected && (
                                        <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full flex items-center gap-1">
                                            <AlertTriangle className="w-4 h-4" />
                                            Fraud Detected - Refunds Available
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Community Voting */}
                        <motion.div
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="text-2xl font-bold mb-4">Community Voting</h2>
                            <p className="text-[hsl(var(--text-secondary))] mb-6">
                                Contributors can vote on campaign legitimacy
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="glass p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ThumbsUp className="w-5 h-5 text-green-400" />
                                        <span className="font-semibold">Yes Votes</span>
                                    </div>
                                    <p className="text-3xl font-bold text-green-400">{campaign.yesVotes}</p>
                                </div>
                                <div className="glass p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ThumbsDown className="w-5 h-5 text-red-400" />
                                        <span className="font-semibold">No Votes</span>
                                    </div>
                                    <p className="text-3xl font-bold text-red-400">{campaign.noVotes}</p>
                                </div>
                            </div>

                            {/* Vote Progress */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Approval Rate</span>
                                    <span className="font-semibold">
                                        {Math.round((campaign.yesVotes / (campaign.yesVotes + campaign.noVotes)) * 100)}%
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-green-400"
                                        style={{
                                            width: `${(campaign.yesVotes / (campaign.yesVotes + campaign.noVotes)) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {!campaign.hasVoted ? (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleVote(true)}
                                        disabled={voting}
                                        className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <ThumbsUp className="w-5 h-5" />
                                        {voting ? 'Voting...' : 'Vote Yes'}
                                    </button>
                                    <button
                                        onClick={() => handleVote(false)}
                                        disabled={voting}
                                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <ThumbsDown className="w-5 h-5" />
                                        {voting ? 'Voting...' : 'Vote No'}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-4 glass rounded-lg">
                                    <p className="font-semibold">✓ You have voted</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Creator Info */}
                        <motion.div
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold mb-4">Campaign Creator</h2>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-full flex items-center justify-center text-2xl">
                                    👤
                                </div>
                                <div>
                                    <p className="font-mono text-sm">{campaign.creator}</p>
                                    <p className="text-sm text-[hsl(var(--text-secondary))]">Verified Creator</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Donation Widget */}
                    <div className="lg:col-span-1">
                        <motion.div
                            className="card sticky top-24"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h2 className="text-2xl font-bold mb-6">Support this Campaign</h2>

                            {/* Progress */}
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-3xl font-bold">{campaign.raised} ETH</span>
                                    <span className="text-[hsl(var(--text-secondary))]">
                                        of {campaign.goal} ETH
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2">
                                    <div
                                        className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-sm text-[hsl(var(--text-secondary))]">
                                    {campaign.backers} backers • {campaign.daysLeft} days left
                                </p>
                            </div>

                            {/* Donation Amount */}
                            {!campaign.fraudDetected ? (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">Donation Amount</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={donationAmount}
                                                onChange={(e) => setDonationAmount(e.target.value)}
                                                placeholder="0.1"
                                                className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))]">
                                                ETH
                                            </span>
                                        </div>
                                    </div>

                                    {/* Preset Amounts */}
                                    <div className="grid grid-cols-3 gap-2 mb-6">
                                        {['0.1', '0.5', '1'].map((amount) => (
                                            <button
                                                key={amount}
                                                onClick={() => setDonationAmount(amount)}
                                                className="glass glass-hover px-4 py-2 rounded-lg text-sm font-semibold"
                                            >
                                                {amount} ETH
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleContribute}
                                        disabled={contributing || !donationAmount}
                                        className="gradient-button w-full mb-4 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Heart className="w-5 h-5" />
                                        {contributing ? 'Processing...' : 'Donate Now'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={async () => {
                                        try {
                                            const campaign = await getCampaignContract(params.id);
                                            if (!campaign) throw new Error('Campaign not found');
                                            const tx = await campaign.refund();
                                            await tx.wait();
                                            alert('Refund claimed successfully!');
                                            fetchCampaignData();
                                        } catch (error: any) {
                                            alert(`Refund failed: ${error.message || 'Unknown error'}`);
                                        }
                                    }}
                                    className="bg-red-500/20 text-red-400 w-full px-6 py-4 rounded-lg font-semibold hover:bg-red-500/30"
                                >
                                    Claim Refund
                                </button>
                            )}

                            <p className="text-xs text-[hsl(var(--text-secondary))] text-center">
                                Funds are locked until AI & community verification passes
                            </p>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
