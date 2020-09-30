import { inspect } from "@xstate/inspect";

if (window.location.search.includes("?inspect")) {
  inspect({
    url: "https://statecharts.io/inspect",
    iframe: false,
  });
}
