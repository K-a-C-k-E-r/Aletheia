'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, Users, Lock, Zap, TrendingUp, FileCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import StarfieldBackground from '@/components/StarfieldBackground';
import TorchCursor from '@/components/TorchCursor';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Wait for first paint before starting animations
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimationStarted(true);
      });
    });
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#070709' }}>
      {/* Starfield Background */}
      <StarfieldBackground />

      {/* Torch Cursor */}
      <TorchCursor />

      {/* Navbar */}
      <Navbar mode="landing" />

      {/* Content wrapper with higher z-index */}
      <div className="relative" style={{ zIndex: 1 }}>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center items-center text-center">
          <motion.div
            initial="hidden"
            animate={animationStarted ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 1 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.15,
                },
              },
            }}
            className="w-full"
          >
            {/* Powered by Badge */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="inline-block mb-6 px-6 py-2 glass rounded-full"
            >
              <motion.span
                className="text-sm font-semibold gradient-text"
                whileHover={{ scale: 1.05 }}
              >
                Powered by Bittensor Network
              </motion.span>
            </motion.div>

            {/* Aletheia Title */}
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
            >
              Aletheia
              <br />
              <span className="gradient-text">Truth-Verified Finance</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="text-lg md:text-xl text-[hsl(var(--text-muted))] mb-4 italic"
            >
              Truth, Revealed by Intelligence
            </motion.p>

            {/* Description */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="text-xl md:text-2xl text-[hsl(var(--text-secondary))] mb-12 max-w-3xl mx-auto"
            >
              Crowdfunding and lending secured by AI intelligence, community trust, and on-chain truth.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <Link href="/app">
                  <motion.button
                    className="gradient-button flex items-center gap-2 px-8 py-4 text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Launch Aletheia
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <Link href="#how-it-works">
                  <motion.button
                    className="glass glass-hover px-8 py-4 rounded-lg text-lg font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Explore Verified Campaigns
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {[
              { icon: Shield, title: 'AI Verified', desc: 'Document authenticity checked by AI' },
              { icon: Users, title: 'Community Approved', desc: 'Contributors vote on legitimacy' },
              { icon: Lock, title: 'Fraud Protected', desc: 'Automatic refunds on fraud detection' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="card glass-hover p-8"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <feature.icon className="w-12 h-12 mb-4 text-[hsl(var(--primary))]" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-[hsl(var(--text-secondary))]">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* How Aletheia Works */}
        <section id="how-it-works" className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">How Aletheia Works</h2>
            <p className="text-xl text-[hsl(var(--text-secondary))]">
              Six simple steps to truth-verified crowdfunding
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              { step: '01', title: 'Upload Documents', desc: 'Submit your campaign with ID and proof documents' },
              { step: '02', title: 'Gemini AI Verification', desc: 'Advanced Gemini AI validates document authenticity' },
              { step: '03', title: 'Community Voting', desc: 'Contributors vote on campaign legitimacy' },
              { step: '04', title: 'Smart Contract Unlock', desc: 'Funds unlocked only after dual verification' },
              { step: '05', title: 'Funds Released', desc: 'Creator receives funds when goal is met' },
              { step: '06', title: 'Fraud → Auto Refund', desc: 'Automatic refunds if fraud is detected' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-6 card glass-hover"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl font-bold gradient-text">{item.step}</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-[hsl(var(--text-secondary))]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            className="card max-w-4xl mx-auto text-center p-12 bg-gradient-to-r from-[hsl(var(--primary))]/20 to-[hsl(var(--secondary))]/20"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Launch Your Campaign?
            </h2>
            <p className="text-xl text-[hsl(var(--text-secondary))] mb-8">
              Join the future of decentralized intelligence-backed crowdfunding on Bittensor Network
            </p>
            <Link href="/create">
              <motion.button
                className="gradient-button text-lg px-10 py-5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Campaign Now
              </motion.button>
            </Link>
          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl font-bold mb-8 text-center">About Aletheia</h2>
            <div className="space-y-6 text-lg text-[hsl(var(--text-secondary))]">
              <p>
                Aletheia is a revolutionary decentralized platform combining two powerful financial tools:
                <span className="text-white font-semibold"> AI & Community Verified Crowdfunding</span> and
                <span className="text-white font-semibold"> Trust-Based Lending</span>.
              </p>
              <p>
                Built on Bittensor Network, Aletheia leverages decentralized intelligence and blockchain technology to create a trustless
                environment where fraud is impossible and transparency is guaranteed. Every transaction,
                every vote, and every verification is recorded on-chain, with AI verification powered by Gemini AI through Bittensor's subnet architecture.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="card">
                  <h3 className="text-xl font-bold mb-3 gradient-text">Aletheia Raise</h3>
                  <p className="text-sm">
                    Launch campaigns with dual verification from Gemini AI document analysis and community voting.
                    Automatic fraud detection ensures contributor safety.
                  </p>
                </div>
                <div className="card">
                  <h3 className="text-xl font-bold mb-3 gradient-text">Aletheia Lending</h3>
                  <p className="text-sm">
                    Access loans with interest rates based on your on-chain trust score. No credit checks,
                    no paperwork—just pure blockchain transparency.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">Aletheia Platform Features</h2>
            <p className="text-xl text-[hsl(var(--text-secondary))]">
              Everything you need for truth-verified decentralized finance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'Gemini AI Document Verification',
                desc: 'Advanced Gemini AI analyzes uploaded documents for authenticity before campaigns go live',
              },
              {
                icon: Users,
                title: 'Community Governance',
                desc: 'Contributors vote on campaign legitimacy with one-wallet-one-vote system',
              },
              {
                icon: Lock,
                title: 'Smart Contract Security',
                desc: 'Funds locked until verification passes. Automatic refunds on fraud detection',
              },
              {
                icon: TrendingUp,
                title: 'Aletheia Trust Score',
                desc: 'On-chain reputation calculated from wallet history, transactions, and loan repayments',
              },
              {
                icon: Zap,
                title: 'Truth-Adjusted Interest',
                desc: 'Borrow at rates determined by your trust score—10% to 30% APR',
              },
              {
                icon: FileCheck,
                title: 'Full Transparency',
                desc: 'Every action recorded on-chain. View transaction history and proof of verification',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="card glass-hover p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <feature.icon className="w-10 h-10 mb-4 text-[hsl(var(--primary))]" />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Faucet Section */}
        <section id="faucet" className="container mx-auto px-4 py-20">
          <motion.div
            className="max-w-2xl mx-auto card text-center p-12"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Testnet Faucet</h2>
            <p className="text-lg text-[hsl(var(--text-secondary))] mb-8">
              Get free testnet tokens to try out the platform. No real money required!
            </p>
            <div className="glass p-6 rounded-lg mb-6">
              <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                Connect your wallet to receive testnet ETH for Mental Network
              </p>
              <motion.button
                className="gradient-button w-full py-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Request Testnet Tokens
              </motion.button>
            </div>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Limit: 1 ETH per wallet per 24 hours
            </p>
          </motion.div>
        </section>

        {/* Docs Section */}
        <section id="docs" className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-5xl font-bold mb-12 text-center">Documentation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/docs/getting-started">
                <motion.div
                  className="card glass-hover p-6 cursor-pointer"
                  whileHover={{ y: -5 }}
                >
                  <h3 className="text-xl font-bold mb-3">🚀 Getting Started</h3>
                  <p className="text-[hsl(var(--text-secondary))]">
                    Learn how to connect your wallet and start using the platform
                  </p>
                </motion.div>
              </Link>
              <Link href="/docs/crowdfunding">
                <motion.div
                  className="card glass-hover p-6 cursor-pointer"
                  whileHover={{ y: -5 }}
                >
                  <h3 className="text-xl font-bold mb-3">💰 Crowdfunding Guide</h3>
                  <p className="text-[hsl(var(--text-secondary))]">
                    Create campaigns, upload documents, and manage contributions
                  </p>
                </motion.div>
              </Link>
              <Link href="/docs/borrowing">
                <motion.div
                  className="card glass-hover p-6 cursor-pointer"
                  whileHover={{ y: -5 }}
                >
                  <h3 className="text-xl font-bold mb-3">📊 Borrowing Guide</h3>
                  <p className="text-[hsl(var(--text-secondary))]">
                    Understand trust scores, collateral, and loan terms
                  </p>
                </motion.div>
              </Link>
              <Link href="/docs/smart-contracts">
                <motion.div
                  className="card glass-hover p-6 cursor-pointer"
                  whileHover={{ y: -5 }}
                >
                  <h3 className="text-xl font-bold mb-3">📜 Smart Contracts</h3>
                  <p className="text-[hsl(var(--text-secondary))]">
                    View contract addresses, ABIs, and technical documentation
                  </p>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-4">Aletheia</h3>
                <p className="text-[hsl(var(--text-secondary))]">
                  Truth-Verified Web3 Finance
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-[hsl(var(--text-secondary))]">
                  <li><Link href="/app" className="hover:text-white">Explore</Link></li>
                  <li><Link href="/create" className="hover:text-white">Create</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-[hsl(var(--text-secondary))]">
                  <li><a href="#" className="hover:text-white">Aletheia Docs</a></li>
                  <li><a href="#" className="hover:text-white">Aletheia Protocol</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Network</h4>
                <ul className="space-y-2 text-[hsl(var(--text-secondary))]">
                  <li><a href="https://bittensor.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Bittensor Network</a></li>
                  <li><a href="#" className="hover:text-white">DAO</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center text-[hsl(var(--text-secondary))]">
              <p>&copy; 2026 Aletheia — Truth-Revealed Web3 Finance</p>
              <p className="text-sm mt-2">AI Verification powered by Gemini AI</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
