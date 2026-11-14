import { createFileRoute, redirect } from "@tanstack/react-router";

// The site is now just the practice tests: a static page served from public/practice/.
// Visiting the home page sends you straight there.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ href: "/practice/index.html" });
  },
});
