import React from 'react'
import { render } from 'react-dom'
import { getSnapshot, destroy, onSnapshot } from 'mobx-state-tree'

import App from './App'
import config from './config'
import { updateStoreToCurrentVersion } from './store-version-migrations'
import './styles/app.css'
import { Shell } from './lib/Shell'

function renderApp(App) {
  render(<App />, document.getElementById('root'))
}

renderApp(App)

/*render(
  <AppContainer>
    <App />
  </AppContainer>,
  document.getElementById('root')
);*/

if (module.hot) {
}
