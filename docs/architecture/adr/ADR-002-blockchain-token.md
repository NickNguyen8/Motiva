# ADR 002: Token on Blockchain (ERC-20)

## Context
We need a mechanism to represent employee equity that is transparent, portable, and ready for a future IPO or secondary market liquidity even while the company is private.

## Decision
We will implement the equity token (`MTS`) as a standard **ERC-20 Smart Contract** on an EVM-compatible chain (Private/Testnet initially, Mainnet later).
- **Implementation**: OpenZeppelin ERC20 Upgradeable (UUPS).
- **Minting**: Restricted to `MINTER_ROLE` held by the backend `TokenEngine`.

## Consequences
### Positive
- **Trust**: Employees can verify their holdings independently of the company database.
- **Future-Proof**: Moving to a public liquidity event (IPO/DEX listing) is technically seamless (remove restrictions or bridge).
- **Standardization**: Wallet integration (MetaMask, etc.) works out of the box.

### Negative
- **Cost**: Gas fees for minting/transfers (mitigated by L2s or sidechains).
- **Key Management**: Company must securely manage the `MINTER` private key. Loss = Loss of automation capability.
