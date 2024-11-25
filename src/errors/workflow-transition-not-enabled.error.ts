export class WorkflowTransitionNotEnabledError implements Error {
  name = 'TransitionNotEnabledError';
  message: string;
  constructor(transitionName: string) {
    this.message = `Transition with name "${transitionName}" can't be applied.`;
  }
}
