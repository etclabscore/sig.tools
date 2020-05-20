import { createMachine, assign, StateMachine } from "xstate";
import { hexToBigInt, bigIntToHex } from "@etclabscore/eserialize";

export interface IHexNumberMachineContext {
  hex: string;
  number: string;
}

const hexToNumberMachine: StateMachine<IHexNumberMachineContext, any, any> = createMachine({
  initial: "active",
  context: { hex: "", number: "" },
  entry: assign({
    hex: (context: IHexNumberMachineContext, event: any) => context.hex,
    number: (context: IHexNumberMachineContext, event: any) => {
      let returnVal;
      if (!context.hex) {
        return "";
      }
      if (!context.hex.match(/^0x/)) {
        return "";
      }
      try {
        returnVal = hexToBigInt(context.hex).toString();
      } catch (e) {
        //
      }
      return returnVal || "";
    },
  }),
  states: {
    active: {
      on: {
        HEX_INPUT: {
          actions: assign({
            hex: (_, event: any) => event.value,
            number: (_, event: any) => {
              let returnVal;
              if (!event.value.match(/^0x/)) {
                return "";
              }
              try {
                returnVal = hexToBigInt(event.value).toString();
              } catch (e) {
                //
              }
              return returnVal || "";
            },
          }),
        },
        NUMBER_INPUT: {
          actions: assign({
            number: (_, event: any) => event.value,
            hex: (_, event: any) => {
              let returnVal;
              try {
                returnVal = bigIntToHex(BigInt(event.value)).toString();
              } catch (e) {
                //
              }
              return returnVal || "0x";
            },
          }),
        },
      },
    },
  },
});

export default hexToNumberMachine;
