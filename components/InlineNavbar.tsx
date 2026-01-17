'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { useTrustScoreStore } from '@/store/trustScoreStore';

interface InlineNavbarProps {
  activeTab?: 'borrow' | 'crowdfunding';
  onTabChange?: (tab: 'borrow' | 'crowdfunding') => void;
}

export default function InlineNavbar({ activeTab = 'borrow', onTabChange }: InlineNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { address, isConnected, balance, connect, disconnect } = useWalletStore();
  const { score, level } = useTrustScoreStore();
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getTrustColor = () => {
    switch (level) {
      case 'high':
        return '#22c55e'; // green
      case 'medium':
        return '#eab308'; // yellow
      case 'low':
        return '#ef4444'; // red
      default:
        return '#808080'; // gray
    }
  };

  const handleTabClick = (tab: 'borrow' | 'crowdfunding') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      // Navigate to the appropriate page
      router.push(tab === 'borrow' ? '/borrow' : '/app');
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06]" style={{ background: '#000' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo + Trust Indicator */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex flex-col">
              <span className="text-2xl font-bold gradient-text">Aletheia</span>
              <span className="text-xs text-[hsl(var(--text-muted))]">Truth on-chain</span>
            </Link>
            {isConnected && (
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: getTrustColor(),
                  boxShadow: `0 0 8px ${getTrustColor()}`,
                }}
                title={`Trust Level: ${level}`}
              />
            )}
          </div>

          {/* Center - Inline Tabs */}
          {isConnected && (
            <div className="flex items-center gap-1 glass rounded-lg p-1">
              <button
                onClick={() => handleTabClick('borrow')}
                className="relative px-6 py-2 rounded-md font-semibold transition-all duration-300"
                style={{
                  color: activeTab === 'borrow' ? '#fff' : '#b3b3b3',
                }}
              >
                Aletheia Lending
                {activeTab === 'borrow' && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]"
                    layoutId="activeTab"
                    style={{ borderRadius: '2px' }}
                  />
                )}
              </button>
              <button
                onClick={() => handleTabClick('crowdfunding')}
                className="relative px-6 py-2 rounded-md font-semibold transition-all duration-300"
                style={{
                  color: activeTab === 'crowdfunding' ? '#fff' : '#b3b3b3',
                }}
              >
                Aletheia Raise
                {activeTab === 'crowdfunding' && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]"
                    layoutId="activeTab"
                    style={{ borderRadius: '2px' }}
                  />
                )}
              </button>
            </div>
          )}

          {/* Right Side - Wallet + Trust Score */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-3">
                {/* Trust Score Mini Badge */}
                <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="text-xs text-[hsl(var(--text-muted))]">Trust</span>
                  <span className="font-bold text-sm" style={{ color: getTrustColor() }}>
                    {score}
                  </span>
                </div>

                {/* Wallet Address */}
                <div className="relative">
                  <button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="glass glass-hover px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="font-mono text-sm">{formatAddress(address!)}</span>
                    <span className="text-xs text-[hsl(var(--text-secondary))]">{balance} ETH</span>
                  </button>

                  {showWalletMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-2 right-0 glass rounded-lg overflow-hidden min-w-[180px]"
                      style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(address!);
                          setShowWalletMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-white/5 transition-colors text-sm"
                      >
                        Copy Address
                      </button>
                      <button
                        onClick={() => {
                          disconnect();
                          setShowWalletMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-white/5 transition-colors text-sm border-t border-white/[0.06] text-red-400"
                      >
                        Disconnect
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <motion.button
                onClick={connect}
                className="gradient-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Connect Wallet
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
