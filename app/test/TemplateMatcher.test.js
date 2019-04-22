import TemplateMatcher from '../lib/TemplateMatcher'
const cv = require('opencv4nodejs')
const tm = new TemplateMatcher()

const match = async (templatePath, imagePath) => {
  await tm.setTemplateImage(templatePath)
  const matches = await tm.matchImageFile(imagePath)
  return matches
}

// I could not get those tests to work, since CLI node version is a different to the one used by electron
// opencv module does not like that
test('find some pattern in some image', async () => {
  const matches = await match('./tests/0.111346648616236/1.png', './temp/lastMatchedFrame.png')
  expect(matches.length).toBe(0)
})
