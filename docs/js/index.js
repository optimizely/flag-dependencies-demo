import * as optimizely_flag_dependencies from "./optimizely_flag_dependencies.js";

/**
 * Initialize dynamic elements on this page
 */
function init() {
    console.log("Initializing..")
    document.querySelectorAll(".decide-button").forEach(btn => {
        btn.onclick = decideButtonClick.bind(btn);
    })
    {
        let btn = document.querySelector(".example-flag-decide-button");
        btn.onclick = exampleFlagDecideButtonClick.bind(btn);
    }


}

/**
 * Initialize the Optimizely SDK and attach it to the window object
 */
function initOptimizely() {
    console.log(`Initializing Optimizely SDK with sdkKey ${sdkKey}`);
}

/**
 * Handle the decide button click for "example_flag"
 */
function exampleFlagDecideButtonClick() {
    console.log(`Decide button clicked for flag ${this.getAttribute("flag")}`);

}

/**
 * Handle a decide button click
 */
function decideButtonClick() {
    console.log(`Decide button clicked for flag ${this.getAttribute("flag")}`);
}


/**
  * Handle a "Decide" button click
  */
function decideBtnClickHandler(flag) {
    console.log(`Decide button clicked for ${flag}`);

    // Instantiate an Optimizely client object
    var optimizelyClient = optimizely_flag_dependencies.createInstance({
        sdkKey: document.getElementById("sdkKey").value
    });

    optimizelyClient.onReady().then(() => {

        // Create user context
        var userId = "user123";
        var attrs = {
            in_audience_1: document.getElementById("in_audience_1").checked,
            in_audience_2: document.getElementById("in_audience_2").checked
        }
        var user = optimizelyClient.createUserContext(userId, attrs);
        console.log(`Created user context with userId=${userId} and attrs=${JSON.stringify(attrs)}`);

        let isOn = optimizelyClient.decideWithDependencies(user, flag).enabled;
        let flagElt = document.getElementById(flag);
        flagElt.innerHTML = isOn ? "ON" : "OFF";
        flagElt.setAttribute("state", isOn ? "on" : "off");
    })
}

export { init };