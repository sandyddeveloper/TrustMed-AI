import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("TrustMedAudit Smart Contract", function () {
  let trustMedAudit;
  let owner, practitioner, verifier;

  beforeEach(async function () {
    [owner, practitioner, verifier] = await ethers.getSigners();
    const TrustMedAudit = await ethers.getContractFactory("TrustMedAudit");
    trustMedAudit = await TrustMedAudit.deploy(owner.address);
    await trustMedAudit.waitForDeployment();
  });

  it("Should set the correct owner upon deployment", async function () {
    expect(await trustMedAudit.owner()).to.equal(owner.address);
  });

  it("Should successfully anchor a medical diagnostic record", async function () {
    const recordId = "REC-2026-001";
    const recordHash = "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b";
    const ipfsCid = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
    const modelSignature = "v1.0.0-shap-rf";

    await expect(
      trustMedAudit.connect(practitioner).anchorRecord(
        recordId,
        recordHash,
        ipfsCid,
        modelSignature
      )
    )
      .to.emit(trustMedAudit, "RecordAnchored")
      .withArgs(recordId, recordHash, ipfsCid, practitioner.address, (val) => val > 0);

    const record = await trustMedAudit.getRecord(recordId);
    expect(record.recordHash).to.equal(recordHash);
    expect(record.ipfsCid).to.equal(ipfsCid);
    expect(record.modelSignature).to.equal(modelSignature);
    expect(record.recordedBy).to.equal(practitioner.address);
    expect(await trustMedAudit.getTotalRecords()).to.equal(1);
  });

  it("Should prevent duplicate record IDs", async function () {
    const recordId = "REC-DUPLICATE";
    const recordHash = "0x1111111111111111111111111111111111111111111111111111111111111111";

    await trustMedAudit.connect(practitioner).anchorRecord(
      recordId,
      recordHash,
      "Qm1",
      "model-v1"
    );

    await expect(
      trustMedAudit.connect(practitioner).anchorRecord(
        recordId,
        recordHash,
        "Qm2",
        "model-v1"
      )
    ).to.be.revertedWith("TrustMed: Record already anchored");
  });

  it("Should verify valid and invalid hashes accurately", async function () {
    const recordId = "REC-VERIFY";
    const trueHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    const fakeHash = "0x0000000000000000000000000000000000000000000000000000000000000000";

    await trustMedAudit.connect(practitioner).anchorRecord(
      recordId,
      trueHash,
      "QmCID",
      "model-v1"
    );

    await expect(trustMedAudit.connect(verifier).verifyRecord(recordId, trueHash))
      .to.emit(trustMedAudit, "RecordVerified")
      .withArgs(recordId, true, verifier.address, (val) => val > 0);

    await expect(trustMedAudit.connect(verifier).verifyRecord(recordId, fakeHash))
      .to.emit(trustMedAudit, "RecordVerified")
      .withArgs(recordId, false, verifier.address, (val) => val > 0);
  });
});
