export class WorkflowTransitionNotExistError implements Error {
  name = 'TransitionNotExistError';
  message: string;
  constructor(transitionName: string) {
    this.message = `Transition with name "${transitionName}" not exist.`;
  }
}
