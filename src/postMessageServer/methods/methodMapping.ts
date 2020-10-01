import {
  ListAccounts,
  NewAccount,
  Data,
  Address,
  ChainId,
  Transaction,
  TypedData,
  ImportMnemonicOptions,
} from "../__GENERATED_TYPES__";
import { IContext } from "../../machines/appMachine";
import { IPostMessageServerOptions } from "../postMessageServer";
import { methods as signatoryFactory } from "@etclabscore/signatory-core/build/src/index";
import SignatoryLocalStorage from "../../storage/signatoryLocalStorage";
import _ from "lodash";
export interface IMethodMapping {
  [methodName: string]: (...params: any) => Promise<any>;
}

const signatoryCore = signatoryFactory(new SignatoryLocalStorage());

type TGenerateMethodMapping = (options: IPostMessageServerOptions) => IMethodMapping;

const generateMethodMapping: TGenerateMethodMapping = (options) => {

  const listAccounts: ListAccounts = async () => {
    const r = await signatoryCore.listAccounts();
    return r.map((item) => _.omitBy(item, _.isUndefined)) as any;
  };

  const sign: any = async (dataToSign: Data, address: Address, chainId: ChainId, domain: any) => {
    return new Promise((resolve, reject) => {
      options.send("SHOW_SIGN_MESSAGE", {
        dataToSign,
        address,
        chainId,
        domain,
        invokePromiseSuccess: async (context: IContext, event: any) => {
          resolve(event.data);
        },
        invokePromiseReject: async (context: IContext, event: any) => {
          reject(new Error("User Rejected Request"));
        },
      });
    });
  };

  const signTransaction: any = async (transaction: Transaction, chainId: ChainId, domain: any) => {
    if (!domain) {
      domain = chainId;
      chainId = undefined as any;
    }
    return new Promise((resolve, reject) => {
      options.send("SHOW_SIGN_TRANSACTION", {
        transaction,
        chainId,
        domain,
        invokePromiseSuccess: async (context: IContext, event: any, data: any) => {
          resolve(data);
        },
        invokePromiseReject: async (context: IContext, event: any, error: any) => {
          reject(new Error("User Rejected Request"));
        },
      });
    });
  };

  const signTypedData: any = async (typedData: TypedData, address: Address, chainId: ChainId, domain: any) => {
    return new Promise((resolve, reject) => {
      options.send("SHOW_SIGN_TYPED_DATA", {
        typedData,
        address,
        chainId,
        domain,
        invokePromiseSuccess: async (context: IContext, event: any, data: any) => {
          resolve(data);
        },
        invokePromiseReject: async (context: IContext, event: any, error: any) => {
          reject(error);
        },
      });
    });
  };

  const createAccount: any = async (newAccount: NewAccount, domain: any) => {
    return new Promise((resolve, reject) => {
      options.send("CREATE_ACCOUNT", {
        newAccount,
        domain,
        invokePromiseSuccess: async (context: IContext, event: any, data: any) => {
          resolve(data);
        },
        invokePromiseReject: async (context: IContext, event: any, error: any) => {
          reject(error);
        },
      });
    });
  };

  const importMnemonic: any = async (importMnemonicOptions: ImportMnemonicOptions, domain: any) => {
    return new Promise((resolve, reject) => {
      options.send("CREATE_WALLET", {
        importMnemonicOptions,
        domain,
        invokePromiseSuccess: async (context: IContext, event: any, data: any) => {
          resolve(data);
        },
        invokePromiseReject: async (context: IContext, event: any, error: any) => {
          reject(error);
        },
      });
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
