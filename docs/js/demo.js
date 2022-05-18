
// Optimizely SDK
import "https://unpkg.com/@optimizely/optimizely-sdk@4.9.1/dist/optimizely.browser.umd.min.js";

// Flag Dependency module
import * as flag_dependencies from "./flag_dependencies.js";

// AlpineJS
import Alpine from "https://unpkg.com/alpinejs@3.10.2/dist/module.esm.js";

// Default Optimizely Datafile
// Use a local copy of the Optimizely Datafile so that this demo won't break if the upstream
// Optimizely project changes
const DEFAULT_DATAFILE_PATH = "./js/optimizely/datafiles/LbmzK7viE2J2bP5ozmZR9.json";

// Load default static datafile
fetch(DEFAULT_DATAFILE_PATH).then(response => {
    return response.json();
}).then(datafile => {

    // Instantiate the Optimizely SDK
    window.optimizelyClient = optimizelySdk.createInstance({
        datafile: datafile,
    });

    // Start AlpineJS
    Alpine.start();


});

// Attach the flag_dependencies module to the window object so that it can be used inline
window.deps = flag_dependencies;

/**
 * Draw an arrow from start to end using leader-line.js
 * @param {String} startId    The arrow will start at the element with this id
 * @param {*} endId           The arrow will terminate at the element with this id
 * @param {*} options         Options passed to LeaderLine's constructor
 */
function drawArrow(startId, endId, options = {}) {
    const DEFAULT_OPTIONS = { color: "#33C3F0", path: "grid", startSocket: "bottom", endSocket: "top" };
    var combinedOptions = {};
    Object.assign(combinedOptions, DEFAULT_OPTIONS, options);

    // setTimeout is a hack; leader-line.js breaks when content is still being rendered.
    setTimeout(() => {
        new LeaderLine(
            document.getElementById(startId),
            document.getElementById(endId),
            combinedOptions
        );
    }, 300)
}

window.drawArrow = drawArrow;