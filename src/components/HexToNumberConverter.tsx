import React from "react";
import { TextField, Grid, Typography, Link } from "@material-ui/core";
import hexToNumberMachine from "../machines/hexToNumberMachine";
import { useMachine } from "@xstate/react";
import { SwapHoriz } from "@material-ui/icons";

interface IProps {
  onChange?: (hex: string) => void;
  schema: any;
  value: string;
}

const HexToNumberConverter: React.FC<IProps> = (props) => {
  const [state, send, machine] = useMachine(hexToNumberMachine.withContext({ hex: props.value, number: "" }), { devtools: true });
  machine.onChange((context: any) => {
    if (props.onChange) {
      props.onChange(context.hex);
    }
  });
  return (
    <>
      <Typography variant="body2" gutterBottom>{props.schema.title}</Typography>
      <Link style={{ cursor: "pointer", userSelect: "none" }}>
        <Typography variant="caption" color="primary" onClick={() => send("TOGGLE")}>raw</Typography>
      </Link>
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
        {state.matches("all") && <SwapHoriz />}
        <TextField
          type="number"
          label="Number"
          variant="outlined"
          value={state.context.number || ""}
          inputProps={{
            min: "0",
            step: "1",
          } as any}
          onChange={(e) => send("NUMBER_INPUT", { value: e.target.value })} style={{ width: "43%" }}
        />
      </Grid>
    </>
  );
};

export default HexToNumberConverter;
