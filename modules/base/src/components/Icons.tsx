import { ArrowBackIosOutlined as BackIcon, AppsOutlined as AppsIcon } from '@material-ui/icons';

// re-export standardized icons so they are consistent
export { BackIcon, AppsIcon };

export const Logo = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/logo.png" {...props} />
);
