import Priorities from "./todoPriorities";
import TodoTask from "./todoTask";
import EventEmitter from "events";

const TASK_ADDED_EVENT = "taskAdded";
const TASK_REMOVED_EVENT = "taskRemoved";

class TodoSection {
    #title;
    #tasks = [];
    #eventEmitter;

    constructor(title) {
        this.#title = title;
        this.#eventEmitter = new EventEmitter();
    }

    get title() {
        return this.#title;
    }

    get tasksCount() {
        return this.#tasks.length;
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