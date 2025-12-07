/**
 * Convert wei (string or bigint) to ETH as a number
 */
export function weiToEth(wei: string | bigint): number {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
  return Number(weiValue) / 1e18;
}

/**
 * Convert wei (string or bigint) to ETH as a formatted string with decimals
 */
export function weiToEthFormatted(wei: string | bigint, decimals: number = 4): string {
  return weiToEth(wei).toFixed(decimals);
}

/**
 * Convert ETH (number or string) to wei as a bigint
 */
export function ethToWei(eth: number | string): bigint {
  const ethValue = typeof eth === 'string' ? parseFloat(eth) : eth;
  return BigInt(Math.floor(ethValue * 1e18));
}

/**
 * Convert ETH (number or string) to wei as a string
 */
export function ethToWeiString(eth: number | string): string {
  return ethToWei(eth).toString();
}
