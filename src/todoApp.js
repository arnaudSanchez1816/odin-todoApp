import TodoProject from "./todoProject";
import { addDays } from "date-fns";

const projects = [];

projects.push(new TodoProject("Test project"));


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

export { createDemoProject }