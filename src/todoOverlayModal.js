import createDomEventListener from "./domEventListener";
import "./overlayModal.css"
import { createIconButton, Icons } from "./todoAppComponents";
import Priorities from "./todoPriorities";
import TodoProject from "./todoProject";

class OverlayModal {
    #overlay;
    #title;

    constructor(title) {
        this.#title = title;
    }

    show() {
        if (this.#overlay) {
            console.error("Modal already displayed !");
            return;
        }

        this.#overlay = document.createElement("div");
        this.#overlay.classList = ["overlay"];

        const backgroundClickCb = (event) => {
            if(event.target === this.#overlay) {
                this.#overlay.removeEventListener("click", backgroundClickCb);
                this.hide();
            }
        };
        this.#overlay.addEventListener("click", backgroundClickCb);

        const modal = document.createElement("div");
        modal.classList = ["overlay-modal"];
        this.#overlay.appendChild(modal);

        // Header
        const header = this.#createHeader();
        modal.appendChild(header);
        // Content
        const content = document.createElement("div");
        content.classList = ["overlay-content"];
        const generatedContent = this.createContent();
        if (generatedContent) {
            content.appendChild(generatedContent);
        }
        modal.appendChild(content);
        // Footer
        const footer = document.createElement("footer");
        footer.classList = ["overlay-footer"];
        const generatedFooter = this.createFooter();
        if (generatedFooter) {
            footer.appendChild(generatedFooter);
        }
        modal.appendChild(footer);

        const body = document.body;
        body.appendChild(this.#overlay);
    }

    hide() {
        if (this.#overlay) {
            const body = document.body;
            body.removeChild(this.#overlay);
            this.#overlay = null;
        }
    }

    #createHeader() {
        const header = document.createElement("header");
        header.classList = ["overlay-header"];

        const title = document.createElement("span");
        title.classList = ["overlay-title"];
        title.textContent = this.#title;

        const closeButton = createIconButton(Icons.Close);
        closeButton.classList.add("overlay-close-button");
        const closeCb = (event) => {
            closeButton.removeEventListener("click", closeCb);
            this.hide();
        };
        closeButton.addEventListener("click", closeCb);

        header.appendChild(title);
        header.appendChild(closeButton);

        return header;
    }

    createContent() {
    }

    createFooter() {
    }
}

class CreateProjectModal extends OverlayModal {
    #formId = "add-project-form";
    #projectCreatedCallback;

    constructor() {
        super("Add Project");
    }

    createContent() {
        const form = document.createElement("form");
        form.id = this.#formId;
        form.classList = ["add-project-form"];
        const item = document.createElement("div");
        item.classList = ["form-item"];

        const label = document.createElement("label");
        label.htmlFor = "add-project-form-title";
        label.textContent = "Name";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.name = "project-title";
        titleInput.id = label.htmlFor;
        titleInput.maxLength = 120;
        titleInput.required = true;

        item.appendChild(label);
        item.appendChild(titleInput);
        form.appendChild(item);

        const formSubmittedCb = (event) => {
            form.removeEventListener("submit", formSubmittedCb);
            this.#onCreateProjectFormSubmitted(event);
            this.hide();
        };
        form.addEventListener("submit", formSubmittedCb);

        return form;
    }

    createFooter() {
        const container = document.createElement("div");
        container.classList = "form-controls";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Add";
        submitButton.type = "submit";
        submitButton.classList.add("form-submit-button");
        submitButton.setAttribute("form", this.#formId);

        container.appendChild(submitButton);

        return container;
    }

    /**
     * 
     * @param {(title : string) => void} callback 
     */
    projectCreated(callback) {
        this.#projectCreatedCallback = callback;
    }

    /**
     * 
     * @param {Event} event 
     */
    #onCreateProjectFormSubmitted(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const projectCreatedData = {
            title : formData.get("project-title").valueOf()
        };

        if(this.#projectCreatedCallback) {
            this.#projectCreatedCallback(projectCreatedData);
        }
    }
}

