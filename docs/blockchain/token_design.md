# ESOP Token Design & Strategy

## 1. Token Specification
- **Name**: Motiva ESOP
- **Symbol**: MTS (Motiva Stock)
- **Standard**: ERC-20 Upgradeable (OpenZeppelin)
- **Decimals**: 18 (Standard)

## 2. Access Control & Minting Rules
The contract will use `AccessControlUpgradeable`.

### Roles
- `DEFAULT_ADMIN_ROLE`:
  - **Who**: Company Multi-Sig Wallet (Gnosis Safe).
  - **Powers**: Grant/Revoke roles, Upgrade contract implementation (UUPS).
- `MINTER_ROLE`:
  - **Who**: Backend Service (API/Worker) via a secure private key (AWS KMS / HSM).
  - **Powers**: Call `mint(address to, uint256 amount)`.

### Minting Logic
1. User contribution is approved -> `Points` issued in DB.
2. (Optional/Periodic) Backend triggers `mint()` to the User's wallet address.
3. **No public mint function**. Users cannot mint their own tokens.

## 3. Upgrade Strategy (UUPS)
We use the **UUPS (Universal Upgradeable Proxy Standard)** pattern.
- **Proxy**: Holds the state (balances).
- **Implementation**: Holds the logic.
- **Upgrade**: `DEFAULT_ADMIN_ROLE` calls `upgradeTo(newImplementation)`.
- **Reason**: Safer and more gas-efficient than Transparent Proxy.

## 4. Deployment Strategy
1. **Local**: Hardhat Network.
2. **Testnet**: Sepolia (Ethereum) or Amoy (Polygon).
3. **Production**: Mainnet (Ethereum or Polygon).

### Steps
1. Deploy `ESOPToken` implementation.
2. Deploy `ERC1967Proxy` pointing to implementation + initialization data.
3. Verify contract on Etherscan.

## 5. ABI Export Strategy for Backend
The backend needs the ABI to interact with the contract (via Ethers.js / Viem).
1. `packages/blockchain`: Compile contracts (Hardhat).
2. Script extracts `abi` from `artifacts/contracts/ESOPToken.sol/ESOPToken.json`.
3. Save to `packages/contracts/src/abis/ESOPToken.json`.
4. `packages/contracts` exports this JSON.
5. `apps/worker` imports `ESOPTokenAbi` from `@motiva/contracts`.
