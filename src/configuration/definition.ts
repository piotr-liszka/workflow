import { WorkflowLogicError } from '../errors/workflow-logic.error';
import { Transition } from './transition';

export class Definition {
  private places = new Set<string>();
  private transitions: Transition[] = [];
  private initialPlaces = new Set<string>();

  constructor(
    places: string[],
    transitions: Transition[],
    initialPlaces?: string | string[],
  ) {
    places.forEach((place) => this.addPlace(place));
    transitions.forEach((transition) => this.addTransition(transition));
    this.setInitialPlaces(initialPlaces);
  }

  getInitialPlaces(): Set<string> {
    return this.initialPlaces;
  }

  getPlaces(): Set<string> {
    return this.places;
  }

  getTransitions(): Transition[] {
    return this.transitions;
  }

  private setInitialPlaces(places?: string | string[]): void {
    if (!places) {
      return;
    }

    const placeArray = Array.isArray(places)
      ? new Set(places)
      : new Set([places]);

    placeArray.forEach((place) => {
      if (!this.places.has(place)) {
        throw new WorkflowLogicError(
          `Place "${place}" cannot be the initial place as it does not exist in all places.`,
        );
      }
    });

    this.initialPlaces = placeArray;
  }

  private addPlace(place: string): void {
    if (this.places.has(place)) {
      return;
    }

    this.places.add(place);

    if (this.places.size === 1) {
      this.initialPlaces = new Set([place]);
    }
  }

  private addTransition(transition: Transition): void {
    transition.getFroms().forEach((from) => {
      this.addPlace(from);
    });

    transition.getTos().forEach((to) => {
      this.addPlace(to);
    });

    this.transitions.push(transition);
  }
}
