# Implementation Notes

Here are a few notes I took while building this demo. They may be useful if flag dependencies is shipped as a formal Full Stack product feature.

### Returning the default variation vs `off` when a dependency is not satisfied

If `flag_2` depends on `flag_1`, `flag_dependencies.decide()` uses the following logic to make a decision for `flag_2`:

- If `flag_1` is enabled, decide `flag_2` according to the experiment and rollout rules specified in the flag configuration.
- If `flag_1` is not enabled, return `flag_2` _default variation_: the variation specified in the "for everyone else" rule.

You could argue that in the second scenario it would make more sense to return `flag_2`'s `off` variation. However, this was difficult to implement because the [`OptimizelyFeature`](https://docs.developers.optimizely.com/full-stack/docs/optimizelyconfig-javascript-node#object-model) object does not contain a top level map of variations. Instead, variations are children of the `OptimizelyExperiment` "rule" objects in `OptimizelyFeature.experimentRules` and `OptimizelyFeature.deliveryRules`