class EditProjectModal extends OverlayModal{
    #formId = "edit-project-form";
    #projectEditedCallback;
    #project;

    /**
     * 
     * @param {TodoProject} project 
     */
    constructor(project) {
        super("Edit Project");
        this.#project = project;
    }

    createContent() {
        const form = document.createElement("form");
        form.id = this.#formId;
        form.classList = ["edit-project-form"];
        const item = document.createElement("div");
        item.classList = ["form-item"];

        const label = document.createElement("label");
        label.htmlFor = "edit-project-form-title";
        label.textContent = "Name";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.name = "project-title";
        titleInput.id = label.htmlFor;
        titleInput.maxLength = 120;
        titleInput.required = true;
        titleInput.value = this.#project.title;

        item.appendChild(label);
        item.appendChild(titleInput);
        form.appendChild(item);

        const formSubmittedCb = (event) => {
            form.removeEventListener("submit", formSubmittedCb);
            this.#onEditProjectFormSubmitted(event);
            this.hide();
        };
        form.addEventListener("submit", formSubmittedCb);

        return form;
    }

    createFooter() {
        const container = document.createElement("div");
        container.classList = "form-controls";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Edit";
        submitButton.type = "submit";
        submitButton.classList.add("form-submit-button");
        submitButton.setAttribute("form", this.#formId);

        container.appendChild(submitButton);

        return container;
    }

    /**
     * 
     * @param {(title : string) => void} callback 
     */
    projectEdited(callback) {
        this.#projectEditedCallback = callback;
    }

    /**
     * 
     * @param {Event} event 
     */
    #onEditProjectFormSubmitted(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const projectEditedData = {
            title : formData.get("project-title").valueOf()
        };

        if(this.#projectEditedCallback) {
            this.#projectEditedCallback(projectEditedData);
        }
    }
}

class EditTaskModal extends OverlayModal{
    #formId = "edit-task-form";
    #task;
    #taskEditedCallback;
    #taskDeletedCallback;
    #eventListeners;

    constructor(task) {
        super("Edit task");
        this.#eventListeners = [];
        this.#task = task;
    }

    hide() {
        super.hide();
        this.#eventListeners.forEach((item) => item.dispose());
        this.#eventListeners = [];
    }

    createContent() {
        const form = document.createElement("form");
        form.id = this.#formId;
        form.classList = ["edit-task-form"];

        const titleItem = this.#createTitleFormItem();
        const descriptionItem = this.#createDescriptionFormItem();
        const dueDateItem = this.#createDateFormItem();
        const priorityItem = this.#createPriorityFormItem();

        form.appendChild(titleItem);
        form.appendChild(descriptionItem);
        form.appendChild(dueDateItem);
        form.appendChild(priorityItem);

        const eventListener = createDomEventListener(form, "submit", this.#onEditTaskFormSubmitted.bind(this));
        this.#eventListeners.push(eventListener);

        return form;
    }

    #createFormItemContainer() {
        const item = document.createElement("div");
        item.classList = ["form-item"];

        return item;
    }

    #createTitleFormItem() {
        const item = this.#createFormItemContainer();

        const titleLabel = document.createElement("label");
        titleLabel.htmlFor = "edit-task-form-title";
        titleLabel.textContent = "Name";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.name = "task-title";
        titleInput.id = titleLabel.htmlFor;
        titleInput.maxLength = 120;
        titleInput.required = true;
        titleInput.value = this.#task.title;
        item.appendChild(titleLabel);
        item.appendChild(titleInput);

