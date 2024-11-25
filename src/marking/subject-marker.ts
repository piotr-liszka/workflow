import { WorkflowSubject } from '../interfaces/subject';
import { MarkingState } from './marking-state';

export interface SubjectMarker<
  SUBJECT extends WorkflowSubject = WorkflowSubject,
> {
  readState(subject: SUBJECT): MarkingState;

  writeState(subject: SUBJECT, state: MarkingState): void;
}
