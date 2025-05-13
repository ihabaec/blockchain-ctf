const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy Debugger", function () {
  let vault, debuggerContract, owner, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const VaultFactory = await ethers.getContractFactory("ReentrancyVulnerableVault", owner);
    vault = await VaultFactory.deploy("CTF{debug_success}");
    await vault.waitForDeployment();

    const DebuggerFactory = await ethers.getContractFactory("ReentrancyDebugger", user);
    debuggerContract = await DebuggerFactory.deploy(await vault.getAddress());
    await debuggerContract.waitForDeployment();
  });

  it("should track all steps of the attack", async () => {
    // Deposit to setup
    const depositTx = await debuggerContract.connect(user).debugDeposit({ value: ethers.parseEther("5") });
    const depositReceipt = await depositTx.wait();
    
    console.log("\n--- DEPOSIT DEBUG INFO ---");
    for (const log of depositReceipt.logs) {
      try {
        const parsedLog = debuggerContract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === "DebugInfo") {
          console.log(`${parsedLog.args[0]}: ${parsedLog.args[1]}`);
        }
      } catch (e) {
        // Not a DebugInfo event
      }
    }
    
    // Get pre-attack state
    const preAttackInfo = await debuggerContract.getVaultInfo();
    console.log("\n--- PRE-ATTACK STATE ---");
    console.log(`Attacker Balance: ${preAttackInfo[0]}`);
    console.log(`Total Vault Balance: ${preAttackInfo[1]}`);
    console.log(`Withdrawal Counter: ${preAttackInfo[2]}`);
    console.log(`Is Drained: ${preAttackInfo[3]}`);
    
    // Perform attack
    const attackTx = await debuggerContract.connect(user).debugAttack();
    const attackReceipt = await attackTx.wait();
    
    console.log("\n--- ATTACK DEBUG INFO ---");
    let stepCount = 0;
    for (const log of attackReceipt.logs) {
      try {
        const parsedLog = debuggerContract.interface.parseLog(log);
        if (parsedLog) {
          if (parsedLog.name === "AttackStarted") {
            console.log("Attack started");
          } else if (parsedLog.name === "AttackStep") {
            console.log(`Attack step ${parsedLog.args[0]}`);
            stepCount++;
          } else if (parsedLog.name === "AttackCompleted") {
            console.log(`Attack completed, success: ${parsedLog.args[0]}`);
          } else if (parsedLog.name === "DebugInfo") {
            console.log(`${parsedLog.args[0]}: ${parsedLog.args[1]}`);
          }
        }
      } catch (e) {
        // Not one of our events
      }
    }
    
    // Get post-attack state
    const postAttackInfo = await debuggerContract.getVaultInfo();
    console.log("\n--- POST-ATTACK STATE ---");
    console.log(`Attacker Balance: ${postAttackInfo[0]}`);
    console.log(`Total Vault Balance: ${postAttackInfo[1]}`);
    console.log(`Withdrawal Counter: ${postAttackInfo[2]}`);
    console.log(`Is Drained: ${postAttackInfo[3]}`);
    
    // Assertions
    expect(stepCount).to.be.greaterThanOrEqual(3); // At least 3 steps in the attack
    expect(await debuggerContract.attackSucceeded()).to.be.true;
    expect(await vault.vaultDrained()).to.be.true;
    
    // Get the flag
    const flag = await debuggerContract.getFlag();
    console.log(`\nFlag: ${flag}`);
    expect(flag).to.equal("CTF{debug_success}");
  });
});