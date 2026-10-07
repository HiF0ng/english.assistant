import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/index.html" }], afterFiles: [], fallback: [] };
  },
  async redirects() {
    return [
      ...["login", "register", "forgot-password", "reset-password", "settings", "notifications"].map(page => ({ source: `/${page}`, destination: `/${page}.html`, permanent: false })),
      ...["teacher", "student", "admin"].flatMap(role => ["dashboard", "classes"].map(page => ({ source: `/${role}/${page}`, destination: `/${role}-${page}.html`, permanent: false }))),
      ...["teacher", "student"].map(role => ({ source: `/${role}/submissions`, destination: `/${role}-submissions.html`, permanent: false })),
      { source: "/admin", destination: "/admin-login.html", permanent: false },
      { source: "/admin/login", destination: "/admin-login.html", permanent: false },
    ];
  },
};
export default config;
