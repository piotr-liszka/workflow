import { Guard } from './guard';
import { WorkflowSetupError } from '../errors/workflow-setup.error';
import { describe, expect, it } from '@jest/globals';

describe('Guard', () => {
  it('should create a guard from a query with === operator (type check)', () => {
    const guard = Guard.fromQuery<{ name: string | number }>('name === "1"');
    expect(guard.check({ name: '1' })).toBe(true);
    expect(guard.check({ name: 1 })).toBe(false);
  });

  it('should create a guard from a query with === operator', () => {
    const guard = Guard.fromQuery<{ name: string }>('name === "John"');
    expect(guard.check({ name: 'John' })).toBe(true);
    expect(guard.check({ name: 'Doe' })).toBe(false);

    const guard2 = Guard.fromQuery<{ name: string }>('name === "John"');
    expect(guard.check({ name: 'John' })).toBe(true);
    expect(guard.check({ name: 'Doe' })).toBe(false);
  });

  it('should create a guard from a query with !== operator', () => {
    const guard = Guard.fromQuery<{ name: string }>('name !== "John"');
    expect(guard.check({ name: 'John' })).toBe(false);
    expect(guard.check({ name: 'Doe' })).toBe(true);
  });

  it('should create a guard from a query with > operator', () => {
    const guard = Guard.fromQuery<{ age: number }>('age > 18');
    expect(guard.check({ age: 20 })).toBe(true);
    expect(guard.check({ age: 18 })).toBe(false);
  });

  it('should create a guard from a query with < operator', () => {
    const guard = Guard.fromQuery<{ age: number }>('age < 18');
    expect(guard.check({ age: 16 })).toBe(true);
    expect(guard.check({ age: 18 })).toBe(false);
  });

  it('should create a guard from a query with >= operator', () => {
    const guard = Guard.fromQuery<{ age: number }>('age >= 18');
    expect(guard.check({ age: 18 })).toBe(true);
    expect(guard.check({ age: 17 })).toBe(false);
  });

  it('should create a guard from a query with <= operator', () => {
    const guard = Guard.fromQuery<{ age: number }>('age <= 18');
    expect(guard.check({ age: 18 })).toBe(true);
    expect(guard.check({ age: 19 })).toBe(false);
  });

  it('should create a guard from a query with <= operator', () => {
    const guard = Guard.fromQuery<{ valid: boolean }>('valid === true');
    expect(guard.check({ valid: true })).toBe(true);
    expect(guard.check({ valid: false })).toBe(false);
  });

  it('should throw an error for unsupported operator', () => {
    expect(() => {
      Guard.fromQuery('age == 18');
    }).toThrow(WorkflowSetupError);
  });

  it('should throw an error for invalid query format', () => {
    expect(() => {
      Guard.fromQuery('invalid query');
    }).toThrow(WorkflowSetupError);
  });
});
