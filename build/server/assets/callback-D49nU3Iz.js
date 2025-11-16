import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { u as useAuth, s as supabase } from "./server-build-CQlMvEI0.js";
import { Loader2, AlertCircle } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const handleAuthCallback = async () => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      try {
        console.log("Auth callback started");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
        if (!(session == null ? void 0 : session.user)) {
          console.log("No session found, checking URL hash");
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          if (accessToken) {
            console.log("Found tokens in URL, setting session");
            const { data: { user: user2 }, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ""
            });
            if (setSessionError) throw setSessionError;
            if (!user2) throw new Error("Failed to set session");
            console.log("Session set successfully");
          } else {
            throw new Error("No user session found");
          }
        }
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!(currentSession == null ? void 0 : currentSession.user)) {
          throw new Error("No user session found");
        }
        const user = currentSession.user;
        console.log("OAuth user:", user.email);
        const { data: existingProfile, error: profileCheckError } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (profileCheckError && profileCheckError.code !== "PGRST116") {
          console.error("Profile check error:", profileCheckError);
          throw profileCheckError;
        }
        if (!existingProfile) {
          console.log("Creating new profile for OAuth user");
          const displayName = ((_a = user.user_metadata) == null ? void 0 : _a.full_name) || ((_b = user.user_metadata) == null ? void 0 : _b.name) || ((_c = user.email) == null ? void 0 : _c.split("@")[0]) || "User";
          let username = ((_d = user.user_metadata) == null ? void 0 : _d.user_name) || ((_e = user.user_metadata) == null ? void 0 : _e.preferred_username) || ((_g = (_f = user.email) == null ? void 0 : _f.split("@")[0]) == null ? void 0 : _g.replace(/[^a-zA-Z0-9_]/g, "")) || "user";
          if (username.length < 3) {
            username = `user_${Date.now()}`;
          }
          const { data: existingUser } = await supabase.from("profiles").select("username").eq("username", username).maybeSingle();
          if (existingUser) {
            username = `${username}_${Math.floor(Math.random() * 1e3)}`;
          }
          console.log("Creating profile for OAuth user:", {
            id: user.id,
            username,
            name: displayName,
            email: user.email
          });
          const { error: insertError } = await supabase.from("profiles").insert({
            id: user.id,
            username,
            name: displayName,
            role: "consumer",
            // Default role for OAuth users
            avatar_url: ((_h = user.user_metadata) == null ? void 0 : _h.avatar_url) || ((_i = user.user_metadata) == null ? void 0 : _i.picture),
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          if (insertError) {
            console.error("Error creating OAuth profile:", insertError);
            throw insertError;
          }
          try {
            await supabase.functions.invoke("send-welcome-email", {
              body: {
                to: user.email,
                name: displayName,
                role: "consumer"
              }
            });
            console.log("Welcome email sent");
          } catch (emailError) {
            console.error("Error sending welcome email:", emailError);
          }
        } else {
          console.log("Profile already exists for OAuth user");
        }
        console.log("Setting user in auth state");
        await setUser(user);
        console.log("Redirecting to home page");
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setTimeout(() => {
          navigate("/signin", {
            state: {
              message: "Authentication failed. Please try again."
            },
            replace: true
          });
        }, 3e3);
      } finally {
        setLoading(false);
      }
    };
    handleAuthCallback();
  }, [navigate, setUser]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Completing authentication..." })
    ] }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center space-y-4", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Authentication Error" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Redirecting you back to sign in..." })
    ] }) });
  }
  return null;
}
export {
  AuthCallbackPage
};