        return item;
    }

    #createDescriptionFormItem() {
        const item = this.#createFormItemContainer();

        const descriptionLabel = document.createElement("label");
        descriptionLabel.htmlFor = "edit-task-form-description";
        descriptionLabel.textContent = "Description";
        const descriptionTextArea = document.createElement("textarea");
        descriptionTextArea.name = "task-description";
        descriptionTextArea.id = descriptionLabel.htmlFor;
        descriptionTextArea.maxLength = 256;
        descriptionTextArea.value = this.#task.description;

        item.appendChild(descriptionLabel);
        item.appendChild(descriptionTextArea);
        return item;
    }

    #createDateFormItem() {
        const item = this.#createFormItemContainer();

        const dueDateLabel = document.createElement("label");
        dueDateLabel.htmlFor = "edit-task-form-date";
        dueDateLabel.textContent = "Due date";
        const dueDateInput = document.createElement("input");
        dueDateInput.type = "date";
        dueDateInput.name = "task-date";
        dueDateInput.id = dueDateLabel.htmlFor;
        dueDateInput.valueAsDate = this.#task.date;

        item.appendChild(dueDateLabel);
        item.appendChild(dueDateInput);

        return item;
    }

    #createPriorityFormItem() {
        const item = this.#createFormItemContainer();

        const priorityLabel = document.createElement("label");
        priorityLabel.htmlFor = "edit-task-form-priority";
        priorityLabel.textContent = "Priority";
        const prioritySelect = document.createElement("select");
        prioritySelect.name = "task-priority";
        prioritySelect.id = priorityLabel.htmlFor;

        const priorityValues = Priorities.values();
        for (const priority of priorityValues) {
            const priorityOption = document.createElement("option");
            priorityOption.value = priority.value;
            priorityOption.textContent = priority.name;

            if(this.#task.priority === priority) {
                priorityOption.selected = true;
            }

            prioritySelect.appendChild(priorityOption);
        }

        item.appendChild(priorityLabel);
        item.appendChild(prioritySelect);

        return item;
    }

    createFooter() {
        const container = document.createElement("div");
        container.classList = "form-controls";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Edit";
        submitButton.type = "submit";
        submitButton.classList.add("form-submit-button");
        submitButton.setAttribute("form", this.#formId);

        const deleteTaskButton = document.createElement("button");
        deleteTaskButton.textContent = "Delete";
        deleteTaskButton.type = "button";
        deleteTaskButton.classList.add("delete-button");

        const eventListener = createDomEventListener(deleteTaskButton, "click", this.#onDeleteTask.bind(this));
        this.#eventListeners.push(eventListener);

        container.appendChild(deleteTaskButton);
        container.appendChild(submitButton);

        return container;
    }

    taskEdited(callback) {
        this.#taskEditedCallback = callback;
    }

    taskDeleted(callback) {
        this.#taskDeletedCallback = callback;
    }

    /**
     * 
     * @param {Event} event 
     */
    #onEditTaskFormSubmitted(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        let dueDate = null;
        if(formData.get("task-date")) {
            dueDate = new Date(formData.get("task-date").valueOf());
        }
        const taskEditedData = {
            title : formData.get("task-title").valueOf(),
            description: formData.get("task-description").valueOf(),
            dueDate: dueDate,
            priority: Priorities.fromValue(formData.get("task-priority").valueOf())
        };

        if(this.#taskEditedCallback) {
            this.#taskEditedCallback(taskEditedData);
        }

        this.hide();
    }

    #onDeleteTask(event) {
        if(this.#taskDeletedCallback) {
            this.#taskDeletedCallback(this.#task);
        }

        this.hide();
    }
}

class CreateTaskModal extends OverlayModal{
    #formId = "add-task-form";
    #task;
    #taskCreatedCallback;
    #eventListeners;

    constructor(task) {
        super("Add task");
        this.#eventListeners = [];
        this.#task = task;
    }

    hide() {
        super.hide();
        this.#eventListeners.forEach((item) => item.dispose());
        this.#eventListeners = [];
    }

