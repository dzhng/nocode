import { capitalize, words } from 'lodash';
import isPlainObject from 'is-plain-object';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const isMobile = (() => {
  if (typeof navigator === 'undefined' || typeof navigator.userAgent !== 'string') {
    return false;
  }
  return /Mobile/.test(navigator.userAgent);
})();

export const isBrowser = (() => {
  return typeof window !== 'undefined';
})();

export const isTestEnv = (() => {
  return process.env.NODE_ENV === 'test';
})();

export function formatPastDate(date: Date, hourCutoff = 24) {
  const OneDayAgo = new Date().getTime() - hourCutoff * 60 * 60 * 1000;
  return date.getTime() < OneDayAgo ? dayjs(date).format('dddd, MMMM D') : dayjs(date).fromNow();
}

export function formatFutureDate(date: Date, hourCutoff = 1) {
  const OneHourFromNow = new Date().getTime() + hourCutoff * 60 * 60 * 1000;
  return date.getTime() > OneHourFromNow ? dayjs(date).format('dddd, MMMM D') : dayjs(date).toNow();
}

export function formatRelativeDate(date: Date) {
  if (date.getTime() > Date.now()) {
    return formatFutureDate(date);
  } else {
    return formatPastDate(date);
  }
}

export function formatDuration(seconds: number) {
  return Math.round(dayjs.duration({ seconds }).asMinutes());
}

// This function ensures that the user has granted the browser permission to use audio and video
// devices. If permission has not been granted, it will cause the browser to ask for permission
// for audio and video at the same time (as opposed to separate requests).
// TODO: currently not used
export async function ensureMediaPermissions() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const shouldAskForMediaPermissions = devices.every(
    (device) => !(device.deviceId && device.label),
  );
  if (shouldAskForMediaPermissions) {
    return navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((mediaStream) => mediaStream.getTracks().forEach((track) => track.stop()));
  }
}

export function updateClipboard(newClip: string) {
  navigator.clipboard.writeText(newClip).then(
    function () {
      console.log('Copy successful!');
    },
    function (e) {
      console.warn('Copy failed!', e);
    },
  );
}

// return short one word version of display name
export function shortName(displayName: string) {
  return capitalize(words(displayName)[0]);
}

// Recursively removes any object keys with a value of undefined
export function removeUndefineds<T>(obj: T): T {
  if (!isPlainObject(obj)) return obj;

  const target: { [name: string]: any } = {};

  for (const key in obj) {
    const val = obj[key];
    if (typeof val !== 'undefined') {
      target[key] = removeUndefineds(val);
    }
  }

  return target as T;
}
