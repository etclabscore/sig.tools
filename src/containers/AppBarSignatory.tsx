import React from "react";
import { Grid, Typography } from "@material-ui/core";

interface IProps {
  //
}

const AppBarSignatory: React.FC<IProps> = (props) => {
  return (
    <Grid container justify="center" alignItems="center">
      <img
        src="https://user-images.githubusercontent.com/10556209/73570773-a07fb900-4432-11ea-8ed1-3bf525af04d9.png"
        height="30px"
        style={{ marginRight: "7px" }}
      />
      <Typography color="textSecondary">Signatory&nbsp;&nbsp;🖥</Typography>
    </Grid>
  );
};

export default React.memo(AppBarSignatory);
