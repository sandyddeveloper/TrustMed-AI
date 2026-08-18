from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class Web3StatusResponse(BaseModel):
    is_connected: bool
    network: str
    chain_id: int
    latest_block: Optional[int] = None
    provider_uri: str


class AnchorRecordRequest(BaseModel):
    record_id: str = Field(..., description="Unique medical record ID")
    record_hash: str = Field(..., description="SHA-256 or Keccak-256 hash of record payload")
    ipfs_cid: Optional[str] = Field(default=None, description="IPFS Content ID if stored off-chain")
    metadata: Optional[Dict[str, Any]] = None


class AnchorRecordResponse(BaseModel):
    status: str
    record_id: str
    record_hash: str
    ipfs_cid: Optional[str] = None
    tx_hash: Optional[str] = None
    block_number: Optional[int] = None
