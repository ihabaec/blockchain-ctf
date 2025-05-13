const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy CTF", function () {
  let vault, attacker, owner, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const VaultFactory = await ethers.getContractFactory("ReentrancyVulnerableVault", owner);
    vault = await VaultFactory.deploy("CTF{congrats_you_did_it}");
    await vault.waitForDeployment();

    const AttackerFactory = await ethers.getContractFactory("ReentrancyAttackerSolution", user);
    attacker = await AttackerFactory.deploy(await vault.getAddress());
    await attacker.waitForDeployment();
  });

  it("should simulate a successful reentrancy attack", async () => {
    await attacker.connect(user).attack({ value: ethers.parseEther("3") });

    // Check if the vault is marked as drained
    const drained = await vault.vaultDrained();
    expect(drained).to.be.true;

    // Get the flag
    const flag = await attacker.connect(user).getFlag();
    console.log(flag)
  });
});