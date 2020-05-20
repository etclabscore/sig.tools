import React, { useState, useEffect, createRef, RefObject } from "react";
import { InputBase, Grid } from "@material-ui/core";

interface IProps {
  type: "password" | "text" | "number" | "emoji";
  fields: number;
  value: any;
  onChange: (changed: string) => void;
}

const CodeInput: React.FC<IProps> = (props) => {
  const arrLength = props.fields;
  const [elRefs, setElRefs] = React.useState<Array<RefObject<HTMLInputElement>>>([]);
  useEffect(() => {
    setElRefs((ers: Array<RefObject<HTMLInputElement>>) => {
      return Array(arrLength).fill("").map((__, i) => ers[i] || createRef());
    });
  }, [arrLength]);
  const [fieldValues, setFieldValues] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const step = (by: number) => {
    const next = currentIndex + (by || 1);
    if (next >= props.fields) {
      return false;
    }
    setCurrentIndex(next);
    return true;
  };

  const handlePrev = () => {
    console.log("handleprev");
    setCurrentIndex((prevCurrentIndex) => {
      const p = prevCurrentIndex - 1;
      if (elRefs[prevCurrentIndex] && elRefs[prevCurrentIndex].current) {
        const fieldValCopy = [...fieldValues.slice(0, prevCurrentIndex), ...fieldValues.slice(prevCurrentIndex + 1)];
        setFieldValues(fieldValCopy);
      }
      if (p === -1) {
        return prevCurrentIndex;
      }
      return p;
    });
  };

  useEffect(() => {
    if (elRefs[currentIndex] && elRefs[currentIndex].current) {
      elRefs[currentIndex].current!.focus();
    }
  }, [currentIndex, elRefs]);
  console.log("fieldValues", fieldValues);
  return (
    <Grid container justify="center" alignItems="center">
      {
        "_".repeat(props.fields).split("").map((__, index) => {
          return (
            <InputBase
              inputProps={{
                autoComplete: "new-password",
              }}
              autoFocus={index === currentIndex}
              className="codeInput"
              inputRef={elRefs[index]}
              // placeholder={"0"}
              type={props.type}
              style={{
                background: "#323232",
                borderRadius: "4px",
                padding: "0px 10px",
                marginRight: "5px",
                width: "30px",
              }}
              value={fieldValues[index] || ""}
              onFocus={() => setCurrentIndex(index)}
              required={true}
              onKeyDown={(event) => {
                if (event.keyCode === 8) {
                  handlePrev();
                }
              }}
              onChange={(event) => {
                console.log("changed", event.target.value);
                let val = event.target.value;
                if (!val) {
                  return;
                }
                let newFieldValues: any[] = [...fieldValues];
                const valSplit = event.target.value.split("");
                console.log("valSplit", valSplit);
                if (valSplit.length > 0) {
                  const stepResult = step(valSplit.length);
                  console.log("stepresult", stepResult);
                  if (!stepResult && currentIndex !== 0 && valSplit.length !== props.fields) {
                    // last, keep setting last value
                    newFieldValues = Object.assign([], newFieldValues, { [currentIndex]: valSplit[valSplit.length - 1] });
                  } else {
                    for (let ind = 0; ind < valSplit.length; ind++) {
                      const element = valSplit[ind];
                      console.log("assigning element", element, ind);
                      newFieldValues = Object.assign([], newFieldValues, { [currentIndex + ind]: element });
                    }
                  }
                } else {
                  val = valSplit[valSplit.length - 1];
                  newFieldValues = Object.assign([], fieldValues, { [index]: val });
                }
                setFieldValues(newFieldValues);
                props.onChange(newFieldValues.join(""));
              }}
            />
          );
        })
      }
      <InputBase
        style={{ display: "none" }}
        type="text"
        inputProps={{ autoComplete: "user" }}
        value={""}
        onChange={() => console.log("changed")}
      />
      <InputBase
        style={{ display: "none" }}
        type="password"
        inputProps={{ autoComplete: "new-password" }}
        value={fieldValues.join("") || ""}
        onChange={() => console.log("changed")}
      />
    </Grid>
  );
};

export default CodeInput;
