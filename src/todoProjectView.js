import "./projectView.css"
import { createIconButton, Icons } from "./todoAppComponents";
import SectionView from "./todoSectionView";
import { CreateSectionModal, EditProjectModal } from "./todoOverlayModal";
import todoData from "./todoAppData";
import createDomEventListener from "./domEventListener";
import TodoSection from "./todoSection";

class ProjectView {
    #project;
    #domElement;
    #sectionViews;
    #sectionsDomContainer;
    #listeners;

    constructor(project) {
        this.#project = project;
        this.#sectionViews = [];
        this.#listeners = [];
        this.#domElement = this.#createDom(project);

        this.#project.addProjectChangedListener(this.#onProjectChanged);
        this.#project.addSectionAddedListener(this.#onProjectSectionAdded);
        this.#project.addSectionRemovedListener(this.#onProjectSectionRemoved);
    }

    get domElement() {
        return this.#domElement;
    }

    dispose() {
        this.#listeners.forEach((listener) => listener.dispose());

        this.#project.removeSectionAddedListener(this.#onProjectSectionAdded);
        this.#project.removeSectionRemovedListener(this.#onProjectSectionRemoved);
        this.#project.removeProjectChangedListener(this.#onProjectChanged);
        this.#sectionViews.forEach((sectionView) => sectionView.dispose());

        this.#listeners = null;
        this.#sectionViews = null;
        this.#project = null;
        this.#domElement = null;
    }

    #createDom(project) {
        const container = document.createElement("div");
        container.classList = ["main-content-project"];
        const header = this.#createProjectHeaderMarkup();
        const content = this.#createProjectContentMarkup(project);
        container.appendChild(header);
        container.appendChild(content);

        return container;
    }

    #createProjectHeaderMarkup() {
        const header = document.createElement("header");
        header.classList = ["project-header"];

        const editProjectButton = createIconButton(Icons.Edit, "Edit");
        editProjectButton.id = "project-header-edit";
        editProjectButton.classList.add("edit-button");

        const listener = createDomEventListener(editProjectButton, "click", this.#editProjectCallback);
        this.#listeners.push(listener);

        header.appendChild(editProjectButton);

        return header;
    }

    #createProjectContentMarkup(project) {
        const contentElement = document.createElement("div");
        contentElement.classList = ["project-content"];

        const titleElement = this.#createProjectTitleMarkup(project);
        contentElement.appendChild(titleElement);

        const sectionsElement = this.#createProjectSections(project);
        contentElement.appendChild(sectionsElement);

        return contentElement;
    }

    #createProjectTitleMarkup(project) {
        const titleContainer = document.createElement("div");
        titleContainer.classList = ["project-title-container"];

        const titleEditDiv = document.createElement("div");
        const titleHeading = document.createElement("h1");
        titleHeading.classList = ["project-title"];
        titleHeading.textContent = project.title;
        titleEditDiv.classList = ["project-title-edit"];

        titleEditDiv.appendChild(titleHeading);
        titleContainer.appendChild(titleEditDiv);

        return titleContainer;
    }

    #createProjectSections(project) {
        const sectionsContainer = document.createElement("div");
        sectionsContainer.classList = ["project-sections-container"];

        const sections = document.createElement("div");
        sections.classList = ["project-sections"];
        this.#sectionsDomContainer = sections;

        for (const section of project.sections) {
            this.#addSectionView(section);
        }
        sectionsContainer.appendChild(sections);

        // "Add section" button
        const addSectionButtonContainer = document.createElement("div");
        addSectionButtonContainer.classList = ["project-add-section-container"];
        const addSectionButton = createIconButton(Icons.Plus, "Add section");
        addSectionButton.id = "project-add-section";

        const listener = createDomEventListener(addSectionButton, "click", this.#addSectionCallback);
        this.#listeners.push(listener);

        addSectionButtonContainer.appendChild(addSectionButton);
        sectionsContainer.appendChild(addSectionButtonContainer);

        return sectionsContainer;
    }

    #addSectionView(section) {
        const sectionView = new SectionView(section);

        this.#sectionViews.push(sectionView);
        this.#sectionsDomContainer.appendChild(sectionView.domElement);
    }

    #removeSectionView(section) {
        const sectionViewIndex = this.#sectionViews.indexOf((view) => view.section === section);
        if (sectionViewIndex >= 0) {
            const sectionView = this.#sectionViews[sectionViewIndex];
            sectionView.dispose();

            this.#sectionViews.splice(sectionViewIndex, 1);
            this.#sectionsDomContainer.removeChild(sectionView.domElement);
        }
    }

    #onProjectChanged = () => {
        const projectTitle = this.#domElement.querySelector(".project-title");
        if (projectTitle) {
            projectTitle.textContent = this.#project.title;
        }
    };

    /**
     * Called when a section was added to the project.
     * @param {TodoSection} section 
     */
    #onProjectSectionAdded = (section) => {
        this.#addSectionView(section);
    };

    /**
    * Called when a section was removed from the project.
    * @param {TodoSection} section 
    */
    #onProjectSectionRemoved = (section) => {
        this.#removeSectionView(section);
    };

    #editProjectCallback = () => {
        const project = this.#project;
        const editProjectModal = new EditProjectModal(project);
        editProjectModal.projectEdited(({ title }) => {
            project.title = title;

            todoData.saveChanges();
        });
        editProjectModal.show();
    };

    #addSectionCallback = () => {
        const createSectionModal = new CreateSectionModal();
        createSectionModal.sectionCreated(({ title }) => {
            this.#project.addSection(title);

            todoData.saveChanges();
        });
        createSectionModal.show();
    };
}

export { ProjectView };