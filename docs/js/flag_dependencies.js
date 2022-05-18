import "https://unpkg.com/@optimizely/optimizely-sdk@4.9.1/dist/optimizely.browser.umd.min.js";

/**
 * Makes a flag decision that respects any dependencies specified in the '_depends' flag variable
 * @param {Object} optimizelyClient 	An OptimizelyClient instance
 * @param {Object} userContext  		An OptimizelyUserContext object representing the user 
 * @param {String} flagKey      		The flag key 
 * @param {Object} options      		[Array of OptimizelyDecideOption enums]
 */
function decide(optimizelyClient, userContext, flagKey, options = null) {
	console.log(`Deciding flag ${flagKey} with stateless dependencies`);
	let dependencyConfig = new DependencyConfig(optimizelyClient, flagKey);

	// Determine whether all dependencies are satisfied
	dependencyConfig.getDependencies().every(dependency => {
		console.log(`  Checking dependency ${dependency.getDepStr()}`);

		// Make a "silent" decision (without firing a decision event) for this dependency flag
		let decision = userContext.decide(dependency.flagKey, [
			optimizelySdk.OptimizelyDecideOption.DISABLE_DECISION_EVENT,
			optimizelySdk.OptimizelyDecideOption.IGNORE_USER_PROFILE_SERVICE,
		]);

		if (dependency.isSatisfiedBy(decision)) {
			// This dependency is satisfied; continue evaluating dependencies
			console.log(`${flagKey} dependency ${dependency.getDepStr()} is satisifed`);
		} else {
			// This dependency is not satisfied. Force a null decision for this flag and 
			// stop evaluating dependencies.
			console.log(`${flagKey} dependency ${dependency.getDepStr()} is NOT satisifed`);
			console.log(`Setting forced variation ${dependencyConfig.defaultVariation} for flag ${flagKey}`);
			userContext.setForcedDecision(
				{ flagKey: flagKey },
				{ variationKey: dependencyConfig.defaultVariation }
			);
			return false;
		}
	})

	// Make the decision for flagKey
	// If flagKey has any disabled dependencies, decide() will return "off"
	var decision = userContext.decide(flagKey, options);

	// Remove the forced decision rule
	userContext.removeForcedDecision({ flagKey: flagKey, ruleKey: null });

	return decision;
}



/**
 * Represents a flag dependency
 */
class Dependency {

	/**
	 * Construcs a Dependency object by converting a dependency string, e.g. "flagKey" or 
	 * "flagKey:variationKey", into a Dependency object. 
	 * @param {String} dependencyStr 	A dependency string, e.g. "flagKey:variationKey"
	 */
	constructor(dependencyStr) {
		let flagAndVariation = dependencyStr.split(/:/);
		this.flagKey = flagAndVariation[0];
		this.variationKey = flagAndVariation[1] || null;
	}

	/**
	 * Returns true iff the passed decision satisfies this dependency
	 * @param {Object} decision  		An OptimizelyDecision object
	 * @returns Boolean
	 */
	isSatisfiedBy(decision) {
		if (this.variationKey == null) {
			return decision.enabled;
		} else {
			return decision.variationKey == this.variationKey;
		}
	}

	/**
	 * Returns the string representation of this dependency
	 * @returns String
	 */
	getDepStr() {
		let dependencyString = this.flagKey;
		if (this.variationKey) {
			dependencyString += `:${this.variationKey}`
		}
		return dependencyString;
	}
}

/**
 * Represents a set of dependencies
 */
class Dependencies {

	/**
	 * Constructs a Dependencies object by parsing a string of dependencies, e.g.
	 * "flag1, flag2:variation4"
	 * @param {String} dependenciesStr
	 */
	constructor(dependenciesStr) {
		this.dependencies = [];

		if (typeof dependenciesStr === "string" || dependenciesStr instanceof String) {
			dependenciesStr.split(/[, ]+/).forEach(dependencyStr => {
				this.dependencies.push(new Dependency(dependencyStr));
			});
		}
	}
}

/**
 * Represents the dependency configuration for a given feature flag
 * 
 * Dependencies may be specified by attaching a special `_depends_on` string variable to a flag. 
 * The default value of this variable must a comma-separated list of dependencies, where each 
 * dependency is specified using one of the following formats:
 * 
 * 		flagKey					- this dependency is satisfied when the flag specified by flagKey 
 * 								  would concurrently be (in the stateless case) or was last decided
 * 								  as (in the stateful case) enabled
 * 
 * 		flagKey:variationKey	- this dependency is satisfied when the flag specified by flagKey
 * 								  would concurrently be (in the stateless case) or was last decided
 * 								  (in the stateful case) in the specified variation
 */
class DependencyConfig {

	/**
	 * Constructs a DependencyConfig object for the specified flag
	 * @param {Object} optimizelyClient		An OptimizelyClient instance 
	 * @param {String} flagKey 				The flag key
	 */
	constructor(optimizelyClient, flagKey) {
		// "reserved" flag variable name used to specify dependencies
		const DEPENDS_ON_VARIABLE_KEY = "_depends_on";

		this.dependenciesStr = null;
		this.defaultVariation = null;

		let config = optimizelyClient.getOptimizelyConfig();

		// Check whether the given flag exists in the Optimizely configuration
		if (config.featuresMap.hasOwnProperty(flagKey)) {
			let flag = config.featuresMap[flagKey];

			// Extract this flag's dependencies from the Optimizely configuration
			if (flag.variablesMap.hasOwnProperty(DEPENDS_ON_VARIABLE_KEY)) {
				this.dependenciesStr = flag.variablesMap[DEPENDS_ON_VARIABLE_KEY].value;
			}

			// Extract the default variation from the Optimizely configuration
			// The default variation is the only variation in the last delivery rule for a flag. It is 
			// specified using the "Then, for everyone else" dropdown in the Optimizely Full Stack flag
			// rule configuration tool.
			//
			// The default variation is used when at least one dependency is not satisfied
			if (flag.deliveryRules.length > 0) {
				let lastRule = flag.deliveryRules[flag.deliveryRules.length - 1];
				this.defaultVariation = Object.keys(lastRule.variationsMap)[0] || null;
			}
		}

		this.dependencies = new Dependencies(this.dependenciesStr);

	}

	getDependencies() {
		return this.dependencies.dependencies;
	}
}

export { decide, DependencyConfig };