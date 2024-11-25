export class WorkflowInvalidArgumentError implements Error {
  name = 'WorkflowInvalidArgumentError';
  message = 'Invalid argument.';
  constructor(message?: string) {
    if (message) {
      this.message = message;
    }
  }
}
