import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["modal", "button"];

    declare readonly modalTarget: HTMLElement;
    declare readonly buttonTarget: HTMLElement;

    connect() {
        console.log("Modal controller connected!");
        // Initially hide the modal
        this.modalTarget.style.display = "none";
    }

    open() {
        console.log("Opening modal");
        this.modalTarget.style.display = "block";
    }

    close() {
        console.log("Closing modal");
        this.modalTarget.style.display = "none";
    }
}
