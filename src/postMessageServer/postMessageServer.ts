import openrpcDocument from "../openrpc.json";
import generateMethodMapping from "./methods/methodMapping";
import { State, Interpreter, StateNode } from "xstate";
import { MethodObject, ContentDescriptorObject } from "@open-rpc/meta-schema";

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

const postMessageServer = (options: IPostMessageServerOptions) => {
  const methodMapping = generateMethodMapping({
    appStateMachine: options.appStateMachine,
  });
  const postMessageListener = async (ev: MessageEvent) => {
    console.log("origin", ev.origin); //tslint:disable-line
    console.log("data", ev.data); //tslint:disable-line
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
      (ev.source as any).postMessage({
        jsonrpc: "2.0",
        result: openrpcDocument,
        id: ev.data.id,
      }, "*");
      return;
    }
    if (!methodMapping[ev.data.method]) {
      window.parent.postMessage({
        jsonrpc: "2.0",
        error: {
          code: 32009,
          message: "Method not found",
        },
        id: ev.data.id,
      }, "*");
      return;
    }
    const methodObject = openrpcDocument.methods.find((m) => m.name === ev.data.method) as MethodObject;
    const paramsAsArray = ev.data.params instanceof Array
      ? ev.data.params
      : sortParamKeys(methodObject, ev.data.params);

    methodMapping[ev.data.method](...paramsAsArray).then((results: any) => {
      if (ev.source) {
        (ev.source as any).postMessage({
          jsonrpc: "2.0",
          result: results,
          id: ev.data.id,
        }, "*");
      }
    }).catch((e: Error) => {
      (ev.source as any).postMessage({
        jsonrpc: "2.0",
        error: {
          code: 32329,
          message: e.message,
        },
        id: ev.data.id,
      }, "*");
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
