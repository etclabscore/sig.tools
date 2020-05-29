import React, { ReactElement } from "react";
import { JSONSchema } from "@open-rpc/meta-schema";
import { Drawer, Button, IconButton } from "@material-ui/core";
import { Theme as MuiTheme } from "@etclabscore/rjsf-material-ui";
import { withTheme, UiSchema } from "react-jsonschema-form";
import { Close } from "@material-ui/icons";
const Form = withTheme(MuiTheme);

interface IProps {
  id?: string;
  schema: JSONSchema;
  open: boolean;
  uiSchema?: UiSchema;
  onChange?: () => void;
  onSubmit?: (data: any) => void;
  onClose: () => void;
  header?: ReactElement;
  formData?: any;
}

const FormDrawer: React.FC<IProps> = (props) => {
  return (
    <Drawer open={props.open} anchor="bottom" onClose={props.onClose} style={{ position: "relative" }}>
      <IconButton
        id="cancel-button"
        style={{ position: "absolute", top: "0px", right: "5px" }} onClick={props.onClose}>
        <Close />
      </IconButton>
      <div id={props.id} style={{
        maxHeight: "90%",
        maxWidth: "400px",
        margin: "0 auto",
        paddingLeft: "25px",
        paddingRight: "25px",
        paddingBottom: "5px",
        paddingTop: "35px",
      }}>
        {props.header}
        <Form
          noHtml5Validate
          schema={props.schema}
          showErrorList={false}
          formData={props.formData}
          liveValidate={true}
          uiSchema={{
            "ui:autoFocus": true,
            ...props.uiSchema,
          }}
          onChange={props.onChange}
          onSubmit={props.onSubmit}
        >
          <Button style={{ marginTop: "10px" }} type="submit" variant="contained" fullWidth color="primary">Sign</Button>
        </Form>
      </div>
    </Drawer>
  );
};

export default React.memo(FormDrawer);
