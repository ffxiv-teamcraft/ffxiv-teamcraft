window.fathom = function() {
  var isElectron = navigator && navigator.userAgent.toLowerCase().indexOf('electron/') > -1;
  var fathomScript = document.currentScript || document.querySelector('script[src*="script.js"][site]') || document.querySelector('script[data-site]') || document.querySelector('script[site]'),
    siteId = fathomScript.getAttribute('data-site') || fathomScript.getAttribute('site'), honorDNT = !1, auto = !0,
    canonical = !0, excludedDomains = [], allowedDomains = [];
  'true' == (fathomScript.getAttribute('data-honor-dnt') || fathomScript.getAttribute('honor-dnt')) && (honorDNT = 'doNotTrack' in navigator && '1' === navigator.doNotTrack), 'false' == (fathomScript.getAttribute('data-auto') || fathomScript.getAttribute('auto')) && (auto = !1), 'false' == (fathomScript.getAttribute('data-canonical') || fathomScript.getAttribute('canonical')) && (canonical = !1), (fathomScript.getAttribute('data-excluded-domains') || fathomScript.getAttribute('excluded-domains')) && (excludedDomains = (fathomScript.getAttribute('data-excluded-domains') || fathomScript.getAttribute('excluded-domains')).split(',')), fathomScript.getAttribute('data-included-domains') || fathomScript.getAttribute('included-domains') ? allowedDomains = (fathomScript.getAttribute('data-included-domains') || fathomScript.getAttribute('included-domains')).split(',') : (fathomScript.getAttribute('data-allowed-domains') || fathomScript.getAttribute('allowed-domains')) && (allowedDomains = (fathomScript.getAttribute('data-allowed-domains') || fathomScript.getAttribute('allowed-domains')).split(','));

  function trackPageview() {
    window.fathom.trackPageview();
  }

  function spaHistory() {
    var pushState;
    void 0 !== history && (pushState = history.pushState, history.pushState = function() {
      var ret = pushState.apply(history, arguments);
      return window.dispatchEvent(new Event('pushstate')), window.dispatchEvent(new Event('locationchangefathom')), ret;
    }, window.addEventListener('popstate', function() {
      window.dispatchEvent(new Event('locationchangefathom'));
    }), window.addEventListener('locationchangefathom', trackPageview));
  }

  function spaHash() {
    window.addEventListener('hashchange', trackPageview);
  }

  if (fathomScript.getAttribute('data-spa') || fathomScript.getAttribute('spa')) switch (fathomScript.getAttribute('data-spa') || fathomScript.getAttribute('spa')) {
    case'history':
      spaHistory();
      break;
    case'hash':
      spaHash();
      break;
    case'auto':
      (void 0 !== history ? spaHistory : spaHash)();
  }
  var scriptUrl, trackerUrl = 'https://cdn.usefathom.com/';

  function encodeParameters(params) {
    return params.cid = Math.floor(1e8 * Math.random()) + 1, '?' + Object.keys(params).map(function(k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');
  }

  function qs() {
    for (var pair, data = {}, pairs = window.location.search.substring(window.location.search.indexOf('?') + 1).split('&'), i = 0; i < pairs.length; i++) pairs[i] && (pair = pairs[i].split('='), -1 < ['keyword', 'q', 'ref', 's', 'utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term', 'action', 'name', 'pagename', 'tab'].indexOf(decodeURIComponent(pair[0])) && (data[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])));
    return data;
  }

  function trackingEnabled() {
    var fathomIsBlocked = !1;
    try {
      fathomIsBlocked = window.localStorage && window.localStorage.getItem('blockFathomTracking');
    } catch (err) {
    }
    var prerender = 'visibilityState' in document && 'prerender' === document.visibilityState,
      isExcludedDomain = -1 < excludedDomains.indexOf(window.location.hostname),
      isAllowedDomain = !(0 < allowedDomains.length) || -1 < allowedDomains.indexOf(window.location.hostname);
    return !(fathomIsBlocked || prerender || honorDNT || isExcludedDomain) && isAllowedDomain;
  }

  function getLocation(params) {
    var a, location = window.location;
    return void 0 === params.url ? canonical && document.querySelector('link[rel="canonical"][href]') && ((a = document.createElement('a')).href = document.querySelector('link[rel="canonical"][href]').href, location = a) : (location = document.createElement('a')).href = params.url, location;
  }

  var tracker;
  var trackerUrlFromScript = fathomScript.getAttribute('data-tracker-url');

  if (isElectron) {
    if (!trackerUrlFromScript) {
      // This is just me telling the user that we're in electron so they need to specify the data-tracker-url manually, else it'll be empty and not work at all.
      console.error('Missing data-tracker-url attribute on the script for electron env to work properly');
      return;
    }
    trackerUrl = trackerUrlFromScript;
    tracker = auto && setTimeout(function() {
      window.fathom.trackPageview();
    });
  } else {
    tracker = fathomScript.src.indexOf('cdn.usefathom.com') < 0 && ((scriptUrl = document.createElement('a')).href = fathomScript.src, trackerUrl = trackerUrlFromScript || 'https://' + scriptUrl.hostname + '/'), auto && setTimeout(function() {
      window.fathom.trackPageview();
    });
  }

  return tracker, {
    siteId: siteId, send: function(params) {
      var img;
      trackingEnabled()
      && ((img = document.createElement('img')).setAttribute('alt', ''), img.setAttribute('aria-hidden', 'true'), img.style.position = 'absolute', img.src = trackerUrl + encodeParameters(params), img.addEventListener('load', function() {
        img.parentNode.removeChild(img);
      }), img.addEventListener('error', function() {
        console.error(trackerUrl + encodeParameters(params));
        img.parentNode.removeChild(img);
      }), document.body.appendChild(img));
    }, beacon: function(params) {
      trackingEnabled() && navigator.sendBeacon(trackerUrl + encodeParameters(params));
    }, trackPageview: function(params) {
      // Standard way to detect electron, also doesn't crash in SSR environment where navigator doesn't exist.
      var hostname, pathnameToSend, location = getLocation(params = void 0 === params ? {} : params);
      if (isElectron) {
        const host = fathomScript.getAttribute('data-host');
        if (!host) {
          // This is just me telling the user that we're in electron so they need to specify the host
          console.error('Missing host attribute on the script for electron env to work properly');
          return;
        }
        hostname = host;
        // Since electron must use hash location strategy, let's force it here, only remove the # if the web version is not using hash.
        pathnameToSend = location.hash.replace('#', 'hash' === fathomScript.getAttribute('data-spa') ? '#' : '') || '/';
      } else {
        hostname = (location.protocol + '//' + location.hostname);
        pathnameToSend = location.pathname || '/';
      }
      if ('hash' === fathomScript.getAttribute('data-spa')) {
        pathnameToSend += location.hash.replace('#/', '');
      }
      this.send({
        h: hostname,
        p: pathnameToSend,
        r: params.referrer || (document.referrer.indexOf(hostname) < 0 ? document.referrer : ''),
        sid: this.siteId,
        qs: JSON.stringify(qs())
      });
    }, trackGoal: function(code, cents) {
      var location = getLocation({}), hostname = location.protocol + '//' + location.hostname;
      this.beacon({
        gcode: code,
        gval: cents,
        qs: JSON.stringify(qs()),
        p: location.pathname || '/',
        h: hostname,
        r: document.referrer.indexOf(hostname) < 0 ? document.referrer : '',
        sid: this.siteId
      });
    }, trackEvent: function(name, payload = {}) {
      var location = getLocation({}), hostname = location.protocol + '//' + location.hostname;
      this.beacon({
        name: name,
        payload: JSON.stringify(payload),
        p: location.pathname || '/',
        h: hostname,
        r: document.referrer.indexOf(hostname) < 0 ? document.referrer : '',
        sid: this.siteId,
        qs: JSON.stringify(qs())
      });
    }, setSite(siteId) {
      this.siteId = siteId;
    }, blockTrackingForMe: function() {
      window.localStorage ? (window.localStorage.setItem('blockFathomTracking', !0), alert('You have blocked Fathom for yourself on this website.')) : alert('Your browser doesn\'t support localStorage.');
    }, enableTrackingForMe: function() {
      window.localStorage && (window.localStorage.removeItem('blockFathomTracking'), alert('Fathom has been enabled for this website.'));
    }
  };
}();
