import shortid from 'shortid';
import { projectsUrl } from '../constants/endpointConstants';
import { filterConsec, findIndices } from '../helpers/customImmutable';

export const ADD_PROJECT = 'ADD_PROJECT';

export function addProject(projectName) {
  const newProject = {
    projectName,
    tasks: [],
    shortId: shortid.generate()
  };

  return {
    type: 'ADD_PROJECT',
    project: newProject
  };
}

export const EDIT_PROJECT_NAME_REQUEST = 'EDIT_PROJECT_NAME_REQUEST';

export function updateProjectNameRequest(projectId, projectName) {
  return {
    type: 'EDIT_PROJECT_NAME_REQUEST',
    projectId,
    projectName
  };
}

export const QUEUE_NEW_PROJECT = 'QUEUE_NEW_PROJECT';

export function queueNewProject(projectName) {
  return {
    type: 'QUEUE_NEW_PROJECT',
    projectName
  };
}

export const EDIT_TASK_REQUEST = 'EDIT_TASK_REQUEST';

export function editTask(projectId, taskId, toUpdate) {
  return {
    type: 'EDIT_TASK_REQUEST',
    projectId,
    taskId,
    toUpdate
  };
}

export const UPDATE_TASKS = 'UPDATE_TASKS';

export function updateTasksInState(projectId, newTasks) {
  return {
    type: 'UPDATE_TASKS',
    projectId,
    newTasks
  };
}

export const SET_SELECTED_PROJECT = 'SET_SELECTED_PROJECT';

export function setSelectedProject(projectId) {
  return (dispatch) => {
    dispatch({
      type: 'SET_SELECTED_PROJECT',
      projectId
    });

    localStorage.selectedProjectId = projectId;
  };
}

export const DELETE_TASK_REQUEST = 'DELETE_TASK_REQUEST';

export function deleteTaskRequest(projectId, taskId) {
  return {
    type: 'DELETE_TASK_REQUEST',
    projectId,
    taskId
  };
}

export const MOVE_TASKS = 'MOVE_TASKS';
export const moveCardsKeyboard = (key) => {
  return (dispatch, getState) => {
    const { selectedProjectId, projects } = getState();
    const activeTasks = projects.items.find(project => project.shortId === selectedProjectId).tasks;
    let selectedIndices = findIndices(activeTasks, (task) => task.isSelected);
    let startIndex,
      endIndex;

    if (selectedIndices.length > 1) {
      selectedIndices = filterConsec(selectedIndices);
      startIndex = selectedIndices[0];
      endIndex = selectedIndices[selectedIndices.length - 1];
    } else {
      startIndex = endIndex = selectedIndices[0];
    }

    if (startIndex == undefined) {
      console.error('move indices undefined');
      return null;
    }

    return dispatch({
      type: 'MOVE_TASKS',
      activeTasks,
      key,
      selectedProjectId,
      startIndex,
      endIndex,
    });
  };
};

export const POST_PROJECT_REQUEST = 'POST_PROJECT_REQUEST';

export function postProjectRequest(project) {
  return {
    type: 'POST_PROJECT_REQUEST',
    project
  };
}

export const POST_PROJECT_SUCCESS = 'POST_PROJECT_SUCCESS';

export function postProjectSuccess(projectId, databaseId) {
  return {
    type: 'POST_PROJECT_SUCCESS',
    projectId,
    databaseId,
  };
}

export const POST_TASK_SUCCESS = 'POST_TASK_SUCCESS';

export function postTaskSuccess(projectId, taskId, databaseId) {
  return {
    type: 'POST_TASK_SUCCESS',
    projectId,
    taskId,
    databaseId,
  };
}

export const FETCH_PROJECTS_SUCCESS = 'FETCH_PROJECTS_SUCCESS';
export const fetchProjectsSuccess = (projects) => ({
  type: 'FETCH_PROJECTS_SUCCESS',
  projects,
});

export const SET_SELECTED_TASK_ID = 'SET_SELECTED_TASK_ID';

export const setSelectedTaskId = (taskId, options = {}) => (dispatch) => {
  localStorage.setItem('prevSelectedTaskId', taskId);
  return dispatch({
    type: 'SET_SELECTED_TASK_ID',
    taskId,
    playSound: options.playSound,
  });
};

export const TOGGLE_FETCHING = 'TOGGLE_FETCHING';

export function fetchProjects() {
  return (dispatch) => {
    dispatch({ type: 'TOGGLE_FETCHING' });

    return fetch(projectsUrl)
      .then((res) => {
        return res.json();
      })
      .then(data => {
        dispatch(fetchProjectsSuccess(data.projects));
      })
      .catch((err) => {
        console.log(err);
      });
  };
}

