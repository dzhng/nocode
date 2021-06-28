import { makeStyles, createStyles } from '@material-ui/core/styles';
import IframeCSSBaseline from '~/components/IframeCSSBaseline';
import WriterModal from '~/components/WriterModal';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
  }),
);

export default function ContentIframe() {
  const styles = useStyles();

  const postResult = (result: string) => {
    const data = JSON.stringify({
      type: 'writer_result',
      result,
    });
    window.top.postMessage(data, '*');
  };

  return (
    <>
      <IframeCSSBaseline />
      <div className={styles.container}>
        <WriterModal onResult={postResult} />
      </div>
    </>
  );
}
