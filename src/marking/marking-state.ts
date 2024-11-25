import { WorkflowInvalidArgumentError } from '../errors/workflow-invalid-argument.error';

export class MarkingState {
  /**
   * @desc places with the number of tokens.
   */
  places: Map<string, number>;

  constructor(places: [string, number][]) {
    this.places = new Map(places);
  }

  markPlace(place: string, token = 1) {
    const currentToken = this.places.get(place);

    this.places.set(place, !currentToken ? token : currentToken + token);
  }

  unmarkPlace(place: string, token = 1) {
    if (token < 1) {
      throw new WorkflowInvalidArgumentError(
        `The number of tokens must be greater than 0, "${token}" given.`,
      );
    }

    const currentToken = this.places.get(place);

    if (currentToken === undefined) {
      throw new WorkflowInvalidArgumentError(
        `The place "${place}" is not marked.`,
      );
    }

    const nextToken = currentToken - token;

    if (nextToken < 0) {
      throw new WorkflowInvalidArgumentError(
        `The place "${place}" could not contain a negative token number: "${currentToken}" (initial) - "${token}" (nextToken) = "${nextToken}".`,
      );
    }

    if (nextToken === 0) {
      this.places.delete(place);
    } else {
      this.places.set(place, nextToken);
    }
  }
}
