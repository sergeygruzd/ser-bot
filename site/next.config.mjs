/** @type {import('next').NextConfig} */
const nextConfig = {
  // Persona files live one level above the app dir; make sure Vercel's
  // serverless bundle includes them for the chat route.
  outputFileTracingIncludes: {
    "/api/chat": ["../persona/**/*"],
  },
};

export default nextConfig;
