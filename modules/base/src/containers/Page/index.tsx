import { createStyles, makeStyles } from '@material-ui/core/styles';
import { AddCircleOutline as AddIcon } from '@material-ui/icons';
import CardButton from '~/components/CardButton';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: 200,
    },
  }),
);

export default function PageContainer() {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <CardButton
        title="New Page"
        height={200}
        icon={
          <AddIcon
            style={{
              fontSize: '3rem',
              color: 'white',
            }}
          />
        }
      />
    </div>
  );
}
