import Priorities from "./todoPriorities";

class TodoTask {
    #title;
    #description = null;
    #date = null;
    #priority;

    constructor(title, description = null, date = null, priority = Priorities.Normal) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.priority = priority;
    }

    set title(newTitle) {
        if (typeof newTitle !== 'string'
            && (newTitle instanceof String) == false
            && newTitle != null) {
                throw new Error("Only strings and null values accepted");
        }

        this.#title = newTitle;
    }

    get title() {
        return this.#title;
    }

    set description(newDescription) {
        if (typeof newDescription !== 'string'
            && (newDescription instanceof String) == false
            && newDescription != null) {
                throw new Error("Only strings and null values accepted");
        }

        this.#description = newDescription;
    }

    get description() {
        return this.#description;
    }

    set date(newDate) {
        if ((newDate instanceof Date) == false && newDate != null) {
            throw new Error("Only Date and null values accepted");
        }

        this.#date = newDate;
    }

    get date() {
        return this.#date;
    }

    set priority(newPrio) {
        if(Priorities.exists(newPrio) === false) {
            throw new Error("Only accept valid Priorities values.")
        }

        this.#priority = newPrio;
    }

    get priority() {
        return this.#priority;
    }
}

export default TodoTask;