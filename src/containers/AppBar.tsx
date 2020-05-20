import React, { ReactNode } from "react";
import { AppBar, Toolbar, Tooltip, IconButton, Box, useTheme } from "@material-ui/core";
import { Brightness3, WbSunny } from "@material-ui/icons";

interface IProps {
  // onClick: () => void;
  darkMode: boolean;
  onDarkModeChange: (darkMode: boolean) => void;
  topItem?: ReactNode;
  backItem?: ReactNode;
}

const MyAppBar: React.FC<IProps> = ({ onDarkModeChange, darkMode, topItem, backItem }) => {
  const theme = useTheme();
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
          <Tooltip title="Toggle Theme">
            <IconButton onClick={() => onDarkModeChange(!!darkMode)} tabIndex={2}>
              {darkMode ? <Brightness3 /> : <WbSunny />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default React.memo(MyAppBar);
