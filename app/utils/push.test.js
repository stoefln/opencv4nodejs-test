import push from './push'

describe('push', () => {
  it('returns an array with an added element', () => {
    const result = push([1, 2], 3)

    const expected = [1, 2, 3]

    expect(result).toEqual(expected)
  })

  it('returns a copy of the array as opposed to mutating it in place', () => {
    const initial = [1, 2]

    const result = push(initial, 3)

    expect(initial).not.toBe(result)
  })
})
