import { Guard } from './guard';
import { WorkflowSubject } from '../marking/subject';

export class Transition<Subject = WorkflowSubject> {
  private froms = new Set<string>();
  private tos = new Set<string>();
  private guards = new Set<Guard<Subject>>();

  /**
   *
   * @param name - string representing the name of the transition
   * @param froms - string or array of strings representing the starting points
   * @param tos - string or array of strings representing the ending points
   * @param guards - Guard or array of Guards representing the conditions to be met
   */
  constructor(
    private name: string,
    froms: string | string[] = [],
    tos: string | string[] = [],
    guards: Guard<Subject> | Guard<Subject>[] = [],
  ) {
    this.froms = Array.isArray(froms) ? new Set(froms) : new Set([froms]);
    this.tos = Array.isArray(tos) ? new Set(tos) : new Set([tos]);
    this.guards = Array.isArray(guards) ? new Set(guards) : new Set([guards]);
  }

  getName(): string {
    return this.name;
  }

  getFroms() {
    return this.froms;
  }

  getTos() {
    return this.tos;
  }

  getGuards() {
    return this.guards;
  }
}
