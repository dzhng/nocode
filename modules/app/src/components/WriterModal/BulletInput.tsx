import { TextField, InputAdornment } from '@material-ui/core';

export default function BulletInput({
  value,
  onChange,
}: {
  value: string[];
  onChange(value: string[]): void;
}) {
  const changeInput = (input: string, idx: number) => {
    const newValue = [...value];
    newValue.splice(idx, 1, input);
    onChange(newValue);
  };

  const appendInputAtIndex = (idx: number) => {
    const newValue = [...value];
    newValue.splice(idx, 0, '');
    onChange(newValue);
  };

  const removeInputAtIndex = (idx: number) => {
    // don't allow user to remove last input
    if (idx === 0) {
      return;
    }

    const newValue = [...value];
    newValue.splice(idx, 1);
    onChange(newValue);
  };

  return (
    <>
      {value.map((input, idx) => (
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: <InputAdornment position="start">👉</InputAdornment>,
          }}
          value={input}
          onChange={(e) => changeInput(e.target.value, idx)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              appendInputAtIndex(idx + 1);
            } else if (e.key === 'Backspace' && input.length === 0) {
              removeInputAtIndex(idx);
            }
          }}
        />
      ))}
    </>
  );
}
