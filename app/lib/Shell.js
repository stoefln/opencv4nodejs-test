const { spawn, spawnSync } = require('child_process')
const exec = require('child_process').exec
const fixPath = require('fix-path')
const electron = require('electron')
const path = require('path')

// the packaged electron app does not have access to the whole PATH on mac OS. therefore we need to fetch it
// https://github.com/electron-userland/electron-packager/issues/603#issuecomment-281539064
fixPath()
console.log('process:', process)
console.log('app.getAppPath()', (electron.app || electron.remote.app).getAppPath())

export default class Shell {
  static async execADBCommand(command, deviceId) {
    var args = command
    if (deviceId) {
      args = '-s ' + deviceId + ' ' + command
    }
    args = 'adb ' + args
    //console.log("ADB command: ", command)
    const output = await Shell.execCommand(args)
    console.log('output', output)

    return output
  }

  static async getAdbShellProp(prop, deviceId) {
    var output = await Shell.execADBCommand('shell getprop ' + prop, deviceId)
    output = output.replace('\n', '').replace('\r', '')
    if (output != 'error: device still connecting') {
      console.log(prop + ': ' + output)
      return output
    } else {
      console.error('error while getting adb prop: ' + output)
    }
  }

  static async adbPushFile(filePath1, filePath2, deviceId) {
    console.log('-----adbPushFile', filePath1)
    var appPath = (electron.app || electron.remote.app).getAppPath()
    if (process.env.NODE_ENV == 'production') {
      // in production mode we need to adapt the path. getAppPath() points to Repeator.app/Contents/Resources/app.asar
      // the files we want to push (minicap and minitouch) are packaged in the Resources dir (Repeator.app/Contents/Resources)
      // thats why we pop-off the app.asar from the path
      const arr = appPath.split('/')
      arr.pop()
      appPath = arr.join(path.sep)
    }
    filePath1 = appPath + path.sep + filePath1
    filePath1 = filePath1.replace('/', path.sep)

    var result = await Shell.execADBCommand('push ' + filePath1 + ' ' + filePath2, deviceId)
    if (result.search('1 file pushed') == -1) {
      console.error('Errow while pushing file (' + filePath1 + ') to device: ' + result)
    }
    return result
  }

  static async execCommand(command, input, quitOnStringFound) {
    let promise = new Promise((resolve, reject) => {
      var cmdArr = command.split(' ')
      const arg1 = cmdArr.shift()
      console.log('Shell.execCommand:', command)
      const child = spawn(arg1, cmdArr)
      child.stdout.setEncoding('utf8')
      if (input) {
        console.log('send input: ', input)
        child.stdin.setEncoding('utf8')
        child.stdin.write(input)
        child.stdin.end()
      }
      var result = ''
      var error = ''
      child.stdout.on('data', chunk => {
        result += chunk
        //console.log("chunk: " + chunk)
        handleQuitOnStringFound()
      })
      child.stderr.on('data', chunk => {
        result += chunk
        //console.error("error chunk: "+ chunk)
        handleQuitOnStringFound()
      })
      child.on('close', code => {
        child.stdin.end()
        //console.log("execCommand process.onClose", result)
        resolve(result)
      })

      let handleQuitOnStringFound = () => {
        if (quitOnStringFound) {
          if (result.indexOf(quitOnStringFound) != -1) {
            console.log('quitOnStringFound')
            child.kill('SIGINT')
          }
        }
      }
    })
    return promise
  }

  static async execInDirectory(directory, command) {
    console.log(`Shell.execInDirectory ${directory} :`, command)
    let promise = new Promise((resolve, reject) => {
      const child = exec(command, { cwd: directory })
      child.stdout.on('data', chunk => {
        console.log(chunk)
      })
      child.stderr.on('data', chunk => {
        console.log(chunk)
      })
      child.on('close', code => {
        console.log(`quit with code ${code}`)
        resolve()
      })
    })
    return promise
  }

  static async execCommandNoConsole(command, input, quitOnStringFound) {
    let promise = new Promise((resolve, reject) => {
      var cmdArr = command.split(' ')
      const arg1 = cmdArr.shift()
      const child = spawn(arg1, cmdArr)
      child.stdout.setEncoding('utf8')
      if (input) {
        child.stdin.setEncoding('utf8')
        child.stdin.write(input)
        child.stdin.end()
      }
      var result = ''
      var error = ''
      child.stdout.on('data', chunk => {
        result += chunk
        handleQuitOnStringFound()
      })
      child.stderr.on('data', chunk => {
        result += chunk
        handleQuitOnStringFound()
      })
      child.on('close', code => {
        child.stdin.end()
        resolve(result)
      })

      let handleQuitOnStringFound = () => {
        if (quitOnStringFound) {
          if (result.indexOf(quitOnStringFound) != -1) {
            child.kill('SIGINT')
          }
        }
      }
    })
    return promise
  }

  static open(command) {
    var cmdArr = command.split(' ')
    const arg1 = cmdArr.shift()
    console.log('Shell.open child process:', command)
    const child = spawn(arg1, cmdArr)
    child.stdout.setEncoding('utf8')
    child.stdin.setEncoding('utf8')
    return child
  }

  static send(command, callback) {
    console.log('Shell.send:', command)
    var process = exec('command', (error, stdout, stderr) => {
      console.log('stdout: ' + stdout)
      console.log('stderr: ' + stderr)
      if (error !== null) {
        console.log('exec error: ' + error)
      }
      if (callback) {
        callback('' + stdout + stderr)
      }
    })
    process.on('exit', function() {
      console.log('on process exit')
    })
  }
}
