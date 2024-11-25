import { Transition } from './transition';
import { describe, expect, it } from '@jest/globals';

describe('Transition', () => {
  it('should create a Transition instance with the correct name', () => {
    const transition = new Transition('testTransition');
    expect(transition.getName()).toBe('testTransition');
  });

  it('should initialize froms and tos as empty sets by default', () => {
    const transition = new Transition('testTransition');
    expect(transition.getFroms().size).toBe(0);
    expect(transition.getTos().size).toBe(0);
  });

  it('should initialize froms and tos with provided values', () => {
    const transition = new Transition('testTransition', 'start', 'end');
    expect(transition.getFroms().has('start')).toBe(true);
    expect(transition.getTos().has('end')).toBe(true);
  });

  it('should handle array inputs for froms and tos', () => {
    const transition = new Transition(
      'testTransition',
      ['start1', 'start2'],
      ['end1', 'end2'],
    );
    expect(transition.getFroms().has('start1')).toBe(true);
    expect(transition.getFroms().has('start2')).toBe(true);
    expect(transition.getTos().has('end1')).toBe(true);
    expect(transition.getTos().has('end2')).toBe(true);
  });
});
