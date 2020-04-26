import { ICard } from "../machines/appMachine";
import _ from "lodash";

const accountsToTree = (accounts: ICard[], wallets: any): ICard[] => {

  const grouped = _.groupBy(accounts, (account) => {
    return account.parent;
  });

  const walletsByUuid = _.keyBy(wallets, (account) => {
    return account.uuid;
  });
  const usedWallets: any = {};

  let accountsTree: ICard[] = [];

  _.forEach(grouped, (group, key) => {
    if (key === "undefined") {
      accountsTree = accountsTree.concat(group);
    } else {
      usedWallets[key] = true;
      accountsTree = [...accountsTree, {
        ...walletsByUuid[key],
        accounts: group,
      }];
    }
  });
  _.forEach(walletsByUuid, (wallet, uuid) => {
    if (!usedWallets[uuid]) {
      accountsTree = [wallet, ...accountsTree];
    }
  });
  return accountsTree;
};

export default accountsToTree;
