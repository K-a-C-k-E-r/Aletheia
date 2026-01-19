import { ethers } from 'ethers';
import CampaignFactoryABI from './abis/CampaignFactory.json';
import CampaignABI from './abis/Campaign.json';
import LendingPoolABI from './abis/LendingPool.json';
import TrustScoreABI from './abis/TrustScore.json';

// Contract addresses - will be loaded from deployments.json
let CAMPAIGN_FACTORY_ADDRESS = '';
let LENDING_POOL_ADDRESS = '';
let TRUST_SCORE_ADDRESS = '';

// Load deployment addresses
export const loadDeploymentAddresses = async () => {
    try {
        const response = await fetch('/contracts/deployments.json');
        if (!response.ok) {
            throw new Error('Deployments file not found');
        }
        const deployments = await response.json();
        CAMPAIGN_FACTORY_ADDRESS = deployments.factoryAddress || '';
        LENDING_POOL_ADDRESS = deployments.lendingPoolAddress || '';
        TRUST_SCORE_ADDRESS = deployments.trustScoreAddress || '';
        
        console.log('Loaded contract addresses:', {
            factory: CAMPAIGN_FACTORY_ADDRESS,
            lendingPool: LENDING_POOL_ADDRESS,
            trustScore: TRUST_SCORE_ADDRESS,
            network: deployments.network,
            chainId: deployments.chainId
        });
        
        return deployments;
    } catch (error) {
        console.error('Failed to load deployment addresses:', error);
        return null;
    }
};

// Get provider and signer
export const getProvider = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
};

export const getSigner = async () => {
    const provider = getProvider();
    if (!provider) return null;
    return await provider.getSigner();
};

// Contract instances
export const getCampaignFactoryContract = async () => {
    const signer = await getSigner();
    if (!signer) {
        console.error('No signer available - wallet not connected');
        return null;
    }
    if (!CAMPAIGN_FACTORY_ADDRESS) {
        console.error('Campaign Factory address not loaded');
        return null;
    }
    
    // Verify we're on the correct network
    const provider = await signer.provider;
    const network = await provider?.getNetwork();
    console.log('Current network:', network?.chainId);
    
    return new ethers.Contract(CAMPAIGN_FACTORY_ADDRESS, CampaignFactoryABI, signer);
};

export const getCampaignContract = async (campaignAddress: string) => {
    const signer = await getSigner();
    if (!signer) return null;
    return new ethers.Contract(campaignAddress, CampaignABI, signer);
};

export const getLendingPoolContract = async () => {
    const signer = await getSigner();
    if (!signer || !LENDING_POOL_ADDRESS) return null;
    return new ethers.Contract(LENDING_POOL_ADDRESS, LendingPoolABI, signer);
};

export const getTrustScoreContract = async () => {
    const signer = await getSigner();
    if (!signer || !TRUST_SCORE_ADDRESS) return null;
    return new ethers.Contract(TRUST_SCORE_ADDRESS, TrustScoreABI, signer);
};

// Helper functions
export const formatEther = (value: bigint | string) => {
    return ethers.formatEther(value);
};

export const parseEther = (value: string) => {
    return ethers.parseEther(value);
};

export const getContractAddresses = () => ({
    campaignFactory: CAMPAIGN_FACTORY_ADDRESS,
    lendingPool: LENDING_POOL_ADDRESS,
    trustScore: TRUST_SCORE_ADDRESS,
});
