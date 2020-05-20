import { createMachine, assign, StateMachine } from "xstate";
import { hexToString, stringToHex } from "@etclabscore/eserialize";

export interface IHexStringMachineContext {
  hex: string;
  string: string;
}

const hexToNumberMachine: StateMachine<IHexStringMachineContext, any, any> = createMachine({
  initial: "active",
  context: { hex: "", string: "" },
  states: {
    active: {
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
    },
  },
});

export default hexToNumberMachine;
