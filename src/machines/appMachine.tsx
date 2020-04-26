import { createMachine, assign, spawn, Interpreter } from "xstate";
import cardMachine from "./cardMachine";
import SignatoryClient from "@etclabscore/signatory-client";
import accountsToTree from "../helpers/accountsToTree";

const signatoryClient = new SignatoryClient({
  transport: {
    type: "http",
    host: "localhost",
    port: 1999,
  },
});

export interface ICard {
  name?: string;
  parent?: string;
  description?: string;
  uuid?: string;
  address?: string;
  ref?: Interpreter<any>;
  accounts?: ICard[];
}

interface IFormData {
  address: string;
  [k: string]: any;
}

export interface IContext {
  cards: ICard[];
  formData: null | IFormData;
  error: null | Error;
  result: null | string;
  createData: null | IFormData;
}

const appMachine = createMachine<IContext, any, any>({
  id: "toggle",
  initial: "idle",
  context: {
    cards: [],
    formData: null,
    error: null,
    result: null,
    createData: null,
  },
  on: {
    SHOW_SIGN_MESSAGE: {
      target: "signMessage",
      actions: assign({
        formData: (ctx: IContext, e) => {
          return e;
        },
      }),
    },
    SHOW_SIGN_TRANSACTION: {
      target: "signTransaction",
      actions: assign({
        formData: (ctx: IContext, e) => {
          return e;
        },
      }),
    },
    SHOW_SIGN_TYPED_DATA: {
      target: "signTypedData",
      actions: assign({
        formData: (ctx: IContext, e) => {
          return e;
        },
      }),
    },
    CREATE_ACCOUNT: {
      target: "createAccount",
      actions: assign({
        createData: (ctx, e) => {
          return e;
        },
      }),
    },
    CREATE_WALLET: {
      target: "createWallet",
      actions: assign({
        createData: (ctx, e) => {
          return e;
        },
      }),
    },
  },
  states: {
    idle: {
      invoke: {
        id: "signatoryListAccounts",
        src: async (context, event) => {
          const accounts = await signatoryClient.listAccounts();
          const wallets = await signatoryClient.listWallets();
          return accountsToTree(accounts, wallets);
        },
        onDone: {
          target: "list",
          actions: assign({ cards: (context, event) => event.data }),
        },
        onError: {
          target: "error",
          actions: assign({ error: (context, event) => event.data }),
        },
      },
    },
    list: {
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
    signMessage: {
      on: {
        CANCEL: "idle",
        SUBMIT: "signingMessage",
      },
    },
    createAccount: {
      on: {
        CANCEL: "idle",
        SUBMIT: "creatingAccount",
      },
    },
    creatingAccount: {
      invoke: {
        id: "signatoryCreateAccount",
        src: (context, event) => {
          return signatoryClient.createAccount(event.newAccount);
        },
        onDone: {
          target: "success",
          actions: assign({ result: (context, event) => event.data }),
        },
        onError: {
          target: "error",
          actions: assign({ error: (context, event) => event.data }),
        },
      },
    },
    createWallet: {
      on: {
        CANCEL: "idle",
        SUBMIT: "creatingWallet",
      },
    },
    creatingWallet: {
      invoke: {
        id: "signatoryCreateWallet",
        src: (context, event) => {
          return signatoryClient.importMnemonic(event.importMnemonicOptions);
        },
        onDone: {
          target: "success",
          actions: assign({ result: (context, event) => event.data }),
        },
        onError: {
          target: "error",
          actions: assign({
            error: (context, event) => {
              return event.data;
            },
          }),
        },
      },
    },
    signingTypedData: {
      invoke: {
        id: "signatorySignTypedData",
        src: (context, event) =>
          signatoryClient.signTypedData(event.typedData, event.address, event.passphrase, event.chainId),
        onDone: {
          target: "success",
          actions: assign({ result: (context, event) => event.data }),
        },
        onError: {
          target: "error",
          actions: assign({ error: (context, event) => event.data }),
        },
      },
    },
    signingTransaction: {
      invoke: {
        id: "signatorySignTransaction",
        src: (context, event) => signatoryClient.signTransaction(event.transaction, event.passphrase, event.chainId),
        onDone: {
          target: "success",
          actions: assign({ result: (context, event) => event.data }),
        },
        onError: {
          target: "error",
          actions: assign({ error: (context, event) => event.data }),
        },
      },
    },
    signingMessage: {
      invoke: {
        id: "signatorySignMessage",
        src: (context, event) => signatoryClient.sign(event.dataToSign, event.address, event.passphrase, event.chainId),
        onDone: {
          target: "success",
          actions: assign({ result: (context, event) => event.data }),
        },
        onError: {
          target: "error",
          actions: assign({ error: (context, event) => event.data }),
        },
      },
    },
    error: {
      on: {
        CANCEL: "idle",
      },
    },
    success: {
      on: {
        CANCEL: "idle",
      },
    },
    signTransaction: {
      on: {
        CANCEL: "list",
        SUBMIT: "signingTransaction",
      },
    },
    signTypedData: {
      on: {
        CANCEL: "list",
        SUBMIT: "signingTypedData",
      },
    },
  },
});

// Machine instance with internal state
export default appMachine;
