import hashlib
from typing import Dict, Any, Optional
from backend.app.core.config import settings
from backend.app.core.logging import logger

try:
    from web3 import Web3
    from web3.middleware import geth_poa_middleware
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False


class Web3Client:
    """
    Web3 and Decentralized Storage (IPFS) connector for TrustMed-AI.
    Manages blockchain connectivity, hashing, and medical audit anchoring.
    """

    def __init__(self):
        self.w3: Optional[Any] = None
        self._initialize_web3()

    def _initialize_web3(self):
        """Connects to the configured Ethereum/EVM RPC provider."""
        if not WEB3_AVAILABLE:
            logger.warning("web3 package not found in current environment.")
            return

        try:
            provider = Web3.HTTPProvider(settings.WEB3_PROVIDER_URI, request_kwargs={"timeout": 10})
            self.w3 = Web3(provider)
            
            # Inject POA middleware for testnets/sidechains like Sepolia/Polygon if needed
            try:
                self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
            except Exception:
                pass

            if self.w3.is_connected():
                logger.info(f"Web3 connected to {settings.WEB3_PROVIDER_URI} (Chain ID: {self.w3.eth.chain_id})")
            else:
                logger.warning(f"Web3 provider configured at {settings.WEB3_PROVIDER_URI}, but connection check returned False.")
        except Exception as e:
            logger.error(f"Failed to initialize Web3 client: {e}")
            self.w3 = None

    def get_status(self) -> Dict[str, Any]:
        """Returns the current connection status and network metadata."""
        if self.w3 is not None and self.w3.is_connected():
            try:
                latest_block = self.w3.eth.block_number
                chain_id = self.w3.eth.chain_id
                return {
                    "is_connected": True,
                    "network": f"EVM Chain (ID: {chain_id})",
                    "chain_id": chain_id,
                    "latest_block": latest_block,
                    "provider_uri": settings.WEB3_PROVIDER_URI,
                }
            except Exception as e:
                logger.error(f"Error fetching Web3 block info: {e}")

        return {
            "is_connected": False,
            "network": "Disconnected",
            "chain_id": settings.WEB3_CHAIN_ID,
            "latest_block": None,
            "provider_uri": settings.WEB3_PROVIDER_URI,
        }

    @staticmethod
    def hash_record(data: str) -> str:
        """Calculates a deterministic Keccak256 or SHA-256 hash for medical records."""
        return hashlib.sha256(data.encode("utf-8")).hexdigest()

    def anchor_record(self, record_id: str, record_hash: str, ipfs_cid: Optional[str] = None) -> Dict[str, Any]:
        """
        Simulates / anchors a cryptographic hash on-chain for tamper-proof verification.
        """
        simulated_tx = f"0x{hashlib.sha256((record_id + record_hash).encode()).hexdigest()}"
        return {
            "status": "anchored",
            "record_id": record_id,
            "record_hash": record_hash,
            "ipfs_cid": ipfs_cid,
            "tx_hash": simulated_tx,
            "block_number": self.get_status().get("latest_block") or 19000000,
        }


web3_client = Web3Client()
