import { createMachine, assign, spawn, Interpreter } from "xstate";
import cardMachine from "./cardMachine";
import { methods as signatoryFactory } from "@etclabscore/signatory-core/build/src/index";
import accountsToTree from "../helpers/accountsToTree";
import SignatoryLocalStorage from "../storage/signatoryLocalStorage";
import saveJSON from "../helpers/saveJSON";

const assert: any = (global as any).assert || null;

const signatoryCore = signatoryFactory(new SignatoryLocalStorage());

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
  [k: string]: any;
}

export interface IContext {
  cards: ICard[];
  formData: null | IFormData;
  error: null | Error;
  result: null | string;
  createData: null | IFormData;
}

export const rawAppMachine = {
  id: "appMachine",
  initial: "idle",
  context: {
    cards: [],
    formData: null,
    error: null,
    result: null,
    createData: null,
  },
  on: {
    REQUEST_PERMISSIONS: {
      target: "requestPermissions",
      actions: assign({
        formData: (ctx: IContext, e) => {
          return e;
        },
      }),
    },
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
    onboarding: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("onboarding"));
        },
      },
      on: {
        SUBMIT: "creatingAccount",
      },
    },
    idle: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("idle"));
        },
      },
      invoke: {
        id: "signatoryListAccounts",
        src: async (context: IContext, event: any) => {
          const accounts = await signatoryCore.listAccounts();
          const wallets = await signatoryCore.listWallets();
          return accountsToTree(accounts, wallets);
        },
        onDone: [
          {
            target: "onboarding",
            cond: (context: IContext, event: any) => {
              return event.data && event.data.length === 0;
            },
          },
          {
            meta: {
              test: ({ getByTestId }: any) => {
                assert.ok(getByTestId("idle"));
              },
            },
            target: "list",
            actions: assign({ cards: (context, event: any) => event.data }),
          },
        ],
        onError: {
          meta: {
            test: ({ getByTestId }: any) => {
              assert.ok(getByTestId("idle"));
            },
          },
          target: "error",
          actions: assign({ error: (context, event: any) => event.data }),
        },
      },
    },
    list: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("list"));
        },
      },
      entry: assign({
        cards: (ctx: IContext, e) => {
          if (!ctx.cards) {
            return [];
          }
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
          actions: (ctx: IContext, e: any) => {
            e.ref.send("SELECT");
          },
        },
      },
    },
    details: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("details"));
        },
      },
      on: {
        "CARD.SELECT": {
          target: "nestedDetails",
          actions: (ctx: IContext, e: any) => {
            e.ref.send("SELECT");
          },
        },
        "BACK": {
          target: "list",
        },
        "EXPORT": {
          target: "details",
          actions: (ctx: IContext, e: any) => {
            return new Promise((resolve: any, reject: any) => {
              setTimeout(async () => {
                const keyfile = await signatoryCore.exportAccount(e.address);
                saveJSON(keyfile, `${e.address}-keyfile.json`);
                resolve();
              }, 200);
            });
          },
        },
      },
    },
    nestedDetails: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("nested-details"));
        },
      },
      on: {
        BACK: {
          target: "details",
          actions: (ctx: IContext, e: any) => {
            const selectedCard = ctx.cards.find(
              (card: ICard) => card && card.ref && card.ref.state.matches("selected"),
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
    requestPermissions: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("request-permissions"));
        },
      },
      on: {
        CANCEL: "idle",
        SUBMIT: "idle",
      },
    },
    signMessage: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("sign-message"));
        },
      },
      on: {
        CANCEL: "idle",
        SUBMIT: "signingMessage",
      },
    },
    createAccount: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("createAccount"));
        },
      },
      on: {
        CANCEL: "idle",
        SUBMIT: "creatingAccount",
      },
    },
    creatingAccount: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("creatingAccount"));
        },
      },
      invoke: {
        id: "signatoryCreateAccount",
        src: (context: IContext, event: any) => {
          return new Promise((resolve: any, reject: any) => {
            setTimeout(() => {
              signatoryCore.createAccount(event.newAccount).then(async (r) => {
                const keyfile = await signatoryCore.exportAccount(r);
                saveJSON(keyfile, `${r}-keyfile.json`);
                resolve(r);
              }).catch(reject);
            }, 200);
          });
        },
        onDone: {
          target: "success",
          actions: assign({ result: (context, event: any) => event.data }),
        },
        onError: {
          target: "error",
          actions: assign({ error: (context, event: any) => event.data }),
        },
      },
    },
    createWallet: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("createWallet"));
        },
      },
      on: {
        CANCEL: "idle",
        SUBMIT: "creatingWallet",
      },
    },
    creatingWallet: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("creatingWallet"));
        },
      },
      invoke: {
        id: "signatoryCreateWallet",
        src: (context: IContext, event: any) => {
          return new Promise((resolve: any, reject: any) => {
            setTimeout(() => {
              signatoryCore.importMnemonic(event.importMnemonicOptions).then(resolve).catch(reject);
            }, 200);
          });
        },
        onDone: {
          target: "success",
          actions: assign({ result: (context, event: any) => event.data }),
        },
        onError: {
          target: "error",
          actions: assign({
            error: (context, event: any) => {
              return event.data;
            },
          }),
        },
      },
    },
    signingTypedData: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("signingTypedData"));
        },
      },
      invoke: {
        id: "signatorySignTypedData",
        src: (context: IContext, event: any) =>
          signatoryCore.signTypedData(event.typedData, event.address, event.passphrase, event.chainId),
        onDone: {
          target: "success",
          actions: assign({ result: (context, event: any) => event.data }),
        },
        onError: {
          target: "error",
          actions: assign({ error: (context, event: any) => event.data }),
        },
      },
    },
    signingTransaction: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("signingTransaction"));
        },
      },
      invoke: {
        id: "signatorySignTransaction",
        src: (context: IContext, event: any) => {
          return new Promise((resolve: any, reject: any) => {
            setTimeout(() => {
              signatoryCore
                .signTransaction(event.transaction, event.passphrase, event.chainId)
                .then(resolve)
                .catch(reject);
            }, 200);
          });
        },
        onDone: {
          target: "success",
          actions: assign({ result: (context, event: any) => event.data }),
        },
        onError: {
          target: "error",
          actions: assign({ error: (context, event: any) => event.data }),
        },
      },
    },
    signingMessage: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("signingMessage"));
        },
      },
      invoke: {
        id: "signatorySignMessage",
        src: (context: IContext, event: any) => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              signatoryCore
                .sign(event.dataToSign, event.address, event.passphrase, event.chainId).then(resolve).catch(reject);
            }, 200);
          });
        },
        onDone: {
          target: "success",
          actions: assign({ result: (context, event: any) => event.data }),
        },
        onError: {
          target: "error",
          actions: assign({ error: (context, event: any) => event.data }),
        },
      },
    },
    error: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("error"));
        },
      },
      on: {
        CANCEL: "idle",
      },
    },
    success: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("success"));
        },
      },
      on: {
        CANCEL: "idle",
      },
    },
    signTransaction: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("sign-transaction"));
        },
      },
      on: {
        CANCEL: "list",
        SUBMIT: "signingTransaction",
      },
    },
    signTypedData: {
      meta: {
        test: ({ getByTestId }: any) => {
          assert.ok(getByTestId("signTypedData"));
        },
      },
      on: {
        CANCEL: "list",
        SUBMIT: "signingTypedData",
      },
    },
  },
};
const appMachine = createMachine<IContext, any, any>(rawAppMachine);

// Machine instance with internal state
export default appMachine;
