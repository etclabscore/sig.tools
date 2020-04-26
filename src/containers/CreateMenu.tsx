import React from "react";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { VpnKey, Hd } from "@material-ui/icons";
import { useTheme } from "@material-ui/core";

interface IProps {
  onActionClick: (accountOrWallet: string) => void;
}

const actions = [
  { icon: <VpnKey />, name: "New Account", id: "account" },
  { icon: <Hd />, name: "New HD Wallet", id: "wallet" },
];

const CreateMenu: React.FC<IProps> = (props) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("xs"));
  const [open, setOpen] = React.useState(false);
  return (
    <SpeedDial
      ariaLabel="Create"
      icon={<SpeedDialIcon />}
      onClick={() => setOpen(!open)}
      open={open}
      style={{ position: "fixed", top: "70px", right: "25px", zIndex: 10 }}
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
