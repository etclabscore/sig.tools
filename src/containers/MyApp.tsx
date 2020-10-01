import React, { useEffect, useState } from "react";
import { useMachine } from "@xstate/react";
import appMachine, { ICard, IContext } from "../machines/appMachine";
import {
  Button,
  Grid,
  IconButton,
  MuiThemeProvider,
  CssBaseline,
  Paper,
  CircularProgress,
  Typography,
  FormControlLabel,
  Checkbox,
  Link,
  Collapse,
} from "@material-ui/core";
import SignatoryOpenRPCDocument from "../openrpc.json";
import CardView from "./CardView";
import refParser, { JSONSchema } from "@apidevtools/json-schema-ref-parser";
import { ArrowBackIos, Close } from "@material-ui/icons";
import CardsList from "./CardsList";
import { Flipper } from "react-flip-toolkit";
import AppBar from "./AppBar";
import { lightTheme, darkTheme } from "../themes/signatoryTheme";
import useDarkMode from "use-dark-mode";
import CreateMenu from "./CreateMenu";
import AppBarSignatory from "./AppBarSignatory";
import postMessageServer from "../postMessageServer/postMessageServer";
import openrpcDocumentToJSONRPCSchema from "../helpers/OpenRPCDocumentMethodToJSONSChema";
import _ from "lodash";
import Alert from "@material-ui/lab/Alert";
import FormPanel from "./FormPanel";
import { green, red } from "@material-ui/core/colors";
import { State } from "xstate";
import HexToNumberConverter from "../components/HexToNumberConverter";
import HexToStringConverter from "../components/HexToString";
import PasswordWidget from "../components/PasswordWidget";
import InfoDialog from "../components/InfoDialog";
import { capabilities } from "../capabilities";
import { RpcCapDomainEntry } from "@xops.net/rpc-cap";

export const matchesMachineState = (
  states: string[],
  machine: State<any, any, any, any>,
) => (states.find((state) => machine.matches(state)) ? true : false);

const configuredAppMachine = appMachine.withConfig({
  actions: {
    persist: (ctx: any) => {
      localStorage.setItem("app-cards-state", JSON.stringify(ctx.cards));
    },
  },
}, { cards: [], formData: null, error: null, result: null, createData: null });

