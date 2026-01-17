import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
    address: string | null;
    isConnected: boolean;
    balance: string;
    chainId: number | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    updateBalance: (balance: string) => void;
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set) => ({
            address: null,
            isConnected: false,
            balance: '0',
            chainId: null,

            connect: async () => {
                try {
                    if (typeof window.ethereum === 'undefined') {
                        alert('Please install MetaMask!');
                        return;
                    }

                    const accounts = await window.ethereum.request({
                        method: 'eth_requestAccounts',
                    });

                    const chainId = await window.ethereum.request({
                        method: 'eth_chainId',
                    });

                    set({
                        address: accounts[0],
                        isConnected: true,
                        chainId: parseInt(chainId, 16),
                    });

                    // Get balance
                    const balance = await window.ethereum.request({
                        method: 'eth_getBalance',
                        params: [accounts[0], 'latest'],
                    });

                    const ethBalance = (parseInt(balance, 16) / 1e18).toFixed(4);
                    set({ balance: ethBalance });
                } catch (error) {
                    console.error('Failed to connect wallet:', error);
                }
            },

            disconnect: () => {
                set({
                    address: null,
                    isConnected: false,
                    balance: '0',
                    chainId: null,
                });
            },

            updateBalance: (balance: string) => {
                set({ balance });
            },
        }),
        {
            name: 'wallet-storage',
        }
    )
);

// Type augmentation for window.ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}
