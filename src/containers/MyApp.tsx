import React, { useEffect, useState } from "react";
import { useMachine } from "@xstate/react";
import appMachine, { ICard, IContext } from "../machines/appMachine";
import { Button, Grid, IconButton, MuiThemeProvider, CssBaseline, Paper, CircularProgress, Typography } from "@material-ui/core";
import SignatoryOpenRPCDocument from "../openrpc.json";
import CardView from "./CardView";
import refParser, { JSONSchema } from "@apidevtools/json-schema-ref-parser";
import { ArrowBackIos, VpnKey, Hd, Close } from "@material-ui/icons";
import CardsList from "./CardsList";
import { Flipper } from "react-flip-toolkit";
import AppBar from "./AppBar";
import { lightTheme, darkTheme } from "../themes/signatoryTheme";
import useDarkMode from "use-dark-mode";
import CreateMenu from "./CreateMenu";
import AppBarSignatory from "./AppBarSignatory";
import postMessageServer from "../postMessageServer/postMessageServer";
import FormDrawer from "./FormDrawer";
import openrpcDocumentToJSONRPCSchema from "../helpers/OpenRPCDocumentMethodToJSONSChema";

import FormPanel from "./FormPanel";
import { green, red } from "@material-ui/core/colors";

interface IProps {
  greeting: string;
}

const configuredAppMachine = appMachine.withConfig({
  actions: {
    persist: (ctx: any) => {
      localStorage.setItem("app-cards-state", JSON.stringify(ctx.cards));
    },
  },
}, { cards: [], formData: null, error: null, result: null, createData: null });

