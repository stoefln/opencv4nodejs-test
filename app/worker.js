import React from 'react'
import { render } from 'react-dom'
const { ipcRenderer } = require('electron')
import TemplateMatcherWorker from './lib/TemplateMatcherWorker'

console.log('Worker started')
//console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

const tmWorker = new TemplateMatcherWorker()

ipcRenderer.on('template-matching-request', (event, request) => {
  console.log('matching requestId', request.requestId)

  tmWorker
    .matchImageBuffer(request.buffer, request.tmpl)
    .then(matchingResult => {
      matchingResult.requestId = request.requestId
      console.log('done matching requestId', request.requestId)
      ipcRenderer.send('template-matching-response', matchingResult)
    })
    .catch(e => console.error(e))
})
