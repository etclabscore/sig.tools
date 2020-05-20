import React from "react";
import { Grid, Typography } from "@material-ui/core";

const AppBarSignatory: React.FC = () => {
  return (
    <Grid container justify="center" alignItems="center">
      <Typography
        variant="h6"
        color="textSecondary"
        style={{ fontWeight: 900 }}>
        <span role="img" aria-label="sig.tools-lock">🔐</span> sig.tools
      </Typography>
    </Grid>
  );
};

export default React.memo(AppBarSignatory);
