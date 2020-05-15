import { Sign, SignTransaction, SignTypedData, CreateAccount, ImportMnemonic, ListAccounts, NewAccount, Data, Address, ChainId, Transaction, TypedData, ImportMnemonicOptions } from "../__GENERATED_TYPES__";
import { State, EventObject } from "xstate";
import { ICard } from "../../machines/appMachine";
import { IPostMessageServerOptions } from "../postMessageServer";
import SignatoryClient from "@etclabscore/signatory-client";
export interface IMethodMapping {
  [methodName: string]: (...params: any) => Promise<any>;
}

const signatoryClient = new SignatoryClient({
  transport: {
    type: "http",
    host: "localhost",
    port: 2999,
  },
});

type TGenerateMethodMapping = (options: IPostMessageServerOptions) => IMethodMapping;

const generateMethodMapping: TGenerateMethodMapping = (options) => {

  const listAccounts: ListAccounts = async () => {
    return signatoryClient.listAccounts();
  };

  const sign: any = async (dataToSign: Data, address: Address, chainId: ChainId, domain: any) => {
    const cardFound = options.appStateMachine.state.context.cards.find((card: ICard) => {
      return card.address === address;
    });
    if (cardFound) {
      options.appStateMachine.send("SHOW_SIGN_MESSAGE", {
        dataToSign,
        address,
        chainId,
        domain,
      });
    }
    return new Promise((resolve, reject) => {
      const listener = (state: State<any>, event: EventObject) => {
        if (event.type === "CANCEL") {
          options.appStateMachine.stateMachineInstance.off(listener);
          reject(new Error("User Rejected Request"));
        } else if (state.value === "success") {
          options.appStateMachine.stateMachineInstance.off(listener);
          resolve(state.context.result);
        }
      };
      options.appStateMachine.stateMachineInstance.onTransition(listener);
    });
  };

  const signTransaction: any = async (transaction: Transaction, chainId: ChainId, domain: any) => {
    const cardFound = options.appStateMachine.state.context.cards.find((card: ICard) => {
      return card.address === transaction.from;
    });
    if (!domain) {
      domain = chainId;
      chainId = undefined as any;
    }
    if (cardFound) {
      options.appStateMachine.send("SHOW_SIGN_TRANSACTION", {
        transaction,
        chainId,
        domain,
      });
    }
    return new Promise((resolve, reject) => {
      const listener = (state: State<any>, event: EventObject) => {
        if (event.type === "CANCEL") {
          options.appStateMachine.stateMachineInstance.off(listener);
          reject(new Error("User Rejected Request"));
        } else if (state.value === "success") {
          options.appStateMachine.stateMachineInstance.off(listener);
          resolve(state.context.result);
        }
      };
      options.appStateMachine.stateMachineInstance.onTransition(listener);
    });
  };

  const signTypedData: any = async (typedData: TypedData, address: Address, chainId: ChainId, domain: any) => {
    const cardFound = options.appStateMachine.state.context.cards.find((card: ICard) => {
      return card.address === address;
    });
    if (cardFound) {
      options.appStateMachine.send("SHOW_SIGN_TYPED_DATA", {
        typedData,
        address,
        chainId,
        domain,
      });
    }
    return new Promise((resolve, reject) => {
      const listener = (state: State<any>, event: EventObject) => {
        if (event.type === "CANCEL") {
          options.appStateMachine.stateMachineInstance.off(listener);
          reject(new Error("User Rejected Request"));
        } else if (state.value === "success") {
          options.appStateMachine.stateMachineInstance.off(listener);
          resolve(state.context.result);
        }
      };
      options.appStateMachine.stateMachineInstance.onTransition(listener);
    });
  };

  const createAccount: any = async (newAccount: NewAccount, domain: any) => {
    options.appStateMachine.send("CREATE_ACCOUNT", {
      newAccount,
      domain,
    });
    return new Promise((resolve, reject) => {
      const listener = (state: State<any>, event: EventObject) => {
        if (event.type === "CANCEL") {
          options.appStateMachine.stateMachineInstance.off(listener);
          reject(new Error("User Rejected Request"));
        } else if (state.value === "success") {
          options.appStateMachine.stateMachineInstance.off(listener);
          resolve(state.context.result);
        }
      };
      options.appStateMachine.stateMachineInstance.onTransition(listener);
    });
  };

  const importMnemonic: any = async (importMnemonicOptions: ImportMnemonicOptions, domain: any) => {
    options.appStateMachine.send("CREATE_WALLET", {
      importMnemonicOptions,
      domain,
    });
    return new Promise((resolve, reject) => {
      const listener = (state: State<any>, event: EventObject) => {
        if (event.type === "CANCEL") {
          options.appStateMachine.stateMachineInstance.off(listener);
          reject(new Error("User Cancelled"));
        } else if (state.value === "success") {
          options.appStateMachine.stateMachineInstance.off(listener);
          resolve(state.context.result);
        }
      };
      options.appStateMachine.stateMachineInstance.onTransition(listener);
    });
  };

  const methodMapping: IMethodMapping = {
    sign,
    signTransaction,
    signTypedData,
    createAccount,
    importMnemonic,
    listAccounts,
  };
  return methodMapping;
};

export default generateMethodMapping;
