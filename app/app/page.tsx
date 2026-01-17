'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InlineNavbar from '@/components/InlineNavbar';
import StarfieldBackground from '@/components/StarfieldBackground';
import TorchCursor from '@/components/TorchCursor';
import { useWalletStore } from '@/store/walletStore';
import { useTrustScoreStore } from '@/store/trustScoreStore';

// Import view components
import BorrowView from '../../components/views/BorrowView';
import CrowdfundingView from '../../components/views/CrowdfundingView';

export default function UnifiedAppPage() {
    const router = useRouter();
    const { isConnected, address } = useWalletStore();
    const { calculateScore } = useTrustScoreStore();
    const [activeTab, setActiveTab] = useState<'borrow' | 'crowdfunding'>('borrow');

    // Calculate trust score when wallet connects
    useEffect(() => {
        if (isConnected && address) {
            calculateScore(address);
        }
    }, [isConnected, address, calculateScore]);

    // Redirect to landing if not connected
    useEffect(() => {
        if (!isConnected) {
            router.push('/');
        }
    }, [isConnected, router]);

    const pageVariants = {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
    };

    if (!isConnected) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: '#070709' }}>
            {/* Starfield Background */}
            <StarfieldBackground />

            {/* Torch Cursor */}
            <TorchCursor />

            {/* Inline Navbar */}
            <InlineNavbar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content - Add padding-top for fixed navbar */}
            <div className="relative pt-16" style={{ zIndex: 1 }}>
                <AnimatePresence mode="wait">
                    {activeTab === 'borrow' ? (
                        <motion.div
                            key="borrow"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            <BorrowView />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="crowdfunding"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            <CrowdfundingView />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
