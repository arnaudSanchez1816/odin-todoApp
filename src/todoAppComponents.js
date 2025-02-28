import "iconify-icon";

const Icons = Object.freeze({
    Edit: "material-symbols:edit-square-outline",
    Plus: "ic:baseline-plus",
    Calendar: "mdi:calendar-blank-outline",
    Circle: "material-symbols:circle-outline",
    Check: "material-symbols:check-rounded",
    Close: "material-symbols:close",
    Hash: "ph:hash"
});

function createIconButton(icon, text = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.classList = ["ic-button"];
    const iconElement = createIconifyIcon(icon);
    button.appendChild(iconElement);

    if (text) {
        const textSpan = document.createElement("span");
        textSpan.textContent = text;
        textSpan.classList = ["ic-button-text"];
        button.appendChild(textSpan);
    }

    return button;
}

function createIconifyIcon(icon) {
    const wrapper = document.createElement("span");
    wrapper.classList = ["ic-wrapper"];

    const iconElement = document.createElement("iconify-icon");
    iconElement.classList = ["ic-icon"];
    iconElement.setAttribute("icon", icon);

    wrapper.appendChild(iconElement);

    return wrapper;
}

export { createIconButton, createIconifyIcon, Icons}