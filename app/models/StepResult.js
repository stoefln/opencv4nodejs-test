import { types, getRoot, destroy } from 'mobx-state-tree'
import { Step } from './Step'
import Match from './Match'
import DeviceData from './DeviceData'
import { guid } from '../lib/Utils'

const StepResult = types
  .model('StepResult', {
    id: types.identifier, // must be the same as the according step id
    step: types.maybe(types.safeReference(Step)),
    matches: types.array(Match),
    // for debugging: the filepath to the frame which was matched agains the steps template image
    frameFilePath: types.maybe(types.string)
  })
  .actions(self => ({
    setId(id) {
      self.id = id
    },
    /**
     * @param {Match} match
     */
    addMatch(match) {
      self.matches.push(match)
    },
    /**
     * @param {Array<Match>} match
     */
    setMatches(matches) {
      self.matches = matches
    },

    setStep(step) {
      self.step = step
    },

    setFrameFilePath(frameFilePath) {
      self.frameFilePath = frameFilePath
    }
  }))
  .views(self => ({
    get frameFilePathUrl() {
      return `file://${self.frameFilePath}?cacheBust=${guid()}`
    }
  }))

export default StepResult
