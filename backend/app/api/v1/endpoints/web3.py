from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.web3 import (
    Web3StatusResponse,
    AnchorRecordRequest,
    AnchorRecordResponse,
)
from backend.app.services.web3_client import web3_client
from backend.app.core.logging import logger

router = APIRouter()


@router.get(
    "/status",
    response_model=Web3StatusResponse,
    summary="Web3 Network Status",
)
def get_web3_status():
    """
    Returns connectivity and block details from the configured Web3 node/provider.
    """
    status_dict = web3_client.get_status()
    return Web3StatusResponse(**status_dict)


@router.post(
    "/anchor",
    response_model=AnchorRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Anchor Medical Record Hash On-Chain",
)
def anchor_record(payload: AnchorRecordRequest):
    """
    Simulates / anchors a cryptographic hash of a medical record and its IPFS CID to the blockchain.
    """
    try:
        result = web3_client.anchor_record(
            record_id=payload.record_id,
            record_hash=payload.record_hash,
            ipfs_cid=payload.ipfs_cid,
        )
        return AnchorRecordResponse(**result)
    except Exception as e:
        logger.error(f"Error anchoring record {payload.record_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to anchor record: {str(e)}",
        )
