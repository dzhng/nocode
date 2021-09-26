import {
  ArrowBackIosOutlined as BackIcon,
  AppsOutlined as AppsIcon,
  AddCircleOutline as AddIcon,
  RadioButtonUnchecked as UncheckedIcon,
  RadioButtonChecked as CheckedIcon,
  DragIndicatorOutlined as DragHandle,
} from '@mui/icons-material';

// re-export standardized icons so they are consistent
export { BackIcon, AppsIcon, AddIcon, UncheckedIcon, CheckedIcon, DragHandle };

export const Logo = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/logo.png" {...props} />
);
