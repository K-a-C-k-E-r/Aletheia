'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, Shield, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useWalletStore } from '@/store/walletStore';
import { getCampaignFactoryContract, parseEther, loadDeploymentAddresses } from '@/lib/contracts';
import { uploadToIPFS, uploadFileToIPFS, type CampaignMetadata } from '@/lib/ipfs';
import { verifyCampaignWithGemini } from '@/lib/geminiVerification';

export default function CreateCampaignPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const { isConnected, address } = useWalletStore();

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fundingGoal, setFundingGoal] = useState('');
    const [duration, setDuration] = useState('30'); // days
    const [documents, setDocuments] = useState<File[]>([]);

    const handleVerifyCampaign = async () => {
        if (!title || !description || !fundingGoal || !duration) {
            alert('Please fill all required fields before verification');
            return;
        }

        setVerifying(true);
        try {
            const result = await verifyCampaignWithGemini({
                title,
                description,
                fundingGoal,
                duration,
                creatorAddress: address || 'Unknown'
            });

            setVerificationResult(result);

            if (result.verified && result.score >= 60) {
                alert(`✅ Campaign verified!\n\nScore: ${result.score}/100\nFraud Risk: ${result.fraudRisk}\n\nYou can now proceed to create the campaign.`);
                setStep(4); // Move to final step
            } else {
                alert(`⚠️ Verification concerns:\n\nScore: ${result.score}/100\nFraud Risk: ${result.fraudRisk}\n\nReasons:\n${result.warnings.join('\n')}\n\nPlease review and improve your campaign details.`);
            }
        } catch (error) {
            console.error('Verification error:', error);
            alert('Failed to verify campaign. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    const handleCreateCampaign = async () => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }

        if (!title || !description || !fundingGoal || !duration) {
            alert('Please fill all required fields');
            return;
        }

        setLoading(true);

        try {
            console.log('Uploading documents to IPFS...');

            // Step 1: Upload documents to IPFS
            const documentHashes: string[] = [];
            for (const doc of documents) {
                try {
                    const hash = await uploadFileToIPFS(doc);
                    documentHashes.push(hash);
                    console.log(`Uploaded ${doc.name} to IPFS: ${hash}`);
                } catch (error) {
                    console.warn(`Failed to upload ${doc.name}:`, error);
                }
            }

            // Step 2: Create and upload campaign metadata to IPFS
            const metadata: CampaignMetadata = {
                title,
                description,
                documents: documentHashes,
                createdAt: new Date().toISOString(),
            };

            console.log('Uploading campaign metadata to IPFS...');
            const ipfsHash = await uploadToIPFS(metadata);
            console.log('Campaign metadata uploaded to IPFS:', ipfsHash);

            // Step 3: Create campaign on blockchain
            await loadDeploymentAddresses();
            const factory = await getCampaignFactoryContract();

            if (!factory) {
                throw new Error('Failed to connect to factory contract');
            }

            // Convert duration from days to seconds
            const durationInSeconds = parseInt(duration) * 24 * 60 * 60;

            // Create campaign
            const tx = await factory.createCampaign(
                ipfsHash,
                parseEther(fundingGoal),
                durationInSeconds
            );

            console.log('Transaction submitted:', tx.hash);
            await tx.wait();

            alert(`Campaign created successfully! TX: ${tx.hash}`);

            // Redirect to campaigns page
            window.location.href = '/app';
        } catch (error: any) {
            console.error('Failed to create campaign:', error);
            alert(`Failed to create campaign: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: '#000' }}>
            {/* Navbar */}
            <Navbar mode="app" activeTab="crowdfunding" />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-5xl font-bold mb-4">Create Campaign</h1>
                    <p className="text-xl text-[hsl(var(--text-secondary))]">
                        Launch your verified crowdfunding campaign
                    </p>
                </motion.div>

                {/* Progress Steps */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        {['Basic Info', 'Documents', 'Details', 'Review'].map((label, i) => (
                            <div key={i} className="flex-1 flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step > i + 1 ? 'bg-green-500' : step === i + 1 ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]' : 'glass'
                                    }`}>
                                    {step > i + 1 ? '✓' : i + 1}
                                </div>
                                {i < 3 && <div className={`flex-1 h-1 mx-2 ${step > i + 1 ? 'bg-green-500' : 'bg-white/10'}`} />}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-sm text-[hsl(var(--text-secondary))]">
                        {['Basic Info', 'Documents', 'Details', 'Review'].map((label, i) => (
                            <div key={i} className="flex-1 text-center">{label}</div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <motion.div
                    className="card p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-6">Basic Information</h2>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Campaign Title</label>
                                <input
                                    type="text"
                                    placeholder="Medical Aid for Children"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Description</label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell your story..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Funding Goal (ETH)</label>
                                    <input
                                        type="number"
                                        placeholder="10"
                                        value={fundingGoal}
                                        onChange={(e) => setFundingGoal(e.target.value)}
                                        className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Duration (days)</label>
                                    <input
                                        type="number"
                                        placeholder="30"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-6">Upload Documents</h2>
                            <p className="text-[hsl(var(--text-secondary))] mb-6">
                                Upload your ID and proof documents for AI verification
                            </p>

                            <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center">
                                <Upload className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--text-secondary))]" />
                                <p className="font-semibold mb-2">Drag & drop files or click to browse</p>
                                <p className="text-sm text-[hsl(var(--text-secondary))]">
                                    Supported: PDF, JPG, PNG (Max 10MB)
                                </p>
                                <input type="file" multiple className="hidden" />
                            </div>

                            <div className="glass p-4 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-[hsl(var(--primary))]" />
                                    <div className="flex-1">
                                        <p className="font-semibold">government_id.pdf</p>
                                        <p className="text-sm text-[hsl(var(--text-secondary))]">2.4 MB</p>
                                    </div>
                                    <span className="text-green-400">✓</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Shield className="w-8 h-8 text-[hsl(var(--primary))]" />
                                AI Verification
                            </h2>

                            <div className="glass p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                                <p className="text-lg mb-4">
                                    Gemini AI will analyze your campaign for:
                                </p>
                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <span>Legitimacy and authenticity</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <span>Fraud indicators and red flags</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <span>Clarity and completeness</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <span>Realistic funding goals</span>
                                    </li>
                                </ul>

                                {!verificationResult && (
                                    <button
                                        onClick={handleVerifyCampaign}
                                        disabled={verifying}
                                        className="gradient-button w-full disabled:opacity-50"
                                    >
                                        {verifying ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Verifying with AI...
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="w-5 h-5 mr-2" />
                                                Verify Campaign with Gemini AI
                                            </>
                                        )}
                                    </button>
                                )}

                                {verificationResult && (
                                    <div className="mt-6 space-y-4">
                                        <div className={`p-4 rounded-lg ${verificationResult.verified ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-lg">
                                                    {verificationResult.verified ? '✅ Verified' : '❌ Not Verified'}
                                                </span>
                                                <span className="text-2xl font-bold">
                                                    {verificationResult.score}/100
                                                </span>
                                            </div>
                                            <div className="text-sm">
                                                <strong>Fraud Risk:</strong> {verificationResult.fraudRisk.toUpperCase()}
                                            </div>
                                            <div className="text-sm">
                                                <strong>Confidence:</strong> {(verificationResult.confidence * 100).toFixed(0)}%
                                            </div>
                                        </div>

                                        {verificationResult.reasons.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Analysis:</h4>
                                                <ul className="space-y-1 text-sm">
                                                    {verificationResult.reasons.map((reason: string, i: number) => (
                                                        <li key={i} className="flex items-start gap-2">
                                                            <span>•</span>
                                                            <span>{reason}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {verificationResult.warnings.length > 0 && (
                                            <div className="bg-yellow-500/10 p-3 rounded-lg">
                                                <h4 className="font-semibold mb-2 text-yellow-400">⚠️ Warnings:</h4>
                                                <ul className="space-y-1 text-sm">
                                                    {verificationResult.warnings.map((warning: string, i: number) => (
                                                        <li key={i}>{warning}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {verificationResult.recommendations.length > 0 && (
                                            <div className="bg-blue-500/10 p-3 rounded-lg">
                                                <h4 className="font-semibold mb-2 text-blue-400">💡 Recommendations:</h4>
                                                <ul className="space-y-1 text-sm">
                                                    {verificationResult.recommendations.map((rec: string, i: number) => (
                                                        <li key={i}>{rec}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleVerifyCampaign}
                                            disabled={verifying}
                                            className="glass glass-hover w-full px-4 py-2 rounded-lg text-sm"
                                        >
                                            Re-verify Campaign
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-6">Review & Deploy</h2>
                                <label className="block text-sm font-semibold mb-2">Use of Funds</label>
                                <textarea
                                    rows={4}
                                    placeholder="Explain how the funds will be used..."
                                    className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Milestones</label>
                                <textarea
                                    rows={4}
                                    placeholder="List key milestones..."
                                    className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                />
                            </div>
                        </div>
                    )}

                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-6">Review & Submit</h2>

                        <div className="space-y-4">
                            <div className="glass p-4 rounded-lg">
                                <p className="text-sm text-[hsl(var(--text-secondary))] mb-1">Campaign Title</p>
                                <p className="font-semibold">Medical Aid for Children</p>
                            </div>
                            <div className="glass p-4 rounded-lg">
                                <p className="text-sm text-[hsl(var(--text-secondary))] mb-1">Funding Goal</p>
                                <p className="font-semibold">10 ETH</p>
                            </div>
                            <div className="glass p-4 rounded-lg">
                                <p className="text-sm text-[hsl(var(--text-secondary))] mb-1">Documents Uploaded</p>
                                <p className="font-semibold">1 file</p>
                            </div>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <p className="text-sm text-yellow-400">
                                ⚠️ Once submitted, your campaign will go through AI verification and community voting.
                                Funds will only be accessible after both verifications pass.
                            </p>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                    <button
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className="glass glass-hover px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => {
                            if (step < 4) setStep(step + 1);
                            else alert('Campaign created! (Mock submission)');
                        }}
                        className="gradient-button px-8 py-3"
                    >
                        {step === 4 ? 'Submit Campaign' : 'Next'}
                    </button>
                </div>
            </motion.div>
        </main>
        </div >
    );
}
