import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("🚀 Deploying contracts to network...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

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

    // Save deployment addresses
    const deploymentInfo = {
        network: (await hre.ethers.provider.getNetwork()).name,
        chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
        factoryAddress: factoryAddress,
        aiVerifier: aiVerifierAddress,
        deployedAt: new Date().toISOString(),
    };

    const deploymentPath = path.join(__dirname, "../deployments.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to deployments.json");

    // Also save to app directory for frontend
    const appDeploymentPath = path.join(__dirname, "../app/contracts/deployments.json");
    const appContractsDir = path.dirname(appDeploymentPath);
    if (!fs.existsSync(appContractsDir)) {
        fs.mkdirSync(appContractsDir, { recursive: true });
    }
    fs.writeFileSync(appDeploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to app/contracts/deployments.json");

    console.log("\n✨ Deployment complete!");
    console.log("=====================================");
    console.log("Factory Address:", factoryAddress);
    console.log("AI Verifier:", aiVerifierAddress);
    console.log("=====================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
