// server/config/csp.js
const splitSources = (value) =>
  value
    ? value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];

const mergeSources = (defaults, extra) => [...new Set([...defaults, ...extra])];

const buildCspDirectives = () => {
  const scriptSrc = mergeSources(
    ["'self'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
    splitSources(process.env.CSP_SCRIPT_SRC)
  );
  const styleSrc = mergeSources(
    ["'self'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
    splitSources(process.env.CSP_STYLE_SRC)
  );
  const fontSrc = mergeSources(
    ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
    splitSources(process.env.CSP_FONT_SRC)
  );
  const imgSrc = mergeSources(
    ["'self'", 'data:', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
    splitSources(process.env.CSP_IMG_SRC)
  );
  const connectSrc = mergeSources(["'self'"], splitSources(process.env.CSP_CONNECT_SRC));

  return {
    defaultSrc: ["'self'"],
    scriptSrc,
    styleSrc,
    fontSrc,
    imgSrc,
    connectSrc,
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
  };
};

export default buildCspDirectives;
