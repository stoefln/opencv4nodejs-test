const electron = require('electron')
const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
const cv = require('opencv4nodejs')
const nodeEnv = process.env.NODE_ENV
const ipc = electron.ipcMain

app.disableHardwareAcceleration()

let win

app.on('ready', () => {
  console.log('app on ready!!!')

  if (nodeEnv === 'development') {
    const sourceMapSupport = require('source-map-support')
    sourceMapSupport.install()

    /*[REACT_DEVELOPER_TOOLS, MOBX_DEVTOOLS].forEach(extension => {
      installExtension(extension)
          .then((name) => console.log(`Added Extension: ${name}`))
          .catch((err) => console.log('An error occurred: ', err));
    });*/
  }
  createWindow()
  createWorkerWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  console.log(nodeEnv)
  if (win === null) {
    createWindow()
  }
  if (worker === null) {
    createWorkerWindow()
  }
})

ipc.on('template-matching-request', function(event, arg) {
  //console.log("template-matching-request received", arg)
  worker.webContents.send('template-matching-request', arg)
})
ipc.on('template-matching-response', function(event, arg) {
  //console.log("template-matching-request received", arg)
  win.webContents.send('template-matching-response', arg)
})

function createWindow() {
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
  win = new BrowserWindow({
    width,
    height,
    webPreferences: {
      webSecurity: false
    }
  })

  if (nodeEnv === 'development') {
    //delay 1000ms to wait for webpack-dev-server start
    setTimeout(function() {
      win.loadURL(
        url.format({
          pathname: 'localhost:3000',
          protocol: 'http:',
          slashes: true
        })
      )
      win.webContents.openDevTools()
    }, 1000)
  } else {
    win.webContents.openDevTools()

    setTimeout(function() {
      win.loadURL(
        url.format({
          pathname: path.join(path.resolve(__dirname, 'static'), 'index.html'),
          protocol: 'file:',
          slashes: true
        })
      )
    }, 2000)
  }
}
function createWorkerWindow() {
  worker = new BrowserWindow({ width: 300, height: 100 })

  if (nodeEnv === 'development') {
    //delay 1000ms to wait for webpack-dev-server start
    setTimeout(function() {
      worker.loadURL(
        url.format({
          pathname: 'localhost:3000/worker.html',
          protocol: 'http:',
          slashes: true
        })
      )
      //worker.webContents.openDevTools();
    }, 1000)
  } else {
    worker.loadURL(
      url.format({
        pathname: path.join(path.resolve(__dirname, 'static'), 'worker.html'),
        protocol: 'file:',
        slashes: true
      })
    )
  }
}
