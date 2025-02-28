import createDomEventListener from "./domEventListener";
import { createIconButton, Icons } from "./todoAppComponents";
import TodoSection from "./todoSection";
import TaskView from "./todoTaskView";

class SectionView {
    #section;
    #domElement;
    #taskViews;
    #listeners;

    /**
     * 
     * @param {TodoSection} section 
     */
    constructor(section) {
        this.#section = section;
        this.#listeners = [];
        this.#taskViews = [];
        this.#domElement = this.#createDom(section);
    }

    get domElement() {
        return this.#domElement;
    }

    dispose() {
        this.#listeners.forEach((item) => item.dispose());
        this.#taskViews.forEach((view) => view.dispose());

        this.#taskViews = null;
        this.#listeners = null;
        this.#section = null;
        this.#domElement = null;
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
    
        return sectionView;
    }
    
    #createSectionHeaderMarkup(section) {
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

        const listener = createDomEventListener(editButton, "click", this.#editSectionCallback);
        this.#listeners.push(listener);
    
        header.appendChild(sectionTItle);
        header.appendChild(taskCountSpan);
        header.appendChild(editButton);
    
        return header;
    }
    
    #createSectionTasksMarkup(section) {
        const tasks = document.createElement("div");
        tasks.classList.add("section-tasks");
    
        for (const task of section.tasks) {
            const taskView = new TaskView(task);

            this.#taskViews.push(taskView);
            tasks.appendChild(taskView.domElement);
        }
    
        return tasks;
    }

    #addTaskCallback = () => {
        console.log("add task to section");
    };

    #editSectionCallback = () => {
        console.log("edit section");
    };
}

export default SectionView;