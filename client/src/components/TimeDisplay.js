import React from 'react';
import PropTypes from 'prop-types';
import CircularProgressbar from 'react-circular-progressbar';

import { secondsToMSS } from '../helpers/time'
import { showProgressBar, devStyle } from '../config/devSettings'

import EditInlineText from '../containers/EditInlineText';

export default function TimeDisplay(props) {
  const {
    handleButtonClick,
    isTimerActive,
    isTimerControlActive,
    setStartTime,
    startCount,
    title,
    time
  } = props;

  const progressPercentage = Math.round((1-(time/startCount))*100);
  let displayTime = time || startCount;

  const flippedClass = isTimerActive ? "flip-button flipped" : "flip-button";

  return (
    <div className="timer">
      <div className="progress-bar-container"></div>
      {showProgressBar && <CircularProgressbar
        initialAnimation={true}
        percentage={progressPercentage}
        strokeWidth={4}
        textForPercentage={(pct)=> ""}
      />}
      <div>{title}</div>
      <div style={devStyle || null} className="timer-content">
         <EditInlineText
            className={`edit-time`}
            handleChange={setStartTime}
            text={secondsToMSS(displayTime)}
         />
        <div
          className={`timer-control `}
          onClick={isTimerControlActive && handleButtonClick}
        >
        <div className={`${isTimerActive? "icon-stop-rounded" : "icon-play-rounded"}`}></div>
      </div>
    </div>
  </div>
  );
}

TimeDisplay.propTypes = {
  title: PropTypes.string,
  time: PropTypes.number
}
