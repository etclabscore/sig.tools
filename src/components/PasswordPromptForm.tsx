import React, { useState, ReactElement } from "react";
import { Button, Grid, IconButton, Paper, Typography } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import FormDrawer from "./FormDrawer";

interface IProps {
  id?: string;
  title?: string;
  header?: ReactElement;
  onSubmit?: (passphrase: string) => void;
  onCancel?: () => void;
  hideClose?: boolean;
}

const PasswordPromptForm: React.FC<IProps> = (props) => {
  const [open, setOpen] = useState<boolean>(true);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  return (
    <>
      <Paper
        id={props.id}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          padding: "50px",
          overflowY: "auto",
          animation: `scale-${open ? "in" : "out"} 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) 0s both`,
          zIndex: 1300,
        }}
      >
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
          {props.header}
          <FormDrawer
            onClose={() => {
              setDrawerOpen(false);
            }}
            header={
              <Grid container justify="center" alignContent="center">
                <Typography gutterBottom>Enter your passphrase.</Typography>
              </Grid>
            }
            schema={{
              title: "passphrase",
              type: "string",
            }}
            uiSchema={{
              "ui:widget": "password",
            }}
            open={drawerOpen}
            onSubmit={(data: any) => {
              if (props.onSubmit) {
                props.onSubmit(data.formData);
              }
            }}
          />
          {!props.hideClose &&
            <IconButton
              id="cancel"
              style={{
                position: "absolute",
                top: "0px",
                right: "5px",
                zIndex: 1400,
              }}
              onClick={() => {
                setOpen(false);
                if (props.onCancel) {
                  props.onCancel();
                }
              }}>
              <Close />
            </IconButton>
          }
          {props.children}
          <Button
            onClick={() => {
              setDrawerOpen(true);
            }}
            id="submit" type="submit" variant="contained" fullWidth color="primary">{props.title}</Button>
        </div>
      </Paper>
    </>
  );
};

export default PasswordPromptForm;
