import React from "react";
import { useMachine } from "@xstate/react";
import cardsMachine, { ICard } from "../machines/cardsMachine";
import { Typography, Grid, IconButton } from "@material-ui/core";
import { pink } from "@material-ui/core/colors";
import CardView from "./CardView";
import { AddOutlined } from "@material-ui/icons";

const accounts: ICard[] = [
  {
    name: "My Account Thing",
    description: "an account that is for x y and z",
    address: "0x90ee510fb88ea47a84b45a6d983a0bc6b193e385",
  },
  {
    name: "For Work",
    description: "bar",
    address: "0x90ee510fb88ea47a84b45a6d983a0bc6b193e385",
  },
  {
    name: "Business Account",
    address: "0x90ee510fb88ea47a84b45a6d983a0bc6b193e385",
  },
  {
    name: "foo",
    description: "bar",
    address: "0x90ee510fb88ea47a84b45a6d983a0bc6b193e385",
  },
  {
    name: "potato",
    description: "salad",
    address: "0x90ee510fb88ea47a84b45a6d983a0bc6b193e385",
  },
  {
    name: "savings",
    description: "savings",
    address: "0x90ee510fb88ea47a84b45a6d983a0bc6b193e385",
  },
  {
    name: "rainy day",
    description: "rainy day fund",
    address: "0x90ee510fb88ea47a84b45a6d983a0bc6b193e385",
  },
  {
    name: "retirement",
    description: "retirement fund",
    address: "0x90ee510fb88ea47a84b45a6d983a0bc6b193e385",
  },
];

interface IProps {
  greeting: string;
}
const styles = {
  card: {
    height: "150px",
    background: pink[100],
    margin: "5px",
    display: "flex",
  },
  cardContent: {
    flexGrow: 1,
    padding: 0,
    margin: "16px",
    display: "flex",
  },
};

const configuredCardsMachine = cardsMachine.withConfig({
  actions: {
    persist: (ctx: any) => {
      localStorage.setItem("cards-xstate", JSON.stringify(ctx.cards));
    },
  },
}, { cards: accounts });

const MyApp = (props: IProps) => {
  const [state, send] = useMachine(configuredCardsMachine, {
    devTools: true,
  });
  return (
    <div id="viewport" style={{
      overflowY: "hidden",
      overflowX: "visible",
      transform: state.matches("selected")
        ? `translate3d(-90px, 0px, 0px)`
        : `translate3d(0px, 0px, 0px)`,
      transition: "0.5s ease-in-out",
    }}>
      <div id="scroll" style={{overflowY: "visible", overflowX: "hidden"}}>
        <div style={{ height: "50px" }}>
          {state.value === "idle" ?
            <Grid container justify="center" alignItems="center">
              <Typography style={{ width: "50px" }}>Wallets</Typography>
              <IconButton>
                <AddOutlined />
              </IconButton>
            </Grid>
            : null}
        </div>
        <Grid container direction="column" justify="center" alignItems="center">
          {state.context.cards.map((card, i) => (
            <div onClick={() => send("CARD.SELECT", card)} style={{
              opacity: (card && card.ref && card.ref.state.value === "selected")
                ? 1
                : state.matches(["idle"])
                  ? 1
                  : 0,
              transform: state.matches("selected") && card && card.ref && card.ref.state.matches("selected")
                ? `translate3d(90px, -${i * 173}px, 0px)`
                : `translate3d(0px, 0px, 0px)`,
              transition: "0.5s ease-in-out",
            }}>
              {card.ref && card.ref.state.value === "selected" ? <button onClick={
                (e) => {
                  e.stopPropagation();
                  send("BACK");
                }
              }>Back</button> : null}
              {card.ref && card.ref.state.value !== "selected" ? <div style={{ marginBottom: "23px" }} /> : null}
              <CardView card={card} />
            </div>
          ))}
        </Grid>
      </div>
    </div >
  );
};

export default MyApp;
