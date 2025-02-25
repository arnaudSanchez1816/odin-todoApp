import "./projectView.css"
import { createIconButton, Icons } from "./todoAppComponents";
import createSectionView from "./todoSectionView";
import { EditProjectModal } from "./todoOverlayModal";

function displayProject(project) {
    const mainContent = document.querySelector("#main-content");
    if(mainContent) {
        // Clear main
        mainContent.innerHTML = "";
    }

    const container = document.createElement("div");
    container.classList = ["main-content-project"];
    const header = createProjectHeaderMarkup(project);
    const content = createProjectContentMarkup(project);
    container.appendChild(header);
    container.appendChild(content);

    mainContent.appendChild(container);
}

function createProjectHeaderMarkup(project) {
    const header = document.createElement("header");
    header.classList = ["project-header"];

    const editProjectButton = createIconButton(Icons.Edit, "Edit");
    editProjectButton.id = "project-header-edit";
    editProjectButton.classList.add("edit-button");
    editProjectButton.addEventListener("click", (event) => {
        const editProjectModal = new EditProjectModal(project);
        editProjectModal.projectEdited(({title}) => {
            project.title = title;
            displayProject(project);
        });
        editProjectModal.show();
    })

    header.appendChild(editProjectButton);

    return header;
}

function createProjectContentMarkup(project) {
    const contentElement = document.createElement("div");
    contentElement.classList = ["project-content"];

    const titleElement = createProjectTitleMarkup(project);
    contentElement.appendChild(titleElement);

    const sectionsElement = createProjectSections(project);
    contentElement.appendChild(sectionsElement);

    return contentElement;
} 

function createProjectTitleMarkup(project) {
    const titleContainer = document.createElement("div");
    titleContainer.classList = ["project-title-container"];

    const titleEditDiv = document.createElement("div");
    const titleHeading = document.createElement("h1");
    titleHeading.classList = ["project-title"];
    titleHeading.textContent = project.title;
    titleEditDiv.classList = ["project-title-edit"];
    // Todo ?
    titleEditDiv.contentEditable = false;
    titleEditDiv.appendChild(titleHeading);
    titleContainer.appendChild(titleEditDiv);

    return titleContainer;
}

function createProjectSections(project) {
    const sections = document.createElement("div");
    sections.classList = ["project-sections"];

    for (const section of project.sections) {
        const sectionView = createSectionView(section);
        sections.appendChild(sectionView);
    }

    // Add section button
    const addSectionButtonContainer = document.createElement("div");
    addSectionButtonContainer.classList = ["project-add-section-container"];
    const addSectionButton = createIconButton(Icons.Plus, "Add section");
    addSectionButton.id = "project-add-section";
    addSectionButton.addEventListener("click", (event) => {
        console.log("add section click !");
    });
    addSectionButtonContainer.appendChild(addSectionButton);
    sections.appendChild(addSectionButtonContainer);

    return sections;
}

export default displayProject;