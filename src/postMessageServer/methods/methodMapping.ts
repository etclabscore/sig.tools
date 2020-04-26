import { Sign, SignTransaction, SignTypedData, CreateAccount, ImportMnemonic } from "../__GENERATED_TYPES__";
import { State, EventObject } from "xstate";
import { ICard } from "../../machines/appMachine";
import { IPostMessageServerOptions } from "../postMessageServer";

export interface IMethodMapping {
  [methodName: string]: (...params: any) => Promise<any>;
}

type TGenerateMethodMapping = (options: IPostMessageServerOptions) => IMethodMapping;

const generateMethodMapping: TGenerateMethodMapping = (options) => {

  const sign: Sign = async (dataToSign, address, chainId) => {
    const cardFound = options.appStateMachine.state.context.cards.find((card: ICard) => {
      return card.address === address;
    });
    if (cardFound) {
      options.appStateMachine.send("SHOW_SIGN_MESSAGE", {
        dataToSign,
        address,
        chainId,
      });
    }
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

  const signTransaction: SignTransaction = async (transaction, chainId) => {
    const cardFound = options.appStateMachine.state.context.cards.find((card: ICard) => {
      return card.address === transaction.from;
    });
    if (cardFound) {
      options.appStateMachine.send("SHOW_SIGN_TRANSACTION", {
        transaction,
        chainId,
      });
    }
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

  const signTypedData: SignTypedData = async (typedData, address, chainId) => {
    const cardFound = options.appStateMachine.state.context.cards.find((card: ICard) => {
      return card.address === address;
    });
    if (cardFound) {
      options.appStateMachine.send("SHOW_SIGN_TYPED_DATA", {
        typedData,
        address,
        chainId,
      });
    }
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

  const createAccount: CreateAccount = async (newAccount) => {
    options.appStateMachine.send("CREATE_ACCOUNT", {
      newAccount,
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

  const importMnemonic: ImportMnemonic = async (importMnemonicOptions) => {
    options.appStateMachine.send("CREATE_WALLET", {
      importMnemonicOptions,
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
  };
  return methodMapping;
};

export default generateMethodMapping;
