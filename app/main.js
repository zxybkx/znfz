const openAK = require('./openAK');
const {app, BrowserWindow, ipcMain, Menu, protocol, ipcRenderer, dialog, } = require('electron');
const path = require('path');
const fs = require("fs");
const os = require("os");

const { autoUpdater }= require('electron-updater');

const feedUrl = `http://141.72.1.215/download/upgrade/znfz`;


let win;
let webContents;

function createWindow() {
  win = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,



    title: '浙江省检察机关刑事办案智能辅助系统',
    icon: './assets/logo.ico',
    backgroundColor: '#010728',
  });

  webContents = win.webContents;







  win.webContents.on('new-window', function (event, urlToOpen) {
    event.preventDefault();
    const newWin = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
      },
    });
    newWin.once('ready-to-show', () => newWin.show());
    newWin.loadURL(urlToOpen);
    event.newGuest = newWin;
  });

  win.once('ready-to-show', () => {
    win.show()
  });

  win.on('close', (e) => {
    e.preventDefault();
    dialog.showMessageBox({
      title  : '提示'
      ,buttons: ['否','是']
      , type  : 'question'
      , message : '确定要退出吗？'
    },(response)=>{
      if(response === 1) {
        win.webContents.session.clearCache(()=>{
          console.log('clear successfully')
        });
        win.destroy();
      }
    });
  });

  win.loadFile(path.resolve(__dirname, './index.html'));
  win.maximize();

  let template = [
    {
    label: '查看',
    submenu: [{
      label: '刷新',
      accelerator: 'CmdOrCtrl+R',
      click: (item, focusedWindow) => {
        if (focusedWindow) {

          if (focusedWindow.id === 1) {
            BrowserWindow.getAllWindows().forEach(win => {
              if (win.id > 1) win.close()
            })
          }
          focusedWindow.reload()
        }
      },
    },
      {
      label: '清除缓存',
      click: (item, focusedWindow) => {
        if (focusedWindow) {
          win.webContents.session.clearCache(()=>{
            console.log('clear successfully')
          });
        }
      },
    }, {
      label: '切换全屏',
      accelerator: (() => {
        if (process.platform === 'darwin') {
          return 'Ctrl+Command+F'
        } else {
          return 'F11'
        }
      })(),
      click: (item, focusedWindow) => {
        if (focusedWindow) {
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
        }
      },
    },















    ],
  },
    {
    label: '窗口',
    role: 'window',
    submenu: [{
      label: '最小化',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize',
    }, {
      label: '关闭',
      accelerator: 'CmdOrCtrl+W',
      role: 'close',
    }, {
      type: 'separator',
    }, {
      label: '重新打开窗口',
      accelerator: 'CmdOrCtrl+Shift+T',
      enabled: false,
      key: 'reopenMenuItem',
      click: () => {
        app.emit('activate')
      },
    }],
  },
    {
      label: '版本',
      role: 'window',
      submenu: [{
        label: '版本 V2.0.0'
      },{
        label: '更新',
        enabled: true,
        key: 'reopenMenuItem',
        click: () => {
          checkForUpdates();
        },
      }
      ],
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);


  protocol.registerHttpProtocol('akfile', (req, cb) => {
    openAK(win, req, cb);
  })
}


app.commandLine.appendSwitch('auto-detect', 'false');
app.commandLine.appendSwitch('no-proxy-server');

app.on('ready', ()=>{
  createWindow();
  setTimeout(checkForUpdates,1000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
});

const ipc = ipcMain;

ipc.on('window-min', function () {
  win.minimize();
});

ipc.on('window-max', function () {
  if (win.isMaximized()) {
    win.restore();
  } else {
    win.maximize();
  }
});
ipc.on('window-close', function () {
  win.close();
});

let handleStartupEvent = function () {
  if (process.platform !== 'win32') {
    return false;
  }

  let squirrelCommand = process.argv[1];

  switch (squirrelCommand) {
    case '--squirrel-install':
    case '--squirrel-updated':
      install();
      return true;
    case '--squirrel-uninstall':
      uninstall();
      app.quit();
      return true;
    case '--squirrel-obsolete':
      app.quit();
      return true;
  }


  function install() {
    let cp = require('child_process');
    let updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
    let target = path.basename(process.execPath);
    let child = cp.spawn(updateDotExe, ['--createShortcut', target], {detached: true});
    child.on('close', function (code) {
      app.quit();
    });
  }

  function uninstall() {
    let cp = require('child_process');
    let updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
    let target = path.basename(process.execPath);
    let child = cp.spawn(updateDotExe, ['--removeShortcut', target], {detached: true});
    child.on('close', function (code) {
      app.quit();
    });
  }

};

if (handleStartupEvent()) {
  return;
}

/**
 * 发送
 * @param message
 * @param data
 */
let sendUpdateMessage = (message, data) => {
  webContents.send('message', { message, data });
};

/**

 */
let checkForUpdates = () => {
  autoUpdater.setFeedURL(feedUrl);

  autoUpdater.on('error', function (message) {
    sendUpdateMessage('error', message)
  });
  autoUpdater.on('checking-for-update', function (message) {
    sendUpdateMessage('checking-for-update', message)
  });
  autoUpdater.on('update-available', function (message) {
    sendUpdateMessage('update-available', message)
  });
  autoUpdater.on('update-not-available', function (message) {
    sendUpdateMessage('update-not-available', message)
  });


  autoUpdater.on('download-progress', function (progressObj) {
    sendUpdateMessage('downloadProgress', progressObj)
  })
  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    //win.destroy();
    ipcMain.on('updateNow', (e, arg) => {
event

      autoUpdater.quitAndInstall();
    })
    sendUpdateMessage('isUpdateNow');
  });


  autoUpdater.checkForUpdates();
};



