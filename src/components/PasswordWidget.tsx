import React from "react";
import CodeInput from "./CodeInput";
import { Typography, Grid } from "@material-ui/core";

interface IProps {
  onChange: any;
  value: any;
}

const PasswordWidget: React.FC<IProps> = (props) => {
  return (
    <Grid container justify="center" alignContent="center">
      <CodeInput type="password" fields={8} onChange={props.onChange} value={props.value}/>
    </Grid>
  );
};

export default PasswordWidget;
