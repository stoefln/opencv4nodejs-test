import { types } from 'mobx-state-tree'
import Point from './Point'
import Size from './Size'
import { guid } from '../lib/Utils'

const Match = types
  .model('Match', {
    /*id: types.optional(types.identifier, guid()),*/
    position: Point,
    value: types.number,
    templateSize: Size
  })
  .actions(self => ({
    templateSizeInPixels(imageSize) {
      return {
        width: self.templateSize.width * imageSize.width,
        height: self.templateSize.height * imageSize.height
      }
    },

    getTopLeftInPixels(imageSize) {
      return Point.create({
        x: self.position.x * imageSize.width,
        y: self.position.y * imageSize.height
      })
    },

    getCenterInPixels(imageSize) {
      const topLeftPx = self.getTopLeftInPixels(imageSize)
      const templateSizePx = self.templateSizeInPixels(imageSize)

      return Point.create({
        x: topLeftPx.x + templateSizePx.width / 2,
        y: topLeftPx.y + templateSizePx.height / 2
      })
    },

    getCenter() {
      return Point.create({
        x: self.position.x + self.templateSize.width / 2,
        y: self.position.y + self.templateSize.height / 2
      })
    }
  }))

export default Match
