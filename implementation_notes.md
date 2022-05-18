# Implementation Notes

Here are a few notes I took while building this demo.

### Returning the default variation vs `off` when a dependency is not satisfied

If `flag_2` depends on `flag_1`, `flag_dependencies.decide()` uses the following logic to make a decision for `flag_2`:

- If `flag_1` is enabled, decide `flag_2` according to the experiment and rollout rules specified in the flag configuration.
- If `flag_1` is not enabled, return `flag_2` _default variation_: the variation specified in the "for everyone else" rule.

You could argue that in the second scenario it would make more sense to return `flag_2`'s `off` variation. However, this wasn't possible to implement because [`setForcedDecision`](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/forced-decision-methods-javascript-browser#set-forced-decision-method---setforceddecision) only works when the specified variation is associated with an existing flag rule, so you can't force `off` if `off` isn't associated with any decision rules.

### Stateful dependency evaluation using a User Profile Service

This demo uses _stateless_ evaluation to check dependencies, which means that a dependency on `flag_1` could be satisfied _even if `flag_1` was never actually enabled for that user_.

Optimizely SDKs can store decision histories in a [User Profile Service](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/implement-a-user-profile-service-javascript) if one is supplied during during initialization, and it seems natural to use this for _stateful_ dependency evaluation..

However, this isn't possible today because the Optimizely SDK _only stores experiment rule decisions_ in a decision service.


