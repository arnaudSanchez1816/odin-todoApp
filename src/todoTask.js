import Priorities from "./todoPriorities";
import EventEmitter from "events";

class TodoTask {
    #title;
    #description = null;
    #date = null;
    #priority;
    #taskEvents;

    constructor(title, description = null, date = null, priority = Priorities.Normal) {
        this.#taskEvents = new EventEmitter();

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
        this.#taskEvents.emit(TodoTask.titleChanged, this.#title);
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
        this.#taskEvents.emit(TodoTask.descriptionChanged, this.#description);
    }

    get description() {
        return this.#description;
    }

    set date(newDate) {
        if ((newDate instanceof Date) == false && newDate != null) {
            throw new Error("Only Date and null values accepted");
        }

        this.#date = newDate;

        this.#taskEvents.emit(TodoTask.dateChanged, this.#date);
    }

    get date() {
        return this.#date;
    }

    set priority(newPrio) {
        if(Priorities.exists(newPrio) === false) {
            throw new Error("Only accept valid Priorities values.")
        }

        this.#priority = newPrio;

        this.#taskEvents.emit(TodoTask.priorityChanged, this.#priority);
    }

    get priority() {
        return this.#priority;
    }

    subscribeToPropertyChanged(property, func) {
        this.#taskEvents.on(property, func);
    }

    unsubscribeToPropertyChanged(property, func) {
        this.#taskEvents.removeListener(property, func);
    }
}

Object.defineProperty(TodoTask, 'priorityChanged', {
    value: "priorityChanged",
    writable : false,
    enumerable : true,
    configurable : false
});

Object.defineProperty(TodoTask, 'dateChanged', {
    value: "dateChanged",
    writable : false,
    enumerable : true,
    configurable : false
});

Object.defineProperty(TodoTask, 'descriptionChanged', {
    value: "descriptionChanged",
    writable : false,
    enumerable : true,
    configurable : false
});

Object.defineProperty(TodoTask, 'titleChanged', {
    value: "titleChanged",
    writable : false,
    enumerable : true,
    configurable : false
});

export default TodoTask;