import fitRectInBound from './fit-rect-in-bound'

const container = {
  width: 100,
  height: 100
}

describe('fitRectInBound()', () => {
  it('adjusts for a rectangle that overlaps only to the left of a container', () => {
    const rectangle = {
      width: 50,
      height: 50,
      x: -5,
      y: 25
    }

    const result = fitRectInBound(rectangle, container)

    const expected = {
      width: 50,
      height: 50,
      x: 0,
      y: 25
    }

    expect(result).toEqual(expected)
  })

  it('adjusts for a rectangle that overlaps only to the right of a container', () => {
    const rectangle = {
      width: 50,
      height: 50,
      x: 55,
      y: 25
    }

    const result = fitRectInBound(rectangle, container)

    const expected = {
      width: 50,
      height: 50,
      x: 50,
      y: 25
    }

    expect(result).toEqual(expected)
  })

  it('adjusts for a rectangle that overlaps only to the top of a container', () => {
    const rectangle = {
      width: 50,
      height: 50,
      x: 25,
      y: -5
    }

    const result = fitRectInBound(rectangle, container)

    const expected = {
      width: 50,
      height: 50,
      x: 25,
      y: 0
    }

    expect(result).toEqual(expected)
  })

  it('adjusts for a rectangle that overlaps only to the bottom of a container', () => {
    const rectangle = {
      width: 50,
      height: 50,
      x: 25,
      y: 55
    }

    const result = fitRectInBound(rectangle, container)

    const expected = {
      width: 50,
      height: 50,
      x: 25,
      y: 50
    }

    expect(result).toEqual(expected)
  })

  it('can handle multiple edges overlapping concurrently', () => {
    const rectangle = {
      width: 50,
      height: 50,
      x: 55,
      y: 55
    }

    const result = fitRectInBound(rectangle, container)

    const expected = {
      width: 50,
      height: 50,
      x: 50,
      y: 50
    }

    expect(result).toEqual(expected)
  })

  it('throws an error if the specified rectangle cant physically fit in the specified container', () => {
    const rectangle = {
      width: 105,
      height: 105,
      x: 55,
      y: 55
    }

    const evaluate = () => fitRectInBound(rectangle, container)

    expect(evaluate).toThrow()
  })
})
