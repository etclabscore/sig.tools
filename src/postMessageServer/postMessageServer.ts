import openrpcDocument from "../openrpc.json";
import generateMethodMapping, { IMethodMapping } from "./methods/methodMapping";
import { State, Interpreter, EventObject } from "xstate";
import { MethodObject, ContentDescriptorObject } from "@open-rpc/meta-schema";
import { UserApprovalPrompt, IPermissionsRequest } from "rpc-cap/dist/src/@types";
import _ from "lodash";
import changePermissionContext from "../helpers/changePermissionContext";
import changePermissionError from "../helpers/changePermissionError";
const RpcCap = require("rpc-cap");//tslint:disable-line
const JsonRpcEngine = require("json-rpc-engine"); //tslint:disable-line

export interface IPostMessageServerOptions {
  appStateMachine: {
    send: (eventName: string, event: any) => void;
    state: State<any, any, any, any>;
    stateMachineInstance: Interpreter<any, any, any, any>;
  };
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

interface ICapabilitiesByDomain {
  [k: string]: any;
}

const capabilitiesByDomain: ICapabilitiesByDomain = {};

const generatePermissions = (
  methodMapping: IMethodMapping,
  stateMachine: Interpreter<any, any, any, any>,
  domain: any,
) => {
  const userApprove: UserApprovalPrompt = async (approvalRequest: IPermissionsRequest) => {
    return new Promise((resolve, reject) => {
      stateMachine.send("REQUEST_PERMISSIONS", approvalRequest);
      const listener = (state: State<any>, event: EventObject) => {
        if (event.type === "CANCEL") {
          stateMachine.off(listener);
          reject(new Error("User Rejected Request"));
        } else if (event.type === "SUBMIT") {
          stateMachine.off(listener);
          resolve(approvalRequest.permissions);
        }
      };
      stateMachine.onTransition(listener);
    });
  };

  const safeMethods = ["createAccount", "sign", "signTypedData", "signTransaction"];

  let capabilities;
  if (capabilitiesByDomain[domain.origin]) {
    capabilities = capabilitiesByDomain[domain.origin];
  } else {
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

            methodMapping[key](...paramsAsArray, domain).then((result) => {
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
    capabilities = new RpcCap.CapabilitiesController({
      safeMethods,
      restrictedMethods,
      // This library also depends on your ability to present the request
      // To an entity in charge of administrating permissions:
      requestUserApproval: userApprove,
    }, localStorageCapabilities);
    capabilities.subscribe((changed: any) => {
      window.localStorage.capabilities = JSON.stringify(changed);
    });
    capabilitiesByDomain[domain.origin] = capabilities;
  }

  const engine = new JsonRpcEngine();
  engine.push(capabilities.providerMiddlewareFunction.bind(capabilities, domain));
  engine.push((req: any, res: any, next: any, end: any) => {
    const methodObject = openrpcDocument.methods.find((m) => m.name === req.method) as MethodObject;
    const paramsAsArray = req.params instanceof Array
      ? req.params
      : sortParamKeys(methodObject, req.params);

    methodMapping[req.method](...paramsAsArray, domain).then((result) => {
      res.result = result;
      end();
    }).catch((e) => {
      res.error = e;
      end(e);
    });
  });

  return engine;
};

const postMessageServer = (options: IPostMessageServerOptions) => {
  const methodMapping = generateMethodMapping({
    appStateMachine: options.appStateMachine,
  });

  const postMessageListener = async (ev: MessageEvent) => {
    const engine = generatePermissions(
      methodMapping,
      options.appStateMachine.stateMachineInstance,
      { origin: ev.origin },
    );
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
        result: openrpcDocument,
        id: ev.data.id,
      };
      (ev.source as any).postMessage(doc, "*");
      return;
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
