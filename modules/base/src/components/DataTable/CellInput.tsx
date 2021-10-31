import { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { makeStyles, createStyles } from '@mui/styles';
import clsx from 'clsx';

const useStyles = makeStyles(() =>
  createStyles({
    input: {
      width: '100%',
      border: 'none',
      backgroundColor: 'transparent',
      padding: 7,
      color: 'inherit',

      '&.focus-visible': {
        outline: 'none',
      },
    },
    header: {
      fontWeight: 'bold',
    },
  }),
);

export function TextCellInput({
  value,
  defaultHeight,
  onChange,
  isHeader,
}: {
  value?: string;
  defaultHeight: number;
  onChange(input: string): void;
  isHeader?: boolean;
}) {
  const [trueValue, setTrueValue] = useState('');
  const classes = useStyles();

  // whenever value changes, set it to true value
  useEffect(() => {
    setTrueValue(value ?? '');
  }, [value]);

  const onValueChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTrueValue(e.target.value);
  }, []);

  // when user is done editing, either via "enter" key or via blur, save the value for real
  const onKeyPress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onChange(trueValue);
      }
    },
    [onChange, trueValue],
  );

  const onBlur = useCallback(() => {
    onChange(trueValue);
  }, [onChange, trueValue]);

  return (
    <input
      className={clsx(classes.input, isHeader && classes.header)}
      style={{ minHeight: defaultHeight }}
      type="text"
      value={trueValue}
      onChange={onValueChange}
      onKeyPress={onKeyPress}
      onBlur={onBlur}
    />
  );
}

export function NumberCellInput({
  value,
  defaultHeight,
  onChange,
}: {
  value?: number;
  defaultHeight: number;
  onChange(input?: number): void;
}) {
  const [trueValue, setTrueValue] = useState<number | undefined>();
  const classes = useStyles();

  // whenever value changes, set it to true value
  useEffect(() => {
    setTrueValue(value);
  }, [value]);

  const onValueChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    if (inputVal === '') {
      setTrueValue(undefined);
    } else {
      setTrueValue(Number(inputVal));
    }
  }, []);

  // when user is done editing, either via "enter" key or via blur, save the value for real
  const onKeyPress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onChange(trueValue);
      }
    },
    [onChange, trueValue],
  );

  const onBlur = useCallback(() => {
    onChange(trueValue);
  }, [onChange, trueValue]);

  return (
    <input
      className={classes.input}
      style={{ minHeight: defaultHeight }}
      type="number"
      value={trueValue === undefined ? '' : trueValue}
      onChange={onValueChange}
      onKeyPress={onKeyPress}
      onBlur={onBlur}
    />
  );
}
