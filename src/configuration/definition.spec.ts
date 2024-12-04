import { describe, expect, it } from '@jest/globals';
import { Transition } from './transition';
import { Definition } from './definition';
import { WorkflowSetupError } from '../errors/workflow-setup.error';

describe('Definition', () => {
  const twoTransitions = [
    new Transition('t1', ['a'], ['b']),
    new Transition('t2', ['b'], ['c']),
  ];

  it('should initialize with given places and transitions', () => {
    const definition = new Definition(['a', 'b', 'c'], twoTransitions);

    expect(definition.getPlaces()).toEqual(new Set(['a', 'b', 'c']));
    expect(definition.getTransitions()).toEqual(twoTransitions);
  });

  it('should set initial places if provided', () => {
    const definition = new Definition(['a', 'b', 'c'], twoTransitions, 'a');

    expect(definition.getInitialPlaces()).toEqual(new Set(['a']));
  });

  it('should set first place as initial place', () => {
    const definition = new Definition(['d', 'e', 'f'], twoTransitions);

    expect(definition.getInitialPlaces()).toEqual(new Set(['d']));
  });

  it('should throw an error if initial place does not exist', () => {
    expect(() => {
      new Definition(['a', 'b', 'c'], twoTransitions, 'd');
    }).toThrow(WorkflowSetupError);
  });

  it('should add places from transitions if not provided initially', () => {
    const definition = new Definition([], twoTransitions);

    expect(definition.getPlaces()).toEqual(new Set(['a', 'b', 'c']));
  });

  it('should handle multiple initial places', () => {
    const definition = new Definition(['a', 'b', 'c'], twoTransitions, [
      'a',
      'b',
    ]);

    expect(definition.getInitialPlaces()).toEqual(new Set(['a', 'b']));
  });

  it('should throw an error if any initial place does not exist', () => {
    expect(() => {
      new Definition(['a', 'b', 'c'], twoTransitions, ['a', 'd']);
    }).toThrow(WorkflowSetupError);
  });
});
