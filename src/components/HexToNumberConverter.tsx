import React, { useState } from "react";
import { TextField, Grid, Typography } from "@material-ui/core";
import hexToNumberMachine from "../machines/hexToNumberMachine";
import { useMachine } from "@xstate/react";
import { SwapHoriz } from "@material-ui/icons";

interface IProps {
  onChange?: (hex: string) => void;
  schema: any;
  value: string;
}

const HexToNumberConverter: React.FC<IProps> = (props) => {
  const [state, send, machine] = useMachine(hexToNumberMachine.withContext({hex: props.value, number: ""}));
  machine.onChange((context: any) => {
    if (props.onChange) {
      props.onChange(context.hex);
    }
  });
  return (
    <>
      <Typography gutterBottom>{props.schema.title}</Typography>
      <Grid container justify="space-around" alignItems="center">
        <TextField label="Hex" variant="outlined" value={state.context.hex || ""} onChange={(e) => send("HEX_INPUT", { value: e.target.value })} style={{ width: "43%" }} />
        <SwapHoriz />
        <TextField label="Number" variant="outlined" value={state.context.number || ""} onChange={(e) => send("NUMBER_INPUT", { value: e.target.value })} style={{ width: "43%" }} />
      </Grid>
    </>
  );
};

export default HexToNumberConverter;
