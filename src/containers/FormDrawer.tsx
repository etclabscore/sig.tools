import React from "react";
import { Drawer, Button, IconButton } from "@material-ui/core";
import { Theme as MuiTheme } from "rjsf-material-ui";
import { withTheme } from "react-jsonschema-form";
import { JSONSchema } from "@open-rpc/meta-schema";
import { Close } from "@material-ui/icons";
const Form = withTheme(MuiTheme);

interface IProps {
  schema: JSONSchema;
  open: boolean;
  onChange?: () => void;
  onSubmit?: (data: any) => void;
  onClose: () => void;
  formData?: any;
}

const FormDrawer: React.FC<IProps> = (props) => {
  return (
    <Drawer open={props.open} anchor="bottom" onClose={props.onClose} style={{ position: "relative" }}>
      <IconButton style={{ position: "absolute", top: "0px", right: "5px" }} onClick={props.onClose}>
        <Close />
      </IconButton>
      <div style={{
        maxHeight: "90%",
        maxWidth: "400px",
        margin: "0 auto",
        paddingLeft: "25px",
        paddingRight: "25px",
        paddingBottom: "5px",
        paddingTop: "35px",
      }}>
        <Form
          noHtml5Validate
          schema={props.schema}
          showErrorList={false}
          formData={props.formData}
          liveValidate={true}
          uiSchema={{
            "ui:autoFocus": true,
          }}
          onChange={props.onChange}
          onSubmit={props.onSubmit}
        >
          <Button type="submit" variant="contained" fullWidth color="primary">Sign</Button>
        </Form>
      </div>
    </Drawer>
  );
};

export default FormDrawer;
