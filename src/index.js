import "modern-normalize";
import "./template.css"
import "iconify-icon";
import { createDemoProject } from "./todoApp.js";
import displayProject from "./projectView.js";

const demoProject = createDemoProject();

displayProject(demoProject);