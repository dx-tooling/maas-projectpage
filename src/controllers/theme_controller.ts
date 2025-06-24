import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["toggleButton"];

    declare readonly toggleButtonTarget: HTMLButtonElement;
    declare readonly hasToggleButtonTarget: boolean;

    connect() {
        this.applyTheme();
    }

    toggle() {
        // Determine the *new* theme based on the *current* visual state
        const isCurrentlyDark = document.documentElement.classList.contains("dark");
        const newTheme = isCurrentlyDark ? "light" : "dark";

        localStorage.setItem("theme", newTheme);
        this.applyTheme(newTheme);
    }

    applyTheme(theme: string | null = null) {
        const selectedTheme = theme ?? localStorage.getItem("theme");
        const osPreferenceDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const htmlElement = document.documentElement;

        if (selectedTheme === "dark" || (selectedTheme === null && osPreferenceDark)) {
            htmlElement.classList.add("dark");
        } else {
            htmlElement.classList.remove("dark");
        }
    }
}
