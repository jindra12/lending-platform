const { execSync } = require("node:child_process");
const fs = require("fs");

(async () => {
    
    const anvilPath = "./anvil.json";
    const anvilData = require(anvilPath);

    const testCoin1 = JSON.parse(execSync(`cd ../src; forge c ./test/LendingPlatform.t.sol:OneCoin --json --private-key ${anvilData.private_keys[0]}`));
    const testCoin2 = JSON.parse(execSync(`cd ../src; forge c ./test/LendingPlatform.t.sol:TwoCoin --json --private-key ${anvilData.private_keys[0]}`));

    /**
     * @type string[]
     */
    const pubKeys = anvilData.available_accounts;
    pubKeys.forEach((key) => {
        const encoded = execSync(`cast calldata "mint(address,uint256)" "${key}" 1000000`, { encoding: "utf-8" });
        execSync(`cast send --private-key ${anvilData.private_keys[0]} ${testCoin1.deployedTo} ${encoded}`, { encoding: "utf-8" });
        execSync(`cast send --private-key ${anvilData.private_keys[0]} ${testCoin2.deployedTo} ${encoded}`, { encoding: "utf-8" });
    });

    fs.writeFileSync("testcoin.1.json", JSON.stringify(testCoin1));
    fs.writeFileSync("testcoin.2.json", JSON.stringify(testCoin2));

    process.exit();
})();
