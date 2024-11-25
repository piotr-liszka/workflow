import { SubjectMarker } from './subject-marker';
import { WorkflowLogicError } from '../errors/workflow-logic.error';
import { MarkingState } from './marking-state';
import { WorkflowSubject } from './subject';

export class SubjectPropertyMarker<
  SUBJECT extends WorkflowSubject = WorkflowSubject,
> implements SubjectMarker<SUBJECT>
{
  constructor(private property = 'marker') {}

  writeState(subject: SUBJECT, state: MarkingState): void {
    if (!subject || typeof subject !== 'object') {
      throw new WorkflowLogicError(
        `Subject ${subject} is not an object, or its empty.`,
      );
    }

    const value = {
      [this.property]: Object.fromEntries(state.places),
    };

    Object.assign(subject, value);
  }

  readState(subject: SUBJECT): MarkingState {
    if (!subject || typeof subject !== 'object') {
      throw new WorkflowLogicError(
        `Subject ${subject} is not an object, or its empty.`,
      );
    }

    let currentValue = subject.hasOwnProperty(this.property)
      ? subject[this.property as keyof SUBJECT]
      : null;

    if (!currentValue) {
      return new MarkingState([]);
    }

    if (typeof currentValue === 'string') {
      return new MarkingState([[currentValue, 1]]);
    }

    if (typeof currentValue === 'object') {
      return new MarkingState(Object.entries(currentValue));
    }

    throw new WorkflowLogicError(
      `Value in subject should match string or Record<string, number>.`,
    );
  }
}
