import React, { ReactNode } from "react";
import { AppBar, Toolbar, Tooltip, IconButton, Box, useTheme } from "@material-ui/core";
import { Brightness3, WbSunny, Description } from "@material-ui/icons";

interface IProps {
  // onClick: () => void;
  darkMode: boolean;
  onDarkModeChange: (darkMode: boolean) => void;
  topItem?: ReactNode;
  backItem?: ReactNode;
}

const MyAppBar: React.FC<IProps> = ({ onDarkModeChange, darkMode, topItem, backItem }) => {
  const theme = useTheme();
  const goToDocumentation = () => {
    window.location.href = process.env.REACT_APP_DOCUMENTATION_URL || "https://docs.sig.tools";
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
          <Tooltip title="Developer Documentation">
            <IconButton onClick={() => goToDocumentation()} tabIndex={2}>
              <Description />
            </IconButton>
          </Tooltip>
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
