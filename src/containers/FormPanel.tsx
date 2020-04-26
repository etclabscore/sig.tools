import React, { useState } from "react";
import { Button, Grid, IconButton, Paper } from "@material-ui/core";
import { JSONSchema } from "@apidevtools/json-schema-ref-parser";
import { Close } from "@material-ui/icons";
import { Theme as MuiTheme } from "rjsf-material-ui";
import { withTheme } from "react-jsonschema-form";
import FormDrawer from "./FormDrawer";
const Form = withTheme(MuiTheme);

interface IProps {
  schema: JSONSchema;
  formData: any;
  skipPassphrase?: boolean;
  title?: string;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const FormPanel: React.FC<IProps> = (props) => {
  const [open, setOpen] = useState<boolean>(true);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [localFormData, setLocalFormData] = useState(props.formData);
  return (
    <>
      <Paper style={{
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
        <FormDrawer
          onClose={() => {
            setDrawerOpen(false);
          }}
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
        <IconButton
          style={{
            position: "absolute",
            top: "0px",
            right: "5px",
            zIndex: 1400,
          }}
          onClick={() => {
            setOpen(false);
            setTimeout(() => {
              if (props.onCancel) {
                props.onCancel();
              }
            }, 90);
          }}>
          <Close />
        </IconButton>
        <Form
          noHtml5Validate
          schema={props.schema as any}
          showErrorList={false}
          formData={props.formData}
          liveValidate={true}
          uiSchema={{
            "ui:autoFocus": true,
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
          <Button type="submit" variant="contained" fullWidth color="primary">{props.title}</Button>
        </Form>
      </Paper>
    </>
  );
};

export default FormPanel;
