import React, { useState, useEffect } from "react";
import { TextField, Grid, Typography, Link } from "@material-ui/core";
import hexToStringMachine from "../machines/hexToStringMachine";
import { useMachine } from "@xstate/react";
import { SwapHoriz } from "@material-ui/icons";

interface IProps {
  onChange?: (hex: string) => void;
  schema: any;
  value: string;
}

const HexToStringConverter: React.FC<IProps> = (props) => {
  const [state, send, machine] = useMachine(hexToStringMachine.withContext({ hex: props.value, string: "" }), { devTools: true });

  const [maybeJSON, setMaybeJSON] = useState();

  machine.onChange((context: any) => {
    if (props.onChange) {
      props.onChange(context.hex);
    }
  });

  const checkMaybeJSON = (show: boolean = false) => {
    try {
      const m = JSON.parse(state.context.string);
      if (m) {
        setMaybeJSON(m);
      }
      if (show) {
        send("SHOW_JSON");
      }
    } catch (e) {
      setMaybeJSON(undefined);

    }
  };

  useEffect(() => {
    checkMaybeJSON();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.context.string]);

  useEffect(() => {
    checkMaybeJSON(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Typography gutterBottom>{props.schema.title}</Typography>
      {!state.matches("all") &&
        <Link style={{ cursor: "pointer", userSelect: "none" }}>
          <Typography variant="caption" color="primary" onClick={() => send("SHOW_HEX")}>raw</Typography>
        </Link>
      }
      {!state.matches("stringonly") &&
        <Link style={{ cursor: "pointer", userSelect: "none" }}>
          <Typography variant="caption" color="primary" onClick={() => send("SHOW_STRING")}>string</Typography>
        </Link>
      }
      {maybeJSON && !state.matches("jsononly") &&
        <Link style={{ cursor: "pointer", userSelect: "none" }}>
          <Typography variant="caption" color="primary" onClick={() => send("SHOW_JSON")}>json</Typography>
        </Link>
      }
      <Grid container justify="flex-start" alignItems="center">
        {state.matches("all") &&
          <TextField
            label="Hex"
            variant="outlined"
            value={state.context.hex || ""}
            onChange={(e) => send("HEX_INPUT", { value: e.target.value })}
            style={{ width: "43%" }}
          />
        }
        {state.matches("all") &&
          <SwapHoriz />
        }
        {!state.matches("jsononly") &&
          <TextField multiline label="String" variant="outlined" value={state.context.string || ""} onChange={(e) => send("STRING_INPUT", { value: e.target.value })} style={{ width: "43%" }} />
        }
        {state.matches("jsononly") &&
          <pre style={{ overflow: "auto" }}>
            <code>
              {JSON.stringify(maybeJSON, null, 4)}
            </code>
          </pre>
        }
      </Grid>
    </>
  );
};

export default HexToStringConverter;
