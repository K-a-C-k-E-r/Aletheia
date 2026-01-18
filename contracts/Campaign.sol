// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Campaign
 * @notice Individual crowdfunding campaign with dual verification (AI + Community)
 * @dev Implements automatic refund mechanism on fraud detection
 */
contract Campaign {
    // Campaign metadata
    address public creator;
    string public ipfsHash; // Campaign details stored on IPFS
    uint256 public fundingGoal;
    uint256 public deadline;
    uint256 public totalRaised;
    
    // Verification states
    bool public aiVerified;
    bool public communityApproved;
    bool public fraudDetected;
    bool public withdrawn;
    
    // Voting system
    uint256 public yesVotes;
    uint256 public noVotes;
    uint256 public constant APPROVAL_THRESHOLD = 60; // 60% approval needed
    uint256 public constant MIN_VOTES_REQUIRED = 3; // Minimum votes to approve
    
    // Contributor tracking
    mapping(address => uint256) public contributions;
    mapping(address => bool) public hasVoted;
    address[] public contributors;
    
    // AI Verifier address (can be updated to oracle)
    address public aiVerifier;
    
    // Events
    event ContributionReceived(address indexed contributor, uint256 amount);
    event VoteCast(address indexed voter, bool approve);
    event AIVerificationSet(bool verified);
    event CommunityApprovalUpdated(bool approved);
    event FraudDetected();
    event FundsWithdrawn(address indexed creator, uint256 amount);
    event RefundClaimed(address indexed contributor, uint256 amount);
    
    // Modifiers
    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this");
        _;
    }
    
    modifier onlyVerifier() {
        require(msg.sender == aiVerifier, "Only AI verifier can call this");
        _;
    }
    
    modifier onlyVerified() {
        require(aiVerified, "AI verification required");
        require(communityApproved, "Community approval required");
        _;
    }
    
    modifier notFraud() {
        require(!fraudDetected, "Campaign marked as fraud");
        _;
    }
    
    modifier hasContributed() {
        require(contributions[msg.sender] > 0, "Must be a contributor");
        _;
    }
    
    /**
     * @notice Initialize a new campaign
     * @param _creator Campaign creator address
     * @param _ipfsHash IPFS hash containing campaign details
     * @param _fundingGoal Target amount to raise (in wei)
     * @param _duration Campaign duration in seconds
     * @param _aiVerifier Address authorized to set AI verification
     */
    constructor(
        address _creator,
        string memory _ipfsHash,
        uint256 _fundingGoal,
        uint256 _duration,
        address _aiVerifier
    ) {
        require(_creator != address(0), "Invalid creator address");
        require(_fundingGoal > 0, "Goal must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        creator = _creator;
        ipfsHash = _ipfsHash;
        fundingGoal = _fundingGoal;
        deadline = block.timestamp + _duration;
        aiVerifier = _aiVerifier;
    }
    
    /**
     * @notice Contribute funds to the campaign
     */
    function contribute() external payable notFraud {
        require(block.timestamp < deadline, "Campaign ended");
        require(msg.value > 0, "Must send value");
        
        // Track new contributor
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        
        emit ContributionReceived(msg.sender, msg.value);
    }
    
    /**
     * @notice Vote on campaign legitimacy (only contributors)
     * @param _approve True to approve, false to reject
     */
    function vote(bool _approve) external hasContributed notFraud {
        require(!hasVoted[msg.sender], "Already voted");
        require(block.timestamp < deadline, "Voting ended");
        
        hasVoted[msg.sender] = true;
        
        if (_approve) {
            yesVotes++;
        } else {
            noVotes++;
        }
        
        emit VoteCast(msg.sender, _approve);
        
        // Check if approval threshold reached
        uint256 totalVotes = yesVotes + noVotes;
        if (totalVotes >= MIN_VOTES_REQUIRED) {
            uint256 approvalPercentage = (yesVotes * 100) / totalVotes;
            if (approvalPercentage >= APPROVAL_THRESHOLD) {
                communityApproved = true;
                emit CommunityApprovalUpdated(true);
            }
        }
    }
    
    /**
     * @notice Set AI verification status (called by oracle/verifier)
     * @param _verified Verification result
     */
    function setAIVerification(bool _verified) external onlyVerifier {
        require(!aiVerified, "AI verification already set");
        aiVerified = _verified;
        emit AIVerificationSet(_verified);
    }
    
    /**
     * @notice Creator withdraws funds if all conditions met
     */
    function withdraw() external onlyCreator onlyVerified notFraud {
        require(block.timestamp >= deadline, "Campaign not ended");
        require(totalRaised >= fundingGoal, "Funding goal not met");
        require(!withdrawn, "Already withdrawn");
        
        withdrawn = true;
        uint256 amount = address(this).balance;
        
        emit FundsWithdrawn(creator, amount);
        
        (bool success, ) = payable(creator).call{value: amount}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @notice Mark campaign as fraudulent (governance/oracle function)
     * @dev In production, this would be controlled by DAO governance
     */
    function reportFraud() external onlyVerifier {
        require(!withdrawn, "Funds already withdrawn");
        fraudDetected = true;
        emit FraudDetected();
    }
    
    /**
     * @notice Claim refund if fraud detected
     */
    function refund() external {
        require(fraudDetected, "No fraud detected");
        require(contributions[msg.sender] > 0, "No contribution to refund");
        
        uint256 amount = contributions[msg.sender];
        contributions[msg.sender] = 0;
        
        emit RefundClaimed(msg.sender, amount);
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Refund failed");
    }
    
    /**
     * @notice Get campaign status
     * @return _creator Campaign creator address
     * @return _fundingGoal Target amount to raise (in wei)
     * @return _totalRaised Total amount raised so far (in wei)
     * @return _deadline Timestamp when the campaign ends
     * @return _aiVerified True if AI verification passed
     * @return _communityApproved True if community approval threshold met
     * @return _fraudDetected True if fraud has been detected
     * @return _withdrawn True if funds have been withdrawn by the creator
     * @return _yesVotes Number of 'yes' votes from contributors
     * @return _noVotes Number of 'no' votes from contributors
     * @return _contributorCount Total number of unique contributors
     */
    function getCampaignStatus() external view returns (
        address _creator,
        uint256 _fundingGoal,
        uint256 _totalRaised,
        uint256 _deadline,
        bool _aiVerified,
        bool _communityApproved,
        bool _fraudDetected,
        bool _withdrawn,
        uint256 _yesVotes,
        uint256 _noVotes,
        uint256 _contributorCount
    ) {
        return (
            creator,
            fundingGoal,
            totalRaised,
            deadline,
            aiVerified,
            communityApproved,
            fraudDetected,
            withdrawn,
            yesVotes,
            noVotes,
            contributors.length
        );
    }
    
    /**
     * @notice Get all contributors
     */
    function getContributors() external view returns (address[] memory) {
        return contributors;
    }
    
    /**
     * @notice Calculate trust score (0-100)
     */
    function getTrustScore() external view returns (uint256) {
        uint256 score = 0;
        
        // AI verification: 40 points
        if (aiVerified) {
            score += 40;
        }
        
        // Community voting: 60 points based on approval percentage
        uint256 totalVotes = yesVotes + noVotes;
        if (totalVotes > 0) {
            uint256 approvalPercentage = (yesVotes * 100) / totalVotes;
            score += (approvalPercentage * 60) / 100;
        }
        
        return score;
    }
}
