import { CapabilitiesController } from "@xops.net/rpc-cap";

export let capabilities: null | CapabilitiesController = null;

export const setCapabilities = (cap: CapabilitiesController) => {
  capabilities = cap;
  capabilities.subscribe((changed: any) => {
    window.localStorage.capabilities = JSON.stringify(changed);
  });
};
