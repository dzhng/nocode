import { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { makeStyles, createStyles } from '@mui/styles';
import clsx from 'clsx';

const useStyles = makeStyles(() =>
  createStyles({
    input: {
      width: '100%',
      height: '100%',
      border: 'none',
      backgroundColor: 'transparent',
      padding: 7,

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
  onChange,
  isHeader,
}: {
  value?: string;
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
  onChange,
}: {
  value?: number;
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
      type="number"
      value={value === undefined ? '' : value}
      onChange={onValueChange}
      onKeyPress={onKeyPress}
      onBlur={onBlur}
    />
  );
}
