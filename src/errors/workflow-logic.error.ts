export class WorkflowLogicError implements Error {
  name = 'WorkflowLogicError';
  message = 'Workflow logic error';
  constructor(message?: string) {
    if (message) {
      this.message = message;
    }
  }
}
