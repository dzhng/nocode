import React from 'react';
import { Typography, Card, Button, Tooltip } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { VideoCall } from '@material-ui/icons';
import { LocalModel, Template } from 'shared/schema';

const useStyles = makeStyles((theme) =>
  createStyles({
    card: {
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
      transition: theme.transitionTime,
      boxShadow: theme.shadows[2],

      '&:hover': {
        boxShadow: theme.shadows[4],
      },
    },
    title: {
      flexGrow: 1,
      margin: theme.spacing(3),
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',

      '& h2': {
        fontWeight: 500,
        fontSize: '1.4rem',
        textAlign: 'center',
        color: theme.palette.grey[900],
      },
    },
    footer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.palette.grey[50],
      borderTop: '1px solid ' + theme.palette.grey[200],
      height: 70,

      '& button': {
        ...theme.customMixins.callButton,
        marginRight: theme.spacing(2),
        height: 38,
      },

      '& p': {
        color: theme.palette.grey[600],
        marginLeft: theme.spacing(2),
      },
    },
  }),
);

export default function TemplateCard({
  template,
  height,
}: {
  template: LocalModel<Template>;
  height: number;
}) {
  const classes = useStyles();
  const callLink = `/start/${template.id}?from=${encodeURIComponent('/')}`;

  return (
    <Card className={classes.card} style={{ height }}>
      <div className={classes.title}>
        <Typography variant="h2">{template.name}</Typography>
      </div>
      <div className={classes.footer}>
        <div>
          <Typography variant="body1">
            <b>{template.activities.length}</b> activities
          </Typography>
        </div>
        <a
          href={callLink}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
        >
          <Tooltip title="Start call" placement="top">
            <Button color="secondary" variant="contained">
              <VideoCall />
            </Button>
          </Tooltip>
        </a>
      </div>
    </Card>
  );
}
