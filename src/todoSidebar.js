import todoData from "./todoAppData.js";
import { createIconButton, Icons } from "./todoAppComponents.js";
import TodoProject from "./todoProject.js";

/**
 * Callback for when the add project button was clicked in the sidebar.
 *
 * @callback addProjectCallback
 */

/** @type {addProjectCallback} */
let onAddProjectCb = null;

/**
 * @type {function(TodoProject):void}
 */
let onProjectSelectedCb = null;

const projectsList = document.querySelector("#sidebar-nav-projects-list");
let projectsSidebarElements = [];

class ProjectSidebarElement {
    #project;
    #domElement;
    #titleDomElement;
    #button;

    constructor(project) {
        this.#project = project;
        this.#domElement = this.#createMarkup();
    }

    #createMarkup() {
        const project = this.#project;

        const li = document.createElement("li");
        li.dataset.projectId = project.id.toString();
        const projectButton = createIconButton(Icons.Hash, project.title);
        projectButton.classList.add("sidebar-button");
        this.#button = projectButton;

        this.#titleDomElement = projectButton.querySelector("span:last-child");
        this.#titleDomElement.textContent = project.title;
        projectButton.addEventListener("click", this.#projectClickedCb);

        project.addProjectChangedListener(this.#onProjectChanged);

        li.appendChild(projectButton);
        return li;
    }

    get project() {
        return this.#project;
    }

    get domElement() {
        return this.#domElement;
    }

    set selected(value) {
        this.#button.classList.toggle("selected", value);
    }

    #onProjectChanged = (project) => {
        this.#titleDomElement.textContent = project.title;
    };

    dispose() {
        const project = this.#project;
        project.removeProjectChangedListener(this.#onProjectChanged);
        this.#button.removeEventListener("click", this.#projectClickedCb);

        this.#titleDomElement = null;
        this.#domElement = null;
        this.#project = null;
        this.#button = null;
    }

    #projectClickedCb = (event) => {
        const target = event.target;
        if(target.classList.contains("selected")) {
            return;
        }

        if(onProjectSelectedCb) {
            onProjectSelectedCb(this.#project);
        }
    };
}

function buildProjectsList(projects) {
    clearProjectsList();

    for (const project of projects) {
        addProjectSidebarElement(project);
    }
}

function addProjectSidebarElement(project) {
    const element = new ProjectSidebarElement(project);
    projectsList.appendChild(element.domElement);
    projectsSidebarElements.push(element);
}

function clearProjectsList() {
    while (projectsList.lastElementChild) {
        projectsList.removeChild(projectsList.lastElementChild);
    }

    for (const sidebarProject of projectsSidebarElements) {
        sidebarProject.dispose();
    }
    projectsSidebarElements = [];
}

function setActiveProject(project) {
    projectsSidebarElements.forEach((projectSidebarElement) => {
        projectSidebarElement.selected = projectSidebarElement.project === project;
    });
}

function initSidebar(addProjectCb, projectSelectedCb) {
    onAddProjectCb = addProjectCb;
    onProjectSelectedCb = projectSelectedCb;
    const addProjectButton = document.querySelector("#nav-add-project");
    addProjectButton.addEventListener("click", () => { 
        if(onAddProjectCb) {
            onAddProjectCb();
        }
    });

    const projects = todoData.getProjects();
    buildProjectsList(projects);
    todoData.addProjectCreatedListener(onProjectCreated);
    todoData.addProjectDeletedListener(onProjectDeleted);
}

function onProjectCreated(project) {
    const projects = todoData.getProjects();
    buildProjectsList(projects);
}

function onProjectDeleted(project) {
    const projects = todoData.getProjects();
    buildProjectsList(projects);
}

const sidebar = {
    initSidebar,
    setActiveProject
};

export default sidebar; 