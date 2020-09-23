import React from "react";
import { Dialog, DialogProps, DialogContent, Card, CardContent, Grid, Typography, IconButton, Tooltip, Divider, useTheme, Link } from "@material-ui/core";
import p from "../../package.json";
import GitHubIcon from "@material-ui/icons/GitHub";
import { Description, Delete } from "@material-ui/icons";
import { IOcapLdCapability } from "rpc-cap/dist/src/@types/ocap-ld";
import { RpcCapDomainEntry } from "rpc-cap/dist/src/@types";

type domainsListTuple = [string, RpcCapDomainEntry];

interface IInfoDialogProps extends DialogProps {
  capabilitiesList: domainsListTuple[];
  onRemoveCapability?: (capability: IOcapLdCapability) => void;
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
const InfoDialog: React.FC<IInfoDialogProps> = (props) => {
  const theme = useTheme();
  const goToDocumentation = () => {
    openPopupDocs(process.env.REACT_APP_DOCUMENTATION_URL || "https://docs.sig.tools/api-documentation");
  };

  const goToGithub = () => {
    window.open(process.env.REACT_APP_GITHUB_URL || "https://github.com/etclabscore/sig.tools", "_blank");
  };

  return (
    <Dialog {...props}>
      <DialogContent>
        <Card>
          <CardContent>
            <Grid container spacing={3} justify="space-around">
              <Grid item>
                <Tooltip
                  title={
                    <Grid container justify="center" style={{ width: "200px", margin: 0, padding: 0 }}>
                      <Typography variant="caption" style={{ fontSize: theme.typography.pxToRem(11) }}>Github</Typography>
                      <Typography color="textPrimary" variant="caption" style={{ fontSize: theme.typography.pxToRem(11) }}>github.com/etclabscore/sig.tools</Typography>
                    </Grid>
                  }>
                  <IconButton onClick={goToGithub}>
                    <GitHubIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip
                  title={
                    <Grid container justify="center" style={{ width: "200px", margin: 0, padding: 0 }}>
                      <Typography variant="caption" style={{ fontSize: theme.typography.pxToRem(11) }}>Developer Documentation</Typography>
                      <Typography color="textPrimary" variant="caption" style={{ fontSize: theme.typography.pxToRem(11) }}>docs.sig.tools</Typography>
                    </Grid>
                  }>
                  <IconButton onClick={goToDocumentation}>
                    <Description />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Grid container direction="column">
              <Grid item container justify="space-between" style={{ minWidth: "275px" }}>
                <Grid item>
                  <Typography>Version</Typography>
                </Grid>
                <Grid item>
                  <Typography color="textPrimary">{p.version}</Typography>
                </Grid>
              </Grid>
              <Grid item container justify="space-between" style={{ minWidth: "275px" }}>
                <Grid item>
                  <Typography>License</Typography>
                </Grid>
                <Grid item>
                  <Link href="https://github.com/etclabscore/sig.tools/blob/master/LICENSE.md" target="_blank">
                    <Typography color="primary">Apache 2.0</Typography>
                  </Link>
                </Grid>
              </Grid>
              <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />
              <Grid item container justify="space-between">
                <Grid item>
                  <Typography color="textPrimary" gutterBottom variant="h6">
                    Domain Permissions
                  </Typography>
                </Grid>
                {props.capabilitiesList && props.capabilitiesList.length === 0 &&
                  <Typography>No permissions.</Typography>
                }
                {props.capabilitiesList && props.capabilitiesList.map(([domain, domainPermissions]) => {
                  return (
                    <Grid item container alignItems="center" justify="space-between" key={JSON.stringify(domainPermissions)}>
                      <Grid item>
                        <Typography variant="caption" style={{ fontSize: 12 }}>{domain}</Typography>
                      </Grid>
                      <Grid item justify="center">
                        {domainPermissions && domainPermissions.permissions && domainPermissions.permissions.length === 0 &&
                          <Typography>No permissions.</Typography>
                        }
                        {domainPermissions && domainPermissions.permissions && domainPermissions.permissions.map((domainPermission: any) => {
                          return (
                            <>
                              <Grid item style={{ paddingTop: "5px", paddingBottom: "5px" }}>
                                <Typography variant="caption" color="secondary" style={{ fontSize: 12 }}>
                                  {domainPermission.parentCapability}
                                </Typography>
                                <Tooltip title="Remove" arrow>
                                  <IconButton size="small" onClick={() => {
                                    if (props.onRemoveCapability) {
                                      props.onRemoveCapability(domainPermission);
                                    }
                                  }}>
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </Grid>
                            </>
                          );
                        })}
                      </Grid>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog >
  );
};

export default InfoDialog;
