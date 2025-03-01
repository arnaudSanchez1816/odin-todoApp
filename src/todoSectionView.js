import createDomEventListener from "./domEventListener";
import { createIconButton, Icons } from "./todoAppComponents";
import todoData from "./todoAppData";
import { CreateTaskModal, EditSectionModal } from "./todoOverlayModal";
import TodoSection from "./todoSection";
import TodoTask from "./todoTask";
import TaskView from "./todoTaskView";

class SectionView {
    #section;
    #domElement;
    #tasksDomContainer;
    #taskViews;
    #listeners;
    #dataDomElements;

    /**
     * 
     * @param {TodoSection} section 
     */
    constructor(section) {
        this.#section = section;
        this.#listeners = [];
        this.#taskViews = [];
        this.#dataDomElements = {};

        this.#domElement = this.#createDom(section);

        this.#section.addTaskAddedListener(this.#onTaskAdded);
        this.#section.addTaskRemovedListener(this.#onTaskRemoved);
        this.#section.addSectionChangedListener(this.#onSectionChanged);
    }

    get section() {
        return this.#section;
    }

    get domElement() {
        return this.#domElement;
    }

    dispose() {
        this.#section.removeTaskAddedListener(this.#onTaskAdded);
        this.#section.removeTaskRemovedListener(this.#onTaskRemoved);
        this.#section.removeSectionChangedListener(this.#onSectionChanged);

        this.#listeners.forEach((item) => item.dispose());
        this.#taskViews.forEach((view) => view.dispose());

        this.#taskViews = null;
        this.#listeners = null;
        this.#section = null;
        this.#domElement = null;
        this.#dataDomElements = null;
    }

    /**
     * 
     * @param {TodoSection} section 
     * @returns {HTMLElement}
     */
    #createDom(section) {
        const sectionView = document.createElement("section");
        sectionView.classList.add("project-section");
        const sectionHeader = this.#createSectionHeaderMarkup(section);

        const tasks = this.#createSectionTasksMarkup(section);

        const addTaskButton = createIconButton(Icons.Plus, "Add task");
        addTaskButton.classList.add("section-add-task");

        const listener = createDomEventListener(addTaskButton, "click", this.#addTaskCallback);
        this.#listeners.push(listener);

        sectionView.appendChild(sectionHeader);
        sectionView.appendChild(tasks);
        sectionView.appendChild(addTaskButton);

        this.#updateSectionDom(section);

        return sectionView;
    }

    #createSectionHeaderMarkup(section) {
        const header = document.createElement("header");
        header.classList = ["section-header"];

        const sectionTitle = document.createElement("h2");
        sectionTitle.classList = ["section-title"];
        this.#dataDomElements.title = sectionTitle;

        const taskCountSpan = document.createElement("span");
        taskCountSpan.classList = ["section-tasks-count"];
        this.#dataDomElements.taskCount = taskCountSpan;

        const editButton = createIconButton(Icons.Edit);
        editButton.classList.add("edit-button", "section");

        const listener = createDomEventListener(editButton, "click", this.#editSectionCallback);
        this.#listeners.push(listener);

        header.appendChild(sectionTitle);
        header.appendChild(taskCountSpan);
        header.appendChild(editButton);

        return header;
    }

    #createSectionTasksMarkup(section) {
        const tasks = document.createElement("div");
        tasks.classList.add("section-tasks");
        this.#tasksDomContainer = tasks;

        for (const task of section.tasks) {
            this.#addTaskView(task);
        }

        return tasks;
    }

    #addTaskView(task) {
        const taskView = new TaskView(task);

        this.#taskViews.push(taskView);
        this.#tasksDomContainer.appendChild(taskView.domElement);
    }

    #removeTaskView(task) {
        const taskViewIndex = this.#taskViews.findIndex((view) => view.task === task);
        if (taskViewIndex >= 0) {
            const taskView = this.#taskViews[taskViewIndex];

            this.#taskViews.splice(taskViewIndex, 1);
            this.#tasksDomContainer.removeChild(taskView.domElement);
            taskView.dispose();
        }
    }

    #addTaskCallback = () => {
        const createTaskModal = new CreateTaskModal();
        createTaskModal.taskCreated(this.#onTaskCreatedCallback);
        createTaskModal.show();
    };

    #editSectionCallback = () => {
        const editSectionModal = new EditSectionModal(this.#section);

        editSectionModal.sectionEdited(({title}) => {
            this.#section.title = title;

            todoData.saveChanges();
        });

        editSectionModal.sectionDeleted((section) => {
            section.deleteSection();
            todoData.saveChanges();
        });

        editSectionModal.show();
    };

    #onTaskCreatedCallback = ({ title, description, dueDate, priority }) => {
        this.#section.addTask(title, description, dueDate, priority);
        todoData.saveChanges();
    };

    /**
     * Called when a task was added to the section.
     * @param {TodoTask} task 
     */
    #onTaskAdded = (task) => {
        this.#addTaskView(task);
        // Update the section count dom element
        this.#updateSectionDom(this.#section);
    };

    /**
     * Called when a task was removed from the section.
     * @param {TodoTask} task 
     */
    #onTaskRemoved = (task) => {
        this.#removeTaskView(task);
        // Update the section count dom element
        this.#updateSectionDom(this.#section);
    };

    /**
     * Called when the section data has changed.
     * @param {TodoSection} section 
     */
    #onSectionChanged = (section) => {
        this.#updateSectionDom(section);
    };

    #updateSectionDom(section) {
        this.#dataDomElements.taskCount.textContent = section.tasksCount.toString();
        this.#dataDomElements.title.textContent = section.title;
    }
}

export default SectionView;