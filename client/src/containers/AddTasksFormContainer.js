import React , { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shortid from 'shortid';
import { SubmissionError, reduxForm, formValueSelector } from 'redux-form';

import {
  addTempTask,
  closeModal,
  deleteTask,
  postTask,
  setTempTasks,
  toggleModal,
  toggleOnboardMode,
  toggleShouldDelete,
  updateTasks
} from '../actions/indexActions';

import { hasAnyValue, isDuplicate } from '../helpers/validate';
import AddTasksForm from '../components/AddTasksForm';
import RemoteSubmitForm from './RemoteSubmitForm';

let AddTasksFormContainer = class extends Component {
  constructor(props) {
    super(props);
    this.deleteButtonRefs = {};
    // this.getInputRef = this.getInputRef.bind(this);
  }

  // getInputRef(el) { return this.inputRef= el }

  componentDidMount() {
    const {
      isModalActive,
      isOnboardingActive,
      setTempTasks,
      showTasksForSelectedProject,
      tasks
    } = this.props;

    if (showTasksForSelectedProject || (!isOnboardingActive && isModalActive)) {
      setTempTasks(tasks);
    }
  }

  handleAddTask({ taskName }) {
    const { addTempTask, formTasks: tasks, reset } = this.props;
    const taskNames = tasks.map(task => task.taskName);

    if (!hasAnyValue(taskName)) {
      return null;
    }

    if (isDuplicate(taskName, taskNames)) {
      throw new SubmissionError({
        taskName: `A task with the name '${taskName}' already exists`,
      })
    }

    const newTask = {
      taskName,
      key: shortid.generate(),
      recordedTime: 0,
      shortId: shortid.generate(),
      shouldDelete: false
    }

    addTempTask(newTask);
    reset('taskName');
  }

  handleFormSubmit (){
    const {
      closeModal,
      formInputValue,
      isOnboardingActive,
      updateTasks,
      selectedProject,
      toggleOnboardMode,
      formTasks: tasks,
    } = this.props;
    const tasksToSubmit = tasks.filter((task) => !task.shouldDelete);


    const newTasks = (formInputValue && formInputValue.length > 0)
    ? [{
      taskName: formInputValue,
      key: shortid.generate(),
      recordedTime: 0,
      shortId: shortid.generate(),
      shouldDelete: false
    }, ...tasks]
    : tasks;


    if (!tasksToSubmit.length) {
      throw new SubmissionError({
        taskName: 'Please add at least one task'
      })
    }

    updateTasks(selectedProject, newTasks);
    isOnboardingActive ? toggleOnboardMode() : closeModal();
  }

  handleDeleteButtonClick = (taskId) => () => {
    const { toggleShouldDelete } = this.props;

    toggleShouldDelete(taskId);
  }

  handleDeleteButtonMouseOver = (taskId) => () => {
    this.deleteButtonRefs[taskId].focus();
  }

  handleDeleteButtonMouseOut = (taskId) => () => {
    this.deleteButtonRefs[taskId].blur();
  }

renderFormTask (task){
    const { shouldDelete, taskName, shortId } = task;

    return (
      <div className="task-form-list-item" key={shortid.generate()}>
        <div className="button-wrapper" >
          <button
            className={`${shouldDelete ? "task-restore" : "task-delete" } circular-delete`}
            ref={el => this.deleteButtonRefs[shortId] = el}
            onClick={this.handleDeleteButtonClick(shortId)}
            onMouseOver={this.handleDeleteButtonMouseOver(shortId)}
            onMouseOut={this.handleDeleteButtonMouseOut(shortId)}
          >
              { shouldDelete ? "Restore": <div className="icon-close"></div> }
          </button>
        </div>
        <div className="name-wrapper">
          <span>{taskName}</span>
        </div>
      </div>
    );
  }

  render() {
    const { formAnimationName, isModalActive, isOnboardingActive } = this.props;
    return (
      <RemoteSubmitForm
        onTargetUpdate={this.handleFormSubmit.bind(this)}
        >
          <AddTasksForm
            {...this.props}
            childContainerClass={isModalActive ? "form-container onboarding-form": "" }
            handleFormSubmit={/*handleFormSubmit ? handleFormSubmit(formTasks) :*/ this.handleFormSubmit.bind(this)}
            handleTaskSubmit={this.handleAddTask.bind(this)}
            parentContainerClass={isOnboardingActive ? "fullscreen-container": (formAnimationName || "")}
            renderFormTask={this.renderFormTask.bind(this)}
            shouldAutoFocus={isModalActive}
        />
      </RemoteSubmitForm>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { customForm, selectedProjectId, modal, projects } = state;
  const { isModalActive, isOnboardingActive } = modal;
  const formTasks = customForm.taskForm.tasks;

  const selectedProject = projects.items.find(project => project.shortId === selectedProjectId);
  const selectedProjectDatabaseId = selectedProject && selectedProject._id;

  const tasks = selectedProject && (ownProps.showTasksForSelectedProject !== false)
    ? selectedProject.tasks.map(task => Object.assign(task, { shouldDelete: false }))
    : [];

  const selector = formValueSelector('addTasks');
  const formInputValue = selector(state, 'taskName');

  return {
    formInputValue,
    formTasks,
    isModalActive,
    isOnboardingActive,
    selectedProject,
    selectedProjectDatabaseId,
    selectedProjectId,
    tasks,
  }
}


AddTasksFormContainer = reduxForm({
  form: 'addTasks',
})(AddTasksFormContainer);

export default AddTasksFormContainer = connect(mapStateToProps, {
  addTempTask,
  closeModal,
  deleteTask,
  focus,
  postTask,
  setTempTasks,
  toggleModal,
  toggleOnboardMode,
  toggleShouldDelete,
  updateTasks
})(AddTasksFormContainer);

AddTasksFormContainer.propTypes = {
  handleSubmit: PropTypes.func,
  // tasks: PropTypes.array.isRequired,
}
