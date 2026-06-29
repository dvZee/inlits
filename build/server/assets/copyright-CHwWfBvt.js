import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { AlertCircle, Send } from "lucide-react";
function CopyrightPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contentUrl: "",
    claimType: "copyright",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        contentUrl: "",
        claimType: "copyright",
        description: ""
      });
    } catch (err) {
      setError("There was an error submitting your claim. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "container max-w-4xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-6", children: "Copyright & Content Claims" }),
    /* @__PURE__ */ jsxs("div", { className: "prose prose-sm md:prose-base max-w-none mb-8", children: [
      /* @__PURE__ */ jsx("p", { children: "At Inlits, we respect the intellectual property rights of others and expect our users to do the same. If you believe that your work has been copied in a way that constitutes copyright infringement, or that your intellectual property rights have been otherwise violated, please submit a claim using the form below." }),
      /* @__PURE__ */ jsx("h2", { children: "DMCA Compliance" }),
      /* @__PURE__ */ jsx("p", { children: "Inlits complies with the Digital Millennium Copyright Act (DMCA). If you believe that content on our platform infringes your copyright, you may submit a DMCA notification. Upon receiving a valid notice, we will remove or disable access to the content and notify the content provider." }),
      /* @__PURE__ */ jsx("h2", { children: "What Information to Include" }),
      /* @__PURE__ */ jsx("p", { children: "For your claim to be valid, please include the following information:" }),
      /* @__PURE__ */ jsxs("ul", { children: [
        /* @__PURE__ */ jsx("li", { children: "A physical or electronic signature of the copyright owner or a person authorized to act on their behalf" }),
        /* @__PURE__ */ jsx("li", { children: "Identification of the copyrighted work claimed to have been infringed" }),
        /* @__PURE__ */ jsx("li", { children: "Identification of the material that is claimed to be infringing and where it is located on our service" }),
        /* @__PURE__ */ jsx("li", { children: "Your contact information, including your address, telephone number, and email" }),
        /* @__PURE__ */ jsx("li", { children: "A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or law" }),
        /* @__PURE__ */ jsx("li", { children: "A statement, made under penalty of perjury, that the information in the notification is accurate and that you are authorized to act on behalf of the copyright owner" })
      ] }),
      /* @__PURE__ */ jsx("h2", { children: "Counter-Notification" }),
      /* @__PURE__ */ jsxs("p", { children: [
        "If you believe your content was removed in error, you may submit a counter-notification by emailing ",
        /* @__PURE__ */ jsx("a", { href: "mailto:copyright@inlits.com", className: "text-primary hover:underline", children: "copyright@inlits.com" }),
        " with the following information:"
      ] }),
      /* @__PURE__ */ jsxs("ul", { children: [
        /* @__PURE__ */ jsx("li", { children: "Your physical or electronic signature" }),
        /* @__PURE__ */ jsx("li", { children: "Identification of the material that has been removed" }),
        /* @__PURE__ */ jsx("li", { children: "A statement under penalty of perjury that you have a good faith belief that the material was removed as a result of mistake or misidentification" }),
        /* @__PURE__ */ jsx("li", { children: "Your name, address, and telephone number" }),
        /* @__PURE__ */ jsx("li", { children: "A statement that you consent to the jurisdiction of the federal court in the district where you live (or the Northern District of California if you live outside the U.S.)" }),
        /* @__PURE__ */ jsx("li", { children: "A statement that you will accept service of process from the person who provided the original notification" })
      ] }),
      /* @__PURE__ */ jsx("h2", { children: "Contact Information" }),
      /* @__PURE__ */ jsxs("p", { children: [
        "For copyright matters: ",
        /* @__PURE__ */ jsx("a", { href: "mailto:copyright@inlits.com", className: "text-primary hover:underline", children: "copyright@inlits.com" }),
        /* @__PURE__ */ jsx("br", {}),
        "For general support: ",
        /* @__PURE__ */ jsx("a", { href: "mailto:support@inlits.com", className: "text-primary hover:underline", children: "support@inlits.com" }),
        /* @__PURE__ */ jsx("br", {}),
        "For advertising inquiries: ",
        /* @__PURE__ */ jsx("a", { href: "mailto:advertising@inlits.com", className: "text-primary hover:underline", children: "advertising@inlits.com" }),
        /* @__PURE__ */ jsx("br", {}),
        "For business partnerships: ",
        /* @__PURE__ */ jsx("a", { href: "mailto:partnerships@inlits.com", className: "text-primary hover:underline", children: "partnerships@inlits.com" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6 mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Submit a Copyright Claim" }),
      success ? /* @__PURE__ */ jsx("div", { className: "bg-primary/10 text-primary p-4 rounded-lg", children: /* @__PURE__ */ jsx("p", { children: "Thank you for your submission! We've received your copyright claim and will review it promptly. Our team will contact you at the email address provided if we need additional information." }) }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium mb-1", children: "Full Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "name",
                name: "name",
                value: formData.name,
                onChange: handleChange,
                required: true,
                className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium mb-1", children: "Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                id: "email",
                name: "email",
                value: formData.email,
                onChange: handleChange,
                required: true,
                className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "contentUrl", className: "block text-sm font-medium mb-1", children: "URL of Content in Question" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "url",
              id: "contentUrl",
              name: "contentUrl",
              value: formData.contentUrl,
              onChange: handleChange,
              required: true,
              className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
              placeholder: "https://inlits.com/..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "claimType", className: "block text-sm font-medium mb-1", children: "Claim Type" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "claimType",
              name: "claimType",
              value: formData.claimType,
              onChange: handleChange,
              required: true,
              className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
              children: [
                /* @__PURE__ */ jsx("option", { value: "copyright", children: "Copyright Infringement" }),
                /* @__PURE__ */ jsx("option", { value: "trademark", children: "Trademark Infringement" }),
                /* @__PURE__ */ jsx("option", { value: "attribution", children: "Missing Attribution" }),
                /* @__PURE__ */ jsx("option", { value: "privacy", children: "Privacy Violation" }),
                /* @__PURE__ */ jsx("option", { value: "other", children: "Other Intellectual Property Claim" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "block text-sm font-medium mb-1", children: "Detailed Description of Claim" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "description",
              name: "description",
              value: formData.description,
              onChange: handleChange,
              required: true,
              rows: 5,
              className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
              placeholder: "Please provide details about your claim, including information about the original work and how it's being infringed..."
            }
          )
        ] }),
        error && /* @__PURE__ */ jsxs("div", { className: "bg-destructive/10 text-destructive p-3 rounded-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm", children: error })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              id: "agreement",
              required: true,
              className: "rounded border-input"
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: "agreement", className: "text-sm", children: "I certify, under penalty of perjury, that the information in this notification is accurate and that I am authorized to act on behalf of the owner of the exclusive right that is allegedly infringed." })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors",
            children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" }),
              "Submitting..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
              "Submit Claim"
            ] })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 border rounded-lg p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Repeat Infringer Policy" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Inlits maintains a policy of terminating the accounts of users who are determined to be repeat infringers of copyright or other intellectual property rights. A repeat infringer is a user who has been notified of infringing activity multiple times and/or has had content removed from our service multiple times." })
    ] })
  ] });
}
export {
  CopyrightPage,
  CopyrightPage as default
};
