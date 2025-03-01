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

    todoData.addProjectDeletedListener(onProjectDeleted);
}

function displayProject(project) {
    if(project === null) {
        setEmptyContent();
        return;
    }

    const projectView = new ProjectView(project);
    setContent(projectView);
    sidebar.setActiveProject(project);
}

function setEmptyContent() {
    const emptyPage = document.createElement("div");
    setContent({domElement: emptyPage});
    sidebar.setActiveProject(null);
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

function onProjectDeleted(project) {
    if(currentContent instanceof ProjectView && currentContent.project === project) {
        const projects = todoData.getProjects();
        if(projects.length > 0) {
            displayProject(projects[0]);
        }
        else {
            setEmptyContent();
        }
    }
}

const todoApp = {
    initApp
};

export default todoApp;