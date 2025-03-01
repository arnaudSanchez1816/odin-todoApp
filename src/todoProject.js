import TodoSection from "./todoSection";
import EventEmitter from "events";

const PROJECT_CHANGED_EVENT = "projectChanged";
const SECTION_ADDED_EVENT = "projectSectionAdded";
const SECTION_REMOVED_EVENT = "projectSectionRemoved";

class TodoProject {
    #id;
    #title;
    #sections = [];
    #eventEmitter;

    constructor(title) {
        this.#id = self.crypto.randomUUID();
        this.#title = title;
        this.#eventEmitter = new EventEmitter();
    }

    get title() {
        return this.#title;
    }

    set title(newTitle) {
        if((typeof newTitle === "string") === false) {
            throw new Error("Only string values valid.");
        }

        this.#title = newTitle;
        this.#eventEmitter.emit(PROJECT_CHANGED_EVENT, this);
    }

    get id() {
        return this.#id;
    }

    addSection(sectionTitle) {
        if(sectionTitle == false) {
            throw new Error("Trying to create a section with an empty title");
        }

        const section = new TodoSection(sectionTitle);
        this.#sections.push(section);

        this.#eventEmitter.emit(SECTION_ADDED_EVENT, section);

        return section;
    }

    removeSection(section) {
        if(section == false) {
            return;
        }

        const index = this.#sections.indexOf(section);
        if(index >= 0) {
            this.#sections.splice(index, 1);
            this.#eventEmitter.emit(SECTION_REMOVED_EVENT, section);
        }
    }

    get sections() {
        return [...this.#sections];
    }

    addProjectChangedListener(func) {
        this.#eventEmitter.on(PROJECT_CHANGED_EVENT, func);
    }

    removeProjectChangedListener(func) {
        this.#eventEmitter.removeListener(PROJECT_CHANGED_EVENT, func);
    }

    addSectionAddedListener(func) {
        this.#eventEmitter.on(SECTION_ADDED_EVENT, func);
    }

    removeSectionAddedListener(func) {
        this.#eventEmitter.removeListener(SECTION_ADDED_EVENT, func);
    }

    addSectionRemovedListener(func) {
        this.#eventEmitter.on(SECTION_REMOVED_EVENT, func);
    }

    removeSectionRemovedListener(func) {
        this.#eventEmitter.removeListener(SECTION_REMOVED_EVENT, func);
    }
}

export default TodoProject;