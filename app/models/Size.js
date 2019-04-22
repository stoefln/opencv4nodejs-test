import { types } from 'mobx-state-tree'

const Size = types.model('Size', {
  width: types.number,
  height: types.number
})

export default Size
