import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogProps, DialogContent, Card, CardContent, Grid, Typography, IconButton, Tooltip } from "@material-ui/core";
import p from "../../package.json";
import GitHubIcon from "@material-ui/icons/GitHub";
import { Description, Delete } from "@material-ui/icons";
import { CapabilitiesController } from "rpc-cap";
import { IOcapLdCapability } from "rpc-cap/dist/src/@types/ocap-ld";
import { RpcCapDomainRegistry, RpcCapDomainEntry } from "rpc-cap/dist/src/@types";
import { capabilities } from "../capabilities";

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
  const goToDocumentation = () => {
    openPopupDocs(process.env.REACT_APP_DOCUMENTATION_URL || "https://docs.sig.tools");
  };

  const goToGithub = () => {
    window.open("https://github.com/etclabscore/sig.tools", "_blank");
  };

  return (
    <Dialog {...props}>
      <DialogContent>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item>
                <Tooltip title="Github" >
                  <IconButton onClick={goToGithub}>
                    <GitHubIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Developer Documentation" >
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
            <Grid container spacing={3} direction="column">
              <Grid item container justify="space-between" style={{ minWidth: "275px" }}>
                <Grid item>
                  Version
                </Grid>
                <Grid item>
                  {p.version}
                </Grid>
              </Grid>
              <Grid item container justify="space-between" style={{ minWidth: "275px" }}>
                <Grid item>
                  License
                </Grid>
                <Grid item>
                  Apache 2.0
                </Grid>
              </Grid>
              <Grid item container justify="space-between">
                <Grid item>
                  <Typography color="textPrimary">
                    Permissions
                  </Typography>
                </Grid>
                {props.capabilitiesList && props.capabilitiesList.length === 0 &&
                  <Typography>No permissions.</Typography>
                }
                {props.capabilitiesList && props.capabilitiesList.map(([domain, domainPermissions]) => {
                    return (
                      <Grid item container alignItems="center" justify="space-between" key={JSON.stringify(domainPermissions)}>
                        <Grid item>
                          <Typography variant="caption" style={{fontSize: 12}}>{domain}</Typography>
                        </Grid>
                        <Grid item justify="center">
                          {domainPermissions && domainPermissions.permissions && domainPermissions.permissions.length === 0 &&
                            <Typography>No permissions.</Typography>
                          }
                          {domainPermissions && domainPermissions.permissions && domainPermissions.permissions.map((domainPermission: any) => {
                            return (
                              <>
                                <Grid item>
                                  <Typography variant="caption" color="secondary" style={{fontSize: 12}}>
                                    {domainPermission.parentCapability}
                                  </Typography>
                                  <IconButton size="small" onClick={() => {
                                    if (props.onRemoveCapability) {
                                      props.onRemoveCapability(domainPermission);
                                    }
                                  }}>
                                    <Delete />
                                  </IconButton>
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
