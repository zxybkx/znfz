const path = require('path');
const fs = require("fs");
const qs = require("querystring");
const {dialog} = require('electron');
const spawn = require('child_process').spawn;
const dst = 'C:\\检察机关统一业务应用系统';
const dst1 = 'C:\\Program Files (x86)\\检察机关统一业务应用系统';
const dst2 = 'C:\\Program Files\\检察机关统一业务应用系统';

function openAK(parent, url, cb) {
  const payload = qs.parse(url.url.split('?')[1]);
  const parameters = {
    BMSAH: payload.bmsah,
    DWBM: payload.dwbm,
    GH: payload.gh
  };

  exists(dst)
    .then(()=>{
      copy(path.resolve(__dirname, './ak'), dst)
        .then(()=>{
          const param = Buffer.from(JSON.stringify(parameters)).toString("base64");
          exeCmd(dst + '\\SmartClient_.exe',param);
        })
    })
    .catch(()=>{
      exists(dst1)
        .then(()=>{
          copy(path.resolve(__dirname, './ak'), dst1)
            .then(()=>{
              const param = Buffer.from(JSON.stringify(parameters)).toString("base64");
              exeCmd(dst1 + '\\SmartClient_.exe',param);
            })
        })
        .catch(()=>{
          exists(dst2)
            .then(()=>{
              copy(path.resolve(__dirname, './ak'), dst2)
                .then(()=>{
                  const param = Buffer.from(JSON.stringify(parameters)).toString("base64");
                  exeCmd(dst2 + '\\SmartClient_.exe',param);
                })
            })
            .catch(()=>{
              dialog.showMessageBox({
                title  : '错误'
                , type  : 'warning'
                , message : '未查找到对应的大统一软件系统，请指定该软件的安装路径。'
              },(response)=>{
                dialog.showOpenDialog({
                  properties: ['openDirectory']
                }, (files) => {
                  if (files) {
                    copy(path.resolve(__dirname, './ak'), files)
                      .then(()=>{
                        const param = Buffer.from(JSON.stringify(parameters)).toString("base64");
                        exeCmd(files + '\\SmartClient_.exe',param);
                      })
                  }
                });
              });





            })
        });
    })
}

function copy(src, dst) {
  return new Promise(function(resolve, reject) {

    fs.readdir( src, function( err, paths ){
      if( err ){
        reject(err);
      }

      let count = 0;

      paths.forEach(function( path ){
        var _src = src + '/' + path,
          _dst = dst + '/' + path,
          readable, writable;

        fs.stat( _src, function( err, st ){
          if( err ){
            reject(err);
          }


          readable = fs.createReadStream( _src );

          writable = fs.createWriteStream( _dst );

          readable.pipe( writable );

          writable.on('close',function() {
            count ++;
            if(count === paths.length) {
              resolve()
            }
          });
        });
      });
    });
  });
}


function exists(src) {
  return new Promise(function(resolve, reject) {
    fs.access( src, function( err ){

      if( !err ){
        resolve();
      }

      else{
        reject(err);
      }
    });
  });
}

function exeCmd(path,param){
  return new Promise(function(resolve, reject) {
    const cmd = spawn(path, [param], {
      windowsHide: true
    });
    cmd.stdout.on('data', data => {
      console.log(`----exeCmd-----stdout: ${data}`);
    });
    cmd.stderr.on('data', data => {
      reject(`${data}`);
      console.log(`----exeCmd-----stderr: ${data}`);
    });
    cmd.on('close', code => {
      if (code == 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });
}

module.exports = openAK;
