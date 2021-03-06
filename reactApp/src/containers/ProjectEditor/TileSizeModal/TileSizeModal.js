
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Modal from '../../../components/Modal/Modal';
import NumberPicker from '../../../components/NumberPicker/NumberPicker';
import Button from '../../../components/Button/Button';

import { changeTileSize } from '../../../state/Project/tileSize';
import { clearTilesetsHistory } from '../../../state/Tileset/index';

import './TileSizeModal.css';

class TileSizeModal extends React.Component {
  constructor( props ) {
    super( props );

    this.state = {
      tempTileSize: props.tileSize,
    };
  }

  handleTileSizeChange( newValue ) {
    this.setState( { tempTileSize: newValue } );
  }

  handleSaveClick() {
    const {
      onClose,
      tileSize,
      _changeTileSize,
      _clearTilesetsHistory,
    } = this.props;
    const { tempTileSize } = this.state;

    if ( tileSize !== tempTileSize ) {
      _changeTileSize( tempTileSize );
      _clearTilesetsHistory();
    }

    this.setState( { tempTileSize: tileSize } );
    onClose();
  }

  handleCancelClick() {
    const { onClose, tileSize } = this.props;

    this.setState( { tempTileSize: tileSize } );
    onClose();
  }

  handleModalClose() {
    const { onClose, tileSize } = this.props;

    this.setState( { tempTileSize: tileSize } );
    onClose();
  }

  render() {
    const { tempTileSize } = this.state;
    return (
      <Modal
        className="tile-size-modal"
        showHeader
        title="Edit Tile Size"
        onClose={ () => this.handleModalClose() }
      >
        <div className="warning">
          WARNING! Changing the tile size will delete all existing tile data! This can not be undone!
        </div>
        <div className="modal-controls">
          <NumberPicker
            title="Tile Size"
            value={ tempTileSize }
            onValueChange={ v => this.handleTileSizeChange( v ) }
            minValue={ 4 }
            maxValue={ 32 }
          />
        </div>
        <div className="exit-buttons">
          <Button
            title="Save"
            click={ () => this.handleSaveClick() }
            standard
          />
          <Button
            title="Cancel"
            click={ () => this.handleCancelClick() }
            standard
          />
        </div>
      </Modal>
    );
  }
}

TileSizeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  tileSize: PropTypes.number.isRequired,
  _changeTileSize: PropTypes.func.isRequired,
  _clearTilesetsHistory: PropTypes.func.isRequired,
};

function mapStateToProps( state ) {
  return {
    tileSize: state.project.tileSize,
  };
}

function mapDispatchToProps( dispatch ) {
  return bindActionCreators( {
    _changeTileSize: changeTileSize,
    _clearTilesetsHistory: clearTilesetsHistory,
  }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( TileSizeModal );
