// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Campaign.sol";

/**
 * @title CampaignFactory
 * @notice Factory contract for creating and managing campaigns
 * @dev Uses factory pattern for efficient campaign deployment
 */
contract CampaignFactory {
    // All deployed campaigns
    address[] public campaigns;
    
    // Mapping of creator to their campaigns
    mapping(address => address[]) public creatorCampaigns;
    
    // AI Verifier address (shared across all campaigns)
    address public aiVerifier;
    address public owner;
    
    // Events
    event CampaignCreated(
        address indexed campaign,
        address indexed creator,
        string ipfsHash,
        uint256 fundingGoal,
        uint256 deadline
    );
    event AIVerifierUpdated(address indexed newVerifier);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(address _aiVerifier) {
        require(_aiVerifier != address(0), "Invalid verifier address");
        owner = msg.sender;
        aiVerifier = _aiVerifier;
    }
    
    /**
     * @notice Create a new crowdfunding campaign
     * @param _ipfsHash IPFS hash containing campaign metadata
     * @param _fundingGoal Target funding amount in wei
     * @param _duration Campaign duration in seconds
     * @return campaignAddress Address of the newly created campaign
     */
    function createCampaign(
        string memory _ipfsHash,
        uint256 _fundingGoal,
        uint256 _duration
    ) external returns (address campaignAddress) {
        Campaign newCampaign = new Campaign(
            msg.sender,
            _ipfsHash,
            _fundingGoal,
            _duration,
            aiVerifier
        );
        
        campaignAddress = address(newCampaign);
        campaigns.push(campaignAddress);
        creatorCampaigns[msg.sender].push(campaignAddress);
        
        emit CampaignCreated(
            campaignAddress,
            msg.sender,
            _ipfsHash,
            _fundingGoal,
            block.timestamp + _duration
        );
        
        return campaignAddress;
    }
    
    /**
     * @notice Get all campaigns
     */
    function getAllCampaigns() external view returns (address[] memory) {
        return campaigns;
    }
    
    /**
     * @notice Get campaigns created by a specific address
     * @param _creator Creator address
     */
    function getCampaignsByCreator(address _creator) external view returns (address[] memory) {
        return creatorCampaigns[_creator];
    }
    
    /**
     * @notice Get total number of campaigns
     */
    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }
    
    /**
     * @notice Update AI verifier address
     * @param _newVerifier New verifier address
     */
    function updateAIVerifier(address _newVerifier) external onlyOwner {
        require(_newVerifier != address(0), "Invalid verifier address");
        aiVerifier = _newVerifier;
        emit AIVerifierUpdated(_newVerifier);
    }
}
