'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';

interface NavbarProps {
    mode?: 'landing' | 'app';
}

export default function Navbar({ mode = 'landing' }: NavbarProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [productMenuOpen, setProductMenuOpen] = useState(false);
    const { address, isConnected, balance, connect, disconnect } = useWalletStore();

    // Determine mode based on pathname if not explicitly set
    const isLandingMode = mode === 'landing' || pathname === '/';

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setMobileMenuOpen(false);
        }
    };

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
            style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold gradient-text flex items-center gap-2">
                        Aletheia
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {isLandingMode ? (
                            <>
                                {/* Landing Mode Navigation */}
                                <button
                                    onClick={() => scrollToSection('about')}
                                    className="text-[hsl(var(--text-secondary))] hover:text-white transition-colors relative group"
                                >
                                    About
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] group-hover:w-full transition-all duration-300" />
                                </button>
                                <button
                                    onClick={() => scrollToSection('features')}
                                    className="text-[hsl(var(--text-secondary))] hover:text-white transition-colors relative group"
                                >
                                    Features
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] group-hover:w-full transition-all duration-300" />
                                </button>
                                <button
                                    onClick={() => scrollToSection('faucet')}
                                    className="text-[hsl(var(--text-secondary))] hover:text-white transition-colors relative group"
                                >
                                    Faucet
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] group-hover:w-full transition-all duration-300" />
                                </button>
                                <button
                                    onClick={() => scrollToSection('docs')}
                                    className="text-[hsl(var(--text-secondary))] hover:text-white transition-colors relative group"
                                >
                                    Docs
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] group-hover:w-full transition-all duration-300" />
                                </button>
                                <Link href="/app">
                                    <motion.button
                                        className="gradient-button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Launch App
                                    </motion.button>
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* App Mode Navigation - Product Switcher */}
                                <div className="relative">
                                    <button
                                        onClick={() => setProductMenuOpen(!productMenuOpen)}
                                        className="flex items-center gap-2 text-[hsl(var(--text-secondary))] hover:text-white transition-colors"
                                    >
                                        <span className="font-semibold">
                                            {pathname.startsWith('/borrow') ? 'Borrowing' : 'Crowdfunding'}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${productMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {productMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full mt-2 left-0 glass rounded-lg overflow-hidden min-w-[200px]"
                                            >
                                                <Link
                                                    href="/app"
                                                    onClick={() => setProductMenuOpen(false)}
                                                    className="block px-4 py-3 hover:bg-white/10 transition-colors"
                                                >
                                                    <div className="font-semibold">Crowdfunding</div>
                                                    <div className="text-sm text-[hsl(var(--text-secondary))]">
                                                        AI & Community Verified
                                                    </div>
                                                </Link>
                                                <Link
                                                    href="/borrow"
                                                    onClick={() => setProductMenuOpen(false)}
                                                    className="block px-4 py-3 hover:bg-white/10 transition-colors border-t border-white/10"
                                                >
                                                    <div className="font-semibold">Borrowing</div>
                                                    <div className="text-sm text-[hsl(var(--text-secondary))]">
                                                        Trust-Based Lending
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}

                        {/* Wallet Button */}
                        {isConnected ? (
                            <div className="relative group">
                                <button className="glass glass-hover px-4 py-2 rounded-lg flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                                    <span className="font-mono text-sm">{formatAddress(address!)}</span>
                                    <span className="text-xs text-[hsl(var(--text-secondary))]">
                                        {balance} ETH
                                    </span>
                                </button>
                                <div className="absolute top-full mt-2 right-0 glass rounded-lg overflow-hidden min-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(address!)}
                                        className="block w-full text-left px-4 py-2 hover:bg-white/10 transition-colors text-sm"
                                    >
                                        Copy Address
                                    </button>
                                    <button
                                        onClick={disconnect}
                                        className="block w-full text-left px-4 py-2 hover:bg-white/10 transition-colors text-sm border-t border-white/10 text-red-400"
                                    >
                                        Disconnect
                                    </button>
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

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden glass glass-hover p-2 rounded-lg"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-white/10 py-4"
                        >
                            {isLandingMode ? (
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => scrollToSection('about')}
                                        className="text-left text-[hsl(var(--text-secondary))] hover:text-white transition-colors"
                                    >
                                        About
                                    </button>
                                    <button
                                        onClick={() => scrollToSection('features')}
                                        className="text-left text-[hsl(var(--text-secondary))] hover:text-white transition-colors"
                                    >
                                        Features
                                    </button>
                                    <button
                                        onClick={() => scrollToSection('faucet')}
                                        className="text-left text-[hsl(var(--text-secondary))] hover:text-white transition-colors"
                                    >
                                        Faucet
                                    </button>
                                    <button
                                        onClick={() => scrollToSection('docs')}
                                        className="text-left text-[hsl(var(--text-secondary))] hover:text-white transition-colors"
                                    >
                                        Docs
                                    </button>
                                    <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                                        <button className="gradient-button w-full">Launch App</button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                                        <div className="glass glass-hover p-3 rounded-lg">
                                            <div className="font-semibold">Crowdfunding</div>
                                            <div className="text-sm text-[hsl(var(--text-secondary))]">
                                                AI & Community Verified
                                            </div>
                                        </div>
                                    </Link>
                                    <Link href="/borrow" onClick={() => setMobileMenuOpen(false)}>
                                        <div className="glass glass-hover p-3 rounded-lg">
                                            <div className="font-semibold">Borrowing</div>
                                            <div className="text-sm text-[hsl(var(--text-secondary))]">
                                                Trust-Based Lending
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Wallet Button */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                {isConnected ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="glass p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                                                <span className="font-mono text-sm">{formatAddress(address!)}</span>
                                            </div>
                                            <div className="text-sm text-[hsl(var(--text-secondary))]">
                                                {balance} ETH
                                            </div>
                                        </div>
                                        <button
                                            onClick={disconnect}
                                            className="glass glass-hover px-4 py-2 rounded-lg text-red-400"
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={connect} className="gradient-button w-full">
                                        Connect Wallet
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
