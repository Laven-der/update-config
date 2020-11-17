/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
const fs = require("fs");
const crypto = require("crypto");
const http = require("http");
const request = require('request')
const { remote } = require('electron');
const cp = require("child_process"); //子进程
const path = require("path")
// const Bagpipe = require('bagpipe')
export function getMd5(filePath) {
    const md5sum = crypto.createHash("md5");
    const stream = fs.createReadStream(filePath);
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
export function downloadFile111(configuration, tries = 0) {
    const options = {
        method: 'GET', hostname: "https://ali-res.dabanjia.com/", path: "/updatePackages/bim/client/3.4.0/XR.exe", port: 443
    }
    return new Promise((resolve) => {
        const req = http.request(options, async (response) => {
            let body = Buffer(0);
            response.on("data", (chunk) => {
                body = Buffer.concat([body, chunk]);
            })

            const on = pify(response.on.bind(response));

            await on("end");
            let decoded = Buffer(body, 'base64').toString('utf8')
            let json = JSON.parse(decoded);
            if (json.completed) {
                return resolve("all good");
            }
            if (tries < 3) {
                console.log(`retrying ${tries + 1} time`);
                return resolve(ping(tries + 1));
            }
            return resolve("failed");
        })

        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });

        // write data to request body
        req.end();
    })
}
function getRange(range) {
    var match = /bytes=([0-9]*)-([0-9]*)/.exec(range);
    const requestRange = {};
    if (match) {
        if (match[1]) requestRange.start = Number(match[1]);
        if (match[2]) requestRange.end = Number(match[2]);
    }
    return requestRange;
}

export function downloadFile(configuration, tries = 0) {
    const { size, localFile, remoteFile } = configuration
    return new Promise(function (resolve, reject) {
        let received_bytes = 0; //当前流字节
        let total_bytes = 0;    //总字节
        //避免第一次下载本地文件已经存在
        if (tries > 0) {
            try {
                let stats = fs.statSync(localFile);//如果文件已存在读取文件信息
                console.log("文件以及存在", stats.size, total_bytes)
                if (total_bytes == stats.size) {//如果文件已经存在并且已经下载按成则跳过该文件
                    console.log("文件以及存在")
                    return;
                }
                received_bytes = stats.size;
            } catch (err) {
                console.log("-------", err)
            }
        }
        let params = {
            "method": 'GET',
            "url": remoteFile
        }
        if (received_bytes > 0) {
            console.log("-------3333", received_bytes, size)
            params.headers['Range'] = 'bytes=' + received_bytes;
        }
        let req = request(params);
        let out = fs.createWriteStream(localFile);
        req.pipe(out);

        req.on('response', function (data) {
            // Change the total bytes value to get progress later.
            total_bytes = parseInt(data.headers['content-length']);
        });

        // 判断是否含有进度函数
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
        req.on('error', function (err) {
            if (err) {
                //只下载重试三次
                if (tries < 3) {
                    resolve(downloadFile(configuration, tries + 1))
                }

            }
        });
        req.on('end', function () {
            // 下载结束返回总字节
            // return resolve(total_bytes);
        });
    });
}
// 递归创建目录 同步方法
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

export async function getDiffData(confArr, bimPath) {
    const updateData = []; let size = 0;
    for (let i = 0; i < confArr.length; i++) {
        let confItem = confArr[i]
        let filePath = `${bimPath}${confItem.pathWithName}`
        console.log(`${bimPath}${confItem.path}`)
        //  验证文件位置是否存在
        if (!fs.existsSync(filePath)) {
            size += confItem.size;
            // 若当前不存在文件，则创建相关目录，并写入到更新数组中
            mkdirsSync(`${bimPath}${confItem.path}`, function (error) {
                if (error) {
                    console.log(error);
                    return false;
                }
                console.log('创建目录成功');
            })
            updateData.push(confItem)
        } else {
            let md5 = await getMd5(filePath)
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
