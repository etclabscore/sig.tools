import { Machine } from "xstate";
import { createModel } from "@xstate/test";

const toggleMachine = Machine({
  id: "toggle",
  initial: "inactive",
  states: {
    inactive: {
      on: {
        /* ... */
      },
      meta: {
        test: async (page: any) => {
          await page.waitFor("input:checked");
        },
      },
    },
    active: {
      on: {
        /* ... */
      },
      meta: {
        test: async (page: any) => {
          await page.waitFor("input:not(:checked)");
        },
      },
    },
  },
});



describe("other", () => {
  it("can", () => {
    return;
  });
});
