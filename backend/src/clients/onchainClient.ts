import { createPublicClient, createWalletClient, http, parseAbi, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { RPC_URL, CONTRACT_ADDRESS, OWNER_PRIVATE_KEY } from "../config";

const abi = parseAbi([
  "function allowedTokens(address token) view returns (bool)",
  "function setAllowedToken(address token, bool allowed) external",
]);

const chain = {
  id: 9999, // TODO: Formicarium/memecorechain 체인 ID 로 교체
  name: "Formicarium",
  nativeCurrency: { name: "M", symbol: "M", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
} as const;

const publicClient = createPublicClient({
  chain,
  transport: http(RPC_URL),
});

const ownerAccount = privateKeyToAccount(OWNER_PRIVATE_KEY as Hex);

const walletClient = createWalletClient({
  chain,
  transport: http(RPC_URL),
  account: ownerAccount,
});

export async function isTokenAllowed(tokenAddress: `0x${string}`): Promise<boolean> {
  return publicClient.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi,
    functionName: "allowedTokens",
    args: [tokenAddress],
  });
}

export async function allowTokenIfNeeded(tokenAddress: `0x${string}`) {
  const allowed = await isTokenAllowed(tokenAddress);
  if (allowed) return;

  // owner 계정에서 setAllowedToken 호출
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi,
    functionName: "setAllowedToken",
    args: [tokenAddress, true],
  });

  // 필요하면 여기서 트랜잭션 mined 까지 기다리기
  // const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("setAllowedToken tx sent:", hash);
}
