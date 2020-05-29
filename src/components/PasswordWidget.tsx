import React from "react";
import CodeInput from "./CodeInput";
import { Grid } from "@material-ui/core";

interface IProps {
  onChange: (val: string) => void;
  value: any;
  label: string;
}

//const spacing = 14;
    //   <TextField
    //     InputLabelProps={{
    //       shrink: true,
    //     }}
    //     inputProps={{
    //       style: {
    //         letterSpacing: `${spacing + 5}px`,
    //       },
    //     }}
    //     InputProps={{
    //       disableUnderline: true,
    //     }}
    //     fullWidth={true}
    //     placeholder={"•".repeat(8)}
    //     label={props.label}
    //     value={props.value || ""}
    //     onChange={(event: any) => {
    //       props.onChange(event.target.value);
    //     }}
    //     type="password"
    //   />
const PasswordWidget: React.FC<IProps> = (props) => {
  return (
    <Grid container justify="center" alignContent="center">
      <CodeInput type="password" fields={8} onChange={props.onChange} value={props.value}/>
    </Grid>
  );
};

export default PasswordWidget;
