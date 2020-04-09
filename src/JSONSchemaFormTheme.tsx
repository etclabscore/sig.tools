import { InputBase } from "@material-ui/core";
import React from "react";

const MyCustomWidget = (props: any) => {
  return (
    <InputBase
      placeholder={props.schema.title}
      type={props.type}
      style={{ background: "rgba(0,0,0,0.1)", borderRadius: "4px", padding: "0px 10px", marginRight: "5px" }}
      value={props.value}
      required={props.required}
      onChange={(event) => props.onChange && props.onChange(event.target.value)}
    />
  );
};

const myFields = {
  StringField: MyCustomWidget,
  TitleField: MyCustomWidget,
};

const ThemeObject = { fields: myFields };
export default ThemeObject;
