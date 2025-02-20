import TodoSection from "./todoSection";

class TodoProject {
    #title;
    #sections = [];

    constructor(title) {
        this.#title = title;
    }

    get title() {
        return this.#title;
    }

    set title(newTitle) {
        this.#title = newTitle;
    }

    createSection(sectionTitle) {
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
}

export default TodoProject;