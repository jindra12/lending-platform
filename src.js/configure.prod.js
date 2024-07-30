const { exec } = require("node:child_process");
const fs = require("fs");
const handlebars = require("handlebars");
const crypto = require("crypto");
const { Command } = require("commander");
const { url } = require("./rpc.json");

const program = new Command();
program.requiredOption("-k", "--key <index>", "0");
const result = program.parse();

(async () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    
    const anvilPath = "./anvil.json";
    const anvilData = require(anvilPath);
    const compileCommand = `cd ../src; forge c ./src/LendingPlatform.sol:LendingPlatform --json --private-key ${anvilData.private_keys[0]} --rpc-url ${url} --constructor-args "0x0000000000000000000000000000000000000000" "Test bank" "0x0000000000000000000000000000000000000000000000000000000000000000"`;
    const deployed = await (new Promise((resolve, reject) => {
        exec(compileCommand, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            if (stdout) {
                resolve(stdout);
            }
            if (stderr) {
                reject(stderr);
            }
        });
    }));
    const unpacked = JSON.parse(deployed);
    const templated = handlebars.compile(fs.readFileSync("./public/index.hbs", "utf-8"));
    const html = templated({ ...anvilData, bankAddress: unpacked.deployedTo, publicKey: publicKey.replace(/\n/gmui, ""), keyIndex: result.args[0] });
    fs.writeFileSync("./dist/index.html", html);
    fs.writeFileSync("./dist/privatekey.txt", privateKey.replace(/\n/gmui, ""));
    process.exit();
})();
