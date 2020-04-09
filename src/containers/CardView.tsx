import React, { useState, useEffect, useRef } from "react";
import { useService } from "@xstate/react";
import { Card, CardContent, Typography, Grid, ButtonBase, Tooltip } from "@material-ui/core";
import { Hd, VpnKey } from "@material-ui/icons";
import { ICard } from "../machines/appMachine";
import { Theme as MuiTheme } from "rjsf-material-ui";
import SignatoryOpenRPCDocument from "../openrpc.json";
import refParser, { JSONSchema } from "@apidevtools/json-schema-ref-parser";
import openrpcDocumentToJSONRPCSchema from "../helpers/OpenRPCDocumentMethodToJSONSChema";
import "./CardView.css";
import { Flipped } from "react-flip-toolkit";
import ColorHash from "color-hash";
import FormDrawer from "./FormDrawer";
import useDarkMode from "use-dark-mode";
import { QRCode } from "react-qrcode-logo";
import CardsList from "./CardsList";
const withTheme = require("@rjsf/core").withTheme; //tslint:disable-line
const Form = withTheme(MuiTheme);

interface IProps {
  card: ICard;
  onBack?: any;
  hideAccountEntryAnimation?: boolean;
  key?: any;
}

const styles = {
  card: {
    minHeight: "150px",
    width: "300px",
    borderRadius: "10px",
    background: "transparent",
    margin: "0px",
    display: "flex",
  },
  cardContent: {
    flexGrow: 1,
    padding: 0,
    margin: "16px",
    display: "flex",
  },
  cardItem: {
    borderRadius: "10px",
    width: "145px",
    minHeight: "115px",
  },
  listItem: {
    width: "145px",
    minHeight: "115px",
    borderRadius: "10px",
  },
  listItemIcon: {
    minWidth: "auto",
  },
};

