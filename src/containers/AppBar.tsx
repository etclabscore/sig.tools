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

const openPopupDocs = (url: string) => {
  const width = window.screen.width - 400;
  const height = window.screen.height;
  const left = 400;
  const top = 0;
  const right = 0;

  return window.open(
    url,
    "docs-sig-tools:popup",
    `left=${left},top=${top},right=${right},width=${width},height=${height},resizable,scrollbars=yes,status=1`,
  );
};

const MyAppBar: React.FC<IProps> = ({ onDarkModeChange, darkMode, topItem, backItem }) => {
  const theme = useTheme();

  const goToDocumentation = () => {
    openPopupDocs(process.env.REACT_APP_DOCUMENTATION_URL || "https://docs.sig.tools");
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
