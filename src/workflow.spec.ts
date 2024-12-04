import { describe, expect, test } from '@jest/globals';
import { Workflow } from './workflow';
import { Definition } from './configuration/definition';
import { SubjectPropertyMarker } from './marking/subject-property-marker';
import { Transition } from './configuration/transition';
import { WorkflowTransitionNotExistError } from './errors/workflow-transition-not-exist.error';
import { WorkflowTransitionNotEnabledError } from './errors/workflow-transition-not-enabled.error';
import { Guard } from './configuration/guard';

const createThreeStepWorkflowDefinition = (): Definition => {
  return new Definition(
    ['a', 'b', 'c'],
    [
      new Transition('a_to_b', ['a'], ['b']),
      new Transition('b_to_c', ['b'], ['c']),
    ],
  );

  // +---+     +--------+     +---+     +--------+     +----+
  // | a | --> | a_to_b | --> | b | --> | b_to_c | --> | c  |
  // +---+     +--------+     +---+     +--------+     +----+
};
const createComplexWorkflowDefinition = (): Definition => {
  const places = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  const transitions = [
    new Transition('t1', 'a', ['b', 'c']),
    new Transition('t2', ['b', 'c'], 'd'),
    new Transition('t3', 'd', 'e'),
    new Transition('t4', 'd', 'f'),
    new Transition('t5', 'e', 'g'),
    new Transition('t6', 'f', 'g'),
  ];

  // +---+     +----+     +---+     +----+     +----+     +----+     +----+     +----+     +---+
  // | a | --> | t1 | --> | c | --> | t2 | --> | d  | --> | t4 | --> | f  | --> | t6 | --> | g |
  // +---+     +----+     +---+     +----+     +----+     +----+     +----+     +----+     +---+
  //             |                    ^          |                                           ^
  //             |                    |          |                                           |
  //             v                    |          v                                           |
  //           +----+                 |        +----+     +----+     +----+                  |
  //           | b  | ----------------+        | t3 | --> | e  | --> | t5 | -----------------+
  //           +----+                          +----+     +----+     +----+

  return new Definition(places, transitions);
};

const createLongWorkflowDefinition = (): Definition => {
  const places = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  const transitions = [
    new Transition('t1', 'a', 'b'),
    new Transition('t2', 'b', 'c'),
    new Transition('t3', 'c', 'd'),
    new Transition('t4', 'c', 'e'),
    new Transition('t5', 'e', 'f'),
    new Transition('t6', 'd', 'f'),
  ];

  // +---+     +----+     +---+     +----+     +----+     +----+     +----+     +----+     +---+
  // | a | --> | t1 | --> | b | --> | t2 | --> | c  | --> | t4 | --> | e  | --> | t6 | --> | f |
  // +---+     +----+     +---+     +----+     +----+     +----+     +----+     +----+     +---+
  //                                             |                                           ^
  //                                             |                                           |
  //                                             v                                           |
  //                                           +----+     +----+     +----+                  |
  //                                           | t3 | --> | d  | --> | t5 | -----------------+
  //                                           +----+     +----+     +----+

  return new Definition(places, transitions);
};

