/*
 * array -> array
 *
 * immutably removes the first element from an array
 * */

function unshift(array) {
  const [removal, ...remainder] = array

  return remainder
}

export default unshift
