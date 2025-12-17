import { ethers, upgrades } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    console.log("Deploying ESOPToken...");

    const ESOPToken = await ethers.getContractFactory("ESOPToken");

    // Deploy Proxy + Implementation (UUPS)
    // Admin and Minter roles assigned to deployer for dev simplicity
    const [deployer] = await ethers.getSigners();
    const token = await upgrades.deployProxy(ESOPToken, [deployer.address, deployer.address], {
        kind: "uups",
    });

    await token.waitForDeployment();
    const address = await token.getAddress();

    console.log("ESOPToken deployed to:", address);

    // Save address to shared config for API to pick up
    const configDir = path.join(__dirname, "../../../apps/api/src/config");
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    const configFile = path.join(configDir, "contracts.json");
    fs.writeFileSync(configFile, JSON.stringify({ ESOPToken: address }, null, 2));
    console.log(`Saved contract address to ${configFile}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