const MyApp = () => {
  const [state, send, service]: [any, any, any] =
    useMachine<IContext, any>(configuredAppMachine, { devTools: true });
  const [infoDialogOpen, setInfoDialogOpen] = useState<boolean>(false);
  const [onboardingSchema, setOnboardingSchema] = useState();
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
  const { metadata, ...formData } = state.context.formData || { metadata: { origin: "" } };
  let { domain, ...createData } = state.context.createData || { domain: "" }; //tslint:disable-line
  if (formData.domain) {
    domain = formData.domain;
    delete formData.domain;
  }

  useEffect(() => {
    if (window.location.search.includes("?inspect")) {
      window.__xstate__.register(service);
    }
  }, [service]);

  useEffect(() => {
    if (jsonrpcServer) {
      jsonrpcServer.stop();
    }
    const pmServer = postMessageServer({
      send,
    });
    pmServer.start();
    setJsonrpcServer(pmServer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refParser.dereference(SignatoryOpenRPCDocument as any || {})
      .then(setOpenrpcDocument)
      .catch((e) => {
        console.error("REFPARSER ERROR", e);
      });
  }, []);

  useEffect(() => {
    if (openrpcDocument) {
      const onboards: any = {
        ...openrpcDocumentToJSONRPCSchema(openrpcDocument, "createAccount"),
        title: "",
      };
      delete onboards.properties.newAccount.properties.description;
      delete onboards.properties.newAccount.properties.privateKey;
      setOnboardingSchema(onboards);
    }
  }, [openrpcDocument]);

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
      transaction: {
        from: e.address,
      },
    });
  };
  const [showAlpha, setShowAlpha] = useState(true);

  const onInfoDialogClose = () => {
    setInfoDialogOpen(false);
  };

  const handleInfoClick = () => {
    setInfoDialogOpen(true);
  };

  type domainsListTuple = [string, RpcCapDomainEntry];
  const [capabilitiesList, setCapabilitiesList] = useState<domainsListTuple[]>(Object.entries(capabilities?.getDomains() || {}));
  useEffect(() => {
    if (capabilities) {
      setCapabilitiesList(Object.entries(capabilities.getDomains()));
      capabilities.subscribe(() => {
        if (capabilities) {
          setCapabilitiesList(Object.entries(capabilities.getDomains()));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capabilities]);

  return (
    <MuiThemeProvider theme={theme}>
      <div id={state.value} />
      <CssBaseline />
      <div style={{ marginTop: "70px" }} />
      <Collapse in={showAlpha}>
        <Alert severity="warning"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setShowAlpha(false);
              }}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          <b>sig.tools</b> is in early development<b> alpha</b>.
            &nbsp;Some features are not available.&nbsp;
          <Link href="https://ethereumclassic.org/blog/2017-06-17-private-keys" color="textSecondary">
            Use at your own risk.
          </Link>
          &nbsp;<Link href="https://github.com/etclabscore/sig.tools/issues" color="secondary">
            Give Feedback.
          </Link>
        </Alert>
      </Collapse>
      <AppBar
        onDarkModeChange={darkMode.toggle}
        darkMode={darkMode.value}
        onInfoClick={handleInfoClick}
        backItem={matchesMachineState(["details", "nestedDetails"], state) &&
          <IconButton id="back" onClick={() => {
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
            <CreateMenu offsetTop={showAlpha} onActionClick={(accountOrWallet) => {
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
          id="sign-message"
          uiSchema={{
            dataToSign: {
              "ui:widget": HexToStringConverter,
            },
            chainId: {
              "ui:widget": HexToNumberConverter,
            },
          }}
          header={domain &&
            <Alert severity="info" style={{ marginBottom: "10px" }} variant="outlined">
              <Typography variant="body1">
                {domain && domain.origin}
              </Typography>
            </Alert>
          }
          schema={openrpcDocumentToJSONRPCSchema(openrpcDocument, "sign") as any}
          formData={formData}
          title={"Sign"}
          onSubmit={(e) => send("SUBMIT", { ...e, type: "SUBMIT" })}
          onCancel={() => send("CANCEL")}
        >
          <Button type="submit" variant="contained" fullWidth color="primary">Sign</Button>
        </FormPanel>
      }
      {state.matches("signTransaction") && state.context.formData &&
        <FormPanel
          id="sign-transaction"
          title={"Sign Transaction"}
          header={domain &&
            <Alert severity="info" style={{ marginBottom: "10px" }} variant="outlined">
              <Typography variant="body1">
                {domain && domain.origin}
              </Typography>
            </Alert>
          }
          uiSchema={{
            transaction: {
              value: {
                "ui:widget": HexToNumberConverter,
              },
              gas: {
                "ui:widget": HexToNumberConverter,
              },
              gasPrice: {
                "ui:widget": HexToNumberConverter,
              },
              nonce: {
                "ui:widget": HexToNumberConverter,
              },
            },
            chainId: {
              "ui:widget": HexToNumberConverter,
            },
          }}
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
          id="sign-typed-data"
          header={domain &&
            <Alert severity="info" style={{ marginBottom: "10px" }} variant="outlined">
              <Typography variant="body1">
                {domain && domain.origin}
              </Typography>
            </Alert>
          }
          schema={openrpcDocumentToJSONRPCSchema(openrpcDocument, "signTypedData") as any}
          formData={state.context.formData}
          uiSchema={{
            chainId: {
              "ui:widget": HexToNumberConverter,
            },
          }}
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
          id="create-wallet"
          title={"Create Wallet"}
          header={domain &&
            <Alert severity="info" style={{ marginBottom: "10px" }} variant="outlined">
              <Typography variant="body1">
                {domain && domain.origin}
              </Typography>
            </Alert>
          }
          skipPassphrase={true}
          schema={openrpcDocumentToJSONRPCSchema(openrpcDocument, "importMnemonic") as any}
          formData={createData}
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
          schema={onboardingSchema as any || {}}
          header={domain &&
            <Alert severity="info" style={{ marginBottom: "10px" }} variant="outlined">
              <Typography variant="body1">
                {domain && domain.origin}
              </Typography>
            </Alert>
          }
          uiSchema={{
            newAccount: {
              passphrase: {
                "ui:widget": "password",
              },
            },
          }}
          widgets={{
            password: PasswordWidget,
          }}
          formData={Object.assign(
            {},
            { newAccount: { name: "🧙‍♂️" } },
            { newAccount: state.context.createData.newAccount },
          )}
          onSubmit={(e) => {
            send("SUBMIT", { ...e, type: "SUBMIT" });
          }}
          onCancel={() => send("CANCEL")}
        >
          <Button type="submit" variant="contained" fullWidth color="primary">Create Account</Button>
        </FormPanel>
      }
      {(state.matches("signingMessage") ||
        state.matches("creatingAccount") ||
        state.matches("creatingWallet") ||
        state.matches("signingTransaction") ||
        state.matches("signingTypedData")) &&
        <Grid container justify="center" alignItems="center" style={{ paddingTop: "30px" }}>
          <CircularProgress />
        </Grid>
      }
      {
        <Paper
          id="success"
          style={{
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
            id="cancel-button"
            style={{
              position: "fixed",
              top: "0px",
              right: "5px",
              zIndex: 1400,
            }}
            onClick={() => send("CANCEL")}>
            <Close />
          </IconButton>
          <Typography color="textSecondary"><span role="img" aria-label="success">🎉</span> Success</Typography>
          <pre style={{ overflow: "auto" }}>
            <code>
              {JSON.stringify(state.context.result, null, 4)}
            </code>
          </pre>
          <Button variant="contained" onClick={() => send("CANCEL")}>Ok</Button>
        </Paper>
      }
      {<Paper
        id="error"
        style={{
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
          id="cancel-button"
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
      </Paper>}
      {<Paper
        id="request-permissions"
        style={{
          position: "absolute",
          width: "100%",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          padding: "50px",
          overflow: "auto",
          display: state.context.cards.length === 0 ? "none" : "block",
          opacity: 0,
          pointerEvents: state.matches("requestPermissions") ? "all" : "none",
          animation:
            (state.matches("requestPermissions") || (state.history && state.history.value === "requestPermissions"))
              ? `scale-${state.matches("requestPermissions") ? "in" : "out"} 0.2s cubic-bezier(0.4, 0.0, 0.2, 1) 0s both` //tslint:disable-line
              : "none",
          zIndex: 1300,
        }}>
        <IconButton
          id="cancel"
          style={{
            position: "fixed",
            top: "0px",
            right: "5px",
            zIndex: 1400,
          }}
          onClick={() => send("CANCEL")}>
          <Close />
        </IconButton>
        <Grid container>
          <Grid container direction="column" style={{ marginBottom: "20px" }}>
            <Typography variant="h3" gutterBottom>Permissions Needed</Typography>
            <Alert severity="info" style={{ marginBottom: "10px" }} variant="outlined">
              <Typography variant="body1">{metadata && metadata.origin}</Typography>
            </Alert>
          </Grid>
          {state.context.formData && state.context.formData.permissions &&
            _.map(state.context.formData.permissions, (value, key) => {
              return (
                <Grid container direction="row">
                  <FormControlLabel
                    control={<Checkbox checked={true} name={key} />}
                    label={`Trust this app to [${key}]?`}
                  />
                  {/* {key === "listAccounts" &&
                    <>
                      <SelectAccount accounts={state.context.cards} />
                    </>
                  } */}
                </Grid>
              );
            })
          }
          <div style={{ width: "100%", marginBottom: "20px" }} />
          <Button id="submit" variant="contained" onClick={() => send("SUBMIT")}>Trust</Button>
          <Button id="cancel" onClick={() => send("CANCEL")}>Decline</Button>
        </Grid>
      </Paper>
      }
      {state.matches("onboarding") &&
        <FormPanel
          id="onboarding"
          skipPassphrase={true}
          schema={onboardingSchema as any || {}}
          hideClose={true}
          uiSchema={{
            newAccount: {
              passphrase: {
                "ui:widget": "password",
              },
            },
          }}
          widgets={{
            password: PasswordWidget,
          }}
          header={
            <Grid container direction="row">
              <Grid item container direction="column">
                <Grid container justify="space-evenly" alignContent="space-around">
                  <Grid item>
                    <Typography variant="h4" gutterBottom color="textPrimary">
                      Getting Started
                   </Typography>
                  </Grid>
                </Grid>
                <br />
                <Typography variant="caption">
                  <span role="img" aria-label="sig.tools">🔐</span>
                  <b>sig.tools</b>
                  &nbsp;manages cryptographic accounts for the Ethereum stack.
                </Typography>
                <br />
                <Typography variant="caption">
                  <Link href="https://ethereumclassic.org/blog/2017-06-17-private-keys">
                    <b>sig.tools</b> can <b>not</b> recover funds
                  </Link>.
                  Keep your keyfile and password in a safe place.
                </Typography>
              </Grid>
            </Grid>
          }
          formData={state.context.createData}
          title={"Set Up Your Account"}
          onSubmit={(e) => send("SUBMIT", { ...e, type: "SUBMIT" })}
        >
          <Button id="submit" type="submit" variant="contained" fullWidth color="primary">Submit</Button>
        </FormPanel>
      }
      <InfoDialog
        open={infoDialogOpen}
        onClose={onInfoDialogClose}
        capabilitiesList={capabilitiesList}
        onRemoveCapability={(cap) => {
          if (capabilities) {
            capabilities.removePermissionsFor(cap.invoker, [cap]);
            setCapabilitiesList(Object.entries(capabilities.getDomains()));
          }
        }}>
      </InfoDialog>
    </MuiThemeProvider >
  );
};

export default MyApp;
