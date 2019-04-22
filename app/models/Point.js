import { types } from 'mobx-state-tree'

const Point = types
  .model({
    x: types.number,
    y: types.number
  })
  .actions(self => ({
    getDistanceTo(point) {
      const diffX = point.x - self.x
      const diffY = point.y - self.y
      return Math.sqrt(diffX * diffX + diffY * diffY)
    }
  }))
  .views(self => ({
    get infoString() {
      return `x/y: ${(self.x * 100).toFixed(1)}% / ${(self.y * 100).toFixed(1)}%`
    },
    get infoStringX() {
      return `${(self.x * 100).toFixed(1)}%`
    },
    get infoStringY() {
      return `${(self.y * 100).toFixed(1)}%`
    }
  }))

export default Point
