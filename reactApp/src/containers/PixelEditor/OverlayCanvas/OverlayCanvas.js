
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  drawIndicator,
  drawGrid,
} from '../../../utils/drawToCanvas';
import { drawEditorSelection } from '../../../utils/drawEditorSelection';

import { TILE_TAB, TILEMAP_TAB } from '../../../state/Layout/activeNavigationTab';

import './OverlayCanvas.css';

class OverlayCanvas extends React.Component {
  constructor( props ) {
    super( props );

    this.canvasRef = React.createRef();

    this.updateStep = this.updateStep.bind( this );

    this.state = {
      step: 0,
    };
  }

  componentDidMount() {
    this.draw();
    this.stepInterval = setInterval( this.updateStep, 125 );
  }

  componentDidUpdate() {
    this.draw();
  }

  componentWillUnmount() {
    clearInterval( this.stepInterval );
  }

  updateStep() {
    const { step } = this.state;

    const newStep = ( step + 1 ) % 8;
    this.setState( { step: newStep } );
  }

  draw() {
    const {
      width,
      height,
      offsetX,
      offsetY,
      indicatorX,
      indicatorY,
      indicatorWidth,
      indicatorHeight,
      showIndicator,
      scale,
      dataWidth,
      dataHeight,
      isTileEditor,
      tileSize,
      showGrid,
      editorSelection,
      screenWidth,
      screenHeight,
    } = this.props;
    const { step } = this.state;

    const context = this.canvasRef.current.getContext( '2d' );
    context.clearRect( 0, 0, width, height );

    let modifiedScale = scale;
    if ( isTileEditor ) {
      modifiedScale = scale * tileSize;
    }

    if ( showGrid ) {
      const gridSettings = {
        interval: 1,
        lineWidth: 1,
        style: 'rgba( 0, 0, 0, 0.5 )',
        offsetX,
        offsetY,
        scale,
        dataWidth,
        dataHeight,
      };

      const initialScale = gridSettings.scale;

      if ( isTileEditor ) {
        gridSettings.scale = scale * tileSize;
      }

      // draw main grid
      drawGrid( gridSettings, this.canvasRef.current );

      if ( isTileEditor ) {
        // draw stronger border at screen edges
        if ( screenWidth % tileSize === 0 && screenHeight % tileSize === 0 ) {
          gridSettings.scale = initialScale;
          gridSettings.interval = screenWidth;
          gridSettings.yInterval = screenHeight;
          gridSettings.dataWidth = gridSettings.dataWidth * tileSize;
          gridSettings.dataHeight = gridSettings.dataHeight * tileSize;
          gridSettings.lineWidth = 2;
          gridSettings.style = 'rgba( 0, 0, 0, 0.5 )';

          drawGrid( gridSettings, this.canvasRef.current );
        }
      }
      else {
        // draw stronger borders at tile edges
        gridSettings.interval = tileSize;
        gridSettings.lineWidth = 2;

        drawGrid( gridSettings, this.canvasRef.current );
      }
    }

    if ( showIndicator ) {
      drawIndicator(
        {
          offsetX,
          offsetY,
          indicatorX,
          indicatorY,
          indicatorWidth,
          indicatorHeight,
          scale: modifiedScale,
          dataHeight,
        },
        this.canvasRef.current,
      );
    }

    if ( editorSelection && editorSelection.isActive ) {
      drawEditorSelection(
        {
          offsetX,
          offsetY,
          scale: modifiedScale,
          dataHeight,
        },
        editorSelection,
        this.canvasRef.current,
        step,
      );
    }
  }

  render() {
    const {
      width,
      height,
      onPointerDown,
      onWheel,
    } = this.props;

    return (
      <canvas
        ref={ this.canvasRef }
        className="overlay-canvas"
        width={ width }
        height={ height }
        onPointerDown={ onPointerDown }
        onWheel={ onWheel }
        onContextMenu={ e => {
          e.preventDefault();
          return false;
        } }
      />
    );
  }
}

OverlayCanvas.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  onPointerDown: PropTypes.func.isRequired,
  onWheel: PropTypes.func.isRequired,
  offsetX: PropTypes.number.isRequired,
  offsetY: PropTypes.number.isRequired,
  indicatorX: PropTypes.number.isRequired,
  indicatorY: PropTypes.number.isRequired,
  indicatorWidth: PropTypes.number.isRequired,
  indicatorHeight: PropTypes.number.isRequired,
  showIndicator: PropTypes.bool.isRequired,
  scale: PropTypes.number.isRequired,
  dataWidth: PropTypes.number.isRequired,
  dataHeight: PropTypes.number.isRequired,
  isTileEditor: PropTypes.bool.isRequired,
  tileSize: PropTypes.number.isRequired,
  showGrid: PropTypes.bool.isRequired,
  editorSelection: PropTypes.object,
  screenWidth: PropTypes.number.isRequired,
  screenHeight: PropTypes.number.isRequired,
};

OverlayCanvas.defaultProps = {
  editorSelection: null,
};

function mapStateToProps( state ) {
  const { activeNavigationTab } = state.layout;
  let showGrid = false;
  if ( activeNavigationTab === TILE_TAB ) {
    showGrid = state.layout.tileEditor.showGrid;
  }
  else if ( activeNavigationTab === TILEMAP_TAB ) {
    showGrid = state.layout.tilemapEditor.showGrid;
  }
  return {
    showGrid,
    screenWidth: state.project.screen.width,
    screenHeight: state.project.screen.height,
  };
}

export default connect( mapStateToProps )( OverlayCanvas );
