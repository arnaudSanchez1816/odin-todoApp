import Priorities from "./todoPriorities";
import TodoTask from "./todoTask";

class TodoSection {
    #title;
    #tasks = [];

    constructor(title) {
        this.#title = title;
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

    addTask(title, description, dueDate) {
        const task = new TodoTask(this, title, description, dueDate, Priorities.Normal);
        this.#addTask(task);

        return task;
    }

    removeTask(todoTask) {
        this.#tasks = this.#tasks.filter((element) => element !== todoTask);
    }

    get tasks() {
        return [...this.#tasks];
    }
}

export default TodoSection;