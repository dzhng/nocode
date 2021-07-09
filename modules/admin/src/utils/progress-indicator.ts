import Router from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// configure global loading spinner
// ONLY show if page has been loading for more than a set period
// no need to load if already cached on client
const showLoadingThresholdMS = 100;
let isLoading = false;

NProgress.configure({
  trickleSpeed: 100,
  minimum: 0.3,
});

Router.events.on('routeChangeStart', () => {
  isLoading = true;
  setTimeout(() => {
    if (isLoading) {
      NProgress.start();
    }
  }, showLoadingThresholdMS);
});

Router.events.on('routeChangeComplete', () => {
  isLoading = false;
  NProgress.done();
});

Router.events.on('routeChangeError', () => {
  isLoading = false;
  NProgress.done();
});

// for triggering manually
export function setLoading(show: boolean) {
  if (show) {
    NProgress.start();
  } else {
    NProgress.done();
  }
}
