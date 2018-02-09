// refactor to presentaional Component
// assign button classes from container
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import callOnTargetUpdate from '../hocs/callOnTargetUpdate';

import Input from './Input';
import List from './List';

let AddTasksForm = class extends Component {
  render() {
    const {
      childContainerClass,
      fieldAnimationName,
      formTasks,
      handleFormSubmit,
      handleSubmit,
      handleTaskSubmit,
      isOnboardingActive,
      parentContainerClass,
      renderFormTask,
      shouldRenderSubmitButton,
      shouldAutoFocus,
      submitButtonText,
      title,
      titleAnimationName,
      titleName
    } = this.props;

    return (
    <div className={parentContainerClass}>
      <div className={childContainerClass}>
          {title &&
            <h2 className={`form-title ${isOnboardingActive ? (titleAnimationName || "") : ""}`}>
              {title}
              {titleName && <span className='grey-title-text'>{titleName}</span>}
            </h2>
          }
          <div className={`form-field-wrapper ${isOnboardingActive ? (fieldAnimationName || "") : ""}`}>
            <label htmlFor="taskName">Tasks</label>
            <List className={` ${isOnboardingActive ? '' : 'normal-modal-form-task-list'} form-task-list`} items={formTasks} renderItem={renderFormTask} />
            <form className="add-tasks-form" autoComplete="off" onSubmit={handleSubmit(handleTaskSubmit)}>
             <Field
               component={Input}
               name="taskName"
               placeholder="Add Tasks"
               inputRef={this.inputRef}
               shouldAutoFocus={shouldAutoFocus}
             />
            </form>
          </div>
        </div>
      {!(shouldRenderSubmitButton === false) &&
        <button className={`${isOnboardingActive ? 'fade-in-medium-delay' : 'fade-in-short-delay'} outline-button modal-button-bottom-right`} onClick={handleSubmit(handleFormSubmit)}>{submitButtonText || "Finish"}</button>
      }
    </div>
    );
  }
}

const targetInfo = props => {
  return {
    targetValue: "ADD_TASKS",
    targetPropKey: "remoteSubmitForm"
  }
}

const onTargetUpdate = props => {
  const { handleSubmit, onTargetUpdate } = props;
    handleSubmit(onTargetUpdate)();
}

export default AddTasksForm = callOnTargetUpdate(targetInfo, onTargetUpdate)(AddTasksForm);

AddTasksForm.propTypes = {
  handleFormSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  tasks: PropTypes.array
}
