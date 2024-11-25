import { WorkflowLogicError } from '../errors/workflow-logic.error';
import { describe, expect, it } from '@jest/globals';
import { SubjectPropertyMarker } from './subject-property-marker';
import { MarkingState } from './marking-state';
import { WorkflowSubject } from './subject';

type WorkflowSubjectMarker = WorkflowSubject & {
  marker?: { [key: string]: number };
};

type WorkflowSubjectPlace = WorkflowSubject & {
  places?: { [key: string]: number };
};

describe('MethodSubjectMarker', () => {
  describe('writeState', () => {
    it('should write single state to the subject', () => {
      const marker = new SubjectPropertyMarker();

      const subject: WorkflowSubjectMarker = {};
      const state = new MarkingState([['state1', 1]]);

      marker.writeState(subject, state);

      expect(subject.marker).toEqual({
        state1: 1,
      });
    });

    it('should write MULTIPLE states to the subject', () => {
      const marker = new SubjectPropertyMarker();

      const subject: WorkflowSubjectMarker = {};
      const state = new MarkingState([
        ['state1', 1],
        ['state2', 1],
        ['state5', 1],
      ]);

      marker.writeState(subject, state);

      expect(subject.marker).toEqual({
        state1: 1,
        state2: 1,
        state5: 1,
      });
    });

    it('should throw an error if subject is not an object', () => {
      const marker = new SubjectPropertyMarker();

      expect(() =>
        marker.writeState(null as any, new MarkingState([['state1', 1]])),
      ).toThrow(WorkflowLogicError);
      expect(() =>
        marker.writeState(
          'not an object' as any,
          new MarkingState([['state1', 1]]),
        ),
      ).toThrow(WorkflowLogicError);
    });

    it('should write to custom property', () => {
      const marker = new SubjectPropertyMarker<WorkflowSubjectPlace>('places');

      const subject: WorkflowSubjectPlace = {};
      const state = new MarkingState([['place1', 1]]);

      marker.writeState(subject, state);

      expect(subject.places).toEqual({ place1: 1 });
    });
  });

  describe('readState', () => {
    it('should read state from the subject', () => {
      const marker = new SubjectPropertyMarker<WorkflowSubjectMarker>();
      const subject: WorkflowSubjectMarker = {
        marker: {
          place1: 1,
        },
      };

      const state = marker.readState(subject);

      expect(state.places).toEqual(new Map([['place1', 1]]));
    });

    it('should read MULTIPLE states from the subject', () => {
      const marker = new SubjectPropertyMarker<WorkflowSubjectMarker>();
      const subject: WorkflowSubjectMarker = {
        marker: { state1: 1, state2: 1, state5: 1 },
      };

      const state = marker.readState(subject);

      expect(state.places).toEqual(
        new Map([
          ['state1', 1],
          ['state2', 1],
          ['state5', 1],
        ]),
      );
    });

    it('should fail when subject is not an object', () => {
      const marker = new SubjectPropertyMarker();

      expect(() => marker.readState('not an object' as any)).toThrow(
        WorkflowLogicError,
      );
      expect(() => marker.readState(null as any)).toThrow(WorkflowLogicError);
    });

    it('should read state as empty from the empty subject', () => {
      const marker = new SubjectPropertyMarker();
      const subject = {};

      const state = marker.readState(subject);

      expect(state.places).toEqual(new Map());
    });

    it('write from custom property', () => {
      const marker = new SubjectPropertyMarker<WorkflowSubjectPlace>('places');
      const subject: WorkflowSubjectPlace = { places: { place1: 1 } };

      const state = marker.readState(subject);

      expect(state.places).toEqual(new Map([['place1', 1]]));
    });
  });
});
