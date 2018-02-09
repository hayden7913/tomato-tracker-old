import  * as actions from '../actions/indexActions'
import { alphaSortByProp, shiftElementsUp, shiftElementsDown } from '../helpers/customImmutable';

function tasks(state, action) {
  switch(action.type) {
    case actions.UPDATE_TASKS:
      return state.mapAndFindById('shortId', action.projectId, (project) => {
        return Object.assign({}, project, { tasks: action.newTasks })
      });
    case actions.POST_TASK_SUCCESS:
      return state.mapAndFindById('_id', action.projectId, (project) => {
        const newTasks = project.tasks.mapAndFindById('shortId', action.taskId, (task) => {
          return Object.assign({}, task, { _id: action.databaseId });
        });

        return Object.assign({}, project, { tasks: newTasks });
      });
    case actions.DELETE_TASK_REQUEST:
      return state.mapAndFindById('shortId', action.projectId, (project) => {
        const deleteIndex = project.tasks.findIndex(task => task['shortId'] === action.taskId);
        const newTasks = project.tasks.sliceDelete(deleteIndex);

        return Object.assign({}, project, { tasks: newTasks })
      });
    case actions.INCREMENT_TASK_TIME:
      return state.mapAndFindById('shortId', action.projectId, (project) => {
        const newTasks = project.tasks.mapAndFindById('shortId', action.taskId, (task) => {
          return Object.assign({}, task, { recordedTime: task.recordedTime + 1 });
        });

        return Object.assign({}, project, { tasks: newTasks });
      });
    case actions.EDIT_TASK_REQUEST:
      return state.mapAndFindById('shortId', action.projectId, (project) => {
        const newTasks = project.tasks.mapAndFindById('shortId', action.taskId, (task) => {

          return Object.assign({}, task, action.toUpdate);
        });
        return Object.assign({}, project, { tasks: newTasks });
      });
    case actions.TOGGLE_SELECTED:
      return state.mapAndFindById('shortId', action.projectId, (project) => {
        const newTasks = project.tasks.mapAndFindById('shortId', action.taskId, (task) => {
          return Object.assign({}, task, { isSelected: !task.isSelected });
        });
        return Object.assign({}, project, { tasks: newTasks });
      });
    case actions.MOVE_TASKS:
      const { activeTasks, key, selectedProjectId, startIndex, endIndex } = action;
      let newTasks;

      return state.mapAndFindById('shortId', selectedProjectId, (project) => {
        if (key === 'ARROW_DOWN') {
          newTasks =  shiftElementsUp(activeTasks, startIndex, endIndex);
        }

        if (key === 'ARROW_UP') {
          newTasks  = shiftElementsDown(activeTasks, startIndex, endIndex);
        }

        return Object.assign({}, project, { tasks: newTasks });
      });
    default:
    return state;
  }
}

const defaultState = {
  hasFetched: false,
  isFetching: false,
  items: [],
  queue: null
}

export function projects(state=defaultState, action) {
  switch(action.type) {
    case "CHANGE_ACTIVE_EDIT_MENU":
    return {
      ...state,
      activeContextMenuId: action.activeMenuId
    }
    case actions.TOGGLE_FETCHING:
    return {
      ...state,
      isFetching: !state.isFetching,
    }
    case actions.FETCH_PROJECTS_SUCCESS:
      return {
        ...state,
        items: action.projects,
        hasFetched: true,
        isFetching: false
      }
    case actions.POST_PROJECT_REQUEST:
      const newProjects = [action.project, ...state.items,];
      const sortedProjects = alphaSortByProp(newProjects, 'projectName');

      return {
        ...state,
        items: sortedProjects,
      }
    case actions.POST_PROJECT_SUCCESS:
      return {
        ...state,
        items: state.items.mapAndFindById('shortId', action.projectId, (project) => {
          return Object.assign({}, project, { _id: action.databaseId })
        })
      }
    case actions.EDIT_PROJECT_NAME_REQUEST:
      return {
        ...state,
        items: state.items.mapAndFindById('shortId', action.projectId, (project) => {
          return Object.assign({}, project, { projectName: action.projectName })
        })
      }
    case actions.DELETE_PROJECT_REQUEST:
      const projectIndex = state.items.findIndex(project => project.shortId === action.project.shortId);

      return {
        ...state,
        items: state.items.sliceDelete(projectIndex)
      }
    case actions.QUEUE_NEW_PROJECT:
      return {
        ...state,
        queue: action.projectName
      }
    case actions.DELETE_TASK_REQUEST:
    case actions.EDIT_TASK_REQUEST:
    case actions.INCREMENT_TASK_TIME:
    case actions.MOVE_TASKS:
    case actions.POST_TASK_SUCCESS:
    case actions.TOGGLE_SELECTED:
    case actions.UPDATE_TASKS:
      return {
        ...state,
        items: tasks(state.items, action)
      }
    default:
    return state;
  }
}
