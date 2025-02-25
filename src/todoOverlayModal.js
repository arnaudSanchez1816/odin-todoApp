import "./overlayModal.css"
import { createIconButton, Icons } from "./todoAppComponents";

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

export { CreateProjectModal };