# Contract Verification Guide

## Deployed Contracts

### MemeTipLoggerV2 (Latest)
- **Address**: `0x7e9bcAB945D93a152C8D768FDD0A3e05E58BA5Be`
- **Network**: Insectarium (MemeCore)
- **RPC**: https://rpc.insectarium.memecore.net
- **Owner**: `0xBFED7774e226472A2252A6A2db8990DbEfac864B`
- **Solidity**: 0.8.23
- **EVM Version**: paris

## Verification Steps

### 1. Find the Block Explorer

First, locate the block explorer for insectarium.memecore.net:
- Common patterns:
  - `https://explorer.insectarium.memecore.net`
  - `https://scan.insectarium.memecore.net`
  - `https://insectarium-explorer.memecore.net`

### 2. Verify with Foundry

Once you have the explorer API URL, run:

```bash
cd contract

# For Blockscout-based explorer
forge verify-contract \
  0x7e9bcAB945D93a152C8D768FDD0A3e05E58BA5Be \
  src/MemeTipLoggerV2.sol:MemeTipLoggerV2 \
  --rpc-url https://rpc.insectarium.memecore.net \
  --verifier blockscout \
  --verifier-url https://insectarium.blockscout.memecore.com \
  --constructor-args 0x000000000000000000000000bfed7774e226472a2252a6a2db8990dbefac864b

# For Etherscan-compatible explorer
forge verify-contract \
  0x7e9bcAB945D93a152C8D768FDD0A3e05E58BA5Be \
  src/MemeTipLoggerV2.sol:MemeTipLoggerV2 \
  --rpc-url https://rpc.insectarium.memecore.net \
  --verifier etherscan \
  --verifier-url <EXPLORER_API_URL> \
  --etherscan-api-key <API_KEY_IF_NEEDED> \
  --constructor-args 0x000000000000000000000000bfed7774e226472a2252a6a2db8990dbefac864b
```

### 3. Constructor Arguments

The contract takes one constructor argument:
```solidity
constructor(address _initialOwner)
```

Encoded:
```
0x000000000000000000000000bfed7774e226472a2252a6a2db8990dbefac864b
```

You can generate this with:
```bash
cast abi-encode 'constructor(address)' 0xBFED7774e226472A2252A6A2db8990DbEfac864B
```

### 4. Manual Verification (if automated fails)

If automated verification fails, manually verify via the explorer:

1. Go to the explorer
2. Find contract: `0x7e9bcAB945D93a152C8D768FDD0A3e05E58BA5Be`
3. Click "Verify & Publish"
4. Select:
   - Compiler: 0.8.23
   - EVM Version: paris
   - Optimization: Enabled (200 runs by default)
5. Paste flattened source:
   ```bash
   forge flatten src/MemeTipLoggerV2.sol > flattened.sol
   ```
6. Constructor arguments (ABI-encoded):
   ```
   0x000000000000000000000000bfed7774e226472a2252a6a2db8990dbefac864b
   ```

## Compilation Settings

From `foundry.toml`:
```toml
[profile.default]
solc = "0.8.23"
evm_version = "paris"
optimizer = true
optimizer_runs = 200
```

## Contract Source

Main contract: `contract/src/MemeTipLoggerV2.sol`

Dependencies:
- OpenZeppelin Contracts (ReentrancyGuard, Ownable, Pausable)
- All imported via git submodules in `lib/`

## Verification Status

- [ ] Blockscout verification
- [ ] Etherscan verification (if supported)
- [ ] Source code publicly available: ✅ (GitHub)

## Notes

- The contract uses native coin (M) for tips, not ERC20 tokens
- Constructor sets the initial owner who has admin privileges
- Contract is pausable and includes emergency withdrawal function
- All tips are logged with `TippedWithNative` event including cumulative totals

## Support

If verification fails, check:
1. Explorer API URL is correct
2. Network RPC is accessible
3. Compiler version matches (0.8.23)
4. EVM version is set to "paris"
5. Constructor args are properly ABI-encoded

For issues, contact the MemeCore team or check their documentation.
