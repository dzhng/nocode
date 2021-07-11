import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
  createStyles({
    input: {
      width: '100%',
      height: '100%',
    },
  }),
);

export function TextCellInput({
  value,
  onChange,
}: {
  value?: string;
  onChange(input: string): void;
}) {
  const classes = useStyles();

  return (
    <input
      className={classes.input}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function NumberCellInput({
  value,
  onChange,
}: {
  value?: number;
  onChange(input?: number): void;
}) {
  const classes = useStyles();

  return (
    <input
      className={classes.input}
      type="number"
      value={value === undefined ? '' : value}
      onChange={(e) => {
        const inputVal = e.target.value;
        if (inputVal === '') {
          onChange(undefined);
        } else {
          onChange(Number(inputVal));
        }
      }}
    />
  );
}
