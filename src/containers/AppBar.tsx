import React, { ReactNode } from "react";
import { AppBar, Toolbar, Tooltip, IconButton, Box, useTheme } from "@material-ui/core";
import { Brightness3, WbSunny, Info } from "@material-ui/icons";

interface IProps {
  // onClick: () => void;
  darkMode: boolean;
  onDarkModeChange: (darkMode: boolean) => void;
  topItem?: ReactNode;
  backItem?: ReactNode;
  onInfoClick?: () => void;
}

const MyAppBar: React.FC<IProps> = ({ onDarkModeChange, darkMode, topItem, backItem, onInfoClick }) => {
  const theme = useTheme();

  const handleDarkModeChange = () => {
    onDarkModeChange(!!darkMode);
  };

  return (
    <>
      <AppBar elevation={0} position="fixed">
        <Toolbar style={{ background: theme.palette.background.default }}>
          <Box width="50px">
            {backItem}
          </Box>
          <Box flexGrow={1} style={{ marginRight: "30px" }}>
            {topItem}
          </Box>
          <Tooltip title="Info">
            <IconButton onClick={onInfoClick} tabIndex={2}>
              <Info />
            </IconButton>
          </Tooltip>
          <Tooltip title="Toggle Theme">
            <IconButton onClick={handleDarkModeChange} tabIndex={4}>
              {darkMode ? <Brightness3 /> : <WbSunny />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default React.memo(MyAppBar);
