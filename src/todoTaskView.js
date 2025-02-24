import TodoTask from "./todoTask";
import { createIconButton, createIconifyIcon, Icons } from "./todoAppComponents";
import { format, formatDistance, formatRelative } from 'date-fns'
import { formatRelativeWithOptions } from "date-fns/fp";

function createTaskView(task) {
    const taskView = document.createElement("div");
    taskView.classList.add("section-task");
    const completeButton = createTaskCompleteButtonMarkup((event) => {
        console.log("complete task !");
    });

    const taskContent = createTaskContentMarkup(task);
    const editButton = createTaskEditButtonMarkup((event) => {
        console.log("edit task !");
        
    });

    taskView.appendChild(completeButton);
    taskView.appendChild(taskContent);
    taskView.appendChild(editButton);

    return taskView;
}

function createTaskContentMarkup(task) {
    const content = document.createElement("div");
    content.classList.add("task-content");

    const title = document.createElement("span");
    title.textContent = task.title;
    title.classList.add("task-title");
    content.appendChild(title);

    const description = document.createElement("span");
    description.textContent = task.description;
    description.classList.add("task-description");
    content.appendChild(description);

    const dateSpan = document.createElement("span");
    dateSpan.classList.add("task-date");
    const calendarIcon = createIconifyIcon(Icons.Calendar);
    const dateText = document.createElement("span");
    const hasDueDate = task.date != null;
    if(hasDueDate) {
        dateText.textContent = format(task.date, "d MMM");
    }
    else {
        dateText.textContent = "";
    }
    dateSpan.appendChild(calendarIcon);
    dateSpan.appendChild(dateText);
    dateSpan.classList.toggle("invisible", hasDueDate === false);

    content.appendChild(dateSpan);

    return content;
}

function createTaskCompleteButtonMarkup(callback) {
    const container = document.createElement("div");
    container.classList = ["task-complete-button-container"];

    const button = document.createElement("button");
    button.classList = ["task-complete-button"];
    button.type = "button";
    const circleIcon = createIconifyIcon(Icons.Circle);
    const checkIcon = createIconifyIcon(Icons.Check);
    checkIcon.classList.add("task-complete-check");

    button.appendChild(circleIcon);
    button.appendChild(checkIcon);
    container.appendChild(button);

    button.addEventListener("click", (event) => {
        if(callback) {
            callback(event);
        }
    });

    return container;
}

function createTaskEditButtonMarkup(callback) {
    const container = document.createElement("div");
    container.classList.add("task-edit-container");

    const editButton = createIconButton(Icons.Edit);
    editButton.classList.add("edit-button", "task");
    editButton.addEventListener("click", (event) => {
        if(callback) {
            callback(event);
        }
    });
    container.appendChild(editButton);

    return container;
}

export default createTaskView;