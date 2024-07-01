const { exec } = require("node:child_process");
const fs = require("fs");
const handlebars = require("handlebars");
const crypto = require('crypto');

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

if (fs.existsSync(anvilPath)) {
    fs.rmSync(anvilPath);
}
fs.writeFileSync(anvilPath, "{}");

const handle = exec(`anvil --config-out anvil.json >> /dev/null`);
fs.watchFile(anvilPath, { interval: 100 }, () => {
    const anvilData = require(anvilPath);
    const templated = handlebars.compile(fs.readFileSync("./public/index.hbs", "utf-8"));
    const html = templated({ ...anvilData, publicKey });
    fs.writeFileSync("./public/index.html", html);
    fs.writeFileSync("./public/privatekey.txt", privateKey);
    handle.kill();
    process.exit();
});
