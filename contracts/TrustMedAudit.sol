// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TrustMedAudit
 * @dev Cryptographic Audit Trail & Explainable AI (XAI) Verification on Ethereum/EVM
 */
contract TrustMedAudit is Ownable, ReentrancyGuard {
    
    struct AuditRecord {
        string recordId;
        string recordHash;        // SHA-256 or Keccak-256 hash of patient record & XAI attributions
        string ipfsCid;           // IPFS Content Identifier for encrypted medical payload
        string modelSignature;    // Signature or version of the XAI model used
        uint256 timestamp;        // Block timestamp of anchoring
        address recordedBy;       // Practitioner or system address
        bool exists;
    }

    // Mapping from recordId => AuditRecord
    mapping(string => AuditRecord) private records;

    // Array of all record IDs for enumeration
    string[] private recordIds;

    // Events
    event RecordAnchored(
        string indexed recordId,
        string recordHash,
        string ipfsCid,
        address indexed recordedBy,
        uint256 timestamp
    );

    event RecordVerified(
        string indexed recordId,
        bool isValid,
        address indexed verifier,
        uint256 timestamp
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Anchors a medical diagnostic record and XAI hash on-chain.
     */
    function anchorRecord(
        string memory recordId,
        string memory recordHash,
        string memory ipfsCid,
        string memory modelSignature
    ) external nonReentrant {
        require(bytes(recordId).length > 0, "TrustMed: Record ID cannot be empty");
        require(bytes(recordHash).length > 0, "TrustMed: Record Hash cannot be empty");
        require(!records[recordId].exists, "TrustMed: Record already anchored");

        records[recordId] = AuditRecord({
            recordId: recordId,
            recordHash: recordHash,
            ipfsCid: ipfsCid,
            modelSignature: modelSignature,
            timestamp: block.timestamp,
            recordedBy: msg.sender,
            exists: true
        });

        recordIds.push(recordId);

        emit RecordAnchored(
            recordId,
            recordHash,
            ipfsCid,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Retrieves details of an anchored medical audit record.
     */
    function getRecord(string memory recordId)
        external
        view
        returns (
            string memory recordHash,
            string memory ipfsCid,
            string memory modelSignature,
            uint256 timestamp,
            address recordedBy
        )
    {
        require(records[recordId].exists, "TrustMed: Record does not exist");
        AuditRecord memory r = records[recordId];
        return (
            r.recordHash,
            r.ipfsCid,
            r.modelSignature,
            r.timestamp,
            r.recordedBy
        );
    }

    /**
     * @dev Verifies whether a given hash matches the on-chain anchored hash.
     */
    function verifyRecord(string memory recordId, string memory claimedHash)
        external
        returns (bool isValid)
    {
        if (!records[recordId].exists) {
            emit RecordVerified(recordId, false, msg.sender, block.timestamp);
            return false;
        }

        isValid = (keccak256(bytes(records[recordId].recordHash)) == keccak256(bytes(claimedHash)));
        emit RecordVerified(recordId, isValid, msg.sender, block.timestamp);
        return isValid;
    }

    /**
     * @dev Returns total number of anchored records.
     */
    function getTotalRecords() external view returns (uint256) {
        return recordIds.length;
    }

    /**
     * @dev Returns record ID at index.
     */
    function getRecordIdAtIndex(uint256 index) external view returns (string memory) {
        require(index < recordIds.length, "TrustMed: Index out of bounds");
        return recordIds[index];
    }
}
