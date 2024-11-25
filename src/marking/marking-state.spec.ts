import { MarkingState } from './marking-state';
import { describe, expect, it } from '@jest/globals';

describe('SubjectState', () => {
  it('should initialize with a single place', () => {
    const state = new MarkingState([['place1', 1]]);
    expect(state.places.get('place1')).toBe(1);
  });

  it('should initialize with multiple places', () => {
    const state = new MarkingState([
      ['place1', 1],
      ['place2', 1],
    ]);
    expect(state.places.size).toBe(2);
    expect(state.places.get('place1')).toBe(1);
    expect(state.places.get('place2')).toBe(1);
  });

  it('should increment the count for an existing place', () => {
    const state = new MarkingState([['place1', 1]]);
    state.markPlace('place2');
    state.markPlace('place3');
    state.markPlace('place1');
    expect(state.places.get('place1')).toBe(2);
    expect(state.places.size).toBe(3);
  });

  it('should add a new place if it does not exist', () => {
    const state = new MarkingState([['place1', 1]]);
    state.markPlace('place2');
    expect(state.places.get('place2')).toBe(1);
  });

  it('should handle an empty array of places', () => {
    const state = new MarkingState([]);
    expect(state.places.size).toBe(0);
  });
});
