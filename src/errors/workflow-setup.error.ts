export class WorkflowSetupError implements Error {
  name = 'WorkflowSetupError';
  message = 'Workflow error during setup';
  constructor(message?: string) {
    if (message) {
      this.message = message;
    }
  }
}
