import TodoProject from "./todoProject";
import { addDays } from "date-fns";
import EventEmitter from "events";
import { loadProjects, saveProjects } from "./todoAppSerializer";
import Priorities from "./todoPriorities";

const PROJECT_CREATED_EVENT = "projectCreated";

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
    const odinTask = codingSection.addTask("Odin", "Continue odin project course", null, Priorities.Medium);

    const workoutTask = workoutSection.addTask("Go back to the gym");
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

function addProjectCreatedListener(func) {
    appEvents.on(PROJECT_CREATED_EVENT, func);
}

function removeProjectCreatedListener(func) {
    appEvents.removeListener(PROJECT_CREATED_EVENT, func);
}

function saveChanges() {

}

const todoData = {
    getProjects,
    addProject,
    addProjectCreatedListener,
    removeProjectCreatedListener,
    saveChanges
};

export default todoData;