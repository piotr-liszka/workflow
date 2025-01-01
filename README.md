# Workflow

[![Workflow](https://github.com/piotr-liszka/workflow/actions/workflows/static-analysis.yml/badge.svg)](https://github.com/piotr-liszka/workflow/actions/workflows/static-analysis.yml)

This project is a TypeScript-based implementation of a Petri net workflow. The workflow system allows for defining states and transitions, and managing the state of subjects through these transitions.

## Installation

To install the dependencies, use the following commands:

```sh
npm install @b_niamin/workflow

pnpm add @b_niamin/workflow

yarn add @b_niamin/workflow
```

## Usage

### Workflow

The `Workflow` class is the core of the workflow system. It manages the state of subjects and allows for transitions between states.

#### Methods

- `getState(subject: SUBJECT): MarkingState`: Retrieves the current state of the subject.
- `can(subject: SUBJECT, transitionName: string): boolean`: Checks if a transition can be applied to the subject.
- `getEnabledTransitions(subject: SUBJECT): Transition[]`: Returns a list of transitions that can be applied to the subject.
- `apply(subject: SUBJECT, transitionName: string): void`: Applies a transition to the subject.
- `process(subject: SUBJECT): Transition[]`: Processes the subject through enabled transitions.

### Definition

The `Definition` class defines the workflow, including the places (states) and transitions.

### Transition

The `Transition` class represents a transition in the workflow. It defines the conditions under which the transition can occur and the resulting state changes.
Guards are conditions that must be met for a transition to be enabled. They are used to enforce business rules and ensure that transitions only occur when certain criteria are satisfied. Each guard is a function that takes a subject as input and returns a boolean indicating whether the guard condition is met.

### Example

Here is an example of how to use the `Workflow` class in your project:

```typescript
import {Definition, Guard, Transition, Workflow} from "@b_niamin/workflow";

// Define your workflow definition
const definition = new Definition(
  ['triage', 'todo', 'in_progress', 'done'],
  [
    new Transition('to queue', 'triage', 'todo'),
    new Transition('to in progress', 'todo', 'in_progress'),
    new Transition('to done', 'in_progress', 'done', new Guard('isDone', (subject) => subject.isDone)),
  ],
);


// Create a subject
const subject = {
  isDone: false,
};

// Initialize the workflow
const workflow = new Workflow('TODO Workflow', definition);

// Get the current state of the subject
const state = workflow.getState(subject);
console.log('Current state:', state);

// Check if a transition can be applied
const canTransition = workflow.can(subject, 'to queue');
console.log('Can transition:', canTransition);

// Apply a transition
if (canTransition) {
  workflow.apply(subject, 'to queue');
  console.log('Transition applied');
}

// Process the subject through enabled transitions
const appliedTransitions = workflow.process(subject);
console.log('Applied transitions:', appliedTransitions);
console.log('Current state:', subject);
```

## Petri Net Workflow

This project is based on the Petri net workflow model. All naming conventions and concepts are derived from Petri nets, including places, transitions, and markings. It supports concurrency, allowing multiple transitions to be processed simultaneously.

## Contributions

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Author

This project is maintained by Piotr Liszka.
