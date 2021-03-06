
import React from 'react';

import Property from '../Property/Property';
import Method from '../Method/Method';

import './Font.css';

class Font extends React.Component {
  render() {
    return (
      <div className="api-font">
        <div className="description">
          {
`
Represents a font. Data is stored similarly to tilesets in an array,
with the ability to remap characters that have a unicode point larger than the array can hold.
`
          }
        </div>
        <h2>Properties</h2>
        <Property
          name="font.charData"
          type="object"
          description={
`
Object mapping unicode points to character information.
Used for changing a characters size or remapping unicode points larger than what fits on the tile sheet.
`
          }
        />
        <Property
          name="font.data"
          type="Uint8ClampedArray"
          description={
`
Uint8ClampedArray of the tile sheet data. Generated by the constructor.
`
          }
        />
        <Property
          name="font.height"
          type="number"
          description={
`
The number of rows in the tile sheet
`
          }
        />
        <Property
          name="font.letterSpacing"
          type="number"
          description={
`
Number of pixels between each character.
`
          }
        />
        <Property
          name="font.originX"
          type="number"
          description={
`
The x origin in pixels of the character relative to the bottom left.
`
          }
        />
        <Property
          name="font.originY"
          type="number"
          description={
`
The y origin in pixels of the character relative to the bottom left.
`
          }
        />
        <Property
          name="font.standardWidth"
          type="number"
          description={
`
The standard width for a character. Used as the default if none is specified for a character.
`
          }
        />
        <Property
          name="font.tileSize"
          type="number"
          description={
`
The tile size of the tile sheet where the characters are drawn.
`
          }
        />
        <Property
          name="font.width"
          type="number"
          description={
`
The number of columns in the tile sheet
`
          }
        />
        <h2>Methods</h2>
        <Method
          name="font.baseIndexForChar"
          description={
`
Get the base index in the data array for the character
`
          }
          params={
            [
              {
                name: 'charCode',
                type: 'number',
                description: 'the unicode point for the character',
              },
            ]
          }
        />
        <Method
          name="font.widthForChar"
          description={
`
Get the width of a character
`
          }
          params={
            [
              {
                name: 'charCode',
                type: 'number',
                description: 'the unicode point for the character',
              },
            ]
          }
        />
      </div>
    );
  }
}

export default Font;
