import todoData from "./todoAppData.js";
import sidebar from "./todoSidebar.js";
import { CreateProjectModal } from "./todoOverlayModal.js";
import { ProjectView } from "./todoProjectView.js";

let currentContent = null;
let init = false;
const mainContent = document.querySelector("#main-content");

function initApp() {
    if(init) {
        throw new Error("Website already initialized !");
    }

    init = true;
    const projects = todoData.getProjects();
    sidebar.initSidebar(onSidebarAddProject, onSidebarProjectSelected);

    const initialProject = projects.length > 0 ? projects[0] : null;
    displayProject(initialProject);
}

function displayProject(project) {
    const projectView = new ProjectView(project);
    setContent(projectView);
    sidebar.setActiveProject(project);
}

function setContent(contentToDisplay) {
    if(currentContent && currentContent.dispose) {
        currentContent.dispose();
    }

    if (mainContent) {
        // Clear main
        mainContent.innerHTML = "";
    }

    mainContent.appendChild(contentToDisplay.domElement);
    currentContent = contentToDisplay;
}

function onSidebarAddProject() {
    // Show add project modal
    const addProjectModal = new CreateProjectModal();
    addProjectModal.projectCreated(({ title }) => {
        const project = todoData.addProject(title);
        displayProject(project);
    });

    addProjectModal.show();
}

function onSidebarProjectSelected(project) {
    displayProject(project);
}

const todoApp = {
    initApp
};

export default todoApp;