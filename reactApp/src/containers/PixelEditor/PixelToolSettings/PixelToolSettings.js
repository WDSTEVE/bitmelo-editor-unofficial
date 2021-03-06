
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ToolSettings from '../../../components/ToolSettings/ToolSettings';
import NumberPicker from '../../../components/NumberPicker/NumberPicker';
import Button from '../../../components/Button/Button';

import { PENCIL_TOOL, ERASER_TOOL, LINE_TOOL } from '../../../state/PixelTools/selectedTool';
import { setPixelToolSettings } from '../../../state/PixelTools/pixelToolSettings';
import { deselectTilesetEditorSelection, selectAllTileset } from '../../../state/Tileset/actions';
import { flipTilesetEditorSelection, rotateTilesetEditorSelection } from '../../../state/Tileset/editorSelection';

import { SELECT_ALL, eventMatchesHotkey } from '../../../utils/hotkeys';

import './PixelToolSettings.css';

class PixelToolSettings extends React.Component {
  constructor( props ) {
    super( props );

    this.handleKeyDown = this.handleKeyDown.bind( this );
  }

  componentDidMount() {
    window.addEventListener( 'keydown', this.handleKeyDown );
  }

  componentWillUnmount() {
    window.removeEventListener( 'keydown', this.handleKeyDown );
  }

  handleKeyDown( event ) {
    const {
      _setPixelToolSettings,
      pixelToolSettings,
      selectedTool,
      anyModalIsOpen,
    } = this.props;

    if ( eventMatchesHotkey( event, SELECT_ALL ) ) {
      if ( !anyModalIsOpen ) {
        this.handleSelectAll();
      }
      event.preventDefault();
    }

    if ( anyModalIsOpen ) {
      return;
    }

    let newPencilSize = -1;
    let newEraserSize = -1;
    let newLineSize = -1;

    if ( event.which === 219 ) { // [
      if ( selectedTool === PENCIL_TOOL ) {
        newPencilSize = pixelToolSettings.pencilSize - 1;
      }
      else if ( selectedTool === ERASER_TOOL ) {
        newEraserSize = pixelToolSettings.eraserSize - 1;
      }
      else if ( selectedTool === LINE_TOOL ) {
        newLineSize = pixelToolSettings.lineSize - 1;
      }
    }
    else if ( event.which === 221 ) { // ]
      if ( selectedTool === PENCIL_TOOL ) {
        newPencilSize = pixelToolSettings.pencilSize + 1;
      }
      else if ( selectedTool === ERASER_TOOL ) {
        newEraserSize = pixelToolSettings.eraserSize + 1;
      }
      else if ( selectedTool === LINE_TOOL ) {
        newLineSize = pixelToolSettings.lineSize + 1;
      }
    }

    if ( newPencilSize > 0 && newPencilSize <= 32 ) {
      _setPixelToolSettings( { ...pixelToolSettings, pencilSize: newPencilSize } );
    }
    else if ( newEraserSize > 0 && newEraserSize <= 32 ) {
      _setPixelToolSettings( { ...pixelToolSettings, eraserSize: newEraserSize } );
    }
    else if ( newLineSize > 0 && newLineSize <= 32 ) {
      _setPixelToolSettings( { ...pixelToolSettings, lineSize: newLineSize } );
    }
  }

  handlePencilSizeChange( newValue ) {
    const { _setPixelToolSettings, pixelToolSettings } = this.props;
    _setPixelToolSettings( { ...pixelToolSettings, pencilSize: newValue } );
  }

  handleEraserSizeChange( newValue ) {
    const { _setPixelToolSettings, pixelToolSettings } = this.props;
    _setPixelToolSettings( { ...pixelToolSettings, eraserSize: newValue } );
  }

  handleLineSizeChange( newValue ) {
    const { _setPixelToolSettings, pixelToolSettings } = this.props;
    _setPixelToolSettings( { ...pixelToolSettings, lineSize: newValue } );
  }

  handleDeselect() {
    const { _deselectTilesetEditorSelection, tilesetState, tileSize } = this.props;
    if ( tilesetState.editorSelection && tilesetState.editorSelection.isActive ) {
      _deselectTilesetEditorSelection( tilesetState, tileSize );
    }
  }

  handleSelectAll() {
    const { tilesetState, tileSize, _selectAllTileset } = this.props;
    _selectAllTileset( tilesetState, tileSize );
  }

  handleFlipHorizontal() {
    const { tilesetState, _flipTilesetEditorSelection } = this.props;
    if ( tilesetState.editorSelection && tilesetState.editorSelection.isActive ) {
      _flipTilesetEditorSelection( true, false );
    }
    else {
      this.handleSelectAll();
      _flipTilesetEditorSelection( true, false );
    }
  }