export const TOGGLE_SELECTED = 'TOGGLE_SELECTED';
export const TOGGLE_SELECTED_MULTIPLE = 'TOGGLE_SELECTED_MULTIPLE';
export const toggleSelected = (projectId, taskId, shouldToggleMultiple) => {
  return (dispatch, getState) => {
    if (shouldToggleMultiple) {
      // this line needs to be updated
      const tasks = getState().listOne.tasks;
      let selectedCardIndices = findIndices(tasks, (task) => task.isSelected);
      selectedCardIndices = [...selectedCardIndices, taskId].sort((a, b) => a - b);

      const startIndex = selectedCardIndices[0];
      const endIndex = selectedCardIndices[selectedCardIndices.length - 1];

      return dispatch({
        type: 'TOGGLE_SELECTED_MULTIPLE',
        startIndex,
        endIndex,
      });
    }

    return dispatch({ type: 'TOGGLE_SELECTED', projectId, taskId });
  };
};

export function postProject(projectName, tasks) {
  return (dispatch) => {

    const newProject = {
      projectName,
      shortId: shortid.generate(),
      tasks: tasks || [],
    };

    dispatch(postProjectRequest(newProject));

    fetch(
      'projects',
      {
        method: 'POST',
        body: JSON.stringify(newProject),
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        })
      })
      .then((res) => {
        return res.json();
      })
      .then(project => {
        // add database Ids to projects and tasks
        dispatch(postProjectSuccess(project.shortId, project._id));
        project.tasks.forEach(task => {
          dispatch(postTaskSuccess(project._id, task.shortId, task._id));
        });

        localStorage.selectedProjectId = project.shortId;
      });
  };
}


export function postProjectWithTasks(tasks) {
  return (dispatch, getState) => {
    //dispatch(submit('addProjectForm')).then(() => console.log('hello'))

    // const newProjectName = getState().projects.queue;
    // console.log(newProjectName);
    // console.log(tasks)
    // dispatch(postProject(newProjectName, tasks));
  };
}

const deleteSavedTasks = (dispatch, selectedProject, tasks) => {
  // delete tasks that do not already exist in the database
  // we assume that tasks with an undefined '_id' propery do not yet exist in the database

  tasks.filter((task) => task.shouldDelete && task._id)
    .forEach((task) => dispatch(deleteTask(selectedProject, task)));

};

const postUnsavedTasks = (dispatch, selectedProjectDatabaseId, tasks) => {
  // post tasks that do not already exist in the database
  // we assume that taks without the database created id '_id' do not yet exist in the database
  tasks.filter((task) => !task._id)
    .forEach((task) => {
      selectedProjectDatabaseId
        ? dispatch(postTask(selectedProjectDatabaseId, task))
        : console.error('database id has not yet updated');
    });
};

export function updateTasks(selectedProject, tasks) {
  return (dispatch, getState) => {
    const tasksToSubmit = tasks.filter((task) => !task.shouldDelete);

    dispatch(updateTasksInState(selectedProject.shortId, tasksToSubmit));

    postUnsavedTasks(dispatch, selectedProject._id, tasksToSubmit);
    deleteSavedTasks(dispatch, selectedProject, tasks);
  };
}

export function updateProjectName(project, newName) {
  return (dispatch) => {

    dispatch(updateProjectNameRequest(project.shortId, newName));

    fetch(
      `${projectsUrl}/${project._id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ projectName: newName, }),
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        })
      });
  };
}

export function postTask(projectId, task) {
  return (dispatch) => {
    fetch(
      `${projectsUrl}/${projectId}`,
      {
        method: 'POST',
        body: JSON.stringify(task),
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        })
      })
      .then((res) => {
        return res.json();
      })
      .then(data => {
        const taskId = data.shortId;
        const databaseId = data._id;

        dispatch(postTaskSuccess(projectId, taskId, databaseId));
      })
      .catch(err => {
        console.error(err);
      });
  };
}

export function updateTask(project, task, toUpdate) {
  return (dispatch) => {
    dispatch(editTask(project.shortId, task.shortId, toUpdate));

    fetch(
      `${projectsUrl}/${project._id}/tasks/${task._id}`,
      {
        method: 'PUT',
        body: JSON.stringify(toUpdate),
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        })
      });
  };
}


export const DELETE_PROJECT_REQUEST = 'DELETE_PROJECT_REQUEST';

export function deleteProject(project) {
  return (dispatch) => {
    dispatch({
      type: 'DELETE_PROJECT_REQUEST',
      project
    });

    fetch(
      `${projectsUrl}/${project._id}`,
      {
        method: 'DELETE',
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        })
      });
  };
}

export function deleteTask(project, task, shouldUpdateLocalState) {
  return (dispatch) => {
    if (shouldUpdateLocalState) {
      dispatch(deleteTaskRequest(project.shortId, task.shortId));
    }

    fetch(
      `${projectsUrl}/${project._id}/tasks/${task._id}`,
      {
        method: 'DELETE',
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        })
      });
  };
}
