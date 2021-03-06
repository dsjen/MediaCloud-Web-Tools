import PropTypes from 'prop-types';
import React from 'react';

const DEFAULT_WIDTH = 48.767;
const DEFAULT_HEIGHT = 51.038;
const SCALE = DEFAULT_WIDTH / DEFAULT_HEIGHT;

const FocusIcon = (props) => {
  const height = props.height || DEFAULT_HEIGHT;
  const width = height * SCALE;
  return (
    <div className="app-icon app-icon-large app-icon-focus">
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width={`${width}px`} height={`${height}px`} viewBox="0 0 48.767 51.038" enableBackground="new 0 0 48.767 51.038" xmlSpace="preserve">
        <g>
          <path d="M48.327,48.477L34.264,34.415c3.688-3.649,5.979-8.708,5.979-14.293C40.242,9.026,31.216,0,20.121,0S0,9.026,0,20.122 c0,11.095,9.026,20.121,20.121,20.121c4.428,0,8.514-1.455,11.84-3.889l14.245,14.244c0.293,0.293,0.677,0.439,1.061,0.439 s0.768-0.146,1.061-0.439s0.439-0.677,0.439-1.061S48.62,48.77,48.327,48.477z M3,20.122C3,10.681,10.681,3,20.121,3 s17.121,7.681,17.121,17.122c0,9.44-7.681,17.121-17.121,17.121S3,29.562,3,20.122z" />
          <path d="M29.06,12.7H11.183c-0.828,0-1.5,0.672-1.5,1.5s0.672,1.5,1.5,1.5H29.06c0.828,0,1.5-0.672,1.5-1.5S29.888,12.7,29.06,12.7 z" />
          <path d="M29.06,18.622H11.183c-0.828,0-1.5,0.672-1.5,1.5s0.672,1.5,1.5,1.5H29.06c0.828,0,1.5-0.672,1.5-1.5 S29.888,18.622,29.06,18.622z" />
          <path d="M20.121,24.544h-8.938c-0.828,0-1.5,0.672-1.5,1.5s0.672,1.5,1.5,1.5h8.938c0.828,0,1.5-0.672,1.5-1.5 S20.949,24.544,20.121,24.544z" />
        </g>
      </svg>
    </div>
  );
};

FocusIcon.propTypes = {
  height: PropTypes.number,
};

export default FocusIcon;
