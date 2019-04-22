/**
 * @typedef {Object} Rectangle
 * @property {number} width the width of the rectangle
 * @property {number} height the height of the rectangle
 * @property {number} x the horizontal origin of the rectangle
 * @property {number} y the vertical origin of the rectangle
 */

/**
 * @typedef {Object} Container
 * @property {number} width the height of the container
 * @property {number} height the width of the container
 */

/*
 * this function assumes inputs based on a cartesian coordinate system with its
 * y-axis inverted (such as is default for web-development e.g. browser-rendering and canvas)
 * */

/**
 * takes a rectangle and a container, tries fitting the rect inside the container
 * and adjusts it if the rect would overlap the margin of the container to touch it
 * instead
 *
 * @param {Rectangle} rect the rectangle to be fit inside a given container
 *
 * @param {Container} container the container to fit rect in
 *
 * @returns {Rectangle} the initially passed with its center adjusted
 */
export default function fitRectInBound(rect, container) {
  if (container.width < rect.width || container.height < rect.height) {
    throw new Error(
      "specified rect doesn't fit in specified container" +
        `\n rect dimensions: width - ${rect.width} height - ${rect.height}` +
        `\n container dimensions: width - ${container.width} height - ${container.height}`
    )
  }

  let x = rect.x,
    y = rect.y

  if (rect.x < 0) {
    /*
     * rect overlaps to the left
     * */
    x = 0
  } else if (rect.x + rect.width > container.width) {
    /*
     * rect overlaps to the right
     * */
    x = container.width - rect.width
  }

  if (rect.y < 0) {
    /*
     * rect overlaps top
     * */
    y = 0
  } else if (rect.y + rect.height > container.height) {
    /*
     * rect overlaps bottom
     * */
    y = container.height - rect.height
  }

  return {
    ...rect,
    x,
    y
  }
}
