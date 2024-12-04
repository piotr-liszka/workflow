import { WorkflowSubject } from '../marking/subject';
import { WorkflowSetupError } from '../errors/workflow-setup.error';

export class Guard<Subject = WorkflowSubject> {
  constructor(public check: (subject: Subject) => boolean) {}

  /**
   * Create a guard from a query string, see tests for examples.
   *
   * name === "John"
   * name !== "John"
   * age > 18
   * age < 18
   * isStudent === true
   *
   * possible operators: ===, !==, >, <, >=, <=
   *
   * @param query
   */
  static fromQuery<Subject = WorkflowSubject>(query: string): Guard<Subject> {
    const [property, operator, value] = query.split(' ');

    if (!['===', '!==', '>', '<', '>=', '<='].includes(operator)) {
      throw new WorkflowSetupError(`Unsupported operator: ${operator}`);
    }

    try {
      const parsedValue = JSON.parse(value);

      return new Guard<Subject>((subject: Subject) => {
        const subjectValue = (subject as any)[property];

        switch (operator) {
          case '===':
            return subjectValue === parsedValue;
          case '!==':
            return subjectValue !== parsedValue;
          case '>':
            return subjectValue > parsedValue;
          case '<':
            return subjectValue < parsedValue;
          case '>=':
            return subjectValue >= parsedValue;
          case '<=':
            return subjectValue <= parsedValue;
          default:
            return false;
        }
      });
    } catch (error) {
      throw new WorkflowSetupError(`Invalid query format: ${query}`);
    }
  }
}
