# Blockchain CTF: Reentrancy Challenge

A Capture The Flag (CTF) challenge demonstrating reentrancy vulnerabilities in Ethereum smart contracts. This educational project helps developers understand one of the most critical security vulnerabilities in smart contract development.

## Overview

This CTF challenge simulates a vulnerable vault contract that can be exploited through a reentrancy attack. The goal is to drain the vault and capture the flag by exploiting the classic reentrancy vulnerability pattern.

## Table of Contents

- [Vulnerability Explained](#vulnerability-explained)
- [Challenge Setup](#challenge-setup)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Deployment](#deployment)
- [Learning Resources](#learning-resources)
- [Security Warning](#security-warning)

## Vulnerability Explained

The `ReentrancyVulnerableVault` contract contains a classic reentrancy vulnerability where:

1. The contract checks the user's balance
2. Makes an external call to the user (triggering their fallback function)
3. **Only then** updates the user's balance (the vulnerability!)

An attacker can exploit this by recursively calling the withdraw function before the balance is updated, allowing multiple withdrawals with a single deposit.

## Challenge Setup

### Contracts

1. **ReentrancyVulnerableVault** ([contracts/ReentrancyVulnerableVault.sol](contracts/ReentrancyVulnerableVault.sol))
   - A deliberately vulnerable vault contract
   - Contains a flag that's revealed when successfully drained
   - Simulates balance tracking without requiring actual ETH transfers

2. **ReentrancyAttackerSolution** ([contracts/ReentrancyAttackerSolution.sol](contracts/ReentrancyAttackerSolution.sol))
   - Example attack contract demonstrating the exploit
   - Uses the `receive()` fallback function to perform recursive withdrawals
   - Captures the flag after successful exploitation

## Project Structure

```
blockchain-ctf/
├── contracts/              # Smart contracts
│   ├── ReentrancyVulnerableVault.sol
│   └── ReentrancyAttackerSolution.sol
├── scripts/               # Deployment and execution scripts
│   ├── deploy.js
│   ├── run-attack.js
│   └── debug.js
├── test/                  # Test files
│   ├── reentrancyChallenge.js
│   ├── testsimp.js
│   └── debugReentrancy.js
├── artifacts/             # Compiled contracts
├── cache/                 # Hardhat cache
├── hardhat.config.js      # Hardhat configuration
└── package.json          # Project dependencies
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- (Optional) An Infura account for testnet deployment

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd blockchain-ctf
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (for testnet deployment only):
```env
INFURA_KEY=your_infura_project_id
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
CTF_FLAG=CRISIS{bl0ck-ch4in_1s_c00l_but_d3adly}
```

## Usage

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Run Specific Test

```bash
npx hardhat test test/reentrancyChallenge.js
```

### Deploy Locally

```bash
npx hardhat run scripts/deploy.js
```

### Run Attack Simulation

```bash
npx hardhat run scripts/run-attack.js
```

### Deploy to Sepolia Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Testing

The project includes several test files:

- **reentrancyChallenge.js**: Main challenge test suite
- **debugReentrancy.js**: Detailed debugging of the reentrancy attack
- **testsimp.js**: Simplified test cases

Run all tests:
```bash
npx hardhat test
```

## Deployment

### Local Network

1. Start a local Hardhat node:
```bash
npx hardhat node
```

2. Deploy contracts:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Sepolia Testnet

Ensure your `.env` file is configured with valid credentials, then:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Learning Resources

### Understanding Reentrancy

Reentrancy attacks occur when:
- A contract makes an external call to an untrusted contract
- The called contract calls back into the calling contract
- State changes happen after the external call

### Prevention Techniques

1. **Checks-Effects-Interactions Pattern**: Update state before making external calls
2. **ReentrancyGuard**: Use OpenZeppelin's ReentrancyGuard modifier
3. **Pull over Push**: Use withdrawal patterns instead of direct transfers

## Security Warning

**EDUCATIONAL PURPOSES ONLY**

This project is designed for educational purposes to demonstrate smart contract vulnerabilities. The contracts in this repository contain intentional security flaws and should **NEVER** be deployed to mainnet or used in production environments.

- Do not use these contracts with real funds
- Do not deploy to Ethereum mainnet
- Testnet deployments should only use test ETH
- Always conduct security audits before deploying any smart contract

## License

ISC

## Contributing

This is an educational project. Feel free to fork and create your own CTF challenges!

## Author

Created as part of blockchain security education and CTF challenges.
