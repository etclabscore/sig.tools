import { createMachine, interpret } from "xstate";

// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.
const tabMachine = createMachine({
  id: "tab",
  initial: "idle",
  context: {
    name: "",
  },
  states: {
    idle: { on: { EDIT: "editing" } },
    editing: { on: { BLUR: "idle" } },
  },
});

// Machine instance with internal state
export default tabMachine;
