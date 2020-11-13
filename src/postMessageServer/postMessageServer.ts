import openrpcDocument from "../openrpc.json";
import generateMethodMapping, { IMethodMapping } from "./methods/methodMapping";
import { MethodObject, ContentDescriptorObject } from "@open-rpc/meta-schema";
import { UserApprovalPrompt, IPermissionsRequest } from "@xops.net/rpc-cap";
import _ from "lodash";
import changePermissionContext from "../helpers/changePermissionContext";
import changePermissionError from "../helpers/changePermissionError";
import { CapabilitiesController } from "@xops.net/rpc-cap";
import { setCapabilities } from "../capabilities";
import { IContext } from "../machines/appMachine";

const copyDocument = JSON.stringify(openrpcDocument);
const copyOpenRPCDocument = JSON.parse(copyDocument);

const JsonRpcEngine = require("json-rpc-engine"); //tslint:disable-line

export interface IPostMessageServerOptions {
  send: (eventName: string, event: any) => void;
}

const sortParamKeys = (method: MethodObject, params: object) => {
  const docParams = method.params as ContentDescriptorObject[];
  const methodParamsOrder: { [k: string]: number } = docParams
    .map((p) => p.name)
    .reduce((m, pn, i) => ({ ...m, [pn]: i }), {});

  return Object.entries(params)
    .sort((v1, v2) => methodParamsOrder[v1[0]] - methodParamsOrder[v2[0]])
    .map(([key, val]) => val);
};

const generatePermissions = (
  methodMapping: IMethodMapping,
  options: IPostMessageServerOptions,
) => {
  const userApprove: UserApprovalPrompt = async (approvalRequest: IPermissionsRequest) => {
    return new Promise((resolve, reject) => {
      options.send("REQUEST_PERMISSIONS", {
        approvalRequest,
        invokePromiseSuccess: async (context: IContext, event: any, data: any) => {
          let permissions = {
            listAccounts: {
              ...approvalRequest.permissions.listAccounts,
            },
          };
          if (context.caveats) {
            permissions = {
              listAccounts: {
                ...approvalRequest.permissions.listAccounts,
                caveats: [context.caveats],
              },
            };
          }
          resolve(permissions);
        },
        invokePromiseReject: async (context: IContext, event: any, error: any) => {
          reject(new Error("User Rejected Request"));
        },
      });
    });
  };

  const safeMethods = ["createAccount", "sign", "signTypedData", "signTransaction"];

  let capabilities;
  const restrictedMethods = _.chain(methodMapping)
    .reduce((memo: any, method: any, key: any) => {
      const methodObject = openrpcDocument.methods.find((m) => m.name === key) as MethodObject;
      if (safeMethods.includes(methodObject.name)) {
        return memo;
      }
      memo[key] = {
        description: methodObject.description,
        method: (req: any, res: any, next: any, end: any) => {
          const paramsAsArray = req.params instanceof Array
            ? req.params
            : sortParamKeys(methodObject, req.params);

          methodMapping[key](...paramsAsArray).then((result) => {
            res.result = result;
            end();
          }).catch((e) => {
            res.error = e;
            end(e);
          });
        },
      };
      return memo;
    }, {} as any).value();
  let localStorageCapabilities = window.localStorage.capabilities;
  if (localStorageCapabilities) {
    localStorageCapabilities = JSON.parse(localStorageCapabilities);
  }
  capabilities = new CapabilitiesController({
    safeMethods,
    restrictedMethods,
    requestUserApproval: userApprove,
  }, localStorageCapabilities);
  setCapabilities(capabilities);
  return capabilities;
};

const postMessageServer = (options: IPostMessageServerOptions) => {
  const methodMapping = generateMethodMapping(options);
  const capabilitiesByDomain: any = {};

  const engine = new JsonRpcEngine();
  const capabilities = generatePermissions(methodMapping, options);

  engine.push((req: any, res: any, next: any, end: any) => {
    const methodObject = openrpcDocument.methods.find((m) => m.name === req.method) as MethodObject;
    const paramsAsArray = req.params instanceof Array
      ? req.params
      : sortParamKeys(methodObject, req.params);

    if (!methodMapping[req.method]) {
      return;
    }
    methodMapping[req.method](...paramsAsArray).then((result) => {
      res.result = result;
      end();
    }).catch((e) => {
      res.error = e;
      end(e);
    });
  });

  const postMessageListener = async (ev: MessageEvent) => {
    if (ev.origin === window.origin) {
      return;
    }
    if (!ev.data.jsonrpc || ev.data.jsonrpc !== "2.0") {
      return;
    }
    if (ev.data && ev.data.error) {
      return console.error("JSONRPC ERROR", ev.data.error);
    }
    if (ev.data.method === "rpc.discover") {
      const doc = {
        jsonrpc: "2.0",
        result: copyOpenRPCDocument,
        id: ev.data.id,
      };
      (ev.source as any).postMessage(doc, "*");
      return;
    }
    // only one middlware per origin
    if (!capabilitiesByDomain[ev.origin]) {
      engine._middleware.unshift(capabilities.providerMiddlewareFunction.bind(capabilities, { origin: ev.origin }));
      capabilitiesByDomain[ev.origin] = true;
    }
    return engine.handle(ev.data, (e: Error, response: any) => {
      if (e) {
        if (e.message.includes("User Rejected Request")) {
          return (ev.source as any).postMessage({
            jsonrpc: "2.0",
            error: {
              code: 4001,
              message: e.message,
            },
            id: ev.data.id,
          }, "*");
        }
        e = changePermissionError(e);
        (ev.source as any).postMessage({
          jsonrpc: "2.0",
          error: {
            code: (e as any).code || 32329,
            message: e.message,
          },
          id: ev.data.id,
        }, "*");
        return;
      }
      if (ev.source) {
        (ev.source as any).postMessage(
          changePermissionContext(ev, response, "https://sig.tools")
          , "*");
        return;
      }
      console.error("No origin defined");
    });
  };

  return {
    start: () => {
      window.addEventListener("message", postMessageListener);
    },
    stop: () => {
      if (!postMessageListener) {
        return new Error("Not started");
      }
      window.removeEventListener("message", postMessageListener);
    },
  };
};

export default postMessageServer;
