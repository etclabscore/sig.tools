import { createMachine, assign, StateMachine } from "xstate";
import { hexToString, stringToHex } from "@etclabscore/eserialize";

export interface IHexStringMachineContext {
  hex: string;
  string: string;
}

const hexToNumberMachine: StateMachine<IHexStringMachineContext, any, any> = createMachine({
  initial: "stringonly",
  context: { hex: "", string: "" },
  entry: assign({
    hex: (context: IHexStringMachineContext, event: any) => context.hex,
    string: (context: IHexStringMachineContext, event: any) => {
      let returnVal;
      if (!context.hex) {
        return "";
      }
      if (!context.hex.match(/^0x/)) {
        return "";
      }
      try {
        returnVal = hexToString(context.hex);
      } catch (e) {
        //
      }
      return returnVal || "";
    },
  }),
  on: {
    HEX_INPUT: {
      actions: assign({
        hex: (_, event: any) => event.value,
        string: (_, event: any) => {
          let returnVal;
          try {
            returnVal = hexToString(event.value || "");
          } catch (e) {
            //
          }
          return returnVal || "";
        },
      }),
    },
    STRING_INPUT: {
      actions: assign({
        string: (_, event: any) => event.value,
        hex: (_, event: any) => {
          return stringToHex(event.value || "");
        },
      }),
    },
  },
  states: {
    stringonly: {
      on: {
        TOGGLE: "all",
      },
    },
    all: {
      on: {
        TOGGLE: "stringonly",
      }
    },
  },
});

export default hexToNumberMachine;
