import { createMachine, assign, spawn } from "xstate";
import { Interpreter } from "xstate";
import cardMachine from "./cardMachine";

export interface ICard {
  name?: string;
  parent?: string;
  description?: string;
  uuid?: string;
  address?: string;
  ref?: Interpreter<any>;
  accounts?: ICard[];
}

export interface IContext {
  cards: ICard[];
}

const appMachine = createMachine<IContext, any, any>({
  id: "toggle",
  initial: "initial",
  context: {
    cards: [],
  },
  states: {
    initial: {
      entry: assign({
        cards: (ctx: IContext, e) => {
          const results = ctx.cards.map((card: ICard) => {
            return {
              ...card,
              ref: spawn(cardMachine.withContext({ card })),
            };
          });
          return results;
        },
      }),
      on: {
        "": "list",
      },
    },
    list: {
      onEntry: (ctx: IContext) => {
        ctx.cards.forEach((card) => {
          if (card.ref) {
            card.ref.send("DESELECT");
          }
        });
      },
      on: {
        "CARD.SELECT": {
          target: "details",
          actions: (ctx, e) => {
            e.ref.send("SELECT");
          },
        },
      },
    },
    details: {
      on: {
        "CARD.SELECT": {
          target: "nestedDetails",
          actions: (ctx, e) => {
            e.ref.send("SELECT");
          },
        },
        "BACK": {
          target: "list",

        },
      },
    },
    nestedDetails: {
      on: {
        BACK: {
          target: "details",
          actions: (ctx, e) => {
            const selectedCard = ctx.cards.find(
              (card) => card && card.ref && card.ref.state.matches("selected"),
            );
            let selectedNestedAccount: ICard | undefined;
            if (selectedCard && selectedCard.accounts && selectedCard.ref) {
              selectedNestedAccount = selectedCard.ref.state.context.card.accounts.find(
                (card: ICard) => card && card.ref && card.ref.state.matches("selected"),
              );
            }
            if (selectedNestedAccount && selectedNestedAccount.ref) {
              selectedNestedAccount.ref.send("DESELECT");
            }
          },
        },
      },
    },
  },
});

// Machine instance with internal state
export default appMachine;
