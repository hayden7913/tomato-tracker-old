import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InlineEdit from 'react-edit-inline';

import { timeStringToSeconds } from '../helpers/time';

export default class TopNavbarEditableText extends Component {
  constructor() {
    super();
    
    this.state = {
      message: 'Click to Edit'
    };

    this.dataChanged = this.dataChanged.bind(this);
  }
  
  dataChanged(data) {
    const { handleChange } = this.props;
    
    handleChange(data.message);
  }

  customValidateText(text) {
    if (timeStringToSeconds(text) === 'NAN_ERROR') {
      return false
    }
    
    if (text.length < 0 && text.length > 64)  {
      return false;
    }
    
    return true;
  }

  render() {
    const { className, text } = this.props;

    return (
        <InlineEdit
          validate={this.customValidateText}
          className={className}
          activeClassName="editing"
          text={text || ''}
          paramName="message"
          change={this.dataChanged}
          style={{
            minWidth: 150,
            display: 'inline-block',
            margin: '13px 10px',
            padding: 0,
            border: 0,
          }}
        />
      );
  }
}

TopNavbarEditableText.propTypes = {
  handleChange: PropTypes.func,
  text: PropTypes.string,
};
