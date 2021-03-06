import React from 'react';
import PropTypes from 'prop-types';

import './Spinner.css';

const Spinner = props => {
  const {
    size,
    borderWidth,
    r,
    g,
    b,
  } = props;

  const containerStyles = {
    width: size,
    height: size,
    boxSizing: 'border-box',
  };

  const transparentColor = `rgba(${ r }, ${ g }, ${ b }, 0.2)`;
  const solidColor = `rgb(${ r }, ${ g }, ${ b })`;

  const spinnerStyles = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: `${ borderWidth } solid white`,
    animation: 'spin 1.2s linear infinite',
    borderTop: `${ borderWidth } solid ${ transparentColor }`,
    borderRight: `${ borderWidth } solid ${ transparentColor }`,
    borderBottom: `${ borderWidth } solid ${ transparentColor }`,
    borderLeft: `${ borderWidth } solid ${ solidColor }`,
    boxSizing: 'border-box',
  };

  return (
    <div className="spinner" style={ containerStyles }>
      <div className="spinner-wheel" style={ spinnerStyles } />
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.string,
  borderWidth: PropTypes.string,
  r: PropTypes.string,
  g: PropTypes.string,
  b: PropTypes.string,
};

Spinner.defaultProps = {
  size: '32px',
  borderWidth: '4px',
  r: '114',
  g: '202',
  b: '126',
};

export default Spinner;
