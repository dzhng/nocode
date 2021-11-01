import { useState, useCallback } from 'react';
import produce from 'immer';
import { Box, Button, InputBase } from '@mui/material';
import { DataTypes, SelectionMeta } from 'shared/schema';
import { DefaultOptionColor, OptionColorPalette } from '~/const';

interface ConfigMap {
  [type: string]: React.FunctionComponent<{ onChange(meta: object): void }>;
}

const DefaultMeta: SelectionMeta = {
  options: [
    { value: 'Low', color: '#61BB45' },
    { value: 'Medium', color: '#FDB827' },
    { value: 'High', color: '#E1393E' },
  ],
};

const configByType: ConfigMap = {
  [DataTypes.Selection]: function Selection({ onChange }) {
    const [data, setData] = useState<SelectionMeta>(DefaultMeta);

    const handleAddOption = useCallback(() => {
      setData({
        options: [...data.options, { value: '' }],
      });
    }, [data]);

    const handleOptionValueChange = useCallback(
      (index, value) => {
        const newData = produce(data, (draft) => {
          draft.options[index].value = value;
        });

        setData(newData);
        onChange(newData);
      },
      [onChange, data],
    );

    return (
      <Box>
        {data.options.map((option, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                width: 26,
                height: 26,
                borderRadius: 26 / 2,
                my: '3px',
                mr: 1,
                cursor: 'pointer',
                border: (theme) => theme.dividerBorder,
                backgroundColor: option.color ? option.color : DefaultOptionColor,
              }}
            />
            <InputBase
              fullWidth
              size="small"
              sx={{
                flexGrow: 1,
                height: 32,
                borderRadius: 1,
                border: (theme) => theme.dividerBorder,
                mb: 1,
                py: 0.5,
                px: 1,
                fontWeight: 500,
                color: 'grey.700',
                fontSize: '13px',
                '> input': { p: 0 },
              }}
              value={option.value}
              onChange={(e) => handleOptionValueChange(index, e.target.value)}
            />
          </Box>
        ))}

        <Button fullWidth size="small" variant="outlined" onClick={handleAddOption}>
          Add Option
        </Button>
      </Box>
    );
  },
};

export default configByType;
