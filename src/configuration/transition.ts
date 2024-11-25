export class Transition {
  private froms = new Set<string>();
  private tos = new Set<string>();

  /**
   *
   * @param name - string representing the name of the transition
   * @param froms - string or array of strings representing the starting points
   * @param tos - string or array of strings representing the ending points
   */
  constructor(
    private name: string,
    froms: string | string[] = [],
    tos: string | string[] = [],
  ) {
    this.froms = Array.isArray(froms) ? new Set(froms) : new Set([froms]);
    this.tos = Array.isArray(tos) ? new Set(tos) : new Set([tos]);
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
}
