import NextHead from 'next/head';

const defaultTitle = '';
const defaultDescription = '';
const defaultOGURL = '';
const defaultOGImage = '';

interface HeadProps {
  title?: string;
  description?: string;
  url?: string;
  ogImage?: string;
}

export default function Head({ title, description, url, ogImage }: HeadProps) {
  return (
    <NextHead>
      <meta charSet="UTF-8" />
      <title>{title ?? defaultTitle}</title>
      <meta name="description" content={description ?? defaultDescription} />
      {/* this no longer applies to iOS, Apple disabled user-scalable, and other fixes are janky */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />

      <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;800&display=swap"
        rel="stylesheet"
      />
      <link rel="icon" href="/favicon.png" />

      <meta property="og:url" content={url ?? defaultOGURL} />
      <meta property="og:title" content={title ?? defaultTitle} />
      <meta property="og:description" content={description ?? defaultDescription} />
      <meta name="twitter:site" content={url ?? defaultOGURL} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={ogImage ?? defaultOGImage} />
      <meta property="og:image" content={ogImage ?? defaultOGImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Intercom integration script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
						// We pre-filled your app ID in the widget URL: 'https://widget.intercom.io/widget/w0k8mz0m'
						(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/w0k8mz0m';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
        `,
        }}
      />
    </NextHead>
  );
}
