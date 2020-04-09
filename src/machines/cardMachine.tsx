import { createMachine, assign, spawn, StateMachine } from "xstate";
import { ICard } from "./appMachine";

interface ICardMachineContext {
  card: ICard;
}

// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.
const cardMachine: StateMachine<ICardMachineContext, any, any> = createMachine({
  id: "toggle",
  initial: "initial",
  context: {
    card: {},
  },
  states: {
    initial: {
      entry: assign({
        card: (ctx: ICardMachineContext, e) => {
          const card = ctx.card;
          if (card.accounts) {
            return {
              ...card,
              accounts: card.accounts.map((c: ICard) => ({
                ...c,
                ref: spawn(cardMachine.withContext({ card: c })),
              })),
            };
          }

          return card;
        },
      }),
      on: {
        SELECT: "selected",
      },
    },
    selected: {
      id: "selected",
      initial: "idle",
      on: {
        DESELECT: "initial",
      },
      states: {
        idle: {
          on: {
            SHOW_SIGN_MESSAGE: "signMessage",
            SHOW_SIGN_TRANSACTION: "signTransaction",
            SHOW_SIGN_TYPED_DATA: "signTypedData",
          },
        },
        signMessage: {
          on: {
            CANCEL: "idle",
            SUBMIT: "idle",
          },
        },
        signTransaction: {
          on: {
            CANCEL: "idle",
            SUBMIT: "idle",
          },
        },
        signTypedData: {
          on: {
            CANCEL: "idle",
            SUBMIT: "idle",
          },
        },
      },
    },
  },
});

// Machine instance with internal state
export default cardMachine;
