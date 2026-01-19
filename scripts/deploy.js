import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import hre from "hardhat";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("🚀 Deploying contracts to network...");

    // Check if private key is configured
    if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === '') {
        console.error("❌ ERROR: PRIVATE_KEY not found in .env file");
        console.error("Please add your wallet private key to .env file:");
        console.error("PRIVATE_KEY=your_private_key_here");
        process.exit(1);
    }

    const signers = await hre.ethers.getSigners();
    if (!signers || signers.length === 0) {
        console.error("❌ ERROR: No signers available. Check your network configuration.");
        process.exit(1);
    }

    const [deployer] = signers;
    console.log("📝 Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

    // Deploy TrustScore contract first (if you have one)
    // For now, we'll use a placeholder
    const trustScoreAddress = deployer.address; // Replace with actual TrustScore deployment

    // Deploy AIVerifier (for now, use deployer address as verifier)
    const aiVerifierAddress = deployer.address;
    console.log("🤖 AI Verifier address:", aiVerifierAddress);

    // Deploy CampaignFactory
    console.log("\n📦 Deploying CampaignFactory...");
    const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
    const factory = await CampaignFactory.deploy(aiVerifierAddress);
    await factory.waitForDeployment();

    const factoryAddress = await factory.getAddress();
    console.log("✅ CampaignFactory deployed to:", factoryAddress);

    // Deploy LendingPool
    console.log("\n📦 Deploying LendingPool...");
    const LendingPool = await hre.ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPool.deploy(trustScoreAddress);
    await lendingPool.waitForDeployment();

    const lendingPoolAddress = await lendingPool.getAddress();
    console.log("✅ LendingPool deployed to:", lendingPoolAddress);

    // Save deployment addresses
    const deploymentInfo = {
        network: (await hre.ethers.provider.getNetwork()).name,
        chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
        factoryAddress: factoryAddress,
        lendingPoolAddress: lendingPoolAddress,
        trustScoreAddress: trustScoreAddress,
        aiVerifier: aiVerifierAddress,
        deployedAt: new Date().toISOString(),
    };

    const deploymentPath = path.join(__dirname, "../deployments.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to deployments.json");

    // Save to public directory for frontend
    const publicDeploymentPath = path.join(__dirname, "../public/contracts/deployments.json");
    const publicContractsDir = path.dirname(publicDeploymentPath);
    if (!fs.existsSync(publicContractsDir)) {
        fs.mkdirSync(publicContractsDir, { recursive: true });
    }
    fs.writeFileSync(publicDeploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to public/contracts/deployments.json");

    // Copy ABIs to lib/abis
    console.log("\n📋 Copying ABIs...");
    const artifactsDir = path.join(__dirname, "../artifacts/contracts");
    const abisDir = path.join(__dirname, "../lib/abis");

    if (!fs.existsSync(abisDir)) {
        fs.mkdirSync(abisDir, { recursive: true });
    }

    // Copy CampaignFactory ABI
    const factoryArtifact = JSON.parse(
        fs.readFileSync(path.join(artifactsDir, "CampaignFactory.sol/CampaignFactory.json"))
    );
    fs.writeFileSync(
        path.join(abisDir, "CampaignFactory.json"),
        JSON.stringify(factoryArtifact.abi, null, 2)
    );

    // Copy Campaign ABI
    const campaignArtifact = JSON.parse(
        fs.readFileSync(path.join(artifactsDir, "Campaign.sol/Campaign.json"))
    );
    fs.writeFileSync(
        path.join(abisDir, "Campaign.json"),
        JSON.stringify(campaignArtifact.abi, null, 2)
    );

    // Copy LendingPool ABI
    const lendingPoolArtifact = JSON.parse(
        fs.readFileSync(path.join(artifactsDir, "LendingPool.sol/LendingPool.json"))
    );
    fs.writeFileSync(
        path.join(abisDir, "LendingPool.json"),
        JSON.stringify(lendingPoolArtifact.abi, null, 2)
    );

    console.log("✅ ABIs copied successfully");

    console.log("\n✨ Deployment complete!");
    console.log("=====================================");
    console.log("CampaignFactory:", factoryAddress);
    console.log("LendingPool:", lendingPoolAddress);
    console.log("TrustScore:", trustScoreAddress);
    console.log("AI Verifier:", aiVerifierAddress);
    console.log("=====================================");
    console.log("\n🚀 Run 'npm run dev' to start the frontend");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
