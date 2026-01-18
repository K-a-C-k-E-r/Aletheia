// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITrustScore {
    function recordLoan(address _user, uint256 _amount) external;
    function recordRepayment(address _user, uint256 _amount, bool _onTime) external;
    function recordDefault(address _user, uint256 _amount) external;
    function getInterestRate(address _user) external view returns (uint256);
    function calculateTrustScore(address _user) external view returns (uint256);
}

/**
 * @title LendingPool
 * @notice Manages collateralized loans with dynamic interest rates
 * @dev Interest rates are determined by user trust scores
 */
contract LendingPool {
    ITrustScore public trustScore;
    address public owner;
    
    // Loan structure
    struct Loan {
        address borrower;
        uint256 collateralAmount;
        uint256 loanAmount;
        uint256 interestRate; // In basis points (e.g., 1000 = 10%)
        uint256 startTime;
        uint256 duration;
        uint256 dueDate;
        bool active;
        bool repaid;
        bool defaulted;
    }
    
    // State variables
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    uint256 public loanCounter;
    uint256 public totalPoolBalance;
    uint256 public constant COLLATERAL_RATIO = 150; // 150% collateralization
    uint256 public constant BASIS_POINTS = 10000;
    
    // Events
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 collateralAmount,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 dueDate
    );
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 totalAmount);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);
    event CollateralWithdrawn(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event PoolDeposit(address indexed depositor, uint256 amount);
    event PoolWithdrawal(address indexed withdrawer, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(address _trustScore) {
        require(_trustScore != address(0), "Invalid trust score address");
        trustScore = ITrustScore(_trustScore);
        owner = msg.sender;
    }
    
    /**
     * @notice Deposit funds to the lending pool
     */
    function depositToPool() external payable {
        require(msg.value > 0, "Must deposit value");
        totalPoolBalance += msg.value;
        emit PoolDeposit(msg.sender, msg.value);
    }
    
    /**
     * @notice Create a new collateralized loan
     * @param _loanAmount Amount to borrow
     * @param _duration Loan duration in seconds
     */
    function createLoan(
        uint256 _loanAmount,
        uint256 _duration
    ) external payable returns (uint256 loanId) {
        require(_loanAmount > 0, "Loan amount must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(msg.value > 0, "Must provide collateral");
        
        // Calculate required collateral (150% of loan amount)
        uint256 requiredCollateral = (_loanAmount * COLLATERAL_RATIO) / 100;
        require(msg.value >= requiredCollateral, "Insufficient collateral");
        
        // Check pool has enough funds
        require(totalPoolBalance >= _loanAmount, "Insufficient pool balance");
        
        // Get interest rate from trust score
        uint256 interestRate = trustScore.getInterestRate(msg.sender);
        
        // Create loan
        loanId = loanCounter++;
        uint256 dueDate = block.timestamp + _duration;
        
        loans[loanId] = Loan({
            borrower: msg.sender,
            collateralAmount: msg.value,
            loanAmount: _loanAmount,
            interestRate: interestRate,
            startTime: block.timestamp,
            duration: _duration,
            dueDate: dueDate,
            active: true,
            repaid: false,
            defaulted: false
        });
        
        userLoans[msg.sender].push(loanId);
        
        // Update pool balance
        totalPoolBalance -= _loanAmount;
        
        // Record loan in trust score
        trustScore.recordLoan(msg.sender, _loanAmount);
        
        // Transfer loan amount to borrower
        (bool success, ) = payable(msg.sender).call{value: _loanAmount}("");
        require(success, "Loan transfer failed");
        
        emit LoanCreated(
            loanId,
            msg.sender,
            msg.value,
            _loanAmount,
            interestRate,
            dueDate
        );
        
        return loanId;
    }
    
    /**
     * @notice Repay a loan
     * @param _loanId Loan ID to repay
     */
    function repayLoan(uint256 _loanId) external payable {
        Loan storage loan = loans[_loanId];
        
        require(loan.active, "Loan not active");
        require(loan.borrower == msg.sender, "Not loan borrower");
        require(!loan.repaid, "Loan already repaid");
        require(!loan.defaulted, "Loan defaulted");
        
        // Calculate total repayment amount (principal + interest)
        uint256 totalRepayment = calculateRepaymentAmount(_loanId);
        require(msg.value >= totalRepayment, "Insufficient repayment amount");
        
        // Check if repayment is on time
        bool onTime = block.timestamp <= loan.dueDate;
        
        // Update loan status
        loan.active = false;
        loan.repaid = true;
        
        // Return collateral to borrower
        uint256 collateralToReturn = loan.collateralAmount;
        
        // Add repayment to pool
        totalPoolBalance += totalRepayment;
        
        // Record repayment in trust score
        trustScore.recordRepayment(msg.sender, totalRepayment, onTime);
        
        emit LoanRepaid(_loanId, msg.sender, totalRepayment);
        
        // Return collateral
        (bool success, ) = payable(msg.sender).call{value: collateralToReturn}("");
        require(success, "Collateral return failed");
        
        // Return excess payment if any
        if (msg.value > totalRepayment) {
            uint256 excess = msg.value - totalRepayment;
            (bool excessSuccess, ) = payable(msg.sender).call{value: excess}("");
            require(excessSuccess, "Excess return failed");
        }
    }
    
    /**
     * @notice Liquidate a defaulted loan
     * @param _loanId Loan ID to liquidate
     */
    function liquidateLoan(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];
        
        require(loan.active, "Loan not active");
        require(!loan.repaid, "Loan already repaid");
        require(block.timestamp > loan.dueDate, "Loan not yet due");
        
        // Mark as defaulted
        loan.active = false;
        loan.defaulted = true;
        
        // Add collateral to pool
        totalPoolBalance += loan.collateralAmount;
        
        // Record default in trust score
        trustScore.recordDefault(loan.borrower, loan.loanAmount);
        
        emit LoanDefaulted(_loanId, loan.borrower);
    }
    
    /**
     * @notice Calculate total repayment amount for a loan
     * @param _loanId Loan ID
     * @return totalAmount Total amount to repay (principal + interest)
     */
    function calculateRepaymentAmount(uint256 _loanId) public view returns (uint256 totalAmount) {
        Loan memory loan = loans[_loanId];
        
        // Calculate interest: (principal * rate * duration) / (BASIS_POINTS * 365 days)
        uint256 interest = (loan.loanAmount * loan.interestRate * loan.duration) / 
                          (BASIS_POINTS * 365 days);
        
        totalAmount = loan.loanAmount + interest;
        return totalAmount;
    }
    
    /**
     * @notice Get all loan IDs for a user
     * @param _user User address
     */
    function getUserLoans(address _user) external view returns (uint256[] memory) {
        return userLoans[_user];
    }
    
    /**
     * @notice Owner can withdraw excess pool funds
     * @param _amount Amount to withdraw
     */
    function withdrawPoolFunds(uint256 _amount) external onlyOwner {
        require(_amount <= totalPoolBalance, "Insufficient pool balance");
        totalPoolBalance -= _amount;
        
        emit PoolWithdrawal(msg.sender, _amount);
        
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @notice Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 balance,
        uint256 totalLoans,
        uint256 activeLoans
    ) {
        uint256 active = 0;
        for (uint256 i = 0; i < loanCounter; i++) {
            if (loans[i].active) {
                active++;
            }
        }
        
        return (totalPoolBalance, loanCounter, active);
    }
}
