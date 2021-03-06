import { Storage, AccountStorageData, AccountMetadata } from "@etclabscore/signatory-core/build/src/lib/storage";
import { WalletType, DeterministicWallet, NonDeterministicWallet } from "@etclabscore/signatory-core/build/src/lib/wallet";
import * as ethUtil from "ethereumjs-util";
import _ from "lodash";

export class SignatoryLocalStorage implements Storage {
  public storage: any;
  public prefix: string;

  constructor(prefix: string = "signatory-") {
    this.prefix = prefix;
    this.storage = window.localStorage;
  }

  public open(): Promise<void> {
    return Promise.resolve();
  }

  public close(): Promise<void> {
    return Promise.resolve();
  }

  public getAccount(address: string): Promise<NonDeterministicWallet> {
    return Promise.resolve(JSON.parse(this.getEntry(ethUtil.toChecksumAddress(address))) as NonDeterministicWallet);
  }

  public getHDWallet(uuid: string) {
    return Promise.resolve(JSON.parse(this.getEntry(uuid)) as DeterministicWallet);
  }

  public storeAccount(wallet: AccountStorageData): Promise<AccountStorageData> {
    const serializedWallet = JSON.stringify(wallet);
    switch (wallet.type) {
      case "deterministic":
        this.storage[this.prefix + wallet.uuid] = serializedWallet;
        break;
      case "non-deterministic":
        this.storage[this.prefix + ethUtil.toChecksumAddress(wallet.address)] = serializedWallet;
        break;
    }
    return Promise.resolve(wallet);
  }

  public listWallets(type: WalletType, hidden: boolean): Promise<AccountMetadata[]> {
    const wallets = Object.keys(this.storage)
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => JSON.parse(this.storage[key]) as AccountStorageData);
    const filteredWallets = wallets.filter((wallet) => wallet.type === type && (wallet.visible || hidden));
    return Promise.resolve(filteredWallets.map((wallet) => {
      const { name, description, visible } = wallet;
      switch (wallet.type) {
        case "non-deterministic":
          const { address, parent } = wallet;
          return _.omitBy<AccountMetadata>({
            address, parent, name, description, type: wallet.type, hidden: !visible,
          }, _.isUndefined);
        case "deterministic":
          const { uuid, hdPath } = wallet;
          return { uuid, name, description, hdPath, type: wallet.type, hidden: !visible } as any;
      }
      return wallet;
    }));
  }

  private getEntry(key: string) {
    return this.storage[this.prefix + key];
  }
}

export default SignatoryLocalStorage;