const CardView = (props: IProps) => {
  const [state, send] = useService(props.card.ref!);
  const [formSchema, setFormSchema] = useState<undefined | JSONSchema>();
  const [openrpcDocument, setOpenrpcDocument] = useState<undefined | JSONSchema>();
  const darkMode = useDarkMode();
  const ref = useRef(null);
  const colorHash =
    darkMode.value
      ? new ColorHash({
        lightness: [0.3, 0.3, 0.3],
        saturation: [0.4, 0.5, 0.6],
      })
      : new ColorHash({
        lightness: [0.7, 0.37, 0.7],
        saturation: [0.4, 0.5, 0.6],
      });

  useEffect(() => {
    refParser.dereference(SignatoryOpenRPCDocument as any || {})
      .then(setOpenrpcDocument)
      .catch((e) => {
        console.error("REFPARSER ERROR", e);
      });
  }, []);

  return (
    <>
      {openrpcDocument &&
        <FormDrawer
          schema={openrpcDocumentToJSONRPCSchema(openrpcDocument, "sign") as any}
          formData={{
            address: props.card.address,
          }}
          open={state.matches({ selected: "signMessage" })}
          onSubmit={() => send("SUBMIT")}
          onClose={() => send("CANCEL")}
        />
      }
      {openrpcDocument &&
        <FormDrawer
          schema={openrpcDocumentToJSONRPCSchema(openrpcDocument, "signTransaction") as any}
          formData={{
            transaction: {
              from: props.card.address,
            },
          }}
          open={state.matches({ selected: "signTransaction" })}
          onSubmit={() => send("SUBMIT")}
          onClose={() => send("CANCEL")}
        />
      }
      {openrpcDocument &&
        <FormDrawer
          schema={openrpcDocumentToJSONRPCSchema(openrpcDocument, "signTypedData") as any}
          formData={{
            address: props.card.address,
          }}
          open={state.matches({ selected: "signTypedData" })}
          onSubmit={() => send("SUBMIT")}
          onClose={() => send("CANCEL")}
        />
      }
      <Grid container direction="column" justify="center" alignItems="center">
        <Card
          style={{
            ...styles.card,
            position: "relative",
            overflow: "visible",
            cursor: state.matches("selected") ? "initial" : "pointer",
            zIndex: state.matches("selected") ? 1 : "inherit",
          }}
          className={
            state.matches("initial") && state.history && state.history.matches("selected") === false
              ? "fade-in"
              : ""
          }
        >
          <CardContent style={{ ...styles.cardContent, zIndex: 10 }}>
            <Grid container direction="column" justify="space-between" style={{ flexGrow: 1, position: "relative" }}>
              <Flipped flipId={`account-${props.card.name}-${props.card.address || props.card.uuid}-name`} spring="stiff" translate>
                <Typography color="textSecondary">{props.card.name}</Typography>
              </Flipped>
              <Flipped flipId={`account-${props.card.name}-${props.card.address || props.card.uuid}-hd`} spring="stiff" translate>
                <div style={{ position: "absolute", top: "0", right: props.card.uuid ? "-1px" : "10px" }} >
                  {props.card.uuid
                    ? <Tooltip title={"HD Wallet"} >
                      <Hd />
                    </Tooltip>
                    : <Tooltip title={"Account"} >
                      <VpnKey />
                    </Tooltip>
                  }
                </div>
              </Flipped>
              <Flipped
                flipId={`account-${props.card.name}-${props.card.address || props.card.uuid}-${props.card.description}-description`}
                spring="stiff"
                translate
              >
                <Typography style={{ fontSize: "14px" }}>{props.card.description}</Typography>
              </Flipped>
              <Flipped
                flipId={`account-${props.card.name}-${props.card.address || props.card.uuid}-address`}
                spring="stiff"
                translate
                scale
              >
                <Typography style={{ fontSize: "12px", fontFamily: "mono" }}>{props.card.address || props.card.uuid}</Typography>
              </Flipped>
              {props.card.address &&
                <div
                  style={{
                    animation: "qrcode-in 0.25s ease-in-out 0.20s both",
                    opacity: state.matches("selected") ? 1 : 0,
                    display: state.matches("selected") ? "inherit" : "none",
                    margin: "0 auto",
                    marginTop: "10px",
                  }}>
                  <QRCode
                    value={props.card.address}
                    bgColor={"transparent"}
                    size={240}
                    quietZone={0}
                    qrStyle="dots"
                  />
                </div>
              }
            </Grid>
          </CardContent>
          <Flipped flipId={`account-${props.card.address || props.card.uuid}-background`} spring="stiff" >
            <div style={{ margin: 0, borderRadius: "10px", background: colorHash.hex(props.card.address || props.card.uuid || "default").toString(), opacity: 1 }} className="card-background" />
          </Flipped>
        </Card>
        {state.matches("selected") && props.card.address &&
          <Grid container justify="center" alignItems="center" style={{ width: "300px", marginTop: "10px" }}>
            <ButtonBase style={{
              ...styles.listItem,
              marginRight: "5px",
              marginBottom: "5px",
              animation: "item-in 0.25s ease-in-out 0.20s both",
            }} onClick={() => send("SHOW_SIGN_TRANSACTION")}>
              <Card style={{ ...styles.cardItem, width: "100%", height: "100%" }}>
                <CardContent>
                  <Typography>✍️</Typography>
                  <Typography>Sign Transaction</Typography>
                </CardContent>
              </Card>
            </ButtonBase>
            <ButtonBase style={{
              ...styles.listItem,
              marginLeft: "5px",
              marginBottom: "5px",
              animation: "item-in 0.25s ease-in-out 0.20s both",
            }} onClick={() => send("SHOW_SIGN_MESSAGE")}>
              <Card style={{ ...styles.cardItem, width: "100%", height: "100%" }}>
                <CardContent style={{ width: "80%", margin: "0 auto" }}>
                  <Typography>🔏</Typography>
                  <Typography>Sign Message</Typography>
                </CardContent>
              </Card>
            </ButtonBase>
            <ButtonBase style={{
              ...styles.listItem,
              marginRight: "5px",
              marginTop: "5px",
              animation: "item-in 0.25s ease-in-out 0.30s both",
            }} onClick={() => send("SHOW_SIGN_TYPED_DATA")}>
              <Card style={{ ...styles.cardItem, width: "100%", height: "100%" }}>
                <CardContent>
                  <Typography>📝</Typography>
                  <Typography>Sign Typed Data</Typography>
                </CardContent>
              </Card>
            </ButtonBase>
            <ButtonBase style={{
              ...styles.listItem,
              marginLeft: "5px",
              marginTop: "5px",
              animation: "item-in 0.25s ease-in-out 0.30s both",
            }} onClick={() => send("SHOW_EXPORT")}>

              <Card style={{ ...styles.cardItem, width: "100%", height: "100%" }}>
                <CardContent>
                  <Typography>🔑</Typography>
                  <Typography>Export Account</Typography>
                </CardContent>
              </Card>
            </ButtonBase>
          </Grid>
          // <List>
          //   <ListItem button style={styles.listItem} onClick={() => send("SHOW_SIGN_MESSAGE")}>
          //     <ListItemText>Sign Message</ListItemText>
          //     <ListItemIcon style={styles.listItemIcon}>
          //       <ArrowForwardIos />
          //     </ListItemIcon>
          //   </ListItem>
          //   <ListItem button style={styles.listItem} onClick={() => send("SHOW_SIGN_TYPED_DATA")}>
          //     <ListItemText>Sign Typed Data</ListItemText>
          //     <ListItemIcon style={styles.listItemIcon}>
          //       <ArrowForwardIos />
          //     </ListItemIcon>
          //   </ListItem>
          //   <ListItem button style={styles.listItem}>
          //     <ListItemText>Export Account</ListItemText>
          //     <ListItemIcon style={styles.listItemIcon}>
          //       <ArrowForwardIos />
          //     </ListItemIcon>
          //   </ListItem>
          // </List>
        }
        {state.matches("selected") && props.card.uuid &&
          <Grid style={{
            marginTop: "10px",
          }} container justify="center" alignItems="center" direction="column">
            <div style={{ width: "300px", marginBottom: "10px" }}>
              <ButtonBase style={{
                ...styles.listItem,
                marginRight: "5px",
                marginBottom: "5px",
                animation: "item-in 0.25s ease-in-out 0.20s both",
              }} onClick={() => send("SHOW_SIGN_TRANSACTION")}>
                <Card style={{ ...styles.cardItem, width: "100%", height: "100%" }}>
                  <CardContent>
                    <Typography>🔐</Typography>
                    <Typography>New</Typography>
                    <Typography>Account</Typography>
                  </CardContent>
                </Card>
              </ButtonBase>
              <ButtonBase style={{
                ...styles.listItem,
                marginLeft: "5px",
                marginBottom: "5px",
                animation: "item-in 0.25s ease-in-out 0.20s both",
              }} onClick={() => send("SHOW_SIGN_MESSAGE")}>
                <Card style={{ ...styles.cardItem, width: "100%", height: "100%" }}>
                  <CardContent style={{ width: "80%", margin: "0 auto" }}>
                    <Typography>🔑</Typography>
                    <Typography>Export Mnemonic</Typography>
                  </CardContent>
                </Card>
              </ButtonBase>
            </div>
            <div style={{
              animation: "item-in 0.25s ease-in-out 0.30s both",
            }}>
              <Typography>Accounts</Typography>
            </div>
            <Grid container justify="center" alignItems="center" style={{
              animation: props.hideAccountEntryAnimation
                ? "none"
                : "item-in 0.25s ease-in-out 0.30s both",
            }}>
              <CardsList cards={state.context.card.accounts || []} onCardSelect={(card) => {
                window.scroll({
                  top: 0,
                });
                if (card.ref && card.ref.parent && card.ref.parent && card.ref.parent.parent) {
                  card.ref.parent.parent.send("CARD.SELECT", card);
                }
              }} />
            </Grid>
          </Grid>
        }
      </Grid>
    </>
  );
};

export default CardView;
