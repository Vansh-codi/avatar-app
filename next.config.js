// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow MediaPipe CDN resources
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // CSRF / security headers
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=()', // Allow camera for avatar tracking
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
              "worker-src blob: 'self'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // "connect-src 'self' https://cdn.jsdelivr.net",
              "connect-src 'self' https://cdn.jsdelivr.net https://lottie.host https://app.lottiefiles.com",
              "img-src 'self' data: blob:",
              "media-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Webpack config to handle Three.js examples
  webpack: (config) => {
    config.externals = config.externals || [];
    return config;
  },
};

module.exports = nextConfig;
