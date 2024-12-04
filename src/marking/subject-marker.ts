import { MarkingState } from './marking-state';
import { WorkflowSubject } from './subject';

export interface SubjectMarker<
  SUBJECT extends WorkflowSubject = WorkflowSubject,
> {
  readState(subject: SUBJECT): MarkingState;

  writeState(subject: SUBJECT, state: MarkingState): void;
}
