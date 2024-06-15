const fs = require("node:fs");
const path = require("node:path");

module.exports = (folderRoute, sourceDir) => {
    const newFolderRoute= path.resolve(sourceDir, folderRoute)

    if(fs.existsSync(newFolderRoute)) {
        fs.rmSync(newFolderRoute, { recursive: true })
    }
}