import { createMachine, assign, spawn, Interpreter } from "xstate";
import cardMachine from "./cardMachine";
import { methods as signatoryFactory } from "@etclabscore/signatory-core/build/src/index";
import accountsToTree from "../helpers/accountsToTree";
import SignatoryLocalStorage from "../storage/signatoryLocalStorage";
import saveJSON from "../helpers/saveJSON";

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

type InvokePromiseSuccessReject = (context: IContext, event: any) => void;

export interface IContext {
  cards: ICard[];
  formData: null | IFormData;
  error: null | Error;
  result: null | string;
  createData: null | IFormData;
  invokePromiseSuccess?: undefined | InvokePromiseSuccessReject;
  invokePromiseReject?: undefined | InvokePromiseSuccessReject;
}

export const rawAppMachine: any = {
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
      cond: (context: IContext, event: any) => {
        return context.cards.length > 0;
      },
      actions: assign({
        formData: (ctx: IContext, e: any) => {
          return e.approvalRequest;
        },
        invokePromiseSuccess: (ctx: IContext, e: any) => {
          return e.invokePromiseSuccess;
        },
        invokePromiseReject: (ctx: IContext, e: any) => {
          return e.invokePromiseReject;
        },
      }),
    },
    SHOW_SIGN_MESSAGE: {
      target: "signMessage",
      cond: (context: IContext, event: any) => {
        const cardFound = context.cards.find((card: ICard) => {
          return card.address === event.address;
        });
        return !!cardFound;
      },
      actions: assign({
        formData: (ctx: IContext, e) => {
          return e;
        },
        invokePromiseSuccess: (ctx: IContext, e: any) => {
          return e.invokePromiseSuccess;
        },
        invokePromiseReject: (ctx: IContext, e: any) => {
          return e.invokePromiseReject;
        },
      }),
    },
    SHOW_SIGN_TRANSACTION: {
      target: "signTransaction",
      cond: (context: IContext, event: any) => {
        const cardFound = context.cards.find((card: ICard) => {
          return card.address === event.transaction.from;
        });
        return !!cardFound;
      },
      actions: assign({
        formData: (ctx: IContext, e) => {
          return e;
        },
        invokePromiseSuccess: (ctx: IContext, e: any) => {
          return e.invokePromiseSuccess;
        },
        invokePromiseReject: (ctx: IContext, e: any) => {
          return e.invokePromiseReject;
        },
      }),
    },
    SHOW_SIGN_TYPED_DATA: {
      target: "signTypedData",
      cond: (context: IContext, event: any) => {
        const cardFound = context.cards.find((card: ICard) => {
          return card.address === event.address;
        });
        return !!cardFound;
      },
      actions: assign({
        formData: (ctx: IContext, e) => {
          return e;
        },
        invokePromiseSuccess: (ctx: IContext, e: any) => {
          return e.invokePromiseSuccess;
        },
        invokePromiseReject: (ctx: IContext, e: any) => {
          return e.invokePromiseReject;
        },
      }),
    },
    CREATE_ACCOUNT: {
      target: "createAccount",
      actions: assign({
        createData: (ctx, e) => {
          return e;
        },
        invokePromiseSuccess: (ctx: IContext, e: any) => {
          return e.invokePromiseSuccess;
        },
        invokePromiseReject: (ctx: IContext, e: any) => {
          return e.invokePromiseReject;
        },
      }),
    },
    CREATE_WALLET: {
      target: "createWallet",
      actions: assign({
        createData: (ctx, e) => {
          return e;
        },
        invokePromiseSuccess: (ctx: IContext, e: any) => {
          return e.invokePromiseSuccess;
        },
        invokePromiseReject: (ctx: IContext, e: any) => {
          return e.invokePromiseReject;
        },
      }),
    },
  },
  states: {
    onboarding: {
      on: {
        SUBMIT: "creatingAccount",
      },
    },
    idle: {
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
            target: "list",
            actions: assign({ cards: (context, event: any) => event.data }),
          },
        ],
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
    list: {
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
      on: {
        CANCEL: "cancelling",
        SUBMIT: {
          target: "success",
          actions: assign({
            result: (context, event: any) => {
              return "Granted Permissions";
            },
          }),
        },
      },
    },
    cancelling: {
      after: {
        0: "idle",
      },
      invoke: {
        id: "invokePromiseReject",
        src: async (context: IContext, event: any) => {
          if (context.invokePromiseReject) {
            return context.invokePromiseReject(context, event);
          }
        },
      },
      onExit: {
        actions: assign({
          invokePromiseSuccess: () => {
            return undefined;
          },
          invokePromiseReject: () => {
            return undefined;
          },
        }),
      } as any,
    },
    signMessage: {
      on: {
        CANCEL: "cancelling",
        SUBMIT: "signingMessage",
      },
    },
    createAccount: {
      on: {
        CANCEL: "cancelling",
        SUBMIT: "creatingAccount",
      },
    },
    creatingAccount: {
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
      on: {
        CANCEL: "cancelling",
        SUBMIT: "creatingWallet",
      },
    },
    creatingWallet: {
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
      invoke: {
        id: "signatorySignMessage",
        src: async (context: IContext, event: any) => {
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
      on: {
        CANCEL: "idle",
      },
      invoke: {
        id: "invokePromiseReject",
        src: async (context: IContext, event: any) => {
          if (context.invokePromiseReject) {
            return context.invokePromiseReject(context, event);
          }
        },
      },
      onExit: {
        actions: assign({
          invokePromiseSuccess: () => {
            return undefined;
          },
          invokePromiseReject: () => {
            return undefined;
          },
        }),
      } as any,
    },
    success: {
      on: {
        CANCEL: "idle",
      },
      invoke: {
        id: "invokePromiseSuccess",
        src: async (context: IContext, event: any) => {
          if (context.invokePromiseSuccess) {
            return context.invokePromiseSuccess(context, event);
          }
        },
      },
      onExit: {
        actions: assign({
          invokePromiseSuccess: () => {
            return undefined;
          },
          invokePromiseReject: () => {
            return undefined;
          },
        }),
      } as any,
    },
    signTransaction: {
      on: {
        CANCEL: "cancelling",
        SUBMIT: "signingTransaction",
      },
    },
    signTypedData: {
      on: {
        CANCEL: "cancelling",
        SUBMIT: "signingTypedData",
      },
    },
  },
};
const appMachine = createMachine<IContext, any, any>(rawAppMachine);

// Machine instance with internal state
export default appMachine;
