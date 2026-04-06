import { useEffect } from 'react';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';

export const TrackingScripts = () => {
  const { settings } = useHomepageSettings();
  const { tracking } = settings;

  useEffect(() => {
    if (!tracking) return;

    // Google Tag Manager
    if (tracking.google_tag_manager) {
      const gtmId = tracking.google_tag_manager.replace(/[^a-zA-Z0-9-]/g, '');
      if (gtmId && !document.getElementById('gtm-script')) {
        const script = document.createElement('script');
        script.id = 'gtm-script';
        script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
        document.head.appendChild(script);

        // noscript iframe
        const noscript = document.createElement('noscript');
        noscript.id = 'gtm-noscript';
        noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.insertBefore(noscript, document.body.firstChild);
      }
    }

    // Facebook/Meta Pixel (always inject independently)
    if (tracking.facebook_pixel) {
      const pixelId = tracking.facebook_pixel.replace(/\D/g, '');
      if (pixelId && !document.getElementById('fb-pixel-script')) {
        const script = document.createElement('script');
        script.id = 'fb-pixel-script';
        script.innerHTML = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`;
        document.head.appendChild(script);
      }
    }

    // Google Analytics (GA4)
    if (tracking.google_analytics && !tracking.google_tag_manager) {
      const gaId = tracking.google_analytics.replace(/[^a-zA-Z0-9-]/g, '');
      if (gaId && !document.getElementById('ga-script')) {
        const script1 = document.createElement('script');
        script1.id = 'ga-script';
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.innerHTML = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`;
        document.head.appendChild(script2);
      }
    }

    // TikTok Pixel
    if (tracking.tiktok_pixel && !tracking.google_tag_manager) {
      const ttId = tracking.tiktok_pixel.replace(/[^a-zA-Z0-9]/g, '');
      if (ttId && !document.getElementById('tt-pixel-script')) {
        const script = document.createElement('script');
        script.id = 'tt-pixel-script';
        script.innerHTML = `!function (w, d, t) {
w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
ttq.load('${ttId}');
ttq.page();
}(window, document, 'ttq');`;
        document.head.appendChild(script);
      }
    }
  }, [tracking]);

  return null;
};
