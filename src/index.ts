import { Application } from "@hotwired/stimulus";
import { definitionsFromContext } from "@hotwired/stimulus-webpack-helpers";

window.Stimulus = Application.start();

// Load controllers from .ts files recursively within ./controllers
// The last argument is a regex, ensure backslashes are escaped
const context = require.context("./controllers", true, /\.ts$/);

// Load definitions using the helper
window.Stimulus.load(definitionsFromContext(context));
