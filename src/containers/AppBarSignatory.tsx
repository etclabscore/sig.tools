import React from "react";
import { Grid, Typography } from "@material-ui/core";

interface IProps {
  //
}

const AppBarSignatory: React.FC<IProps> = (props) => {
  return (
    <Grid container justify="center" alignItems="center">
      <Typography variant="h6" color="textSecondary" style={{fontWeight: 900}}>🔐sig.tools</Typography>
    </Grid>
  );
};

export default React.memo(AppBarSignatory);
