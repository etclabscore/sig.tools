import React from "react";
import { useMachine } from "@xstate/react";
import appMachine, { ICard } from "../machines/appMachine";
import { Typography, Grid, IconButton, MuiThemeProvider, CssBaseline } from "@material-ui/core";
import CardView from "./CardView";
import { ArrowBackIos, VpnKey, Hd } from "@material-ui/icons";
import CardsList from "./CardsList";
import { Flipper } from "react-flip-toolkit";
import AppBar from "./AppBar";
import { lightTheme, darkTheme } from "../themes/signatoryTheme";
import useDarkMode from "use-dark-mode";
import mockListAccounts from "../helpers/mockListAccounts.json";
import mockListWallets from "../helpers/mockListWallets.json";
import accountsToTree from "../helpers/accountsToTree";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const actions = [
  { icon: <VpnKey />, name: "New Account" },
  { icon: <Hd />, name: "New HD Wallet" },
];

const accounts: ICard[] = accountsToTree(mockListAccounts.result, mockListWallets.result);

interface IProps {
  greeting: string;
}

const configuredAppMachine = appMachine.withConfig({
  actions: {
    persist: (ctx: any) => {
      localStorage.setItem("app-cards-state", JSON.stringify(ctx.cards));
    },
  },
}, { cards: accounts });

const MyApp = (props: IProps) => {
  const [state, send] = useMachine(configuredAppMachine);
  const darkMode = useDarkMode();
  const theme = darkMode.value ? darkTheme : lightTheme;
  const mobile = useMediaQuery(theme.breakpoints.down("xs"));
  const selectedCard = state.context.cards.find(
    (card) => card && card.ref && card.ref.state.matches("selected"),
  );
  let selectedNestedAccount;
  if (selectedCard && selectedCard.accounts && selectedCard.ref) {
    selectedNestedAccount = selectedCard.ref.state.context.card.accounts.find(
      (card: ICard) => card && card.ref && card.ref.state.matches("selected"),
    );
  }
  const [open, setOpen] = React.useState(false);
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        onDarkModeChange={darkMode.toggle}
        darkMode={darkMode.value}
        backItem={(state.matches("details") || state.matches("nestedDetails")) &&
          <IconButton onClick={() => {
            send("BACK");
          }} tabIndex={1}>
            <ArrowBackIos />
          </IconButton>
        }
        topItem={
          <Grid container justify="center" alignItems="center">
            <img
              src="https://user-images.githubusercontent.com/10556209/73570773-a07fb900-4432-11ea-8ed1-3bf525af04d9.png"
              height="30px"
              style={{ marginRight: "7px" }}
            />
            <Typography color="textSecondary">Signatory&nbsp;&nbsp;🖥</Typography>
          </Grid>
        }
      >
      </AppBar>
      <Flipper flipKey={state.value}>
        <div id="scroll" >
          <Grid container justify="center" alignItems="center">
            {state.value === "list" &&
              <CardsList cards={state.context.cards} onCardSelect={(card) => {
                window.scroll({
                  top: 0,
                });
                send("CARD.SELECT", card);
              }} />
            }
            {state.value === "details" && selectedCard &&
              <div style={{ width: "100%" }}>
                <CardView
                  card={selectedCard}
                  hideAccountEntryAnimation={state.history && state.history.matches("nestedDetails")}
                />
              </div>
            }
            {state.value === "nestedDetails" && selectedNestedAccount &&
              <div style={{ width: "100%" }}>
                <CardView card={selectedNestedAccount} />
              </div>
            }
          </Grid>
        </div>
      </Flipper>
      {state.value === "list" &&
        <SpeedDial
          ariaLabel="Create"
          icon={<SpeedDialIcon />}
          onClick={() => setOpen(!open)}
          open={open}
          style={mobile
            ? { position: "fixed", bottom: "45px", right: "25px", zIndex: 10 }
            : { position: "fixed", top: "75px", right: "25px", zIndex: 10 }
          }
          // onOpen={() => setOpen(true)}
          // onClose={() => setOpen(false)}
          direction={mobile ? "up" : "down"}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
            />
          ))}
        </SpeedDial>
      }
    </MuiThemeProvider >
  );
};

export default MyApp;
