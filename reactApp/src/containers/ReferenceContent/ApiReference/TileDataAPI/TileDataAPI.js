
import React from 'react';

import Property from '../Property/Property';
import Method from '../Method/Method';

import './TileDataAPI.css';

class TileDataAPI extends React.Component {
  render() {
    return (
      <div className="api-tile-data">
        <div className="description">
          {
`
Holds all of the tile data.
`
          }
        </div>
        <h2>Properties</h2>
        <Property
          name="tileData.data"
          type="Uint8ClampedArray"
          description={
`
All of the tile data in a single Uint8ClampedArray. This is whats used by Screen to draw tiles.
`
          }
        />
        <Property
          name="tileData.tileSize"
          type="number"
          description={
`
The size of each tile in pixels. Used for both width and height.
`
          }
        />
        <Property
          name="tileData.tilesets"
          type="[object]"
          description={
`
Array of tileset data. All tiledata is added to this.data when init is called.
More tilesets can not be added after this.
`
          }
        />
        <h2>Methods</h2>
        <Method
          name="tileData.addTileset"
          description={
`
Add a tileset. All tilesets must be added before init is called.
`
          }
          params={
            [
              {
                name: 'tileset',
                type: 'object',
                description: 'the tileset data',
              },
            ]
          }
        />
        <Method
          name="tileData.getGid"
          description={
`
Get the GID for a tile
`
          }
          params={
            [
              {
                name: 'x',
                type: 'number',
                description: 'x position of the tile',
              },
              {
                name: 'y',
                type: 'number',
                description: 'y position of the tile',
              },
              {
                name: 'tileset',
                type: 'number',
                description: 'the index of the tileset',
              },
            ]
          }
          example={
`
const playerTile = tileData.getGid(
  2,    // x
  4,    // y
  0     // tileset index
);
`
          }
        />
        <Method
          name="tileData.getTileSectionData"
          description={
`
Get the pixel data for a section of the tileset. Returns an object that contains the following:
data: the array of pixel data
width: the width in pixels of the data
height: the height in pixels of the data.
`
          }
          params={
            [
              {
                name: 'gid',
                type: 'number',
                description: 'The gid of the bottom left tile in the tile section',
              },
              {
                name: 'tileWidth',
                type: 'number',
                description: 'The width in tiles of the section',
              },
              {
                name: 'tileHeight',
                type: 'number',
                description: 'The height in tiles of the section',
              },
            ]
          }
          example={
`
const sectionData = tileData.getTileSectionData(
  1,    // gid
  2,    // tile section width
  2     // tile section height
);

const { data, width, height } = sectionData;
`
          }
        />
        <Method
          name="tileData.init"
          description={
`
Parse all of the tilesets and add them to the data array.
Called automatically by the Engine.
`
          }
        />
      </div>
    );
  }
}

export default TileDataAPI;
