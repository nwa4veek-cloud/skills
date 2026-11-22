const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let imageLocation;

if (projectUrl) {
  try {
    const parsedUrl = new URL(projectUrl);
    imageLocation = {
      protocol: parsedUrl.protocol.replace(":", ""),
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
    };
  } catch {
    imageLocation = undefined;
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: imageLocation
      ? [
          {
            ...imageLocation,
            pathname: "/storage/v1/object/public/product-images/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
