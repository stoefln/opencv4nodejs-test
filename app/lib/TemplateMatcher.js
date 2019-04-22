//const Match = require('../models/Match')
const cv = require('opencv4nodejs')
import Match from '../models/Match'
import StepResult from '../models/StepResult'
import { interval } from 'rxjs'
import { sample } from 'rxjs/operators'
const electron = require('electron')
const ipc = electron.ipcRenderer
import fileUtils from '../lib/FileUtils'
import { guid } from '../lib/Utils'
const fs = require('fs')
/**
 * TemplateMatcher looks for a template image in another image and returns the positions and likeliness of each match
 * Since those pixel based operations are quite expensive, we do the matching on another thread.
 * In electron js this is best done via an extra browser window (worker.html)
 * The actuall work happens in TemplateMatcherWorker.js which is instantiated in this extra browser window
 */

class TemplateMatcher {
  isWatchingImageStream = false
  isPatternSearching = false
  lastFrame = Buffer.from('') // last frame which was handled
  tmpl = null

  constructor() {
    this.subscribeToIpcBus()
  }

  subscribeToIpcBus() {}

  async setTemplateImage(templateImagePath) {
    this.templateImagePath = templateImagePath
    const tmpl = cv.imread(this.templateImagePath)
    if (tmpl.cols < 1 || tmpl.rows < 1) throw new Error('Template has no size')
    this.tmpl = tmpl
  }

  /**
   *  Basic workflow: We process as many frames from the image stream serially as we can. As soon as we detect a match, we stop.
   *  Problem: Lets think of following scenario to make things more clear: There will be 2 frames sent by minicap (before timeout):
   *  One (frame1) before a button (out matching target) is shown (maybe a spinner was just spinning) and one (frame2) when the button gets displayed. After that, minicap stops to send more frames (because no pixels change anymore)
   *  Lets further assume that we are currently processing frame1. If frame2 arrives, we need to make sure that it won't just be discarded, but kept safely for processing later (in case frame1 didn't lead to a match). Otherwise we will not find a match (which can be found only in frame2)
   *  Further: If frame3 arrives during processing of frame1, frame2 can be discarded and frame3 should be scheduled for processing later.
   *  Further: If frame3 arrives during processing of frame2, frame 3 should be scheduled for processing later
   *
   *  PSEUDO CODE:
   *
   *  if(processing)
   *    scheduledFrame = nextFrame
   *  else
   *    processing = true
   *    result = await findTemplate(nextFrame)
   *    while(scheduledFrame != null && result.matches.length == 0)
   *      result = await findTemplate(scheduledFrame)
   *    scheduledFrame = undefined
   *    processing = false
   *
   * @param {ImageStreamConnector} imageStreamConnector
   * @param {String} imagePath
   * @returns {Promise<StepResult>}
   */
  async watchImageStream(imageStreamConnector, imagePath, timeoutInMs, stepId) {
    this.stopWatchImageStream()

    this.isWatchingImageStream = true
    console.log('watchImageStream for image: ', imagePath)
    await this.setTemplateImage(imagePath)
    console.log('check current frameBody instantly')

    let promise = new Promise((resolve, reject) => {
      this.clearTimeout()
      this.searchTimeoutTimer = setTimeout(() => {
        console.log('timout called!')
        this.stopWatchImageStream()
        if (!this.lastStepResult) {
          this.lastStepResult = StepResult.create({ id: stepId })
        }
        resolve(this.lastStepResult)
      }, timeoutInMs)

      var processing = false
      var scheduledFrame = undefined

      this.imageStreamSub = imageStreamConnector.frameSubject.pipe(sample(interval(50))).subscribe({
        next: async data => {
          console.log('template matcher frame update')
          try {
            if (processing) {
              //console.log("new frame arrived during matching...")
              scheduledFrame = data // previously scheduled frame is useless, discard it and save new one
            } else {
              processing = true
              this.lastStepResult = await this.patternSearch(data, stepId)
              while (scheduledFrame && this.lastStepResult.matches.length == 0 && this.isWatchingImageStream) {
                console.log('processing scheduled frame...')
                this.lastStepResult = await this.patternSearch(scheduledFrame, stepId)
              }
              console.log('processing scheduled frames done.')
              scheduledFrame = undefined
              processing = false

              if (this.lastStepResult.matches.length > 0) {
                this.stopWatchImageStream()
                this.clearTimeout()
                resolve(this.lastStepResult)
              }
            }
          } catch (e) {
            console.error(e)
          }
        }
      })
    })
    return promise
  }

  clearTimeout() {
    if (this.searchTimeoutTimer) {
      clearTimeout(this.searchTimeoutTimer)
      self.searchTimeoutTimer = null
    }
  }

  stopWatchImageStream() {
    this.clearTimeout()

    if (this.imageStreamSub) {
      this.imageStreamSub.unsubscribe()
    }
    this.isWatchingImageStream = false
  }

  /**
   * @returns {StepResult}
   */
  async patternSearch(frameData, stepId) {
    const requestId = guid()

    this.lastFrame = Buffer.from(frameData, 'base64')
    console.log('patternSearch matching...')
    const matchingResponse = await this.matchImageBuffer(this.lastFrame, requestId)

    if (matchingResponse.matches.length > 0) {
      console.log(matchingResponse.matches.length + 'match(es) found!')
    } else {
      console.log('no matches found')
    }

    this.lastStepResult = StepResult.create({ id: stepId })

    matchingResponse.matches.forEach(obj => {
      const match = Match.create({
        position: obj.position,
        value: obj.value,
        templateSize: obj.templateSize
      })
      this.lastStepResult.addMatch(match)
    })
    console.log('new StepResult', this.lastStepResult)

    return this.lastStepResult
  }

  isMatching = false
  /**
   * CAUTION: calling this method before its done with the matching, will cause the previous calls to never finish.
   * TODO: We need to find a better way to do this
   *
   * @param {Buffer} buffer
   * @returns {Promise<StepResult>}
   */
  async matchImageBuffer(buffer, requestId) {
    if (this.isMatching) {
      console.error('this method has to finish before being called again!')
      return null
    }
    this.isMatching = true
    const promise = new Promise((resolve, reject) => {
      console.group('matching request')
      console.time('matching duration')
      console.log(`--> send to TemplateMatcherWorker \n${requestId}`)
      ipc.send('template-matching-request', {
        buffer: buffer,
        tmpl: this.templateImagePath,
        requestId: requestId
      })
      ipc.once('template-matching-response', (event, matchingResponse) => {
        console.log(`<-- receive from TemplateMatcherWorker \n${requestId}`)
        console.timeEnd('matching duration')
        console.groupEnd()
        this.isMatching = false
        resolve(matchingResponse)
      })
    })
    return promise
  }
}

module.exports = TemplateMatcher
