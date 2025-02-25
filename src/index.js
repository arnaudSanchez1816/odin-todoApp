import "modern-normalize";
import "./template.css"
import todoApp from "./todoApp.js";
import displayProject from "./projectView.js";
import OverlayView from "./todoOverlayModal.js";
import "./todoSidebar.js";

const projects = todoApp.getProjects();
const currentProject = projects[0];

displayProject(currentProject);