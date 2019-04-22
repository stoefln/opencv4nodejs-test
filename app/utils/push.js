/*
 * array -> array
 *
 * immutably adds an element to an array
 * */

function push(array, item) {
  return [...array, item]
}

export default push
