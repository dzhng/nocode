import {
  ArrowBackIosOutlined as BackIcon,
  AppsOutlined as AppsIcon,
  Circle as AppIcon,
  AddCircleOutline as AddIcon,
  AddOutlined as PlainAddIcon,
  Settings as SettingsIcon,
  MoreVert as MoreIcon,
  ExpandMore as ExpandIcon,
  RadioButtonUnchecked as UncheckedIcon,
  RadioButtonChecked as CheckedIcon,
  DragIndicatorOutlined as DragHandle,

  // sheet icons
  DeleteOutline as DeleteIcon,
  ContentCopyOutlined as DuplicateIcon,
  ChevronLeftOutlined as MoveLeftIcon,
  ChevronRightOutlined as MoveRightIcon,
  FilterList as FilterIcon,
  HideSourceOutlined as HideIcon,
  Search as SearchIcon,
  SwapVertOutlined as SortIcon,
  SwapHorizOutlined as ConvertIcon,
  ViewWeekOutlined as FieldsIcon,
  Share as ShareIcon,
  History as HistoryIcon,
  TableRows as GridIcon,
  Apps as CardIcon,
  ViewAgendaOutlined as GroupIcon,
  InvertColorsOutlined as ColorIcon,
  Height as RowHeightIcon,
} from '@mui/icons-material';

// re-export standardized icons so they are consistent
export {
  BackIcon,
  AppsIcon,
  AppIcon,
  AddIcon,
  PlainAddIcon,
  SettingsIcon,
  MoreIcon,
  ExpandIcon,
  UncheckedIcon,
  CheckedIcon,
  DragHandle,
  DeleteIcon,
  DuplicateIcon,
  MoveLeftIcon,
  MoveRightIcon,
  FilterIcon,
  HideIcon,
  SearchIcon,
  SortIcon,
  ConvertIcon,
  FieldsIcon,
  ShareIcon,
  HistoryIcon,
  GridIcon,
  CardIcon,
  GroupIcon,
  ColorIcon,
  RowHeightIcon,
};

export const Logo = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/logo.png" {...props} />
);
