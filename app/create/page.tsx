'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import InlineNavbar from '@/components/InlineNavbar';

export default function CreateCampaignPage() {
    const [step, setStep] = useState(1);

    return (
        <div className="min-h-screen" style={{ background: '#000' }}>
            {/* Navbar */}
            <InlineNavbar activeTab="crowdfunding" />

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
                                    className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Description</label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell your story..."
                                    className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Funding Goal (ETH)</label>
                                    <input
                                        type="number"
                                        placeholder="10"
                                        className="glass w-full px-4 py-3 rounded-lg text-white placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Duration (days)</label>
                                    <input
                                        type="number"
                                        placeholder="30"
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
                            <h2 className="text-2xl font-bold mb-6">Campaign Details</h2>

                            <div>
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
