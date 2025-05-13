// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ReentrancyVulnerableVault
 * @dev A CTF challenge that simulates a vault vulnerable to reentrancy attacks
 * without actually transferring real ETH.
 */
contract ReentrancyVulnerableVault {
    address public owner;
    string private flag;
    bool public vaultDrained;
    
    // Tracking simulated balances
    mapping(address => uint256) public userBalances;
    uint256 public totalVaultBalance;
    
    // For tracking and simulation purposes
    uint256 public withdrawalCounter;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event VaultDrained(address indexed attacker, uint256 drainedAmount);
    
    constructor() {
        owner = msg.sender;
        totalVaultBalance = 100 ether;
        // Set the flag
        flag = "CRISIS{bl0ck-ch4in_1s_n0t_c00l_but_d3adly}";
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    /**
     * @dev Simulates a deposit into the vault
     */
    function deposit() external payable {
        // The actual ETH sent is not used, but we track a simulated balance
        uint256 depositAmount = msg.value > 0 ? msg.value : 1 ether;
        
        userBalances[msg.sender] += depositAmount;
        totalVaultBalance += depositAmount;
        
        emit Deposit(msg.sender, depositAmount);
    }
    
    /**
     * @dev Simulates withdrawal from the vault. Has the classic reentrancy vulnerability
     * where the balance check happens after the external call.
     */
    function withdraw(uint256 amount) external {
        // Require that user has the simulated balance
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        require(totalVaultBalance >= amount, "Vault has insufficient funds");
        
        withdrawalCounter++;
        
        // THE VULNERABILITY: External call before state updates
        // This simulated "call" to user's fallback function opens the reentrancy vector
        // Send a small amount of ETH to ensure the call succeeds
        (bool success, ) = msg.sender.call{value: 0.0001 ether}("");
        require(success, "External call failed");
        
        // Update state after the call (the vulnerable pattern)
        userBalances[msg.sender] -= amount;
        totalVaultBalance -= amount;
        
        emit Withdrawal(msg.sender, amount);
        
        // Check if the vault is "drained" through simulated reentrancy
        // This is triggered if the withdrawal counter indicates multiple withdrawals in one tx
        if (withdrawalCounter >= 3) {
            vaultDrained = true;
            emit VaultDrained(msg.sender, totalVaultBalance);
        }
    }
    
    /**
     * @dev Returns the flag if the vault has been successfully drained
     */
    function getFlag() external view returns (string memory) {
        require(vaultDrained, "No flag for you");
        return flag;
    }
    
    /**
     * @dev Shows the current balance of the user (simulated)
     */
    function balanceOf(address user) external view returns (uint256) {
        return userBalances[user];
    }
    
    /**
     * @dev Resets the challenge state for testing
     */
    function reset() external onlyOwner {
        vaultDrained = false;
        withdrawalCounter = 0;
        totalVaultBalance = 100 ether;
        // Don't clear all balances, just the sender's
        userBalances[msg.sender] = 0;
    }
    
    // Allow the contract to receive ETH
    receive() external payable {}
}