import React, { useState } from "react";
import { TextField, Grid, Typography } from "@material-ui/core";
import hexToStringMachine from "../machines/hexToStringMachine";
import { useMachine } from "@xstate/react";
import { SwapHoriz } from "@material-ui/icons";

interface IProps {
  onChange?: (hex: string) => void;
  schema: any;
  value: string;
}

const HexToStringConverter: React.FC<IProps> = (props) => {
  const [state, send, machine] = useMachine(hexToStringMachine.withContext({hex: props.value, string: ""}));
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
        <TextField label="String" variant="outlined" value={state.context.string || ""} onChange={(e) => send("STRING_INPUT", { value: e.target.value })} style={{ width: "43%" }} />
      </Grid>
    </>
  );
};

export default HexToStringConverter;