const MyApp = (props: IProps) => {
  const [state, send, myStateMachineService] = useMachine<IContext, any>(configuredAppMachine, { devTools: true });
  const darkMode = useDarkMode();
  const theme = darkMode.value ? darkTheme : lightTheme;
  const selectedCard = state.context.cards.find(
    (card: ICard) => card && card.ref && card.ref.state.matches("selected"),
  );
  let selectedNestedAccount;
  if (selectedCard && selectedCard.accounts && selectedCard.ref) {
    selectedNestedAccount = selectedCard.ref.state.context.card.accounts.find(
      (card: ICard) => card && card.ref && card.ref.state.matches("selected"),
    );
  }
  const [openrpcDocument, setOpenrpcDocument] = useState<undefined | JSONSchema>();
  const [jsonrpcServer, setJsonrpcServer] = useState<any>();
  useEffect(() => {
    if (jsonrpcServer) {
      jsonrpcServer.stop();
    }
    const pmServer = postMessageServer({
      appStateMachine: {
        send,
        state,
        stateMachineInstance: myStateMachineService,
      },
    });
    pmServer.start();
    setJsonrpcServer(pmServer);
  }, [state, myStateMachineService]);

  useEffect(() => {
    refParser.dereference(SignatoryOpenRPCDocument as any || {})
      .then(setOpenrpcDocument)
      .catch((e) => {
        console.error("REFPARSER ERROR", e);
      });
  }, []);

  const handleSignMessage = (e: ICard) => {
    send("SHOW_SIGN_MESSAGE", {
      address: e.address,
    });
  };
  const handleSignTypedData = (e: ICard) => {
    send("SHOW_SIGN_TYPED_DATA", {
      address: e.address,
    });
  };
  const handleSignTransaction = (e: ICard) => {
    send("SHOW_SIGN_TRANSACTION", {
      address: e.address,
    });
  };

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
          <AppBarSignatory />
        }
      />
      {!state.matches("signMessage") &&
        <>
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
                      onSignMessage={handleSignMessage}
                      onSignTypedData={handleSignTypedData}
                      onSignTransaction={handleSignTransaction}
                    />
                  </div>
                }
                {state.value === "nestedDetails" && selectedNestedAccount &&
                  <div style={{ width: "100%" }}>
                    <CardView
                      card={selectedNestedAccount}
                      onSignMessage={handleSignMessage}
                      onSignTypedData={handleSignTypedData}
                      onSignTransaction={handleSignTransaction}
                    />
                  </div>
                }
              </Grid>
            </div>
          </Flipper>
          {state.value === "list" &&
            <CreateMenu onActionClick={(accountOrWallet) => {
              switch (accountOrWallet) {
                case "account":
                  send("CREATE_ACCOUNT");
                  break;
                case "wallet":
                  send("CREATE_WALLET");
                  break;
                default:
                  break;
              }
            }} />
          }
        </>
      }
      {state.matches("signMessage") && state.context.formData &&
        <FormPanel
          schema={openrpcDocumentToJSONRPCSchema(openrpcDocument, "sign") as any}
          formData={state.context.formData}
          title={"Sign"}
          onSubmit={(e) => send("SUBMIT", { ...e, type: "SUBMIT" })}
          onCancel={() => send("CANCEL")}
        >
          <Button type="submit" variant="contained" fullWidth color="primary">Sign</Button>
        </FormPanel>
      }
      {state.matches("signTransaction") && state.context.formData &&
        <FormPanel
          title={"Sign"}
          schema={openrpcDocumentToJSONRPCSchema(openrpcDocument, "signTransaction") as any}
          formData={state.context.formData}
          onSubmit={(e) => send("SUBMIT", { ...e, type: "SUBMIT" })}
          onCancel={() => send("CANCEL")}
        >
          <Button type="submit" variant="contained" fullWidth color="primary">Sign</Button>
        </FormPanel>
      }
      {state.matches("signTypedData") && state.context.formData &&
        <FormPanel
          schema={openrpcDocumentToJSONRPCSchema(openrpcDocument, "signTypedData") as any}
          formData={state.context.formData}
          title={"Sign"}
          onSubmit={(e) => {
            send("SUBMIT", { ...e, type: "SUBMIT" });
          }}
          onCancel={() => send("CANCEL")}
        >
          <Button type="submit" variant="contained" fullWidth color="primary">Sign</Button>
        </FormPanel>
      }
      {state.matches("createWallet") &&
        <FormPanel
          title={"Create Wallet"}
          skipPassphrase={true}
          schema={openrpcDocumentToJSONRPCSchema(openrpcDocument, "importMnemonic") as any}
          formData={state.context.createData}
          onSubmit={(e) => {
            send("SUBMIT", { ...e, type: "SUBMIT" });
          }}
          onCancel={() => send("CANCEL")}
        >
          <Button type="submit" variant="contained" fullWidth color="primary">Create Wallet</Button>
        </FormPanel>
      }
      {state.matches("createAccount") &&
        <FormPanel
          title={"Create Account"}
          skipPassphrase={true}
          schema={openrpcDocumentToJSONRPCSchema(openrpcDocument, "createAccount") as any}
          formData={state.context.createData}
          onSubmit={(e) => {
            send("SUBMIT", { ...e, type: "SUBMIT" });
          }}
          onCancel={() => send("CANCEL")}
        >
          <Button type="submit" variant="contained" fullWidth color="primary">Create Account</Button>
        </FormPanel>
      }
      {state.matches("signingMessage") &&
        <Grid container>
          <CircularProgress />
        </Grid>
      }
      {
        <Paper style={{
          position: "absolute",
          backgroundColor: green[500],
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          padding: "50px",
          overflow: "auto",
          width: "100%",
          opacity: 0,
          pointerEvents: state.matches("success") ? "all" : "none",
          animation: (state.matches("success") || (state.history && state.history.value === "success"))
            ? `scale-${state.matches("success") ? "in" : "out"} 0.2s cubic-bezier(0.4, 0.0, 0.2, 1) 0s both`
            : "none",
          zIndex: 1300,
        }}
        >
          <IconButton
            style={{
              position: "fixed",
              top: "0px",
              right: "5px",
              zIndex: 1400,
            }}
            onClick={() => send("CANCEL")}>
            <Close />
          </IconButton>
          <Typography color="textSecondary">Success</Typography>
          <pre style={{ overflow: "auto" }}>
            <code>
              {JSON.stringify(state.context.result, null, 4)}
            </code>
          </pre>
        </Paper>
      }
      {<Paper style={{
        position: "absolute",
        backgroundColor: red[500],
        width: "100%",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        padding: "50px",
        overflow: "auto",
        opacity: 0,
        pointerEvents: state.matches("error") ? "all" : "none",
        animation: (state.matches("error") || (state.history && state.history.value === "error"))
          ? `scale-${state.matches("error") ? "in" : "out"} 0.2s cubic-bezier(0.4, 0.0, 0.2, 1) 0s both`
          : "none",
        zIndex: 1300,
      }}
      >
        <IconButton
          style={{
            position: "fixed",
            top: "0px",
            right: "5px",
            zIndex: 1400,
          }}
          onClick={() => send("CANCEL")}>
          <Close />
        </IconButton>
        <Typography color="textPrimary">Error</Typography>
        <pre style={{ overflow: "auto" }}>
          <code>
            {state.context.error && JSON.stringify(state.context.error, null, 4)}
          </code>
        </pre>
      </Paper>
      }
    </MuiThemeProvider >
  );
};

export default MyApp;
