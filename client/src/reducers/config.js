import * as actions from '../actions/indexActions';

const defaultState = {
  alarmSoundSrc: 'sound/endSound-quiet.mp3'
}

export function config(state=defaultState, action) {
  switch(action.type) {
    case actions.UPDATE_CONFIG:
      return action.newConfigData
    default:
      return state;
  }
}
