import { createMachine, assign, spawn } from "xstate";
import { Interpreter } from "xstate";
import cardMachine from "./cardMachine";

export interface ICard {
  name: string;
  description?: string;
  address: string;
  ref?: Interpreter<any>;
}

interface IContext {
  cards: ICard[];
}

// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.
const cardsMachine = createMachine<IContext, any, any>({
  id: "toggle",
  initial: "initial",
  context: {
    cards: [],
  },
  states: {
    initial: {
      entry: assign({
        cards: (ctx: IContext, e) => {
          const results = ctx.cards.map((card: any) => ({
            ...card,
            ref: spawn(cardMachine.withContext({card})),
          }));
          return results;
        },
      }),
      on: {
        "": "idle",
      },
    },
    idle: {
      onEntry: (ctx: IContext) => {
        ctx.cards.forEach((card) => {
          if (card.ref) {
            card.ref.send("DESELECT");
          }
        });
      },
      on: {
        "CARD.SELECT": {
          target: "selected",
          actions: (ctx, e) => {
            e.ref.send("SELECT");
          },
        },
      },
    },
    selected: {
      on: {
        BACK: {
          target: "idle",
        },
      },
    },
  },
});

// Machine instance with internal state
export default cardsMachine;
