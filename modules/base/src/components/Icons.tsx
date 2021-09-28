import {
  ArrowBackIosOutlined as BackIcon,
  AppsOutlined as AppsIcon,
  Circle as AppIcon,
  AddCircleOutline as AddIcon,
  AddOutlined as PlainAddIcon,
  RadioButtonUnchecked as UncheckedIcon,
  RadioButtonChecked as CheckedIcon,
  DragIndicatorOutlined as DragHandle,
} from '@mui/icons-material';

// re-export standardized icons so they are consistent
export {
  BackIcon,
  AppsIcon,
  AppIcon,
  AddIcon,
  PlainAddIcon,
  UncheckedIcon,
  CheckedIcon,
  DragHandle,
};

export const Logo = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/logo.png" {...props} />
);
