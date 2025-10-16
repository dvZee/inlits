import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Mail, Phone, MapPin, AlertCircle, Send, Clock, Users } from "lucide-react";
function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
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
        subject: "",
        message: ""
      });
    } catch (err) {
      setError("There was an error sending your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "container max-w-5xl mx-auto px-4 py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold mb-3", children: "Get in Touch" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-2xl mx-auto", children: "Have questions or feedback? We'd love to hear from you. Our team is always ready to assist." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-xl p-6 text-center hover:shadow-md transition-shadow", children: [
        /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Mail, { className: "w-7 h-7 text-primary" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-2", children: "Email Us" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "Our friendly team is here to help" }),
        /* @__PURE__ */ jsx("a", { href: "mailto:support@inlits.com", className: "text-primary hover:underline font-medium", children: "support@inlits.com" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-xl p-6 text-center hover:shadow-md transition-shadow", children: [
        /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Phone, { className: "w-7 h-7 text-primary" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-2", children: "Call Us" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "Mon-Fri from 9am to 5pm" }),
        /* @__PURE__ */ jsx("a", { href: "tel:+923284840271", className: "text-primary hover:underline font-medium", children: "+92 328 4840271" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-xl p-6 text-center hover:shadow-md transition-shadow", children: [
        /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(MapPin, { className: "w-7 h-7 text-primary" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-2", children: "Visit Us" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "Come say hello at our office" }),
        /* @__PURE__ */ jsx("p", { className: "text-primary font-medium", children: "69b Block Commercial Area BHS, Lahore" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-card border rounded-xl overflow-hidden shadow-lg", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-6", children: "Send Us a Message" }),
        success ? /* @__PURE__ */ jsxs("div", { className: "bg-primary/10 text-primary p-6 rounded-xl", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-2", children: "Message Sent!" }),
          /* @__PURE__ */ jsx("p", { children: "Thank you for reaching out! We've received your message and will get back to you as soon as possible." }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSuccess(false),
              className: "mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors",
              children: "Send Another Message"
            }
          )
        ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: "name",
                className: "block text-sm font-medium mb-2",
                children: "Full Name"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "name",
                name: "name",
                value: formData.name,
                onChange: handleChange,
                required: true,
                className: "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary",
                placeholder: "Your name"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: "email",
                className: "block text-sm font-medium mb-2",
                children: "Email Address"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                id: "email",
                name: "email",
                value: formData.email,
                onChange: handleChange,
                required: true,
                className: "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary",
                placeholder: "your.email@example.com"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: "subject",
                className: "block text-sm font-medium mb-2",
                children: "Subject"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "subject",
                name: "subject",
                value: formData.subject,
                onChange: handleChange,
                required: true,
                className: "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary",
                placeholder: "How can we help you?"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: "message",
                className: "block text-sm font-medium mb-2",
                children: "Message"
              }
            ),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "message",
                name: "message",
                value: formData.message,
                onChange: handleChange,
                required: true,
                rows: 5,
                className: "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary",
                placeholder: "Tell us what you need help with..."
              }
            )
          ] }),
          error && /* @__PURE__ */ jsxs("div", { className: "bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5 flex-shrink-0" }),
            /* @__PURE__ */ jsx("p", { children: error })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: loading,
              className: "w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-base font-medium",
              children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" }),
                "Sending..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Send, { className: "w-5 h-5" }),
                "Send Message"
              ] })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-primary/5 p-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-6", children: "Additional Information" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-primary" }),
              "Business Hours"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Monday - Friday:" }),
                /* @__PURE__ */ jsx("span", { children: "9:00 AM - 5:00 PM" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Saturday:" }),
                /* @__PURE__ */ jsx("span", { children: "10:00 AM - 2:00 PM" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Sunday:" }),
                /* @__PURE__ */ jsx("span", { children: "Closed" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Users, { className: "w-5 h-5 text-primary" }),
              "Departments"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Customer Support" }),
                /* @__PURE__ */ jsx("a", { href: "mailto:support@inlits.com", className: "text-primary hover:underline text-sm", children: "support@inlits.com" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Creator Relations" }),
                /* @__PURE__ */ jsx("a", { href: "mailto:creators@inlits.com", className: "text-primary hover:underline text-sm", children: "creators@inlits.com" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Advertising" }),
                /* @__PURE__ */ jsx("a", { href: "mailto:advertising@inlits.com", className: "text-primary hover:underline text-sm", children: "advertising@inlits.com" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Copyright Claims" }),
                /* @__PURE__ */ jsx("a", { href: "mailto:copyright@inlits.com", className: "text-primary hover:underline text-sm", children: "copyright@inlits.com" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-4 border-t", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "For urgent matters, please call us directly at",
            " ",
            /* @__PURE__ */ jsx("a", { href: "tel:+923284840271", className: "text-primary hover:underline", children: "+92 328 4840271" })
          ] }) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-12 rounded-xl overflow-hidden h-[400px] border", children: /* @__PURE__ */ jsx(
      "iframe",
      {
        src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3402.5583031589!2d74.2293867!3d31.4825838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391903d4d940f12b%3A0xdb8c83f6699d5226!2sBahria%20Town%2C%20Lahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1654321234567!5m2!1sen!2s",
        width: "100%",
        height: "100%",
        style: { border: 0 },
        allowFullScreen: true,
        loading: "lazy",
        referrerPolicy: "no-referrer-when-downgrade"
      }
    ) })
  ] });
}
export {
  ContactPage,
  ContactPage as default
};
