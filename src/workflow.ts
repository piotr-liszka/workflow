import { SubjectMarker } from './marking/subject-marker';
import { SubjectPropertyMarker } from './marking/subject-property-marker';
import { WorkflowLogicError } from './errors/workflow-logic.error';
import { MarkingState } from './marking/marking-state';
import { WorkflowTransitionNotExistError } from './errors/workflow-transition-not-exist.error';
import { WorkflowTransitionNotEnabledError } from './errors/workflow-transition-not-enabled.error';
import { WorkflowSubject } from './marking/subject';
import { Definition } from './configuration/definition';
import { Transition } from './configuration/transition';
import { TransitionResult } from './configuration/transition-result';

export class Workflow<SUBJECT extends WorkflowSubject = WorkflowSubject> {
  constructor(
    private name: string,
    private definition: Definition,
    private subjectMarker: SubjectMarker<SUBJECT> = new SubjectPropertyMarker<SUBJECT>(),
  ) {}

  getState(subject: SUBJECT): MarkingState {
    const state = this.subjectMarker.readState(subject);

    if (state.places.size === 0) {
      const workflowInitialPlace = this.definition.getInitialPlaces();

      if (workflowInitialPlace.size === 0) {
        throw new WorkflowLogicError(
          `Current subject state is empty and there is no initial place for workflow "${this.name}".`,
        );
      }

      for (let place of workflowInitialPlace) {
        state.markPlace(place);
      }

      this.subjectMarker.writeState(subject, state);
    }

    const workflowPlaces = this.definition.getPlaces();
    const currentPlaces = state.places;
    for (const [place] of currentPlaces) {
      if (!workflowPlaces.has(place)) {
        throw new WorkflowLogicError(
          `Place "${place}" is not valid for workflow "${this.name}".`,
        );
      }
    }
    return state;
  }

  process(subject: SUBJECT) {
    const appliedTransitions: Transition[] = [];
    while (true) {
      const enabledTransitions = this.getEnabledTransitions(subject);

      if (enabledTransitions.length !== 1) {
        break;
      }

      const transition = enabledTransitions[0];

      this.apply(subject, transition.getName());

      appliedTransitions.push(transition);
    }

    return appliedTransitions;
  }

  can(subject: SUBJECT, transitionName: string) {
    const transitions = this.definition.getTransitions();
    const state = this.getState(subject);

    for (const transition of transitions) {
      if (transition.getName() !== transitionName) {
        continue;
      }

      const transitionResult = this.checkTransition(state, transition, subject);

      if (transitionResult.isSuccessful()) {
        return true;
      }
    }
    return false;
  }

  getEnabledTransitions(subject: SUBJECT) {
    const enabledTransitions: Transition[] = [];
    const state = this.getState(subject);

    for (const transition of this.definition.getTransitions()) {
      const transitionResult = this.checkTransition(state, transition, subject);

      if (transitionResult.isSuccessful()) {
        enabledTransitions.push(transition);
      }
    }

    return enabledTransitions;
  }

  apply(subject: SUBJECT, transitionName: string) {
    const transitions = this.definition.getTransitions();
    const state = this.getState(subject);

    let transitionExist = false;
    let transitionSuccessful = false;

    for (const transition of transitions) {
      if (transition.getName() !== transitionName) {
        continue;
      }
      transitionExist = true;

      const transitionResult = this.checkTransition(state, transition, subject);

      if (transitionResult.isSuccessful()) {
        transitionSuccessful = true;
        const tos = transition.getTos();

        for (let to of tos) {
          state.markPlace(to);
        }

        const froms = transition.getFroms();

        for (let from of froms) {
          state.unmarkPlace(from);
        }

        this.subjectMarker.writeState(subject, state);
      }
    }

    if (!transitionExist) {
      throw new WorkflowTransitionNotExistError(transitionName);
    }

    if (!transitionSuccessful) {
      throw new WorkflowTransitionNotEnabledError(transitionName);
    }
  }

  private checkTransition(
    state: MarkingState,
    transition: Transition,
    subject: SUBJECT,
  ) {
    for (const place of transition.getFroms()) {
      if (!state.places.has(place)) {
        return new TransitionResult(false, 'Transition blocked by marking');
      }

      const guards = transition.getGuards();
      for (let guard of guards) {
        if (!guard.check(subject)) {
          return new TransitionResult(false, 'Transition blocked by guard');
        }
      }
      if (!state.places.has(place)) {
        return new TransitionResult(false, 'Transition blocked by marking');
      }
    }

    return new TransitionResult(true);
  }
}
