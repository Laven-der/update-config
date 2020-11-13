/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
const fs = require("fs");
const crypto = require("crypto");
const request = require('request')
const { remote } = require('electron');
const cp = require("child_process"); //子进程

// const Bagpipe = require('bagpipe')
export function getMd5(path) {
    const md5sum = crypto.createHash("md5");
    const stream = fs.createReadStream(path);
    stream.on("data", function (chunk) {
        md5sum.update(chunk);
    });
    return new Promise((resolve, reject) => {
        stream.on("end", function () {
            const md5 = md5sum.digest("hex").toUpperCase();
            resolve(md5);
        });
    });
}
export function downloadFile(configuration) {
    return new Promise(function (resolve, reject) {
        // Save variable to know progress
        var received_bytes = 0;
        var total_bytes = 0;
        // var bagpipe=new Bagpipe(10,{timeout: 5000});
        var req = request({
            method: 'GET', uri: configuration.remoteFile
        });
        // console.log(configuration)
        var out = fs.createWriteStream(configuration.localFile);
        req.pipe(out);

        req.on('response', function (data) {
            // Change the total bytes value to get progress later.
            total_bytes = parseInt(data.headers['content-length']);
        });

        // // Get progress if callback exists
        if (configuration.hasOwnProperty("onProgress")) {
            req.on('data', function (chunk) {
                // Update the received bytes
                received_bytes += chunk.length;

                configuration.onProgress(received_bytes, total_bytes);
            });
        } else {
            req.on('data', function (chunk) {
                // Update the received bytes
                received_bytes += chunk.length;
            });
        }

        req.on('end', function () {
            resolve(configuration.size);
        });
    });
}
export async function getDiffData(confArr, bimPath) {
    const updateData = []; let size = 0;
    for (let i = 0; i < confArr.length; i++) {
        let confItem = confArr[i]
        let path = `${bimPath}${confItem.pathWithName}`
        // console.log(path)
        // // 验证模版文件位置是否正确
        if (!fs.existsSync(path)) {
            size += confItem.size;
            updateData.push(confItem)
            console.log(path, "----1111111")
        } else {
            console.log(path, "----22222222")
            let md5 = await getMd5(path)
            // console.log(md5)
            if (confItem.md5 != md5.toLowerCase()) {
                size += confItem.size;
                updateData.push(confItem)
            }
        }

    }

    console.log(updateData)
    return {
        size: size,
        updateData
    }
}
export function openFileHandler(isOpenFile = true) {
    let properties = [];
    isOpenFile ? properties = ['openFile'] : properties = ['openDirectory']
    return new Promise(function (resolve, reject) {
        remote.dialog.showOpenDialog({ properties }, function (data, b) {
            let path = data[0];
            resolve(path)
        }
        );
    })
}
export function execute(softwarePath) {
    if (!(/^\/.*\/$/.test(softwarePath) || /^[CDEF]:.*\\$/.test(softwarePath))) {
        console.log("请选择正确的路径")
    } else {
        cp.exec(softwarePath, function (error, stdout, stderr) {
            console.log("error", error);
            console.log("stdout", stdout);
            console.log("stderr", stderr);
        });
    }

}
