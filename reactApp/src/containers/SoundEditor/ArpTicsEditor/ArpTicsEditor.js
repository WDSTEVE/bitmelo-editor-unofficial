
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import WaveGrid from '../../../components/WaveGrid/WaveGrid';
import LoopControls from '../LoopControls/LoopControls';
import { setSoundData } from '../../../state/Sound/sounds';

import './ArpTicsEditor.css';

class ArpTicsEditor extends React.Component {
  handleDataChange( newData ) {
    const { setSound, activeSound, soundData } = this.props;
    setSound( activeSound, { ...soundData, arpTics: newData } );
  }

  render() {
    const { soundData, lastTic } = this.props;
    return (
      <Fragment>
        <WaveGrid
          data={ soundData.arpTics }
          minValue={ -12 }
          maxValue={ 12 }
          onDataChange={ ( newData ) => this.handleDataChange( newData ) }
          showLoop={ soundData.useArpLoop }
          loopStart={ soundData.arpLoopStart }
          loopEnd={ soundData.arpLoopEnd }
          lastTic={ lastTic }
        />
        <LoopControls />
      </Fragment>
    );
  }
}

ArpTicsEditor.propTypes = {
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
    lastTic: state.layout.soundEditor.lastArpTic,
  };
}

function mapDispatchToProps( dispatch ) {
  return bindActionCreators( {
    setSound: setSoundData,
  }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( ArpTicsEditor );
