import React from "react";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import { VpnKey } from "@material-ui/icons";

interface IProps {
  onActionClick: (accountOrWallet: string) => void;
  offsetTop?: boolean;
}

const actions = [
  { icon: <VpnKey />, name: "New Account", id: "account" },
  // { icon: <Hd />, name: "New HD Wallet", id: "wallet" },
];

const CreateMenu: React.FC<IProps> = (props) => {
  const [open, setOpen] = React.useState(false);
  return (
    <SpeedDial
      ariaLabel="Create"
      icon={<SpeedDialIcon />}
      onClick={() => setOpen(!open)}
      open={open}
      style={{ position: "fixed", top: props.offsetTop ? "125px" : "75px", right: "25px", zIndex: 10 }}
      // onOpen={() => setOpen(true)}
      // onClose={() => setOpen(false)}
      direction={"down"}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.id}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={() => {
            setOpen(false);
            props.onActionClick(action.id);
          }}
        />
      ))}
    </SpeedDial>
  );
};

export default React.memo(CreateMenu);
