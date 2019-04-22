/*
 * takes an unlimited amount of functions as arguments and composes them to a single function
 * which, when called, calls each one in order with the return value of the latest
 * */

function compose(...fns) {
  return fns.reduce((a, b) => (...args) => a(b(...args)))
}

export default compose
