import React, { useEffect } from "react";
import { Account } from "../postMessageServer/__GENERATED_TYPES__";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import { TextField, Typography, Grid, InputBase, IconButton, Box, Tooltip } from "@material-ui/core";
import { ICard } from "../machines/appMachine";
import { Info } from "@material-ui/icons";
import { HotKeys } from "react-hotkeys";
import { useHotkeys } from "react-hotkeys-hook";

interface IProps {
  accounts: ICard[];
}
const filter = createFilterOptions<ICard>();

const SelectAccount: React.FC<IProps> = (props) => {

  return (
    <Autocomplete
      id="new-account"
      style={{ width: 300 }}
      options={props.accounts.filter((account) => account.address)}
      filterOptions={(options, params) => {
        const filtered = filter(options, params) as ICard[];
        // if (params.inputValue !== "" && filtered.length === 0) {
        //   filtered.push({
        //     name: params.inputValue,
        //     create: true,
        //   } as any);
        // }
        return filtered;
      }}
      multiple
      selectOnFocus
      getOptionLabel={(option) => option.name || option.address || ""}
      renderOption={(option, { selected, inputValue }) => {
        return (
          <Grid container direction="row" alignItems="center" justify="space-between">
            <Box textOverflow="ellipsis" display="flex" style={{ width: "220px" }}>
              <Typography >{option.name || option.address}</Typography>
            </Box>
            {/* {(option as any).create ? <Typography>Create</Typography> : null} */}
          </Grid>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Type your account name"
          variant="filled"
          color="secondary"
          hiddenLabel
          inputProps={{
            ...params.inputProps,
            autoComplete: "new-account", // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
};

export default SelectAccount;
