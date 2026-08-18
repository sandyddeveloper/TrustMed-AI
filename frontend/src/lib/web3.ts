import { ethers, BrowserProvider, Contract } from "ethers";

export const TRUSTMED_AUDIT_ABI = [
  "function anchorRecord(string recordId, string recordHash, string ipfsCid, string modelSignature) external",
  "function getRecord(string recordId) external view returns (string recordHash, string ipfsCid, string modelSignature, uint256 timestamp, address recordedBy)",
  "function verifyRecord(string recordId, string claimedHash) external returns (bool isValid)",
  "function getTotalRecords() external view returns (uint256)",
  "event RecordAnchored(string indexed recordId, string recordHash, string ipfsCid, address indexed recordedBy, uint256 timestamp)",
];

export function hasEthereumWallet(): boolean {
  return typeof window !== "undefined" && Boolean((window as unknown as { ethereum?: unknown }).ethereum);
}

export async function getWeb3Provider(): Promise<BrowserProvider | null> {
  if (!hasEthereumWallet()) {
    return null;
  }
  return new ethers.BrowserProvider((window as unknown as { ethereum: ethers.Eip1193Provider }).ethereum);
}

export async function connectWallet(): Promise<{ address: string; chainId: number }> {
  const provider = await getWeb3Provider();
  
  if (!provider) {
    throw new Error("No Ethereum wallet found. Please install MetaMask or an EIP-1193 Web3 wallet extension.");
  }

  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  return {
    address,
    chainId: Number(network.chainId),
  };
}

export async function getAuditContract(
  contractAddress: string,
  providerOrSigner: ethers.ContractRunner
): Promise<Contract> {
  return new ethers.Contract(contractAddress, TRUSTMED_AUDIT_ABI, providerOrSigner);
}