    createContent() {
        const form = document.createElement("form");
        form.id = this.#formId;
        form.classList = ["add-task-form"];

        const titleItem = this.#createTitleFormItem();
        const descriptionItem = this.#createDescriptionFormItem();
        const dueDateItem = this.#createDateFormItem();
        const priorityItem = this.#createPriorityFormItem();

        form.appendChild(titleItem);
        form.appendChild(descriptionItem);
        form.appendChild(dueDateItem);
        form.appendChild(priorityItem);

        const eventListener = createDomEventListener(form, "submit", this.#onAddTaskFormSubmitted.bind(this));
        this.#eventListeners.push(eventListener);

        return form;
    }

    #createFormItemContainer() {
        const item = document.createElement("div");
        item.classList = ["form-item"];

        return item;
    }

    #createTitleFormItem() {
        const item = this.#createFormItemContainer();

        const titleLabel = document.createElement("label");
        titleLabel.htmlFor = "add-task-form-title";
        titleLabel.textContent = "Name";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.name = "task-title";
        titleInput.id = titleLabel.htmlFor;
        titleInput.maxLength = 120;
        titleInput.required = true;
        item.appendChild(titleLabel);
        item.appendChild(titleInput);

        return item;
    }

    #createDescriptionFormItem() {
        const item = this.#createFormItemContainer();

        const descriptionLabel = document.createElement("label");
        descriptionLabel.htmlFor = "add-task-form-description";
        descriptionLabel.textContent = "Description";
        const descriptionTextArea = document.createElement("textarea");
        descriptionTextArea.name = "task-description";
        descriptionTextArea.id = descriptionLabel.htmlFor;
        descriptionTextArea.maxLength = 256;

        item.appendChild(descriptionLabel);
        item.appendChild(descriptionTextArea);
        return item;
    }

    #createDateFormItem() {
        const item = this.#createFormItemContainer();

        const dueDateLabel = document.createElement("label");
        dueDateLabel.htmlFor = "edit-task-form-date";
        dueDateLabel.textContent = "Due date";
        const dueDateInput = document.createElement("input");
        dueDateInput.type = "date";
        dueDateInput.name = "task-date";
        dueDateInput.id = dueDateLabel.htmlFor;
        dueDateInput.valueAsDate = null;

        item.appendChild(dueDateLabel);
        item.appendChild(dueDateInput);

        return item;
    }

    #createPriorityFormItem() {
        const item = this.#createFormItemContainer();

        const priorityLabel = document.createElement("label");
        priorityLabel.htmlFor = "edit-task-form-priority";
        priorityLabel.textContent = "Priority";
        const prioritySelect = document.createElement("select");
        prioritySelect.name = "task-priority";
        prioritySelect.id = priorityLabel.htmlFor;

        const priorityValues = Priorities.values();
        for (const priority of priorityValues) {
            const priorityOption = document.createElement("option");
            priorityOption.value = priority.value;
            priorityOption.textContent = priority.name;

            if(priority === Priorities.Lowest) {
                priorityOption.selected = true;
            }

            prioritySelect.appendChild(priorityOption);
        }

        item.appendChild(priorityLabel);
        item.appendChild(prioritySelect);

        return item;
    }

    createFooter() {
        const container = document.createElement("div");
        container.classList = "form-controls";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Add";
        submitButton.type = "submit";
        submitButton.classList.add("form-submit-button");
        submitButton.setAttribute("form", this.#formId);

        container.appendChild(submitButton);

        return container;
    }

    taskCreated(callback) {
        this.#taskCreatedCallback = callback;
    }

    /**
     * 
     * @param {Event} event 
     */
    #onAddTaskFormSubmitted(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        let dueDate = null;
        if(formData.get("task-date")) {
            dueDate = new Date(formData.get("task-date").valueOf());
        }
        const taskCreatedData = {
            title : formData.get("task-title").valueOf(),
            description: formData.get("task-description").valueOf(),
            dueDate: dueDate,
            priority: Priorities.fromValue(formData.get("task-priority").valueOf())
        };

        if(this.#taskCreatedCallback) {
            this.#taskCreatedCallback(taskCreatedData);
        }

        this.hide();
    }
}

export { CreateProjectModal, EditProjectModal, CreateTaskModal, EditTaskModal };