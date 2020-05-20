import React from "react";
import { Machine } from "xstate";
import { createModel } from "@xstate/test";
import { IContext, rawAppMachine } from "../machines/appMachine";
import MyApp from "../containers/MyApp";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { TestPlan } from "@xstate/test/lib/types";
import { act } from "react-dom/test-utils";

const applicationMachine = Machine<IContext, any, any>(rawAppMachine);
const testApplicationMachine = applicationMachine.withContext({
  cards: [],
  formData: null,
  error: null,
  result: null,
  createData: null,
});
const applicationModel = createModel(testApplicationMachine, {
  events: {
    [`CARD.SELECT`]: ({ getByText }: any) => {
      //
    },
    BACK: ({ getByTestId }: any) => {
      fireEvent.click(getByTestId("back"));
    },
    CANCEL_ONBOARDING: ({ getByText }: any) => {
      //
    },
    CREATE_ACCOUNT: ({ getByText }: any) => {
      //
    },
    SHOW_SIGN_TYPED_DATA: ({ getByText }: any) => {
      //
    },
    SHOW_SIGN_TRANSACTION: ({ getByText }: any) => {
      //
    },
    SUBMIT: ({ getByTestId }: any) => {
      console.log("in submit");
      fireEvent.click(getByTestId("submit"));
    },
    CANCEL: ({ getByTestId }: any) => {
      console.log("in cancel");
      fireEvent.click(getByTestId("cancel-button"));
    },
  } as any,
});

describe("sig app", () => {
  it("runs", () => {
      //rendered.container.innerHTML
  });
  // const testPlans = applicationModel.getSimplePathPlans();
  // console.log("TESTPLANS?", testPlans);
  // testPlans.forEach((plan: TestPlan<any, IContext>) => {
  //   describe(plan.description, () => {
  //     afterEach(cleanup);
  //     plan.paths.forEach((path) => {
  //       it(plan.description, () => {
  //         const rendered = render(<MyApp />);
  //         return path.test(rendered);
  //       });
  //     });
  //   });
  // });
  // it("should have full coverage", () => {
  //   return applicationModel.testCoverage();
  // });
});
