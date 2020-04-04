import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useService } from "@xstate/react";
import { pink } from "@material-ui/core/colors";
import { Card, CardContent, Typography, Grid, Button, Input, IconButton, Tooltip, InputBase } from "@material-ui/core";
import { Send, Description, AccountBalance } from "@material-ui/icons";
import { ICard } from "../machines/cardsMachine";
import { Theme as MuiTheme } from "rjsf-material-ui";
import SignatoryOpenRPCDocument from "../openrpc.json";
import refParser, { JSONSchema } from "@apidevtools/json-schema-ref-parser";
import openrpcDocumentToJSONRPCSchema from "../helpers/OpenRPCDocumentMethodToJSONSChema";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
// import MuiTheme from "../JSONSchemaFormTheme";
const withTheme = require("@rjsf/core").withTheme; //tslint:disable-line
const Form = withTheme(MuiTheme);


// const schema = {
//   title: "Todo",
//   type: "object",
//   required: ["title"],
//   properties: {
//     title: { type: "string", title: "Title", default: "A new task" },
//     done: { type: "boolean", title: "Done?", default: false },
//   },
// };
// const schema = {
//   "title": "A list of tasks",
//   "type": "object",
//   "required": [
//     "title"
//   ],
//   "properties": {
//     "title": {
//       "type": "string",
//       "title": "Task list title"
//     },
//     "tasks": {
//       "type": "array",
//       "title": "Tasks",
//       "items": {
//         "type": "object",
//         "required": [
//           "title"
//         ],
//         "properties": {
//           "title": {
//             "type": "string",
//             "title": "Title",
//             "pattern": "^0x([a-fA-F0-9]?)+$",
//             "description": "A sample title"
//           },
//           "details": {
//             "type": "string",
//             "title": "Task details",
//             "description": "Enter the task details"
//           },
//           "done": {
//             "type": "boolean",
//             "title": "Done?",
//             "default": false
//           }
//         }
//       }
//     }
//   }
// }
// const schema = {
//   "title": "keyfile",
//   "type": "object",
//   "properties": {
//     "version": {
//       "type": "integer"
//     },
//     "id": {
//       "type": "string"
//     },
//     "crypto": {
//       "title": "crypto",
//       "type": "object",
//       "properties": {
//         "ciphertext": {
//           "type": "string"
//         },
//         "cipherparams": {
//           "type": "object",
//           "properties": {
//             "iv": {
//               "title": "iv",
//               "type": "string"
//             }
//           }
//         },
//         "cipher": {
//           "type": "string"
//         },
//         "kdf": {
//           "type": "string"
//         },
//         "kdfparams": {
//           "type": "object",
//           "properties": {
//             "dklen": {
//               "title": "dklen",
//               "type": "integer"
//             },
//             "salt": {
//               "type": "string"
//             },
//             "n": {
//               "type": "integer"
//             },
//             "r": {
//               "type": "integer"
//             },
//             "p": {
//               "type": "integer"
//             }
//           },
//           "required": [
//             "dklen",
//             "salt",
//             "n",
//             "r",
//             "p"
//           ]
//         },
//         "mac": {
//           "type": "string"
//         }
//       },
//       "required": [
//         "kdfparams",
//         "kdf",
//         "cipher",
//         "cipherparams",
//         "ciphertext",
//         "mac"
//       ]
//     }
//   },
//   "required": [
//     "crypto",
//     "id",
//     "version"
//   ]
// };

// const schema = {
//   "type": "object",
//   "oneOf": [
//     {
//       "properties": {
//         "lorem": {
//           "type": "string"
//         }
//       },
//       "required": [
//         "lorem"
//       ]
//     },
//     {
//       "properties": {
//         "ipsum": {
//           "type": "string"
//         }
//       },
//       "required": [
//         "ipsum"
//       ]
//     }
//   ]
// }

interface IProps {
  card: ICard;
}

const styles = {
  card: {
    width: "300px",
    height: "150px",
    borderRadius: "10px",
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

const CardView = (props: IProps) => {
  const [state, send] = useService(props.card.ref!);
  const [formSchema, setFormSchema] = useState<undefined | JSONSchema>();
  const ref = useRef(null);
  useEffect(() => {
    refParser.dereference(SignatoryOpenRPCDocument as any || {})
      .then((s) => {
        const schema = openrpcDocumentToJSONRPCSchema(s, "sign");
        setFormSchema(schema);
      })
      .catch((e) => {
        console.error("REFPARSER ERROR", e);
      });
  }, []);

  useLayoutEffect(() => {
    if (state.value === "selected") {
      document.body.scroll({
        top: 0,
      });
      setTimeout(() => {
        const el = document.getElementById("viewport");
        if (el) {
          if (ref && ref.current) {
            // el.style.height = ;
            const localHeight = (ref.current as any).clientHeight + 100;
            el.style.height = (Math.max(window.innerHeight, localHeight) + 10) + "px";
          }
        }
      }, 500);
    } else {
      const el = document.getElementById("viewport");
      if (el) {
        el.style.height = "auto";
      }
      // const el = document.getElementById("scroll");
      // if (ref.current !== null) {
      //   el?.scrollTo(ref.current!);
      // }
    }
  }, [state.value]);
  const log = (type: any) => console.log.bind(console, type);

  return (
    <div ref={ref}>
      <Card style={{
        ...styles.card,
        cursor: state.value === "selected" ? "initial" : "pointer",
      }}>
        <CardContent style={styles.cardContent}>
          <Grid container direction="column" justify="space-between" style={{ flexGrow: 1 }}>
            <Typography color="textSecondary">{props.card.name}</Typography>
            <Typography style={{ fontSize: "14px" }}>{props.card.description}</Typography>
            <Typography style={{ fontSize: "12px", fontFamily: "mono" }}>{props.card.address}</Typography>
          </Grid>
        </CardContent>
      </Card>
      <div style={{
        opacity: state.value === "selected" ? 1 : 0,
        display: state.value === "selected" ? "block" : "none",
        transition: "0.5s ease-in-out",
        transitionDelay: "2s",
      }}>
        <div>
          <Tooltip title="QR Code">
            <IconButton>
              <AccountBalance />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sign Transaction">
            <IconButton>
              <Send />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sign Message">
            <IconButton>
              <Description />
            </IconButton>
          </Tooltip>
        </div>
        <div style={{ width: "300px" }}>
          <Form
            noHtml5Validate
            showErrorList={false}
            liveValidate={true}
            validate={true}
            schema={formSchema || {}}
            onChange={log("changed")}
            onSubmit={log("submitted")}
            onError={log("errors")}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Form>
        </div>
        {/* <div id="form">
          <Grid container direction="column">
            <InputBase placeholder="To"  />

            <div style={{ marginBottom: "5px" }} />
            <InputBase placeholder="Amount" type="number" style={{ background: "rgba(0,0,0,0.1)", borderRadius: "4px", padding: "0px 10px", marginRight: "5px" }} />
            <div style={{ marginBottom: "5px" }} />
            <InputBase placeholder="Enter Passphrase" style={{ background: "rgba(0,0,0,0.1)", borderRadius: "4px", padding: "0px 10px", marginRight: "5px" }} />
          </Grid>
        </div> */}
      </div>
    </div>
  );
};

export default CardView;
