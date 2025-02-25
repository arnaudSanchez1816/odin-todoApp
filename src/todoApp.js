import TodoProject from "./todoProject";
import { addDays } from "date-fns";
import EventEmitter from "events";
import { loadProjects, saveProjects } from "./todoAppSerializer";

const projects = loadProjects();
const appEvents = new EventEmitter();

if(projects.length === 0) {
    const demoProject = createDemoProject();
    projects.push(demoProject);
}

function createDemoProject() {
    const demoProject = new TodoProject("Demo project");

    const codingSection = demoProject.createSection("Coding");
    const workoutSection = demoProject.createSection("Workout");

    const todoAppTask = codingSection.addTask("Todo app", "Finish the todo app project");
    const odinTask = codingSection.addTask("Odin", "Continue odin project course");

    const workoutTask = workoutSection.addTask("Go back to the gym");
    let workoutDueDate = new Date(Date.now());
    workoutDueDate = addDays(workoutDueDate, 3);
    workoutTask.date = workoutDueDate;

    projects.push(demoProject);

    return demoProject;
}

function getProjects() {
    return [...projects];
}

function addProject(title) {
    const project = new TodoProject(title);

    projects.push(project);

    return project;
}

const todoApp = {
    getProjects,
    addProject
};

export default todoApp;