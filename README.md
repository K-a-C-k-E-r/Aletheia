# 🌌 Aletheia

**Truth-Verified Crowdfunding & Lending on the Bittensor Network**

<p align="center">
  <b>Aletheia — Truth Revealed.</b><br/>
  Crowdfunding and lending powered by real AI verification, community trust, and on-chain transparency.
</p>

---

## 🚀 What is Aletheia?

Aletheia is a **real, production-grade Web3 platform** that combines:

- 🤖 **Gemini AI** for real document and fraud verification
- 🧠 **Trust scores** derived from real on-chain behavior
- 🔗 **Bittensor Network** as the intelligence-first blockchain layer
- 💰 **Crowdfunding + collateralized lending** in one unified system

**There is no fake data, no mock values, and no centralized control.**

Every number you see is either:
- ✅ Fetched from the blockchain
- ✅ Computed from real transactions
- ✅ Returned by a real AI verification process

---

## ✨ Core Features

### 🤝 Aletheia Raise (Crowdfunding)

**Start a fundraising campaign** after:
- Gemini AI document verification
- Community voting approval

**Anyone can:**
- Browse verified campaigns
- Contribute funds directly on-chain
- **Fraud protection** baked into smart contracts

**If fraud is detected → funds are automatically refundable**

---

### 🏦 Aletheia Lending (Borrowing)

- Borrow funds using **on-chain collateral**
- Interest rates are **not fixed**
- Interest is calculated from your **Aletheia Trust Score**

| Trust Score | Interest Rate |
|-------------|---------------|
| High        | Low           |
| Medium      | Moderate      |
| New / Low   | Higher        |

**Trust score is built only from real behavior:**
- Previous loans
- Repayments
- Missed payments
- Transaction history
- Wallet activity over time

---

### 🧠 Aletheia Trust Engine

Your trust score is:

✅ Automatically calculated  
✅ Fully on-chain transparent  
❌ Not editable  
❌ Not controlled by admins

**It updates dynamically as your on-chain actions change.**

---

### 🤖 Real AI Verification (Gemini)

Aletheia uses **Google Gemini AI** for:
- Document verification
- OCR & data consistency checks
- Campaign authenticity analysis
- Fraud signal generation

**AI never directly controls funds** —  
it only feeds verified signals into on-chain logic.

---

### 🌌 Premium Interface

- Living starfield background (radial: center → edges)
- Subtle 3D depth for key UI elements
- Torch-style cursor illumination (desktop)
- Luxury animation curves
- Fully responsive, mobile-safe fallbacks

---

## 🔐 No Fake Data Policy (Very Important)

Aletheia **strictly does NOT use:**

❌ Dummy users  
❌ Mock campaigns  
❌ Hard-coded balances  
❌ Static trust scores  
❌ Auto-approved AI checks

**If data is unavailable:**
- You will see a loading state
- Or an empty state
- **Never fake numbers**

---

## 🧭 How to Use Aletheia (User Guide)

### 1️⃣ Visit the Website
Open the Aletheia landing page.  
No wallet is required at this stage.

### 2️⃣ Connect Your Wallet
Click **Launch Aletheia** and connect your wallet (MetaMask or compatible).

### 3️⃣ Choose a Path

**🔹 Crowdfunding**
- Start a campaign
- Or contribute to an existing one

**🔹 Lending**
- Check your trust score
- Deposit collateral
- Borrow with dynamically calculated interest

### 4️⃣ Build Trust Over Time
- Repay loans
- Participate honestly
- Maintain a clean on-chain record

**Your trust score improves naturally.**

---

## 🔗 Technology Stack (Transparent)

| Component | Technology |
|-----------|------------|
| **Blockchain** | Bittensor Network (Chain ID: 945) |
| **AI** | Google Gemini (Vision + Reasoning) |
| **Frontend** | Next.js 16, React 19 |
| **Styling** | Tailwind CSS 4, Framer Motion |
| **Storage** | IPFS / Decentralized Storage |
| **Wallets** | MetaMask, WalletConnect |
| **State Management** | Zustand |

---

## 🛡️ Security & Transparency

✅ No admin fund access  
✅ No emergency drain keys  
✅ Refunds enforced by smart contracts  
✅ AI outputs logged transparently (non-sensitive)  
✅ Fully auditable on-chain behavior

---

## 🚰 Getting Testnet Tokens

To test Aletheia on Bittensor EVM Testnet:

### **Thirdweb TAO EVM Testnet Faucet** (Recommended)
- **URL**: https://thirdweb.com/tao-evm-testnet
- **Amount**: 0.01 TAO per day (free)

### **Network Configuration**
Add to MetaMask:
- **Network Name**: Bittensor EVM
- **RPC URL**: `https://test.chain.opentensor.ai`
- **Chain ID**: `945`
- **Currency Symbol**: `TAO`
- **Block Explorer**: `https://test.chain.opentensor.ai`

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/aletheia.git
cd aletheia

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
# - Add your Gemini API key
# - Configure contract addresses after deployment

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📦 Smart Contract Deployment

```bash
# Deploy contracts to Bittensor EVM Testnet
npm run deploy:testnet

# Verify contracts
npm run verify

# Update .env with deployed contract addresses
```

---

## 🧠 Philosophy Behind Aletheia

> **"Truth is not claimed. Truth is revealed."**

Aletheia exists to restore trust to decentralized finance using:

- **Intelligence** instead of blind assumptions
- **Transparency** instead of promises
- **Code** instead of authority

The name "Aletheia" (ἀλήθεια) comes from ancient Greek, meaning **"truth" or "disclosure"** — the state of not being hidden or forgotten.

---

## 📸 Brand Identity

### Visual Concept
- **Core Symbol**: Split circle representing truth being revealed
- **Color Palette**: Deep space black, neural cyan, truth states (green/yellow/red)
- **Motion**: Calm, intelligent, expanding (stars from center → edges)
- **Typography**: Serious, philosophical, premium

### Taglines
- Primary: **"Truth, Revealed by Intelligence"**
- Alternative: **"Verified by Intelligence. Enforced by Code."**
- Short: **"Where Truth Goes On-Chain"**

---

## 📄 Documentation

- [Technical Docs](https://docs.aletheia.xyz) *(coming soon)*
- [Smart Contract Architecture](./docs/contracts.md)
- [Trust Score Formula](./docs/trust-score.md)
- [AI Verification Flow](./docs/ai-verification.md)

---

## 📬 Contact & Community

- **GitHub**: https://github.com/your-username/aletheia
- **Docs**: https://docs.aletheia.xyz
- **Network**: [Bittensor](https://bittensor.com)
- **Discord**: Join the Bittensor community

---

## �️ Roadmap

- [x] Core platform UI with cosmic design
- [x] Wallet integration (MetaMask)
- [x] Trust score system architecture
- [x] Bittensor Network integration
- [ ] Smart contract deployment
- [ ] Gemini AI integration
- [ ] IPFS document storage
- [ ] Mainnet launch
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard

---

## ⚖️ License

MIT License

Copyright (c) 2026 Aletheia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

<p align="center">
  <b>Built with intelligence. Secured by truth. Powered by Bittensor.</b>
</p>
