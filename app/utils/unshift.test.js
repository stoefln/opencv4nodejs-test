import unshift from './unshift'

describe('unshift', () => {
  it('returns an array with its first element removed relative to the array it received', () => {
    const result = unshift([1, 2, 3])

    const expected = [2, 3]

    expect(result).toEqual(expected)
  })

  it('returns a copy of the array as opposed to mutating it in place', () => {
    const initial = [1, 2, 3]

    const result = unshift(initial)

    expect(initial).not.toBe(result)
  })
})
