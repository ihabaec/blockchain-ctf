const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy CTF Simplified", function () {
  let vault, attacker, owner, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const VaultFactory = await ethers.getContractFactory("ReentrancyVulnerableVault", owner);
    vault = await VaultFactory.deploy("CTF{congrats_you_did_it}");
    await vault.waitForDeployment();

    const AttackerFactory = await ethers.getContractFactory("ReentrancyAttackerSimplified", user);
    attacker = await AttackerFactory.deploy(await vault.getAddress());
    await attacker.waitForDeployment();
  });

  it("should perform setup and attack separately", async () => {
    // Step 1: Setup with initial deposit
    await attacker.connect(user).setup({ value: ethers.parseEther("5") });
    
    // Verify attacker has a balance
    const balance = await vault.balanceOf(attacker.getAddress());
    expect(balance).to.be.gt(0);
    
    // Step 2: Perform the attack
    await attacker.connect(user).startAttack();
    
    // Step 3: Check if the vault is drained
    const drained = await vault.vaultDrained();
    expect(drained).to.be.true;
    
    // Step 4: Get the flag
    const flag = await attacker.connect(user).getFlag();
    console.log(flag);
  });
  
  it("should reset and allow new attempts", async () => {
    // First attack
    await attacker.connect(user).setup({ value: ethers.parseEther("5") });
    await attacker.connect(user).startAttack();
    expect(await vault.vaultDrained()).to.be.true;
    
    // Reset the vault
    await vault.connect(owner).reset();
    expect(await vault.vaultDrained()).to.be.false;
    
    // Try again
    await attacker.connect(user).setup({ value: ethers.parseEther("5") });
    await attacker.connect(user).startAttack();
    expect(await vault.vaultDrained()).to.be.true;
  });
});