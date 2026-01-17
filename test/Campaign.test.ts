import { expect } from "chai";
import { ethers } from "hardhat";
import { Campaign, CampaignFactory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Campaign Contract", function () {
    let factory: CampaignFactory;
    let campaign: Campaign;
    let owner: SignerWithAddress;
    let creator: SignerWithAddress;
    let contributor1: SignerWithAddress;
    let contributor2: SignerWithAddress;
    let contributor3: SignerWithAddress;
    let aiVerifier: SignerWithAddress;

    const IPFS_HASH = "QmTest123456789";
    const FUNDING_GOAL = ethers.parseEther("10");
    const DURATION = 7 * 24 * 60 * 60; // 7 days

    beforeEach(async function () {
        [owner, creator, contributor1, contributor2, contributor3, aiVerifier] = await ethers.getSigners();

        // Deploy factory
        const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
        factory = await CampaignFactory.deploy(aiVerifier.address);

        // Create a campaign
        const tx = await factory.connect(creator).createCampaign(IPFS_HASH, FUNDING_GOAL, DURATION);
        const receipt = await tx.wait();

        // Get campaign address from event
        const event = receipt?.logs.find((log: any) => {
            try {
                return factory.interface.parseLog(log)?.name === "CampaignCreated";
            } catch {
                return false;
            }
        });

        const parsedEvent = factory.interface.parseLog(event!);
        const campaignAddress = parsedEvent?.args[0];

        campaign = await ethers.getContractAt("Campaign", campaignAddress);
    });

    describe("Deployment", function () {
        it("Should set the correct creator", async function () {
            expect(await campaign.creator()).to.equal(creator.address);
        });

        it("Should set the correct funding goal", async function () {
            expect(await campaign.fundingGoal()).to.equal(FUNDING_GOAL);
        });

        it("Should set the correct IPFS hash", async function () {
            expect(await campaign.ipfsHash()).to.equal(IPFS_HASH);
        });

        it("Should initialize verification states as false", async function () {
            expect(await campaign.aiVerified()).to.be.false;
            expect(await campaign.communityApproved()).to.be.false;
            expect(await campaign.fraudDetected()).to.be.false;
        });
    });

    describe("Contributions", function () {
        it("Should accept contributions", async function () {
            const amount = ethers.parseEther("1");
            await campaign.connect(contributor1).contribute({ value: amount });

            expect(await campaign.contributions(contributor1.address)).to.equal(amount);
            expect(await campaign.totalRaised()).to.equal(amount);
        });

        it("Should track multiple contributions from same user", async function () {
            const amount1 = ethers.parseEther("1");
            const amount2 = ethers.parseEther("2");

            await campaign.connect(contributor1).contribute({ value: amount1 });
            await campaign.connect(contributor1).contribute({ value: amount2 });

            expect(await campaign.contributions(contributor1.address)).to.equal(amount1 + amount2);
            expect(await campaign.totalRaised()).to.equal(amount1 + amount2);
        });

        it("Should add contributor to list", async function () {
            await campaign.connect(contributor1).contribute({ value: ethers.parseEther("1") });
            const contributors = await campaign.getContributors();
            expect(contributors).to.include(contributor1.address);
        });

        it("Should reject contributions after fraud detection", async function () {
            await campaign.connect(aiVerifier).reportFraud();
            await expect(
                campaign.connect(contributor1).contribute({ value: ethers.parseEther("1") })
            ).to.be.revertedWith("Campaign marked as fraud");
        });
    });

    describe("Voting", function () {
        beforeEach(async function () {
            // Contributors must contribute first
            await campaign.connect(contributor1).contribute({ value: ethers.parseEther("1") });
            await campaign.connect(contributor2).contribute({ value: ethers.parseEther("1") });
            await campaign.connect(contributor3).contribute({ value: ethers.parseEther("1") });
        });

        it("Should allow contributors to vote", async function () {
            await campaign.connect(contributor1).vote(true);
            expect(await campaign.yesVotes()).to.equal(1);
            expect(await campaign.hasVoted(contributor1.address)).to.be.true;
        });

        it("Should prevent double voting", async function () {
            await campaign.connect(contributor1).vote(true);
            await expect(campaign.connect(contributor1).vote(true)).to.be.revertedWith("Already voted");
        });

        it("Should prevent non-contributors from voting", async function () {
            await expect(campaign.connect(owner).vote(true)).to.be.revertedWith("Must be a contributor");
        });

        it("Should auto-approve when threshold reached", async function () {
            await campaign.connect(contributor1).vote(true);
            await campaign.connect(contributor2).vote(true);
            await campaign.connect(contributor3).vote(true);

            expect(await campaign.communityApproved()).to.be.true;
        });

        it("Should not approve with low yes votes", async function () {
            await campaign.connect(contributor1).vote(true);
            await campaign.connect(contributor2).vote(false);
            await campaign.connect(contributor3).vote(false);

            expect(await campaign.communityApproved()).to.be.false;
        });
    });

    describe("AI Verification", function () {
        it("Should allow verifier to set AI verification", async function () {
            await campaign.connect(aiVerifier).setAIVerification(true);
            expect(await campaign.aiVerified()).to.be.true;
        });

        it("Should prevent non-verifier from setting AI verification", async function () {
            await expect(campaign.connect(owner).setAIVerification(true)).to.be.revertedWith(
                "Only AI verifier can call this"
            );
        });

        it("Should prevent changing AI verification after set", async function () {
            await campaign.connect(aiVerifier).setAIVerification(true);
            await expect(campaign.connect(aiVerifier).setAIVerification(false)).to.be.revertedWith(
                "AI verification already set"
            );
        });
    });

    describe("Withdrawal", function () {
        beforeEach(async function () {
            // Setup: Contribute enough funds
            await campaign.connect(contributor1).contribute({ value: ethers.parseEther("5") });
            await campaign.connect(contributor2).contribute({ value: ethers.parseEther("5") });

            // Setup: Get approvals
            await campaign.connect(contributor1).vote(true);
            await campaign.connect(contributor2).vote(true);
            await campaign.connect(aiVerifier).setAIVerification(true);

            // Fast forward past deadline
            await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
            await ethers.provider.send("evm_mine", []);
        });

        it("Should allow creator to withdraw when all conditions met", async function () {
            const balanceBefore = await ethers.provider.getBalance(creator.address);
            await campaign.connect(creator).withdraw();
            const balanceAfter = await ethers.provider.getBalance(creator.address);

            expect(balanceAfter).to.be.gt(balanceBefore);
            expect(await campaign.withdrawn()).to.be.true;
        });

        it("Should prevent withdrawal without AI verification", async function () {
            // Create new campaign without AI verification
            const tx = await factory.connect(creator).createCampaign(IPFS_HASH, FUNDING_GOAL, DURATION);
            const receipt = await tx.wait();
            const event = receipt?.logs.find((log: any) => {
                try {
                    return factory.interface.parseLog(log)?.name === "CampaignCreated";
                } catch {
                    return false;
                }
            });
            const parsedEvent = factory.interface.parseLog(event!);
            const newCampaign = await ethers.getContractAt("Campaign", parsedEvent?.args[0]);

            await newCampaign.connect(contributor1).contribute({ value: FUNDING_GOAL });
            await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
            await ethers.provider.send("evm_mine", []);

            await expect(newCampaign.connect(creator).withdraw()).to.be.revertedWith(
                "AI verification required"
            );
        });

        it("Should prevent withdrawal if fraud detected", async function () {
            await campaign.connect(aiVerifier).reportFraud();
            await expect(campaign.connect(creator).withdraw()).to.be.revertedWith(
                "Campaign marked as fraud"
            );
        });
    });

    describe("Fraud and Refunds", function () {
        beforeEach(async function () {
            await campaign.connect(contributor1).contribute({ value: ethers.parseEther("3") });
            await campaign.connect(contributor2).contribute({ value: ethers.parseEther("2") });
        });

        it("Should allow verifier to report fraud", async function () {
            await campaign.connect(aiVerifier).reportFraud();
            expect(await campaign.fraudDetected()).to.be.true;
        });

        it("Should allow contributors to claim refunds after fraud", async function () {
            await campaign.connect(aiVerifier).reportFraud();

            const balanceBefore = await ethers.provider.getBalance(contributor1.address);
            const tx = await campaign.connect(contributor1).refund();
            const receipt = await tx.wait();
            const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
            const balanceAfter = await ethers.provider.getBalance(contributor1.address);

            const expectedBalance = balanceBefore + ethers.parseEther("3") - gasUsed;
            expect(balanceAfter).to.equal(expectedBalance);
        });

        it("Should prevent double refund", async function () {
            await campaign.connect(aiVerifier).reportFraud();
            await campaign.connect(contributor1).refund();
            await expect(campaign.connect(contributor1).refund()).to.be.revertedWith(
                "No contribution to refund"
            );
        });

        it("Should prevent refund without fraud", async function () {
            await expect(campaign.connect(contributor1).refund()).to.be.revertedWith("No fraud detected");
        });
    });

    describe("Trust Score", function () {
        it("Should calculate trust score with AI verification only", async function () {
            await campaign.connect(aiVerifier).setAIVerification(true);
            const score = await campaign.getTrustScore();
            expect(score).to.equal(40);
        });

        it("Should calculate trust score with voting", async function () {
            await campaign.connect(contributor1).contribute({ value: ethers.parseEther("1") });
            await campaign.connect(contributor2).contribute({ value: ethers.parseEther("1") });
            await campaign.connect(contributor3).contribute({ value: ethers.parseEther("1") });

            await campaign.connect(contributor1).vote(true);
            await campaign.connect(contributor2).vote(true);
            await campaign.connect(contributor3).vote(true);

            const score = await campaign.getTrustScore();
            expect(score).to.equal(60); // 100% approval = 60 points
        });

        it("Should calculate full trust score", async function () {
            await campaign.connect(contributor1).contribute({ value: ethers.parseEther("1") });
            await campaign.connect(contributor2).contribute({ value: ethers.parseEther("1") });
            await campaign.connect(contributor3).contribute({ value: ethers.parseEther("1") });

            await campaign.connect(aiVerifier).setAIVerification(true);
            await campaign.connect(contributor1).vote(true);
            await campaign.connect(contributor2).vote(true);
            await campaign.connect(contributor3).vote(true);

            const score = await campaign.getTrustScore();
            expect(score).to.equal(100); // 40 + 60 = 100
        });
    });
});
