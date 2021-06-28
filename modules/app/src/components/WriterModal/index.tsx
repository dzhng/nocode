import { useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  CircularProgress,
  Button,
} from '@material-ui/core';
import BulletInput from './BulletInput';

const useStyles = makeStyles((theme) =>
  createStyles({
    modal: {
      width: '100%',
      boxShadow: theme.shadows[6],
    },
  }),
);

export default function WriterModal({ onResult }: { onResult(result: string): void }) {
  const styles = useStyles();
  const [isWriting, setIsWriting] = useState(false);
  const [inputs, setInputs] = useState<string[]>(['']);

  const startWriting = () => {
    setIsWriting(true);
    onResult('hello world!');
  };

  return (
    <Card className={styles.modal}>
      <CardContent>
        <Typography variant="h5">What do you want to write?</Typography>
        <Typography variant="body1">
          Please describe in a few bullet points the main content of your message. List out any
          specific points that you want to communicate.
        </Typography>

        <br />
        <hr />
        <br />
        <BulletInput value={inputs} onChange={setInputs} />
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" disabled={isWriting} onClick={startWriting}>
          isWriting ? <CircularProgress /> : Write
        </Button>
      </CardActions>
    </Card>
  );
}
