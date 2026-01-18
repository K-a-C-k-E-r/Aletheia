// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TrustScore
 * @notice Calculates and manages user trust scores based on on-chain behavior
 * @dev Trust scores range from 0-100 and affect lending interest rates
 */
contract TrustScore {
    // User trust data
    struct UserData {
        uint256 totalLoans;
        uint256 successfulRepayments;
        uint256 latePayments;
        uint256 defaultedLoans;
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 accountAge;
        bool exists;
    }
    
    mapping(address => UserData) public userData;
    address public lendingPool;
    address public owner;
    
    // Events
    event TrustScoreUpdated(address indexed user, uint256 newScore);
    event LoanRecorded(address indexed user, uint256 amount);
    event RepaymentRecorded(address indexed user, uint256 amount, bool onTime);
    event DefaultRecorded(address indexed user, uint256 amount);
    
    modifier onlyLendingPool() {
        require(msg.sender == lendingPool, "Only lending pool");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Set the lending pool address
     * @param _lendingPool Address of the lending pool contract
     */
    function setLendingPool(address _lendingPool) external onlyOwner {
        require(_lendingPool != address(0), "Invalid address");
        lendingPool = _lendingPool;
    }
    
    /**
     * @notice Record a new loan
     * @param _user Borrower address
     * @param _amount Loan amount
     */
    function recordLoan(address _user, uint256 _amount) external onlyLendingPool {
        UserData storage data = userData[_user];
        
        if (!data.exists) {
            data.exists = true;
            data.accountAge = block.timestamp;
        }
        
        data.totalLoans++;
        data.totalBorrowed += _amount;
        
        emit LoanRecorded(_user, _amount);
        emit TrustScoreUpdated(_user, calculateTrustScore(_user));
    }
    
    /**
     * @notice Record a loan repayment
     * @param _user Borrower address
     * @param _amount Repayment amount
     * @param _onTime Whether repayment was on time
     */
    function recordRepayment(
        address _user,
        uint256 _amount,
        bool _onTime
    ) external onlyLendingPool {
        UserData storage data = userData[_user];
        require(data.exists, "User not found");
        
        data.totalRepaid += _amount;
        
        if (_onTime) {
            data.successfulRepayments++;
        } else {
            data.latePayments++;
        }
        
        emit RepaymentRecorded(_user, _amount, _onTime);
        emit TrustScoreUpdated(_user, calculateTrustScore(_user));
    }
    
    /**
     * @notice Record a loan default
     * @param _user Borrower address
     * @param _amount Defaulted amount
     */
    function recordDefault(address _user, uint256 _amount) external onlyLendingPool {
        UserData storage data = userData[_user];
        require(data.exists, "User not found");
        
        data.defaultedLoans++;
        
        emit DefaultRecorded(_user, _amount);
        emit TrustScoreUpdated(_user, calculateTrustScore(_user));
    }
    
    /**
     * @notice Calculate trust score for a user (0-100)
     * @param _user User address
     * @return score Trust score
     */
    function calculateTrustScore(address _user) public view returns (uint256 score) {
        UserData memory data = userData[_user];
        
        if (!data.exists || data.totalLoans == 0) {
            return 0;
        }
        
        // Base score from repayment history (0-60 points)
        uint256 repaymentScore = 0;
        if (data.totalLoans > 0) {
            repaymentScore = (data.successfulRepayments * 60) / data.totalLoans;
        }
        
        // Account age bonus (0-20 points)
        uint256 ageInDays = (block.timestamp - data.accountAge) / 1 days;
        uint256 ageScore = ageInDays > 365 ? 20 : (ageInDays * 20) / 365;
        
        // Activity score (0-20 points)
        uint256 activityScore = data.totalLoans > 10 ? 20 : (data.totalLoans * 20) / 10;
        
        // Calculate base score
        score = repaymentScore + ageScore + activityScore;
        
        // Apply penalties
        uint256 latePenalty = data.latePayments * 5;
        uint256 defaultPenalty = data.defaultedLoans * 15;
        uint256 totalPenalty = latePenalty + defaultPenalty;
        
        // Ensure score doesn't go below 0
        if (totalPenalty >= score) {
            score = 0;
        } else {
            score -= totalPenalty;
        }
        
        // Cap at 100
        if (score > 100) {
            score = 100;
        }
        
        return score;
    }
    
    /**
     * @notice Get interest rate based on trust score
     * @param _user User address
     * @return rate Interest rate in basis points (e.g., 1000 = 10%)
     */
    function getInterestRate(address _user) external view returns (uint256 rate) {
        uint256 trustScore = calculateTrustScore(_user);
        
        // Interest rate formula: 30% - (trustScore * 0.2%)
        // High trust (100) = 10% APR
        // Medium trust (50) = 20% APR
        // Low trust (0) = 30% APR
        
        uint256 baseRate = 3000; // 30% in basis points
        uint256 discount = (trustScore * 20); // 0.2% per trust point
        
        if (discount >= baseRate) {
            rate = 1000; // Minimum 10%
        } else {
            rate = baseRate - discount;
        }
        
        return rate;
    }
}
