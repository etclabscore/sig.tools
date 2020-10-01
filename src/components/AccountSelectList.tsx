import React, { useState } from "react";
import { List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox, Typography } from "@material-ui/core";
import { Account } from "@etclabscore/signatory-core";

interface IProps {
  accounts: Account[];
  onChange?: (checked: Account[]) => void;
}

const AccountSelectList: React.FC<IProps> = (props) => {
  const [checked, setChecked] = useState<Account[]>([]);

  const handleToggle = (value: Account) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
    if (props.onChange) {
      props.onChange(newChecked);
    }
  };
  return (
    <List>
      {props.accounts.map((account) => {
        return (
          <ListItem onClick={handleToggle(account)} button>
            <ListItemText primary={
              <Typography variant="caption" style={{ fontSize: "9px" }}>
                {account.address}
              </Typography>
            } secondary={account.name}></ListItemText>
            <ListItemSecondaryAction>
              <Checkbox
                onChange={handleToggle(account)}
                checked={checked.indexOf(account) !== -1}
              />
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
};

export default AccountSelectList;
