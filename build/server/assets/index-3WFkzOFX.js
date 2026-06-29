import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { u as useAuth, s as supabase } from "./server-build-BGC-wbDo.js";
import { AlertCircle, User, Bell, Lock, CreditCard, Wrench } from "lucide-react";
import { I as Input } from "./input-bCdpbejb.js";
import { L as Label } from "./label-B7hQ0ymw.js";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "react-router-dom";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function SettingsPage() {
  const { profile, setProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: (profile == null ? void 0 : profile.name) || "",
    bio: (profile == null ? void 0 : profile.bio) || ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Lock },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "api", label: "API", icon: Wrench }
  ];
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: updateError } = await supabase.from("profiles").update({
        name: formData.name,
        bio: formData.bio,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", profile.id);
      if (updateError) throw updateError;
      setProfile({
        ...profile,
        name: formData.name,
        bio: formData.bio
      });
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(null), 3e3);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const { error: error2 } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      if (error2) throw error2;
      setSuccess("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setTimeout(() => setSuccess(null), 3e3);
    } catch (err) {
      console.error("Error updating password:", err);
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Settings" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Manage your account settings and preferences." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-4 border-b", children: tabs.map((tab) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setActiveTab(tab.id),
        className: `flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
        children: [
          /* @__PURE__ */ jsx(tab.icon, { className: "w-4 h-4" }),
          tab.label
        ]
      },
      tab.id
    )) }),
    (activeTab === "payments" || activeTab === "api") && /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 backdrop-blur-sm border rounded-lg p-8 text-center space-y-2", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-8 h-8 text-primary mx-auto" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "Coming Soon!" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: activeTab === "payments" ? "Payment features will be available soon. Stay tuned for updates!" : "API access and developer tools will be available soon. Stay tuned for updates!" })
    ] }),
    activeTab === "account" && /* @__PURE__ */ jsxs("div", { className: "max-w-2xl space-y-8", children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: handleProfileSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Profile Information" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Update your profile details and public information." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Full Name" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "name",
                  value: formData.name,
                  onChange: (e) => setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "username", children: "Username" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "username",
                  value: profile == null ? void 0 : profile.username,
                  disabled: true,
                  className: "bg-muted"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "email",
                type: "email",
                value: "inlits2@gmail.com",
                disabled: true,
                className: "bg-muted"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "bio", children: "Bio" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "bio",
                value: formData.bio,
                onChange: (e) => setFormData((prev) => ({ ...prev, bio: e.target.value })),
                className: "w-full px-3 py-2 rounded-md border bg-background min-h-[100px]",
                placeholder: "Tell us about yourself..."
              }
            )
          ] })
        ] }),
        error && /* @__PURE__ */ jsx("div", { className: "bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm", children: error }),
        success && /* @__PURE__ */ jsx("div", { className: "bg-primary/10 text-primary px-4 py-3 rounded-lg text-sm", children: success }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50",
            children: loading ? "Saving..." : "Save Changes"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handlePasswordSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Change Password" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Update your password to keep your account secure." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "currentPassword", children: "Current Password" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "currentPassword",
                type: "password",
                value: passwordData.currentPassword,
                onChange: (e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "newPassword", children: "New Password" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "newPassword",
                type: "password",
                value: passwordData.newPassword,
                onChange: (e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "confirmPassword", children: "Confirm New Password" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "confirmPassword",
                type: "password",
                value: passwordData.confirmPassword,
                onChange: (e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50",
            children: loading ? "Updating..." : "Update Password"
          }
        )
      ] })
    ] }),
    activeTab === "notifications" && /* @__PURE__ */ jsx("div", { className: "max-w-2xl", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-3 border-b", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Email Notifications" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Receive notifications via email" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", className: "sr-only peer" }),
          /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-3 border-b", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Push Notifications" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Receive browser notifications" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", className: "sr-only peer" }),
          /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" })
        ] })
      ] })
    ] }) }),
    activeTab === "privacy" && /* @__PURE__ */ jsx("div", { className: "max-w-2xl", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-3 border-b", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Public Profile" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Make profile visible to everyone" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", className: "sr-only peer" }),
          /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-3 border-b", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Show Earnings" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Display earnings on profile" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", className: "sr-only peer" }),
          /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  SettingsPage
};
