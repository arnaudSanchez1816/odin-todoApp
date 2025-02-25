import displayProject from "./projectView";
import todoApp from "./todoApp";
import { CreateProjectModal } from "./todoOverlayModal.js";

const addProjectButton = document.querySelector("#nav-add-project");
addProjectButton.addEventListener("click", showAddProjectModal);

function showAddProjectModal() {
    const addProjectModal = new CreateProjectModal();
    addProjectModal.projectCreated(({ title }) => {
        const project = todoApp.addProject(title);
        displayProject(project);
    });

    addProjectModal.show();
}