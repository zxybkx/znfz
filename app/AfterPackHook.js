/**
 *  electron-builder 打包(packing) 和 生成安装文件(building) 中间调用的钩子函数
 */

let fs = require('fs');
const execSync = require('child_process').execSync;
const path = require('path');


const distPath = "dist/win-ia32-unpacked";

exports.default = async function(context) {
  console.log("开始调用中间钩子函数");


  console.log("1. 拷贝 index.html");
  let indexPathSrc = path.resolve("../deploy_script/prod","index.html");
  let indexPathDist = path.resolve(distPath,'resources/app/index.html');
  fs.copyFileSync(indexPathSrc,indexPathDist);


  console.log("2. 创建文件夹 src assets app")
  let srcFolder = path.resolve(distPath,'resources/src');
  fs.mkdirSync(srcFolder);
  let assetsFolder = path.resolve(distPath,'resources/src/assets');
  fs.mkdirSync(assetsFolder);
  let appFolder = path.resolve(distPath,'resources/src/assets/app');
  fs.mkdirSync(appFolder);


  console.log("3. 拷贝文件 nprogress.css nprogress.js jquery.js bg.svg");
  fs.copyFileSync(path.resolve('../src/assets/app/nprogress.css'),path.resolve(distPath,'resources/src/assets/app/nprogress.css'));
  fs.copyFileSync(path.resolve('../src/assets/app/nprogress.js'),path.resolve(distPath,'resources/src/assets/app/nprogress.js'));
  fs.copyFileSync(path.resolve('../src/assets/app/jquery.js'),path.resolve(distPath,'resources/src/assets/app/jquery.js'));
  fs.copyFileSync(path.resolve('../src/assets/app/bg.svg'),path.resolve(distPath,'resources/src/assets/app/bg.svg'));




















  console.log("结束调用中间钩子函数");
}
