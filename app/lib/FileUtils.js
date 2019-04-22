import { guid } from './Utils'
const electron = require('electron')
const path = require('path')
const fs = require('fs')

class FileUtils {
  static assureUserDirStructure() {
    const recDirPath = this.getTestDirPath()
    if (!fs.existsSync(recDirPath)) {
      console.warn('create', recDirPath)
      fs.mkdirSync(recDirPath)
    }
  }

  static getTestDirPath(test) {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData')
    var dirPath = userDataPath + path.sep + 'tests'
    if (test) {
      dirPath += path.sep + test.id
    }
    return dirPath
  }
  static getNextStepFilePath(test, appendix) {
    var i = test.steps.length
    return this.getTestDirPath(test) + path.sep + i + '_' + appendix + '.png'
  }
  static get sep() {
    return path.sep
  }
}

module.exports = FileUtils
