# Aletheia - Truth-Verified Finance Platform

## What We Fixed

### 1. **Removed Hardcoded Data**

- ✅ Connected CrowdfundingView to CampaignFactory contract
- ✅ Connected BorrowView to LendingPool contract
- ✅ Connected Campaign detail page to Campaign contract
- ✅ Updated Create Campaign page to use real transactions
- ✅ All data now comes from blockchain contracts

### 2. **Fixed Navbar Duplication Issue**

- ✅ Consolidated `Navbar.tsx` and `InlineNavbar.tsx` into single unified component
- ✅ Updated all pages to use the unified Navbar
- ✅ Navbar now handles both landing and app modes
- ✅ Inline tabs work correctly in app mode

### 3. **Created Contract Infrastructure**

- ✅ Created `/lib/contracts.ts` with contract utilities
- ✅ Added contract ABIs in `/lib/abis/`
- ✅ Updated deployment script to export ABIs and addresses
- ✅ Configured contract loading from `deployments.json`

## How to Use

### 1. Deploy Contracts

First, compile and deploy the smart contracts:

```powershell
# Compile contracts
npx hardhat compile

# Start local Hardhat node (in a separate terminal)
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

The deployment script will:

- Deploy CampaignFactory contract
- Deploy LendingPool contract
- Save addresses to `public/contracts/deployments.json`
- Copy ABIs to `lib/abis/`

### 2. Start the Application

```powershell
npm run dev
```

Visit `http://localhost:3000`

### 3. Connect Your Wallet

1. Make sure MetaMask is installed
2. Add Hardhat network to MetaMask:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency: ETH
3. Import one of the Hardhat test accounts
4. Connect wallet on the landing page

### 4. Use the Features

#### **Aletheia Raise (Crowdfunding)**

- Create campaigns with title, description, goal, and duration
- Campaigns are verified by AI and community voting
- Contributors can vote on campaign legitimacy
- Funds locked until verification passes
- Automatic refunds if fraud detected

#### **Aletheia Lending**

- Borrow against collateral (150% collateralization)
- Dynamic interest rates based on trust score
- Create loans with custom duration
- Repay loans with calculated interest

### 5. Contract Addresses

After deployment, you can find contract addresses in:

- `deployments.json` (root directory)
- `public/contracts/deployments.json` (for frontend)

## Contract Features

### CampaignFactory Contract

- `createCampaign(ipfsHash, fundingGoal, duration)` - Create new campaign
- `getAllCampaigns()` - Get all campaign addresses
- `getCampaignsByCreator(address)` - Get campaigns by creator

### Campaign Contract

- `contribute()` - Contribute ETH to campaign (payable)
- `vote(bool approve)` - Vote on campaign legitimacy
- `withdraw()` - Creator withdraws funds (requires verification)
- `refund()` - Claim refund if fraud detected
- `getCampaignStatus()` - Get full campaign details
- `getTrustScore()` - Calculate campaign trust score (0-100)

### LendingPool Contract

- `createLoan(loanAmount, duration)` - Create loan with collateral (payable)
- `repayLoan(loanId)` - Repay loan with interest (payable)
- `liquidateLoan(loanId)` - Liquidate defaulted loan
- `depositToPool()` - Add liquidity to lending pool (payable)

## Technical Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Blockchain**: Ethers.js v6, Hardhat
- **Smart Contracts**: Solidity ^0.8.24
- **State Management**: Zustand

## Key Files

### Contract Integration

- `/lib/contracts.ts` - Contract utilities and provider setup
- `/lib/abis/` - Contract ABIs
- `/public/contracts/deployments.json` - Deployed addresses

### Components

- `/components/Navbar.tsx` - Unified navbar (landing & app modes)
- `/components/views/CrowdfundingView.tsx` - Campaign list with real data
- `/components/views/BorrowView.tsx` - Lending interface with real loans

### Pages

- `/app/page.tsx` - Landing page
- `/app/app/page.tsx` - Main app (unified borrow/crowdfunding)
- `/app/campaign/[id]/page.tsx` - Campaign details with voting & contributions
- `/app/create/page.tsx` - Create campaign with blockchain integration

## Environment Setup

No environment variables needed for local development. The app automatically:

- Loads deployment addresses from `/public/contracts/deployments.json`
- Connects to MetaMask provider
- Uses Hardhat local network (chainId: 1337)

## Troubleshooting

### "Failed to connect to factory contract"

- Make sure contracts are deployed (`npx hardhat run scripts/deploy.js --network localhost`)
- Check that Hardhat node is running
- Verify `public/contracts/deployments.json` has correct addresses

### "Insufficient funds"

- Import a Hardhat test account with ETH
- Make sure you're connected to Hardhat network (not mainnet)

### "Transaction failed"

- Check MetaMask is on Hardhat network (chainId 1337)
- Ensure you have enough ETH for gas
- Check contract requirements (e.g., minimum contribution, collateral ratio)

## Next Steps

To deploy to a real network (e.g., Bittensor Testnet):

1. Update `hardhat.config.js` with network config
2. Add private key to `.env` file
3. Deploy: `npx hardhat run scripts/deploy.js --network bittensorTestnet`
4. Update frontend to point to correct network

## Notes

- The trust score calculation is currently mock data based on wallet address
- To implement real trust scores, deploy the TrustScore contract and update the trust score store
- IPFS integration for campaign metadata is placeholder - integrate with ipfs-http-client for production
- AI verification is simulated via deployer address - integrate with actual AI service for production
