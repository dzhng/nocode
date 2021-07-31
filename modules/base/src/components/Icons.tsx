import {
  ArrowBackIosOutlined as BackIcon,
  VideoCallOutlined as VideoCallIcon,
  VideoCall as VideoCallFilledIcon,
  RecentActorsOutlined as PresentIcon,
  VideoLibraryOutlined as VideoIcon,
  PollOutlined as PollIcon,
  LiveHelpOutlined as QuestionsIcon,
  ScreenShareOutlined as ScreenShareIcon,
  GroupOutlined as BreakoutIcon,
  HistoryOutlined as CallHistoryIcon,
} from '@material-ui/icons';

// re-export standardized icons so they are consistent
export {
  BackIcon,
  VideoCallIcon,
  VideoCallFilledIcon,
  PresentIcon,
  VideoIcon,
  PollIcon,
  QuestionsIcon,
  ScreenShareIcon,
  BreakoutIcon,
  CallHistoryIcon,
};

export const Logo = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img src="/logo.png" {...props} />
);
