import React from 'react'
import { inject, observer } from 'mobx-react'
import { Divider, Grid } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import StepsList from './StepsList'
import RecordingControls from './RecordingControls'
import PlayerControls from './PlayerControls'
import { darkBg2 } from '../styles/colors'

const styles = theme => ({
  flexContainer: {
    /*
     * 100% viewport height - 48px accounting for the height of the collapsed
     * log-panel
     * */
    maxHeight: 'calc(100vh - 48px)'
  },
  stepsListContainer: {
    overflowY: 'auto'
  },
  playerControlsContainer: {
    backgroundColor: darkBg2,
    borderRadius: '5px'
  }
})

@inject('dbStore')
@inject('uiStore')
@observer
class TopControlsPanel extends React.Component {
  render() {
    const { classes, uiStore } = this.props

    const { currentTest } = uiStore.recorder

    return (
      <Grid className={classes.flexContainer} container direction="column" wrap="nowrap">
        <Grid item>
          <RecordingControls />
        </Grid>
        {currentTest && (
          <React.Fragment>
            <Grid item>
              <Divider />
            </Grid>
            <Grid item className={classes.stepsListContainer}>
              <StepsList test={currentTest} testRunner={uiStore.testRunner} />
            </Grid>
            <Grid item className={classes.playerControlsContainer}>
              <PlayerControls />
            </Grid>
          </React.Fragment>
        )}
      </Grid>
    )
  }
}
export default withStyles(styles)(TopControlsPanel)
