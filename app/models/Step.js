import { types } from 'mobx-state-tree'
import Point from './Point'
import { guid } from '../lib/Utils'

const BaseStep = types
  .model('BaseStep', {
    id: types.identifier,
    timeSinceLastStep: types.maybe(types.integer),
    // the frame image which was originally used to extract the template image. can help when debugging a failing test run
    originalFrame: types.maybe(types.string)
  })
  .actions(self => ({
    setOriginalFrame(filePath) {
      self.originalFrame = filePath
    },
    setType(type) {
      self.type = type
    }
  }))
  .views(self => ({
    get originalFrameUrl() {
      return `file://${self.originalFrame}?cacheBust=${guid()}`
    }
  }))

const BaseTemplateMatchingStep = BaseStep.named('BaseTemplateMatchingStep')
  .props({
    image: types.maybe(types.string),
    /*
     * offset between the place an interaction happened on the screen and
     * the corresponding template-image that was captured for it
     *
     * e.g. when
     * the user has clicked the very edge of the screen, say, 2px / 2px but the
     * template image is of 100px / 100px so its center would be at 50px / 50px
     *
     * -> that would mean an offset of 48px / 48px to where the screen was actually
     * clicked (offset does not have a restriction on being stored in pixels this
     * was just for the sake of the example)
     * */
    offset: types.maybe(Point),

    /**
     * whenever we do template matching, we might find the same region multiple times in the current video frame. Think of a bullet list with all bullets looking the same.
     * If user clicks one of the bullets, we need to know later which one it was. So that's why we store the index here.
     */
    matchIndex: types.optional(types.number, 0)
  })
  .actions(self => ({
    setImage(value) {
      self.image = value
    },
    setMatchIndex(value) {
      self.matchIndex = value
    }
  }))
  .views(self => ({
    get imageUrl() {
      // image field refers to an absolute file URL, e.g. /Users/steph/Library/Application Support/Electron/tests/...
      // electron browser interprets this as a http URL and its trying to resolve it via http://localhost:3000/Users/steph/Library/Application Support/Electron/tests/...
      // thats why we need to prepend /Users... with file:// -> file:///Users/...
      return `file://${self.image}?cacheBust=${guid()}`
    }
  }))

const WaitForDurationStep = BaseStep.named('WaitForDurationStep').props({
  duration: types.integer,
  type: types.literal('waitForDuration')
})

const WaitForTemplateStep = BaseTemplateMatchingStep.named('WaitForTemplateStep').props({
  type: types.literal('waitForTemplate')
})

const ClickStep = BaseTemplateMatchingStep.named('ClickStep')
  .props({
    mouseDownPosition: types.maybe(Point),
    mouseMoveCoordinates: types.optional(types.array(Point), []),
    type: types.literal('click')
  })
  .actions(self => ({
    setDuration(value) {
      self.duration = value
    },
    addMouseMoveCoordinates(xPerc, yPerc) {
      console.log('addMouseMoveCoordinates', xPerc, yPerc, self.mouseMoveCoordinates.length)
      self.mouseMoveCoordinates.push(Point.create({ x: xPerc, y: yPerc }))
    },
    hasSignificantMove() {
      // is used to check whether the interaction is a drag (returns true) or a click (returns false)
      const tolerance = 0.05
      let minX = 1,
        maxX = 0,
        minY = 1,
        maxY = 0
      self.mouseMoveCoordinates.forEach(p => {
        if (p.x > maxX) {
          maxX = p.x
        }
        if (p.x < minX) {
          minX = p.x
        }
        if (p.y > maxY) {
          maxY = p.y
        }
        if (p.y < minY) {
          minY = p.y
        }
      })
      return maxX - minX > tolerance || maxY - minY > tolerance
    }
  }))
  .views(self => ({
    get lastDragPoint() {
      return self.mouseMoveCoordinates[self.mouseMoveCoordinates.length - 1]
    },
    get verticalDragDirection() {
      // returns values < 0 for up movement and > 0 for down movement
      return self.lastDragPoint.y - self.mouseDownPosition.y
    },
    get horizontalDragDirection() {
      // returns values < 0 for left movement and > 0 for right movement
      return self.lastDragPoint.x - self.mouseDownPosition.x
    },
    get isHorizontalDrag() {
      return Math.abs(self.horizontalDragDirection) - Math.abs(self.verticalDragDirection) > 0
    },
    get dragDirection() {
      if (self.isHorizontalDrag) {
        return self.horizontalDragDirection < 0 ? 'left' : 'right'
      } else {
        return self.verticalDragDirection < 0 ? 'up' : 'down'
      }
    }
  }))

const DragStep = ClickStep.named('DragStep').props({
  type: types.literal('drag')
})

const LongClickStep = ClickStep.named('LongClickStep').props({
  type: types.literal('longClick'),
  duration: types.integer
})

const TextStep = BaseStep.named('TextStep')
  .props({
    type: types.literal('text'),
    text: types.optional(types.string, '')
  })
  .actions(self => ({
    setText(value) {
      self.text = value
    }
  }))

const HomeStep = BaseStep.named('HomeStep').props({
  type: types.literal('home')
})

const BackStep = BaseStep.named('BackStep').props({
  type: types.literal('back')
})

const AppSwitchStep = BaseStep.named('AppSwitchStep').props({
  type: types.literal('appSwitch')
})

const TemplateAssertionStep = BaseTemplateMatchingStep.named('TemplateAssertionStep').props({
  type: types.literal('templateAssertion')
})

const StartAppStep = BaseStep.named('StartAppStep').props({
  type: types.literal('startApp'),
  packageName: types.string,
  activityName: types.string
})

const StopAppStep = BaseStep.named('StopAppStep').props({
  type: types.literal('stopApp'),
  packageName: types.string
})

const ExecScriptStep = BaseStep.named('ExecScriptStep').props({
  type: types.literal('execScript'),
  directory: types.maybe(types.string),
  script: types.string
})

const Step = types.union(
  WaitForDurationStep,
  WaitForTemplateStep,
  ClickStep,
  DragStep,
  LongClickStep,
  TextStep,
  HomeStep,
  BackStep,
  AppSwitchStep,
  TemplateAssertionStep,
  StartAppStep,
  StopAppStep,
  ExecScriptStep
)
/*
  .views(self => ({
    get isWaitStep() {
      return self.type == 'waitForTemplate' || self.type == 'waitForDuration'
    },
  }))*/

export {
  Step,
  WaitForDurationStep,
  WaitForTemplateStep,
  ClickStep,
  DragStep,
  LongClickStep,
  TextStep,
  HomeStep,
  BackStep,
  AppSwitchStep,
  TemplateAssertionStep,
  StartAppStep,
  StopAppStep,
  ExecScriptStep
}
