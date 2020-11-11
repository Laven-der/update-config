/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
const fs = require("fs");
const crypto = require("crypto");
const request = require('request')
const Bagpipe = require('bagpipe')
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
        var bagpipe=new Bagpipe(10,{timeout: 5000});
        var req = request({
            method: 'GET', uri: configuration.remoteFile
        });
        // console.log(configuration)
        // var out = fs.createWriteStream(configuration.localFile);
        // req.pipe(out);

        // req.on('response', function (data) {
        //     // Change the total bytes value to get progress later.
        //     total_bytes = parseInt(data.headers['content-length']);
        // });

        // // Get progress if callback exists
        // if (configuration.hasOwnProperty("onProgress")) {
        //     req.on('data', function (chunk) {
        //         // Update the received bytes
        //         received_bytes += chunk.length;

        //         configuration.onProgress(received_bytes, total_bytes);
        //     });
        // } else {
        //     req.on('data', function (chunk) {
        //         // Update the received bytes
        //         received_bytes += chunk.length;
        //     });
        // }

        req.on('end', function () {
            resolve(configuration.size);
        });
    });
}
export async function getDiffData(confArr,bimPath) {
    const updateData = [];let size=0;
    for (let i = 0; i < confArr.length; i++) {
        let confItem = confArr[i]
        let path = `${bimPath}${confItem.pathWithName}`
        console.log(path)
        let md5 = await getMd5(path)
        // console.log(md5)
        if (confItem.md5 != md5.toLowerCase()) {
            size+=confItem.size;
            updateData.push(confItem)
        }
    }

    console.log(updateData)
    return {
        size:size,
        updateData
    }
}
export  function getData(arr) {
    var downloadPic=function(src,dest){
        request(src).pipe(fs.createWriteStream(dest)).on('close',function(){
            // console.log('pic saved');
            console.log(
                (new Date().getTime() - start) / 1000.0 +
                "秒" );
        })
    };
    var start=(new Date()).getTime();
        //第三种方式——bagpipe控制并发执行
        var bagpipe=new Bagpipe(10,{timeout: 10});
        for(var i=0;i<arr.length;i++){
            bagpipe.push(downloadPic,arr[i].url,`D:\\work-soft\\打扮家BIM${arr[i].pathWithName}`,function(err,data){
                //if(err) console.log(err);
                //else console.log(data);
             
              
            })
        }
      
}