  handleFlipVertical() {
    const { tilesetState, _flipTilesetEditorSelection } = this.props;
    if ( tilesetState.editorSelection && tilesetState.editorSelection.isActive ) {
      _flipTilesetEditorSelection( false, true );
    }
    else {
      this.handleSelectAll();
      _flipTilesetEditorSelection( false, true );
    }
  }

  handleRotateCounterClockwise() {
    const { tilesetState, _rotateTilesetEditorSelection } = this.props;
    if ( tilesetState.editorSelection && tilesetState.editorSelection.isActive ) {
      _rotateTilesetEditorSelection( -90 );
    }
    else {
      this.handleSelectAll();
      _rotateTilesetEditorSelection( -90 );
    }
  }

  handleRotateClockwise() {
    const { tilesetState, _rotateTilesetEditorSelection } = this.props;
    if ( tilesetState.editorSelection && tilesetState.editorSelection.isActive ) {
      _rotateTilesetEditorSelection( 90 );
    }
    else {
      this.handleSelectAll();
      _rotateTilesetEditorSelection( 90 );
    }
  }

  getTransformsRender() {
    const { tilesetState } = this.props;

    const transformButtons = (
      <Fragment>
        <Button
          title="Select All"
          icon="selectall"
          hideTitle
          click={ () => this.handleSelectAll() }
        />
        <Button
          title="Flip Horizontal"
          icon="flip-h"
          hideTitle
          click={ () => this.handleFlipHorizontal() }
        />
        <Button
          title="Flip Vertical"
          icon="flip-v"
          hideTitle
          click={ () => this.handleFlipVertical() }
        />
        <Button
          title="Rotate Counter Clockwise"
          icon="counter"
          hideTitle
          click={ () => this.handleRotateCounterClockwise() }
        />
        <Button
          title="Rotate Clockwise"
          icon="clockwise"
          hideTitle
          click={ () => this.handleRotateClockwise() }
        />
      </Fragment>
    );

    let selectionButtons = null;
    if ( tilesetState.editorSelection && tilesetState.editorSelection.isActive ) {
      selectionButtons = (
        <Fragment>
          <Button
            title="Deselect"
            icon="deselect"
            hideTitle
            click={ () => this.handleDeselect() }
          />
        </Fragment>
      );
    }

    return (
      <div className="transforms">
        { selectionButtons }
        { transformButtons }
      </div>
    );
  }

  render() {
    const { selectedTool, pixelToolSettings } = this.props;

    let toolsRender = null;
    if ( selectedTool === PENCIL_TOOL ) {
      toolsRender = (
        <NumberPicker
          title="Size"
          value={ pixelToolSettings.pencilSize }
          minValue={ 1 }
          maxValue={ 32 }
          onValueChange={ v => this.handlePencilSizeChange( v ) }
        />
      );
    }
    else if ( selectedTool === ERASER_TOOL ) {
      toolsRender = (
        <NumberPicker
          title="Size"
          value={ pixelToolSettings.eraserSize }
          minValue={ 1 }
          maxValue={ 32 }
          onValueChange={ v => this.handleEraserSizeChange( v ) }
        />
      );
    }
    else if ( selectedTool === LINE_TOOL ) {
      toolsRender = (
        <NumberPicker
          title="Size"
          value={ pixelToolSettings.lineSize }
          minValue={ 1 }
          maxValue={ 32 }
          onValueChange={ v => this.handleLineSizeChange( v ) }
        />
      );
    }

    return (
      <ToolSettings>
        <div className="tools">
          { toolsRender }
        </div>
        { this.getTransformsRender() }
      </ToolSettings>
    );
  }
}

PixelToolSettings.propTypes = {
  selectedTool: PropTypes.string.isRequired,
  pixelToolSettings: PropTypes.object.isRequired,
  _setPixelToolSettings: PropTypes.func.isRequired,
  tilesetState: PropTypes.object.isRequired,
  _deselectTilesetEditorSelection: PropTypes.func.isRequired,
  tileSize: PropTypes.number.isRequired,
  _flipTilesetEditorSelection: PropTypes.func.isRequired,
  _rotateTilesetEditorSelection: PropTypes.func.isRequired,
  _selectAllTileset: PropTypes.func.isRequired,
  anyModalIsOpen: PropTypes.bool.isRequired,
};

function mapStateToProps( state ) {
  return {
    selectedTool: state.pixelTools.selectedTool,
    pixelToolSettings: state.pixelTools.pixelToolSettings,
    tilesetState: state.tileset.present,
    tileSize: state.project.tileSize,
    anyModalIsOpen: state.layout.modalCount > 0,
  };
}

function mapDispatchToProps( dispatch ) {
  return bindActionCreators( {
    _setPixelToolSettings: setPixelToolSettings,
    _deselectTilesetEditorSelection: deselectTilesetEditorSelection,
    _flipTilesetEditorSelection: flipTilesetEditorSelection,
    _rotateTilesetEditorSelection: rotateTilesetEditorSelection,
    _selectAllTileset: selectAllTileset,
  }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( PixelToolSettings );
