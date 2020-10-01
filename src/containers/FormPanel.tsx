import React, { useState, ReactElement } from "react";
import { Button, Grid, IconButton, Paper, Typography } from "@material-ui/core";
import { JSONSchema } from "@apidevtools/json-schema-ref-parser";
import { Close } from "@material-ui/icons";
import { Theme as MuiTheme } from "@etclabscore/rjsf-material-ui";
import { withTheme } from "react-jsonschema-form";
import FormDrawer from "./FormDrawer";
const Form = withTheme(MuiTheme);

interface IProps {
  id?: string;
  schema: JSONSchema;
  formData: any;
  skipPassphrase?: boolean;
  uiSchema?: any;
  widgets?: any;
  title?: string;
  header?: ReactElement;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  hideClose?: boolean;
}

const FormPanel: React.FC<IProps> = (props) => {
  const [open, setOpen] = useState<boolean>(true);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [localFormData, setLocalFormData] = useState(props.formData);
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
            onSubmit={(data) => {
              if (props.onSubmit) {
                props.onSubmit({ ...localFormData, passphrase: data.formData });
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
          <Form
            noHtml5Validate
            schema={props.schema as any}
            showErrorList={false}
            formData={props.formData}
            uiSchema={{
              "ui:autoFocus": true,
              ...props.uiSchema,
            }}
            widgets={{
              ...props.widgets,
            }}
            onSubmit={(data) => {
              if (props.skipPassphrase && props.onSubmit) {
                props.onSubmit(data.formData);
              } else {
                setLocalFormData(data.formData);
                setDrawerOpen(true);
              }
            }}
          >
            <Button id="submit" type="submit" variant="contained" fullWidth color="primary">{props.title}</Button>
          </Form>

        </div>
      </Paper>
    </>
  );
};

export default FormPanel;
