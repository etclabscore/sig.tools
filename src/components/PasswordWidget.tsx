import React, { useState } from "react";
import { Grid, TextField } from "@material-ui/core";

interface IProps {
  onChange: (val: string) => void;
  value: any;
  label: string;
}

const PasswordWidget: React.FC<IProps> = (props) => {
  const [password, setPassword] = useState(props.value);
  const [passwordConfirmed, setPasswordConfirmed] = useState<boolean>(false);
  return (
    <Grid container justify="center" alignContent="center">
      <TextField
        variant="outlined"
        fullWidth={true}
        label={props.label}
        value={password}
        onChange={(event: any) => {
          setPassword(event.target.value);
        }}
        type="password"
      />
      <br />
      <br />
      <br />
      <TextField
        variant="outlined"
        fullWidth={true}
        placeholder={"passphrase"}
        label={"confirm passphrase"}
        error={!passwordConfirmed && password}
        onChange={(event: any) => {
          if (event.target.value === password) {
            props.onChange(event.target.value);
            setPasswordConfirmed(true);
          } else {
            setPasswordConfirmed(false);
          }
        }}
        type="password"
      />
    </Grid>
  );
};

export default PasswordWidget;
