import { createMachine, assign, spawn } from "xstate";

// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.
const cardMachine = createMachine({
  id: "toggle",
  initial: "idle",
  context: {
    card: {},
  },
  states: {
    idle: {
      on: {
        SELECT: "selected",
      },
    },
    selected: {
      on: {
        DESELECT: "idle",
      },
    },
  },
});

// Machine instance with internal state
export default cardMachine;
