import TodoTask from "./todoTask";
import { createIconButton, createIconifyIcon, Icons } from "./todoAppComponents";
import { format, formatDistance, formatRelative } from 'date-fns'
import createDomEventListener from "./domEventListener";
import { EditTaskModal } from "./todoOverlayModal";
import todoData from "./todoAppData";

class TaskView {
    #task;
    #domElement;
    #listeners;
    #dataElements;

    constructor(task) {
        this.#task = task;
        this.#listeners = [];
        this.#dataElements = {};
        this.#domElement = this.#createDom();
        this.#task.addTaskChangedListener(this.#onTaskChanged);
    }

    get domElement() {
        return this.#domElement;
    }

    dispose() {        
        this.#listeners.forEach((listener) => listener.dispose());
        this.#listeners = null;
        this.#domElement = null;
        this.#task.removeTaskChangedListener(this.#onTaskChanged);
        this.#task = null;
        this.#dataElements = null;
    }

    #createDom() {
        const taskView = document.createElement("div");
        taskView.classList.add("section-task");
        const completeButton = this.#createCompleteButtonMarkup();

        const taskContent = this.#createContentMarkup();
        const editButton = this.#createEditButtonMarkup();

        taskView.appendChild(completeButton);
        taskView.appendChild(taskContent);
        taskView.appendChild(editButton);

        return taskView;
    }

    #createContentMarkup() {
        const task = this.#task;

        const content = document.createElement("div");
        content.classList.add("task-content");

        const title = document.createElement("span");
        title.textContent = task.title;
        title.classList.add("task-title");
        this.#dataElements.title = title;
        content.appendChild(title);

        const description = document.createElement("span");
        description.textContent = task.description;
        description.classList.add("task-description");
        this.#dataElements.description = description;
        content.appendChild(description);

        const dateSpan = document.createElement("span");
        dateSpan.classList.add("task-date");
        const calendarIcon = createIconifyIcon(Icons.Calendar);
        const dateText = document.createElement("span");
        const hasDueDate = task.date != null;
        if (hasDueDate) {
            dateText.textContent = format(task.date, "d MMM");
        }
        else {
            dateText.textContent = "";
        }
        this.#dataElements.date = {};
        this.#dataElements.date.span = dateSpan;
        this.#dataElements.date.text = dateText;

        dateSpan.appendChild(calendarIcon);
        dateSpan.appendChild(dateText);
        dateSpan.classList.toggle("invisible", hasDueDate === false);

        content.appendChild(dateSpan);

        return content;
    }

    #createCompleteButtonMarkup() {
        const task = this.#task;

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

        const listener = function() {
            console.log("Complete task !");
            console.log(this);
            this.#task.done = !this.#task.done;
        }.bind(this);

        const onCompleteListener = createDomEventListener(button, "click", listener);
        this.#listeners.push(onCompleteListener);

        return container;
    }

    #createEditButtonMarkup() {
        const container = document.createElement("div");
        container.classList.add("task-edit-container");

        const editButton = createIconButton(Icons.Edit);
        editButton.classList.add("edit-button", "task");

        // Alternate way of binding callback this
        const onEditCb = function() {
            const editTaskModal = new EditTaskModal(this.#task);
            editTaskModal.taskEdited(({title, description, dueDate, priority}) => {
                this.#task.title = title;
                this.#task.description = description;
                this.#task.date = dueDate;
                this.#task.priority = priority;

                todoData.saveChanges();
            });
            editTaskModal.taskDeleted((task) => {
                task.deleteTask();
                this.#domElement.remove();
                if(this.dispose) {
                    this.dispose();
                }

                todoData.saveChanges();
            });

            editTaskModal.show();
        }.bind(this);

        const onEditListener = createDomEventListener(editButton, "click", onEditCb);
        this.#listeners.push(onEditListener);

        container.appendChild(editButton);

        return container;
    }

    #onTaskChanged = (task) => {
        this.#dataElements.title.textContent = task.title;
        this.#dataElements.description.textContent = task.description;

        // Update date
        const hasDueDate = task.date != null;
        if (hasDueDate) {
            this.#dataElements.date.text.textContent = format(task.date, "d MMM");
        }
        else {
            this.#dataElements.date.text.textContent = "";
        }
        this.#dataElements.date.span.classList.toggle("invisible", hasDueDate === false);
    };
}

export default TaskView;