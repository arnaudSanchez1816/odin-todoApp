import Priorities from "./todoPriorities";
import EventEmitter from "events";

const TASK_CHANGED_EVENT = "taskChanged";

class TodoTask {
    #ownerSection;
    #title;
    #description = null;
    #date = null;
    #priority;
    #done;
    #taskChangedEmitter;

    constructor(section, title, description = null, date = null, priority = Priorities.Normal) {
        this.#taskChangedEmitter = new EventEmitter();

        this.#ownerSection = section;
        this.title = title;
        this.description = description;
        this.date = date;
        this.priority = priority;
        this.#done = false;
    }

    deleteTask() {
        this.#ownerSection.removeTask(this);
    }

    set title(newTitle) {
        if (typeof newTitle !== 'string'
            && (newTitle instanceof String) == false
            && newTitle != null) {
                throw new Error("Only strings and null values accepted");
        }

        this.#title = newTitle;
        this.#triggerTaskChangedEvent();
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
        this.#triggerTaskChangedEvent();
    }

    get description() {
        return this.#description;
    }

    set date(newDate) {
        if ((newDate instanceof Date) == false && newDate != null) {
            throw new Error("Only Date and null values accepted");
        }

        this.#date = newDate;
        this.#triggerTaskChangedEvent();
    }

    get date() {
        return this.#date;
    }

    set priority(newPrio) {
        if(Priorities.exists(newPrio) === false) {
            throw new Error("Only accept valid Priorities values.")
        }

        this.#priority = newPrio;
        this.#triggerTaskChangedEvent();
    }

    get priority() {
        return this.#priority;
    }

    set done(value) {
        if((typeof value === "boolean") === false) {
            throw new Error("Only bool values accepted");
        }

        this.#done = value;
        this.#triggerTaskChangedEvent();
    }

    get done() {
        return this.#done;
    }

    addTaskChangedListener(func) {
        this.#taskChangedEmitter.on(TASK_CHANGED_EVENT, func);
    }

    removeTaskChangedListener(func) {
        this.#taskChangedEmitter.removeListener(TASK_CHANGED_EVENT, func);
    }

    #triggerTaskChangedEvent() {
        this.#taskChangedEmitter.emit(TASK_CHANGED_EVENT, this);
    }
}

export default TodoTask;