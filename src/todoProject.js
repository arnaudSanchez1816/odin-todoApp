import TodoSection from "./todoSection";
import EventEmitter from "events";

const PROJECT_CHANGED_EVENT = "projectChanged";
const PROJECT_DELETED_EVENT = "projectDeleted";

class TodoProject {
    #id;
    #title;
    #sections = [];
    eventEmitter;

    constructor(title) {
        this.#id = self.crypto.randomUUID();
        this.#title = title;
        this.eventEmitter = new EventEmitter();
    }

    get title() {
        return this.#title;
    }

    set title(newTitle) {
        if((typeof newTitle === "string") === false) {
            throw new Error("Only string values valid.");
        }

        this.#title = newTitle;
        this.eventEmitter.emit(PROJECT_CHANGED_EVENT, this);
    }

    get id() {
        return this.#id;
    }

    deleteProject() {
        this.eventEmitter.emit(PROJECT_DELETED_EVENT, this);
    }

    addSection(sectionTitle) {
        if(sectionTitle == false) {
            throw new Error("Trying to create a section with an empty title");
        }

        const section = new TodoSection(sectionTitle);
        this.#sections.push(section);

        return section;
    }

    removeSection(section) {
        if(section == false) {
            return;
        }

        this.#sections = this.#sections.filter((item) => item !== section);
    }

    get sections() {
        return [...this.#sections];
    }

    addProjectChangedListener(func) {
        this.eventEmitter.on(PROJECT_CHANGED_EVENT, func);
    }

    removeProjectChangedListener(func) {
        this.eventEmitter.removeListener(PROJECT_CHANGED_EVENT, func);
    }

    addProjectDeletedListener(func) {
        this.eventEmitter.on(PROJECT_DELETED_EVENT, func);
    }

    removeProjectDeletedListener(func) {
        this.eventEmitter.on(PROJECT_DELETED_EVENT, func);
    }
}

export default TodoProject;