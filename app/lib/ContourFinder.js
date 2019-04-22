const cv = require('opencv4nodejs')
const { Mat } = require('opencv4nodejs')

class ContourFinder {
  /**
   * finds differences between to image frames
   * this is needed for automatically detecting the region where text is entered:
   * when we record text input, two frames are compared: the one BEFORE the first character is typed on the screen, and the one AFTER the first character is typed
   * the resulting bounding box position will be used for creating the template image
   * @param {Mat} im1 - The first image
   * @param {Mat} im2 - The second image
   */
  async findDifferences(im1, im2) {
    const diff = im1.absdiff(im2)
    const bw = await diff.cvtColor(cv.COLOR_BGR2GRAY)
    const blurred = await bw.blur(new cv.Size(10, 10))
    //await cv.imwrite('blurred.png', blurred);
    const thresholded = await blurred.threshold(150, 255, cv.THRESH_BINARY)
    //await cv.imwrite('thresholded.png', thresholded)
    const contours = await this.getContours(bw)
    const boundingRects = contours.map(c => c.boundingRect())
    return boundingRects
  }

  /**
   * @param {Mat} mask - The black and white difference image
   */
  async getContours(mask) {
    const mode = cv.RETR_EXTERNAL
    const method = cv.CHAIN_APPROX_SIMPLE
    const contours = mask.findContours(mode, method)
    // largest contour first
    return contours.sort((c0, c1) => c1.area - c0.area)
  }
}

export default ContourFinder
