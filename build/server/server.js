import { createRequestHandler } from "@netlify/remix-adapter";
import { b as build } from "./assets/server-build-CzlBCFpg.js";
import "react/jsx-runtime";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "react";
import "@supabase/supabase-js";
import "lucide-react";
import "react-router-dom";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
const _virtual_netlifyServer = createRequestHandler({
  build,
  getLoadContext: async (_req, ctx) => ctx
});
export {
  _virtual_netlifyServer as default
};
