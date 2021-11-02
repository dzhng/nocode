import { useState, useCallback, useEffect, MouseEvent } from 'react';
import produce from 'immer';
import { v1 as generateId } from 'uuid';
import { Box, Button, InputBase } from '@mui/material';
import { DataTypes, SelectionMeta } from 'shared/schema';
import { DefaultOptionColor } from '~/const';
import OptionColorPicker from './OptionColorPicker';

interface ConfigMap {
  [type: string]: React.FunctionComponent<{ onChange(meta: object): void }>;
}

const DefaultMeta: SelectionMeta = {
  options: [
    { id: generateId(), value: 'Low', color: '#61BB45' },
    { id: generateId(), value: 'Medium', color: '#FDB827' },
    { id: generateId(), value: 'High', color: '#E1393E' },
  ],
};

const configByType: ConfigMap = {
  [DataTypes.Selection]: function Selection({ onChange }) {
    const [data, setData] = useState<SelectionMeta>(DefaultMeta);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [selectedColorOptionId, setSelectedColorOptionId] = useState<string | undefined>();

    useEffect(() => {
      // everytime data changes, call the onchange handler
      onChange(data);
    }, [data, onChange]);

    const handleAddOption = useCallback(() => {
      setData({
        options: [...data.options, { id: generateId(), value: '' }],
      });
    }, [data]);

    const handleOptionValueChange = useCallback(
      (index, value) => {
        const newData = produce(data, (draft) => {
          draft.options[index].value = value;
        });

        setData(newData);
      },
      [data],
    );

    const handleColorSelection = useCallback((e: MouseEvent<HTMLDivElement>, id: string) => {
      e.preventDefault();
      setAnchorEl(e.currentTarget);
      setSelectedColorOptionId(id);
    }, []);

    const handleColorPickerClose = useCallback(() => {
      setAnchorEl(null);
    }, []);

    const handleColorSelected = useCallback(
      (value) => {
        // close the color picker
        setAnchorEl(null);

        const index = data.options.findIndex((o) => o.id === selectedColorOptionId);
        if (index !== -1) {
          const newData = produce(data, (draft) => {
            draft.options[index].color = value;
          });

          setData(newData);
        }
      },
      [data, selectedColorOptionId],
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

                ':hover': {
                  border: '1px solid #777',
                },
              }}
              onClick={(e) => handleColorSelection(e, option.id)}
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
                ':hover': {
                  border: '1px solid #777',
                },
              }}
              value={option.value}
              onChange={(e) => handleOptionValueChange(index, e.target.value)}
            />
          </Box>
        ))}

        <Button fullWidth size="small" variant="outlined" onClick={handleAddOption}>
          Add Option
        </Button>

        <OptionColorPicker
          anchorEl={anchorEl}
          selectedValue={data.options.find((o) => o.id === selectedColorOptionId)?.color}
          onSelect={handleColorSelected}
          onClose={handleColorPickerClose}
        />
      </Box>
    );
  },
};

export default configByType;
