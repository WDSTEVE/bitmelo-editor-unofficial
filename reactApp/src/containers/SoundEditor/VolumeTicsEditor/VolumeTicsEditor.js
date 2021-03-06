
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';

import WaveGrid from '../../../components/WaveGrid/WaveGrid';
import LoopControls from '../LoopControls/LoopControls';
import { setSoundData } from '../../../state/Sound/sounds';

import './VolumeTicsEditor.css';

class VolumeTicsEditor extends React.Component {
  handleDataChange( newData ) {
    const { setSound, activeSound, soundData } = this.props;
    setSound( activeSound, { ...soundData, volumeTics: newData } );
  }

  render() {
    const { soundData, lastTic } = this.props;

    return (
      <Fragment>
        <WaveGrid
          data={ soundData.volumeTics }
          minValue={ 0 }
          maxValue={ 15 }
          onDataChange={ ( newData ) => this.handleDataChange( newData ) }
          showLoop={ soundData.useVolumeLoop }
          loopStart={ soundData.volumeLoopStart }
          loopEnd={ soundData.volumeLoopEnd }
          lastTic={ lastTic }
        />
        <LoopControls />
      </Fragment>
    );
  }
}

VolumeTicsEditor.propTypes = {
  soundData: PropTypes.object.isRequired,
  activeSound: PropTypes.number.isRequired,
  setSound: PropTypes.func.isRequired,
  lastTic: PropTypes.number.isRequired,
};

function mapStateToProps( state ) {
  const { sounds, activeSound } = state.sound;

  return {
    soundData: sounds[activeSound],
    activeSound,
    lastTic: state.layout.soundEditor.lastVolumeTic,
  };
}

function mapDispatchToProps( dispatch ) {
  return bindActionCreators( {
    setSound: setSoundData,
  }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( VolumeTicsEditor );
