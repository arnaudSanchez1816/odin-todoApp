import Priorities from "./todoPriorities";
import TodoTask from "./todoTask";
import EventEmitter from "events";

const SECTION_CHANGED_EVENT = "sectionChanged";
const TASK_ADDED_EVENT = "taskAdded";
const TASK_REMOVED_EVENT = "taskRemoved";

class TodoSection {
    #ownerProject;
    #title;
    #tasks = [];
    #eventEmitter;

    constructor(project, title) {
        this.#ownerProject = project;
        this.#title = title;
        this.#eventEmitter = new EventEmitter();
    }

    get title() {
        return this.#title;
    }

    set title(newTitle) {
        if (typeof newTitle !== 'string'
            && (newTitle instanceof String) == false
            && newTitle != null) {
                throw new Error("Only strings and null values accepted");
        }

        this.#title = newTitle;
        this.#eventEmitter.emit(SECTION_CHANGED_EVENT, this);
    }

    get tasksCount() {
        return this.#tasks.length;
    }

    deleteSection() {
        this.#ownerProject.removeSection(this);
    }

    #addTask(todoTask) {
        this.#tasks.push(todoTask);
    }

    addTask(title, description, dueDate = null, priority = Priorities.Lowest) {
        const task = new TodoTask(this, title, description, dueDate, priority);
        this.#addTask(task);

        this.#eventEmitter.emit(TASK_ADDED_EVENT, task);

        return task;
    }

    removeTask(todoTask) {
        const index = this.#tasks.indexOf(todoTask);
        if(index >= 0) {
            this.#tasks.splice(index, 1);
            this.#eventEmitter.emit(TASK_REMOVED_EVENT, todoTask);
        }
    }

    get tasks() {
        return [...this.#tasks];
    }

    addSectionChangedListener(callback) {
        this.#eventEmitter.addListener(SECTION_CHANGED_EVENT, callback);
    }

    removeSectionChangedListener(callback) {
        this.#eventEmitter.removeListener(SECTION_CHANGED_EVENT, callback);
    }

    addTaskAddedListener(callback) {
        this.#eventEmitter.addListener(TASK_ADDED_EVENT, callback);
    }

    removeTaskAddedListener(callback) {
        this.#eventEmitter.removeListener(TASK_ADDED_EVENT, callback);
    }

    addTaskRemovedListener(callback) {
        this.#eventEmitter.addListener(TASK_REMOVED_EVENT, callback);
    }

    removeTaskRemovedListener(callback) {
        this.#eventEmitter.removeListener(TASK_REMOVED_EVENT, callback);
    }
}

export default TodoSection;