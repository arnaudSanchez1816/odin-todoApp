import { createIconButton, Icons } from "./todoAppComponents";
import TodoSection from "./todoSection";
import createTaskView from "./todoTaskView";

function createSectionView(section) {
    const sectionView = document.createElement("section");
    sectionView.classList.add("project-section");
    const sectionHeader = createSectionHeaderMarkup(section);

    const tasks = createSectionTasksMarkup(section);

    const addTaskButton = createIconButton(Icons.Plus, "Add task");
    addTaskButton.classList.add("section-add-task");
    addTaskButton.addEventListener("click", (event) => {
        console.log(section.title + ": Add task to section !");
    });

    sectionView.appendChild(sectionHeader);
    sectionView.appendChild(tasks);
    sectionView.appendChild(addTaskButton);

    return sectionView;
}

function createSectionHeaderMarkup(section) {
    const header = document.createElement("header");
    header.classList = ["section-header"];

    const sectionTItle = document.createElement("h2");
    sectionTItle.classList = ["section-title"];
    sectionTItle.textContent = section.title;

    const taskCountSpan = document.createElement("span");
    taskCountSpan.textContent = section.tasksCount.toString();
    taskCountSpan.classList = ["section-tasks-count"];

    const editButton = createIconButton(Icons.Edit);
    editButton.classList.add("edit-button", "section");
    editButton.addEventListener("click", () => {
        console.log("edit section : " + section.title);
    });

    header.appendChild(sectionTItle);
    header.appendChild(taskCountSpan);
    header.appendChild(editButton);

    return header;
}

function createSectionTasksMarkup(section) {
    const tasks = document.createElement("div");
    tasks.classList.add("section-tasks");

    for (const task of section.tasks) {
        const taskView = createTaskView(task);
        tasks.appendChild(taskView);
    }

    return tasks;
}

export default createSectionView;