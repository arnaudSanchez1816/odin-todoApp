import TodoProject from "./todoProject";

function storageAvailable() {
    let storage;
    try {
        storage = window["localStorage"];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return (
            e instanceof DOMException &&
            e.name === "QuotaExceededError" &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        );
    }
}

function loadProjects() {
    if (storageAvailable() == false) {
        throw new Error("Local Storage unavailable");
    }

    const projectsJson = localStorage.getItem("projects");
    if (projectsJson == null) {
        return [];
    }

    try {
        const projectsJsonArray = JSON.parse(projectsJson);

        if(projectsJsonArray == false || Array.isArray(projectsJsonArray) == false) {
            throw new Error();
        }

        const projects = projectsJsonArray.map((item) => {
            const project = new TodoProject();
            project.fromJson(item);

            return project;
        });

        return projects;
    } catch (error) {
        console.error("Failed to parse projects json from LocalStorage\n" + error);
        return [];
    }
}

function saveProjects(projects) {
    if (storageAvailable() == false) {
        throw new Error("Local Storage unavailable");
    }

    const projectsJsonArray = projects.map((item) => item.toJson());
    const projectsJsonString = JSON.stringify(projectsJsonArray);

    localStorage.setItem("projects", projectsJsonString);
}

export { loadProjects, saveProjects }