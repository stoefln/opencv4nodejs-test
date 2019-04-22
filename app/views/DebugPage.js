import React, { PropTypes, Component } from 'react'

import DevTools from 'mobx-react-devtools'
import List from '@material-ui/core/List'
import { Divider } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import TemplateMatcherWorker from '../lib/TemplateMatcherWorker'
import ImageCanvas from '../components/ImageCanvas'
const { shell } = require('electron')
const cv = require('opencv4nodejs')
import fs from 'fs'

const styles = theme => ({})

class DebugPage extends Component {
  state = { testResults: [] }

  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.tm = new TemplateMatcherWorker()
    setTimeout(() => {
      this.runTests()
        .then(() => console.log('done'))
        .catch(e => console.error(e))
    }, 30)
  }

  componentDidMount() {}

  createLowerQualityVariant = async (directory, filename, quality) => {
    const filepath = directory + filename
    const mat = await cv.imreadAsync(filepath)
    const encodeParams = [cv.IMWRITE_JPEG_QUALITY, quality]

    const filepath2 = directory + 'lowres/' + filename.replace('.jpg', `.quality-${quality}.jpg`)
    const buffer = await cv.imencodeAsync('.jpg', mat, encodeParams)
    //await cv.imwriteAsync(filepath2, mat, encodeParams)
    fs.writeFileSync(filepath2, buffer)
    console.log(`created lower compression file (quality: ${quality}):`, filepath2)
    return filepath2
  }

  runTests = async () => {
    const resourceFolder = './app/test/resources/'
    const testCases = [
      {
        templateImage: 'frame-6dbf3486-0395-1967-b6a7-0f6090c82b83-template.png',
        frameImage: 'frame-6dbf3486-0395-1967-b6a7-0f6090c82b83.jpg',
        expect: {
          matches: [{ position: { x: 10, y: 10 } }]
        }
      },
      {
        name: 'mostly white templates seem to match easily on white back ground',
        templateImage: 'frame-f5d6f235-60c1-fa46-da51-b18ffc090829-template.png',
        frameImage: 'frame-f5d6f235-60c1-fa46-da51-b18ffc090829.jpg',
        expect: { matches: [] }
      },
      {
        templateImage: 'frame-f284eb8e-e5f1-e2f9-07df-e594d2833c02-template.png',
        frameImage: 'frame-f284eb8e-e5f1-e2f9-07df-e594d2833c02.jpg',
        expect: {
          matches: [{ position: { x: 10, y: 10 } }]
        }
      }
    ]

    var qualities = [40, 60, 100]
    for (var i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      const templateImagePath = resourceFolder + testCase.templateImage
      var frameImagePath = resourceFolder + testCase.frameImage

      for (var q in qualities) {
        const quality = qualities[q]
        console.group(`tests for quality ${quality}`)
        if (quality != 100) {
          frameImagePath = await this.createLowerQualityVariant(resourceFolder, testCase.frameImage, quality)
        }
        await this.execTest(testCase, templateImagePath, frameImagePath, quality)
        console.groupEnd()
      }
    }
  }

  execTest = async (testCase, templateImagePath, frameImagePath, compressionQuality) => {
    const matches = await this.match(templateImagePath, frameImagePath)
    //console.log(matches)
    const matchIndex = 0 // = step.matchIndex // TODO
    const success = matches.length == testCase.expect.matches.length
    var message = ''
    if (!success) {
      if (testCase.expect.matches.length == 0) {
        message = 'No matches should have been found!'
      } else {
        const expectedPos = testCase.expect.matches[matchIndex].position
        message = `Expected match at: ${expectedPos.x} / ${expectedPos.y}...`
      }
    }
    const { testResults } = this.state
    testResults.push({
      success: success,
      frameImagePath: frameImagePath,
      templateImagePath: templateImagePath,
      testCase: testCase,
      matches: matches,
      message: message,
      compressionQuality: compressionQuality
    })
    this.setState({ testResults: testResults })
  }

  match = async (templatePath, imagePath) => {
    await this.tm.setTemplateImage(templatePath)
    const matches = await this.tm.matchImageFile(imagePath)
    return matches
  }

  getSuccessRate = testResults => {
    var successCount = testResults.filter(testResult => testResult.success).length
    return `${successCount} of ${testResults.length} successful`
  }
  render() {
    const { classes } = this.props
    const { testResults } = this.state

    return (
      <div className="" style={{ overflow: 'scroll', height: '100%' }}>
        <h1>Debug</h1>
        <DevTools />
        <h3>Result: {this.getSuccessRate(testResults)}</h3>
        <Divider />
        <List>
          {testResults.map((item, index) => (
            <div key={index} divider>
              CompressionQuality: {item.compressionQuality}
              <img onClick={() => shell.openItem(item.templateImagePath)} src={item.templateImagePath} width={50} />
              <img src={item.frameImagePath} width={50} /> - success: {item.success ? 'true' : 'false'}
              <br />
              {item.message}
              <div onClick={() => shell.openItem(item.frameImagePath)}>
                <ImageCanvas angle={index} matches={item.matches} width={400} src={item.frameImagePath} />
              </div>
            </div>
          ))}
        </List>
      </div>
    )
  }
}

export default withStyles(styles)(DebugPage)
