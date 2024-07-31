const JSZip = require("jszip");
const zip = new JSZip();
const fs = require("fs");
const path = require("path");

(async () => {
    if (fs.existsSync("deploy.zip")) {
        fs.rmSync("deploy.zip");
    }
    await new Promise(resolve => {
        fs.readdir("./dist", (_, files) => {
            files.forEach((file) => {
                if (path.basename(file) !== "privatekey.txt") {
                    const contents = fs.readFileSync("./dist/" + file);
                    console.log(file, contents.length);
                    zip.file(file, contents);
                } else {
                    console.log("Excluded", file);
                }
            });
            const favicon = "./public/favicon.ico";
            const icon = fs.readFileSync(favicon);
            console.log("favicon.ico", icon.length);
            zip.file("favicon.ico", icon);
            resolve();
        });
    });
    await new Promise((resolve) => {
        zip
            .generateNodeStream({ type: "nodebuffer", streamFiles: true })
            .pipe(fs.createWriteStream("deploy.zip"))
            .on("finish", resolve);
    });
})();
