import TodoProject from "./todoProject";
import { addDays } from "date-fns";
import EventEmitter from "events";
import { loadProjects, saveProjects } from "./todoAppSerializer";
import Priorities from "./todoPriorities";

const PROJECT_CREATED_EVENT = "projectCreated";
const PROJECT_DELETED_EVENT = "projectDeleted";

const projects = loadProjects();
const appEvents = new EventEmitter();

if(projects.length === 0) {
    const demoProject = createDemoProject();
    projects.push(demoProject);
}

function createDemoProject() {
    const demoProject = new TodoProject("Demo project");

    const codingSection = demoProject.addSection("Coding");
    const workoutSection = demoProject.addSection("Workout");

    const todoAppTask = codingSection.addTask("Todo app", "Finish the todo app project", null, Priorities.Highest);
    todoAppTask.done = true;
    const odinTask = codingSection.addTask("Odin", "Continue the odin project course", null, Priorities.Medium);

    const workoutTask = workoutSection.addTask("Leg day");
    let workoutDueDate = new Date(Date.now());
    workoutDueDate = addDays(workoutDueDate, 3);
    workoutTask.date = workoutDueDate;

    return demoProject;
}

function getProjects() {
    return [...projects];
}

function addProject(title) {
    const project = new TodoProject(title);

    projects.push(project);

    appEvents.emit(PROJECT_CREATED_EVENT, project);

    return project;
}

function deleteProject(projectToDelete) {
    const index = projects.indexOf(projectToDelete);
    if(index >= 0) {
        projects.splice(index, 1);
        appEvents.emit(PROJECT_DELETED_EVENT, projectToDelete);
    }
}

function addProjectCreatedListener(func) {
    appEvents.on(PROJECT_CREATED_EVENT, func);
}

function removeProjectCreatedListener(func) {
    appEvents.removeListener(PROJECT_CREATED_EVENT, func);
}

function addProjectDeletedListener(func) {
    appEvents.on(PROJECT_DELETED_EVENT, func);
}

function removeProjectDeletedListener(func) {
    appEvents.removeListener(PROJECT_DELETED_EVENT, func);
}

function saveChanges() {

}

const todoData = {
    getProjects,
    addProject,
    deleteProject,
    addProjectCreatedListener,
    removeProjectCreatedListener,
    addProjectDeletedListener,
    removeProjectDeletedListener,
    saveChanges
};

export default todoData;