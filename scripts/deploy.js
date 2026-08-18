import hre from "hardhat";

async function main() {
  console.log(`Starting TrustMedAudit contract deployment to ${hre.network.name}...`);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account address: ${deployer.address}`);

  const TrustMedAudit = await hre.ethers.getContractFactory("TrustMedAudit");
  const auditContract = await TrustMedAudit.deploy(deployer.address);
  await auditContract.waitForDeployment();

  const deployedAddress = await auditContract.getAddress();
  console.log(`TrustMedAudit deployed successfully at: ${deployedAddress}`);

  // Auto-verify on Etherscan / Block Explorer when deploying on public testnets
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for 6 block confirmations before verifying on block explorer...");
    const deploymentTx = auditContract.deploymentTransaction();
    if (deploymentTx) {
      await deploymentTx.wait(6);
    }

    try {
      await hre.run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [deployer.address],
      });
      console.log("Contract successfully verified on Block Explorer.");
    } catch (error) {
      console.error("Block explorer verification notice:", error.message);
    }
  }

  return deployedAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