const createComplexWorkflowDefinitionWithGuards = (): Definition => {
  const places = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  const transitions = [
    new Transition('t1', 'a', 'b'),
    new Transition('t2', 'b', 'c'),
    new Transition('t3', 'c', 'd'),
    new Transition('t4', 'c', 'e', [Guard.fromQuery('propertyA === true')]),
    new Transition('t5', 'e', 'f'),

    new Transition('t6', 'd', 'f', [Guard.fromQuery('propertyB === 2')]),

    new Transition('t7', 'd', 'g', [Guard.fromQuery('propertyB === 4')]),
    new Transition('t8', 'g', 'h'),
    new Transition('t9', 'h', 'f'),
  ];
  //                                                   guard "propertyA === true"
  //                                                   v
  //                                                   v
  // +---+     +----+     +---+     +----+     +----+     +----+     +----+     +----+     +----+
  // | a | --> | t1 | --> | b | --> | t2 | --> | c  | --> | t4 | --> | e  | --> | t6 | --> | f  |
  // +---+     +----+     +---+     +----+     +----+     +----+     +----+     +----+     +----+
  //                                             |                                ^           ^
  //                                             |                                |           |
  //                                             v                                |           |
  //                                           +----+     +----+                  |        +----+
  //                                           | t3 | --> | d  | -----------------+        | t9 |
  //                                           +----+     +----+    "propertyB === 2"      +----+
  //                                                        |                                ^
  //                                                        |                                |
  //                                                        | ~ "propertyB === 4"            |
  //                                                        v                                |
  //                                                      +----+     +----+     +----+     +----+
  //                                                      | t7 | --> | g  | --> | t8 | --> | h  |
  //                                                      +----+     +----+     +----+     +----+

  return new Definition(places, transitions);
};
const createWorkflowWithSameNameTransition = (): Definition => {
  const places = ['a', 'b', 'c'];

  const transitions = [
    new Transition('a_to_bc', 'a', ['b', 'c']),
    new Transition('b_to_c', 'b', 'c'),
    new Transition('to_a', 'b', 'a'),
    new Transition('to_a', 'c', 'a'),
  ];

  return new Definition(places, transitions);

  //   +------------------------------------------------------------+
  //   |                                                            |
  //   |                                                            |
  //   |         +----------------------------------------+         |
  //   v         |                                        v         |
  // +---+     +---------+     +---+     +--------+     +---+     +------+
  // | a | --> | a_to_bc | --> | b | --> | b_to_c | --> | c | --> | to_a | -+
  // +---+     +---------+     +---+     +--------+     +---+     +------+  |
  //   ^                         |                                  ^       |
  //   |                         +----------------------------------+       |
  //   |                                                                    |
  //   |                                                                    |
  //   +--------------------------------------------------------------------+
};

