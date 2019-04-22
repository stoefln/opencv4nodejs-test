import { types, getSnapshot, getType } from 'mobx-state-tree'
import { WaitForTemplateStep, ClickStep, Step } from './Step'

describe('Testing Step types', () => {
  it('Create ClickStep and check type', () => {
    const clickStep = Step.create({ id: '1', type: 'click' })
    //console.log(getSnapshot(clickStep))

    expect(ClickStep.is(clickStep)).toBe(true)
    expect(WaitForTemplateStep.is(clickStep)).toBe(false)
    expect(getType(clickStep)).toEqual(ClickStep)
    expect(getType(clickStep)).not.toEqual(Step)
    expect(getType(clickStep)).not.toEqual(WaitForTemplateStep)
  })

  it('Create ClickStep and WaitStep and check that type differs', () => {
    const clickStep = Step.create({ id: '1', type: 'click' })
    const waitStep = Step.create({ id: '2', type: 'waitForTemplate' })
    expect(getType(clickStep)).not.toEqual(getType(waitStep))
  })

  it('Create ClickStep via ClickStep.create and check type', () => {
    const clickStep = ClickStep.create({ id: '1', type: 'click' })
    expect(getType(clickStep)).toEqual(ClickStep)
  })
})
