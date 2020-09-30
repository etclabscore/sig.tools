import React from "react";
import ReactDOM from "react-dom";
import AccountSelectList from "./AccountSelectList";

describe("AccountSelectList", () => {
  it("can render without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<AccountSelectList accounts={[]}/>, div);
    ReactDOM.unmountComponentAtNode(div);
  });
  it("can render accounts", () => {
    const div = document.createElement("div");
    ReactDOM.render(<AccountSelectList accounts={[
      {
        address: "0x123",
        name: "potato",
        hidden: false,
      },
    ]}/>, div);
    expect(div.innerHTML).toContain("0x123");
    expect(div.innerHTML).toContain("potato");
    ReactDOM.unmountComponentAtNode(div);
  });
});
