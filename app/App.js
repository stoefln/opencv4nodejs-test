import React, { Component } from 'react'
import { HashRouter, Route } from 'react-router-dom'
import { Provider } from 'mobx-react'
import { hot } from 'react-hot-loader/root'
import { createMuiTheme, MuiThemeProvider, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Drawer from '@material-ui/core/Drawer'

import fileUtils from './lib/FileUtils'

import DebugPage from './views/DebugPage'

import { darkBg } from './styles/colors'

console.log('darkBg', darkBg)

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
    h1: {
      fontSize: '1.5rem',
      fontWeight: 400
    },
    h2: {
      fontSize: '1.2rem',
      fontWeight: 400
    },
    h3: {
      fontSize: '1rem',
      fontWeight: 300
    },
    h4: {
      fontSize: '0.7rem'
    },
    h5: {
      fontSize: '0.5rem'
    },
    h6: {
      // dialog title
      fontSize: '1.2rem'
    },
    caption: {
      // dialog title
      color: '#999999',
      fontSize: '0.7rem'
    },
    body2: {
      fontSize: '0.7rem'
    }
  },
  palette: {
    primary: {
      main: darkBg
    },
    secondary: {
      main: '#ad1457'
    }
  }
})

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark'
  }
})

const drawerWidth = 250

const styles = {
  root: {
    /*
     * Adjustment for log component
     * */
    padding: theme.spacing.unit * 2,
    paddingBottom: 48,
    marginLeft: drawerWidth,
    height: '100vh',
    overflow: 'hidden',
    /*
     * Log Component aligns based on this
     * */
    position: 'relative'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: darkBg
  }
}

class App extends Component {
  constructor(props) {
    super(props)

   
    // make sure the folder structure is created for saving files
    fileUtils.assureUserDirStructure()
  }

  render() {
    const { classes } = this.props

    return (
      <MuiThemeProvider theme={theme}>
       
          <HashRouter>
            <React.Fragment>
              <MuiThemeProvider theme={darkTheme}>
                <Drawer
                  className={classes.drawer}
                  classes={{ paper: classes.drawerPaper }}
                  variant="permanent"
                  anchor="left"
                >
                </Drawer>
              </MuiThemeProvider>
              <div className={classes.root}>
                <Route exact path="/" component={DebugPage} />
              </div>
            </React.Fragment>
          </HashRouter>
      </MuiThemeProvider>
    )
  }
}
export default hot(withStyles(styles)(App))
