import React from "react";
import { Card, CardContent, Grid, LinearProgress } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";

const styles = {
  card: {
    minHeight: "150px",
    width: "300px",
    borderRadius: "10px",
    background: grey[500],
    opacity: 0.2,
    margin: "0px",
    display: "flex",
  },
  cardContent: {
    flexGrow: 1,
    padding: 0,
    margin: "16px",
    display: "flex",
  },
  cardItem: {
    borderRadius: "10px",
    width: "145px",
    minHeight: "115px",
  },
  listItem: {
    width: "145px",
    minHeight: "115px",
    borderRadius: "10px",
  },
  listItemIcon: {
    minWidth: "auto",
  },
};

interface IProps {
  content?: JSX.Element;
}

const EmptyCard: React.FC<IProps> = (props) => {
  return (
    <Card style={styles.card}>
      <CardContent style={styles.cardContent}>
        <Grid container direction="column" justify="space-between" style={{ width: "265px" }}>
          <Grid container justify="space-between">
            <Grid container item justify="space-around" alignItems="center">
              {props.content}
            </Grid>
            <LinearProgress style={{ width: "100%", height: "15px", marginTop: props.content ? "35px" : "105px" }} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EmptyCard;