describe('Workflow', () => {
  describe('process', () => {
    test('should process from the beginning to the end in simple workflow', () => {
      const subject: { marker?: Record<string, number> } = {};

      const workflow = new Workflow(
        'example_workflow',
        createThreeStepWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      workflow.process(subject);
      expect(subject).toEqual({
        marker: {
          c: 1,
        },
      });
    });
    test('should process from the specific place to the end in simple workflow', () => {
      const subject: { marker?: Record<string, number> } = {
        marker: { b: 1 },
      };

      const workflow = new Workflow(
        'example_workflow',
        createThreeStepWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      workflow.process(subject);
      expect(subject).toEqual({
        marker: {
          c: 1,
        },
      });
    });
    test('should process as far as it is possible in complex workflow', () => {
      const subject: { marker?: Record<string, number> } = {
        marker: { a: 1 },
      };

      const workflow = new Workflow(
        'example_workflow',
        createLongWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      const transitions = workflow.process(subject);
      expect(subject).toEqual({
        marker: {
          c: 1,
        },
      });

      expect(transitions).toEqual([
        new Transition('t1', 'a', 'b'),
        new Transition('t2', 'b', 'c'),
      ]);
    });
    test('should process from the beginning to the end in complex workflow with guards', () => {
      const subject: {
        marker?: Record<string, number>;
        propertyA: boolean;
        propertyB: number;
      } = {
        marker: {
          a: 1,
        },
        propertyA: false,
        propertyB: 4,
      };

      const workflow = new Workflow(
        'example_workflow',
        createComplexWorkflowDefinitionWithGuards(),
        new SubjectPropertyMarker(),
      );

      const transitions = workflow.process(subject);
      expect(subject).toEqual({
        marker: {
          f: 1,
        },
        propertyA: false,
        propertyB: 4,
      });

      expect(transitions.length).toEqual(6);
    });
  });
  describe('can', () => {
    test('should return false for unknown transition', () => {
      const subject = {};
      const workflow = new Workflow(
        'example_workflow',
        createThreeStepWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      const result = workflow.can(subject, 'unknown_transition');
      expect(result).toBeFalsy();
    });

    test('should return valid values for simple workflow', () => {
      const subject = {
        state: 'a',
      };
      const workflow = new Workflow(
        'example_workflow',
        createThreeStepWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      const result = workflow.can(subject, 'a_to_b');
      expect(result).toBeTruthy();

      const failedResult = workflow.can(subject, 'b_to_c');
      expect(failedResult).toBeFalsy();
    });

    test('should return valid values for complex workflow', () => {
      let subject: { marker?: Record<string, number> } = {};
      const workflow = new Workflow(
        'example_workflow',
        createComplexWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      expect(workflow.can(subject, 't1')).toBeTruthy();
      expect(workflow.can(subject, 't2')).toBeFalsy();

      subject.marker = { b: 1 };
      expect(workflow.can(subject, 't1')).toBeFalsy();

      // In a workflow net (Petri net), all "from" places should contain a token to enable the transition.
      expect(workflow.can(subject, 't2')).toBeFalsy();

      subject.marker = { b: 1, c: 1 };
      expect(workflow.can(subject, 't1')).toBeFalsy();
      expect(workflow.can(subject, 't2')).toBeTruthy();

      subject.marker = { f: 1 };
      expect(workflow.can(subject, 't5')).toBeFalsy();
      expect(workflow.can(subject, 't6')).toBeTruthy();
    });

    test('should return valid values for workflow with same name transitions', () => {
      const subject: { marker?: Record<string, number> } = {};

      const workflow = new Workflow(
        'example_workflow',
        createWorkflowWithSameNameTransition(),
        new SubjectPropertyMarker(),
      );

      const result = workflow.can(subject, 'a_to_bc');
      expect(result).toBeTruthy();

      const failedResult = workflow.can(subject, 'b_to_c');
      expect(failedResult).toBeFalsy();

      const failedResult2 = workflow.can(subject, 'to_a');
      expect(failedResult2).toBeFalsy();

      subject.marker = { b: 1 };

      const failedResult3 = workflow.can(subject, 'a_to_bc');
      expect(failedResult3).toBeFalsy();

      const result2 = workflow.can(subject, 'b_to_c');
      expect(result2).toBeTruthy();

      const result3 = workflow.can(subject, 'to_a');
      expect(result3).toBeTruthy();
    });

    test('should allow/not allow to apply transition according to guards', () => {
      const subject: { marker?: Record<string, number>; propertyB?: number } = {
        marker: {
          d: 1,
        },
      };

      const workflow = new Workflow(
        'example_workflow',
        createComplexWorkflowDefinitionWithGuards(),
        new SubjectPropertyMarker(),
      );

      expect(workflow.can(subject, 't7')).toBeFalsy();
      subject.propertyB = 3;
      expect(workflow.can(subject, 't7')).toBeFalsy();
      subject.propertyB = 4;
      expect(workflow.can(subject, 't7')).toBeTruthy();
    });
  });

  describe('apply', () => {
    test('should receive state with two places for transition t1', () => {
      const subject: { marker?: Record<string, number> } = {};

      const workflow = new Workflow(
        'example_workflow',
        createComplexWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      workflow.apply(subject, 't1');

      expect(subject).toEqual({
        marker: { b: 1, c: 1 },
      });
    });

    test('should throw an exception for invalid transition, or not available transition for given place', () => {
      const subject = {};
      const workflow = new Workflow(
        'example_workflow',
        createComplexWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      expect(() => workflow.apply(subject, 't_not_exists')).toThrow(
        WorkflowTransitionNotExistError,
      );

      expect(() => workflow.apply(subject, 't2')).toThrow(
        WorkflowTransitionNotEnabledError,
      );
    });

    test('should apply only valid transition, second should throw an error', () => {
      const subject: { marker?: Record<string, number> } = {
        marker: { c: 1, e: 1 },
      };

      const workflow = new Workflow(
        'example_workflow',
        createComplexWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      workflow.apply(subject, 't5');

      expect(subject).toEqual({
        marker: { c: 1, g: 1 },
      });

      // due to missing token in place 'e' we can't apply 't2' transition
      expect(() => workflow.apply(subject, 't2')).toThrow(
        WorkflowTransitionNotEnabledError,
      );
    });

    test('should go from start to end in complex workflow', () => {
      const subject: { marker?: Record<string, number> } = {};

      const workflow = new Workflow(
        'example_workflow',
        createComplexWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      workflow.apply(subject, 't1');
      expect(subject).toEqual({ marker: { b: 1, c: 1 } });

      workflow.apply(subject, 't2');
      expect(subject).toEqual({ marker: { d: 1 } });

      workflow.apply(subject, 't3');
      expect(subject).toEqual({ marker: { e: 1 } });

      workflow.apply(subject, 't5');
      expect(subject).toEqual({ marker: { g: 1 } });
    });

    test('should apply with the same name transitions', () => {
      const subject: { marker?: Record<string, number> } = {};

      const workflow = new Workflow(
        'example_workflow',
        createWorkflowWithSameNameTransition(),
        new SubjectPropertyMarker(),
      );

      workflow.apply(subject, 'a_to_bc');
      expect(subject).toEqual({ marker: { b: 1, c: 1 } });

      workflow.apply(subject, 'to_a');
      expect(subject).toEqual({ marker: { a: 2 } });

      workflow.apply(subject, 'a_to_bc');
      workflow.apply(subject, 'b_to_c');
      expect(subject).toEqual({ marker: { a: 1, c: 2 } });

      workflow.apply(subject, 'to_a');
      expect(subject).toEqual({ marker: { a: 2, c: 1 } });
    });

    test('should  apply transition according to guards', () => {
      const subject: { marker?: Record<string, number>; propertyB?: number } = {
        marker: {
          d: 1,
        },
      };

      const workflow = new Workflow(
        'example_workflow',
        createComplexWorkflowDefinitionWithGuards(),
        new SubjectPropertyMarker(),
      );

      expect(() => workflow.apply(subject, 't7')).toThrow(
        WorkflowTransitionNotEnabledError,
      );

      subject.propertyB = 4;
      workflow.apply(subject, 't7');

      expect(subject).toEqual({
        propertyB: 4,
        marker: { g: 1 },
      });
    });
  });

  describe('getEnabledTransitions', () => {
    test('should return enabled transition for place a', () => {
      const subject: { marker?: Record<string, number> } = {};

      const workflow = new Workflow(
        'example_workflow',
        createComplexWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      const response = workflow.getEnabledTransitions(subject);

      expect(response).toEqual([new Transition('t1', 'a', ['b', 'c'])]);
    });

    test('should return two available transitions for place d', () => {
      const subject: { marker?: Record<string, number> } = {
        marker: { d: 1 },
      };

      const workflow = new Workflow(
        'example_workflow',
        createComplexWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      const response = workflow.getEnabledTransitions(subject);

      expect(response).toEqual([
        new Transition('t3', 'd', 'e'),
        new Transition('t4', 'd', 'f'),
      ]);
    });

    test('should return only one valid transition', () => {
      const subject: { marker?: Record<string, number> } = {
        marker: { c: 1, e: 1 },
      };

      const workflow = new Workflow(
        'example_workflow',
        createComplexWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      const response = workflow.getEnabledTransitions(subject);

      expect(response).toEqual([new Transition('t5', 'e', 'g')]);
    });
  });

  describe('getState', () => {
    test('should throw an exception when we are unable to set initial place', () => {
      expect.assertions(1);

      const subject = {};
      const workflow = new Workflow(
        'example_workflow',
        new Definition([], []),
        new SubjectPropertyMarker(),
      );

      try {
        workflow.getState(subject);
      } catch (e) {
        expect(e.message).toEqual(
          'Current subject state is empty and there is no initial place for workflow "example_workflow".',
        );
      }
    });

    test('should throw an exception when initial place does not exist in workflow', () => {
      expect.assertions(1);

      const subject = {
        state: 'initial_place',
      };
      const workflow = new Workflow(
        'example_workflow',
        new Definition([], []),
        new SubjectPropertyMarker(),
      );

      try {
        workflow.getState(subject);
      } catch (e) {
        expect(e.message).toEqual(
          'Current subject state is empty and there is no initial place for workflow "example_workflow".',
        );
      }
    });

    test('should initialize initial place', () => {
      const subject = {};
      const workflow = new Workflow(
        'example_workflow',
        createThreeStepWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      const state = workflow.getState(subject);

      expect(state.places).toEqual(new Map([['a', 1]]));
    });

    test('should return state for subject with valid place', () => {
      const subject = {
        state: 'a',
      };
      const workflow = new Workflow(
        'example_workflow',
        createThreeStepWorkflowDefinition(),
        new SubjectPropertyMarker(),
      );

      const state = workflow.getState(subject);

      expect(state.places).toEqual(new Map([['a', 1]]));
    });
  });
});
