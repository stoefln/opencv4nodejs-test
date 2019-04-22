const cv = require('opencv4nodejs')
const fs = require('fs')
const { Mat, Point2, Vec3 } = require('opencv4nodejs')
import Match from '../models/Match'
import Point from '../models/Point'
import fileUtils from '../lib/FileUtils'
const path = require('path')
import { guid } from '../lib/Utils'
import { TM_SQDIFF_NORMED } from 'opencv4nodejs'

const TM_CCORR_NORMED = 3
const MIN_PROBABILITY = 0.995
/**
 * This class does the actual work of matching a template image
 */
class TemplateMatcherWorker {
  /**
   * @param {string} templateImagePath - The file path to the template image
   */
  async setTemplateImage(templateImagePath) {
    this.templateImagePath = templateImagePath
    const tmpl = cv.imread(this.templateImagePath)
    if (tmpl.cols < 1 || tmpl.rows < 1) throw new Error('Template has no size')
    this.tmpl = tmpl
  }

  /**
   *
   * @param {Buffer} buffer The buffer (serialized image)
   * @param {string} tmplFilePath The file path to the template image
   */
  async matchImageBuffer(buffer, tmplFilePath) {
    if (buffer == null) {
      console.error('imageBuffer must not be null!')
      return
    }
    if (tmplFilePath == null) {
      console.error('templateImage must not be null!')
      return
    }
    if (!this.templateImagePath || this.templateImagePath != tmplFilePath) {
      console.log('Set new template file', tmplFilePath)
      await this.setTemplateImage(tmplFilePath)
    }
    var im = await cv.imdecode(buffer)
    var matches = await this.matchCvImage(im)
    //var lastFrameFilePath = await this.writeBufferToFile(buffer)

    return {
      matches: matches
      //lastFrameFilePath: lastFrameFilePath
    }
  }

  async matchImageFile(filepath) {
    const im = await cv.imread(filepath)
    return await this.matchCvImage(im)
  }

  /**
   * @param {Match} match1
   * @param {Match} match2
   */
  sortByPosition(match1, match2) {
    if (match1.position.x < match2.position.x) return -1
    if (match1.position.x > match2.position.x) return 1
    if (match1.position.y < match2.position.y) return -1
    if (match1.position.y > match2.position.y) return 1

    return 0
  }
  /**
   * @param {Mat} im The image to match
   */
  async matchCvImage(im) {
    if (im.cols < 1 || im.rows < 1) throw new Error('Image has no size')
    console.log('Images loaded.', im, this.tmpl)

    //var t1 = new Date().getTime();

    // 1. create a difference image
    const output = im.matchTemplate(this.tmpl, TM_SQDIFF_NORMED)
    //console.log("output", output)
    //console.log("Time taken (diff image): "+(new Date().getTime()-t1));

    // 2. based on the difference image, we can figure out the spots which are most likely to be matches
    var matches = this.templateMatches(im, output, 5, MIN_PROBABILITY, 60)
    if (matches.length > 0) {
      //console.log(matches.length + " matches found")
    } else {
      console.log('No matches found!')
    }

    //console.debug("Time taken (matches): "+(new Date().getTime()-t1));
    //console.debug("matches: ", matches);
    return matches.sort(this.sortByPosition)
  }

  /**
   * Returns positions and probabilities of all found matches
   * @param {Mat} original The original image frame
   * @param {Mat} diffImg The difference image returned from template matching
   * @param {number} limit The maximum number of hits we want to have returned
   * @param {float} minProbability Minimum probability of a match. Exclude others
   * @param {number} minDinstance Usually neighboring positions of a match have a high match probability too (because they are similar). They need to be excluded.
   */
  templateMatches(original, diffImg, limit, minProbability, minDinstance) {
    // caution: diffImg is smaller than original image (reduced by the template size)
    const positions = []
    console.log('templateMatches')
    const copy = diffImg.copy()
    for (var i = 0; i < limit; i++) {
      const minMax = diffImg.minMaxLoc()
      console.log(
        'minMax: ',
        minMax,
        'limit: ',
        limit,
        'minProbability: ',
        minProbability,
        'minDistance: ',
        minDinstance
      )
      const minLoc = minMax.minLoc
      const probability = 1 - minMax.minVal

      console.log('minVal: ' + probability)
      if (probability < minProbability) {
        // if the probability is too low, return
        break
      }
      const pos = this.toPercentageCoordinates(minLoc, original.cols, original.rows)
      //console.log("pos: ", pos, diffImg)
      const templateSize = {
        width: this.tmpl.cols / original.cols,
        height: this.tmpl.rows / original.rows
      }
      const match = Match.create({
        position: pos,
        value: probability,
        templateSize: templateSize
      })
      console.log('match: ', match)
      positions.push(match)
      console.log('match ' + (i + 1) + ' found', minLoc.x, minLoc.y, probability)
      //cv.imwrite("./debug"+i+".png", img)
      diffImg.drawCircle(minLoc, minDinstance, new Vec3(255, 255, 255), cv.FILLED)
      copy.drawCircle(minLoc, minDinstance, new Vec3(0, 255, 255))
      copy.putText('' + i, minLoc, cv.FONT_ITALIC, 0.5)
    }

    cv.imshow('Pattern matching', copy)
    console.log('positions', positions)
    return positions
  }

  toPercentageCoordinates(position, width, height) {
    return Point.create({ x: position.x / width, y: position.y / height })
  }
}

export default TemplateMatcherWorker
