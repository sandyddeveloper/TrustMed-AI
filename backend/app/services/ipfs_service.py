import os
import json
import requests
import hashlib
from typing import Dict, Any, Optional
from backend.app.core.logging import logger

PINATA_API_KEY = os.getenv("PINATA_API_KEY", "")
PINATA_API_SECRET = os.getenv("PINATA_API_SECRET", "")
PINATA_BASE_URL = "https://api.pinata.cloud/pinning"


class IPFSPinningService:
    """
    Decentralized IPFS storage connector using Pinata Cloud.
    Pins XAI JSON attribution metadata and visual Grad-CAM heatmaps.
    """

    @staticmethod
    def get_headers() -> Dict[str, str]:
        return {
            "pinata_api_key": PINATA_API_KEY,
            "pinata_secret_api_key": PINATA_API_SECRET,
        }

    @classmethod
    def pin_json_to_ipfs(cls, data: Dict[str, Any], record_id: str) -> str:
        """
        Pins structured diagnostic & SHAP/LIME explanation metadata to IPFS.
        Returns ipfs://<CID>
        """
        if PINATA_API_KEY and PINATA_API_SECRET:
            url = f"{PINATA_BASE_URL}/pinJSONToIPFS"
            payload = {
                "pinataContent": data,
                "pinataMetadata": {
                    "name": f"TrustMed_XAI_{record_id}.json",
                    "keyvalues": {"recordId": record_id, "type": "xai_explanation"},
                },
            }
            try:
                response = requests.post(url, json=payload, headers=cls.get_headers(), timeout=15)
                response.raise_for_status()
                res_data = response.json()
                cid = res_data.get("IpfsHash", "")
                logger.info(f"Successfully pinned JSON to Pinata IPFS: ipfs://{cid}")
                return f"ipfs://{cid}"
            except Exception as err:
                logger.warning(f"Pinata IPFS JSON upload encountered error: {err}. Falling back to deterministic CID.")

        # Fallback to deterministic simulated IPFS CID if API credentials are not set or during local offline testing
        simulated_hash = hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()[:44]
        return f"ipfs://Qm{simulated_hash}"

    @classmethod
    def pin_image_to_ipfs(cls, image_bytes: bytes, filename: str) -> str:
        """
        Pins visual explanation artifacts (Grad-CAM heatmaps / SHAP plots) to IPFS.
        Returns ipfs://<CID>
        """
        if PINATA_API_KEY and PINATA_API_SECRET:
            url = f"{PINATA_BASE_URL}/pinFileToIPFS"
            files = {"file": (filename, image_bytes)}
            try:
                response = requests.post(url, files=files, headers=cls.get_headers(), timeout=30)
                response.raise_for_status()
                cid = response.json().get("IpfsHash", "")
                logger.info(f"Successfully pinned file to Pinata IPFS: ipfs://{cid}")
                return f"ipfs://{cid}"
            except Exception as err:
                logger.warning(f"Pinata IPFS image upload error: {err}. Using simulated CID.")

        simulated_hash = hashlib.sha256(image_bytes).hexdigest()[:44]
        return f"ipfs://QmXRayGradCAM{simulated_hash}"


ipfs_service = IPFSPinningService()
