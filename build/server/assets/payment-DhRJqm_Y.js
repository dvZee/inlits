import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { u as useAuth, s as supabase } from "./server-build-JgBpkKvy.js";
import { ArrowLeft, Check, AlertCircle, Shield, Loader2, Lock, CreditCard, Smartphone, Wallet } from "lucide-react";
import { I as Input } from "./input-Dp_I0MuG.js";
import { L as Label } from "./label-DgwxdtmE.js";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
const paymentMethods = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: /* @__PURE__ */ jsx(CreditCard, { className: "w-6 h-6" }),
    type: "card",
    description: "Visa, Mastercard, and local bank cards"
  },
  {
    id: "easypaisa",
    name: "Easypaisa",
    icon: /* @__PURE__ */ jsx(Smartphone, { className: "w-6 h-6" }),
    type: "wallet",
    description: "Pay with your Easypaisa mobile wallet"
  },
  {
    id: "jazzcash",
    name: "JazzCash",
    icon: /* @__PURE__ */ jsx(Smartphone, { className: "w-6 h-6" }),
    type: "wallet",
    description: "Pay with your JazzCash mobile wallet"
  },
  {
    id: "zindigi",
    name: "Zindigi",
    icon: /* @__PURE__ */ jsx(Wallet, { className: "w-6 h-6" }),
    type: "wallet",
    description: "Pay with your Zindigi digital wallet"
  },
  {
    id: "upaisa",
    name: "UPaisa",
    icon: /* @__PURE__ */ jsx(Smartphone, { className: "w-6 h-6" }),
    type: "wallet",
    description: "Pay with your UPaisa mobile wallet"
  }
];
const plans = {
  weekly: { name: "Weekly", price: 150, period: "week" },
  monthly: { name: "Monthly", price: 399, period: "month" },
  annual: { name: "Annual", price: 3600, period: "year", originalPrice: 4788, discount: "25% OFF" }
};
function SubscriptionPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState({
    mobileNumber: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardHolderName: "",
    cnicNumber: ""
  });
  const planId = searchParams.get("plan") || "monthly";
  const selectedPlan = plans[planId];
  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    if (!selectedPlan) {
      navigate("/subscription");
      return;
    }
  }, [user, selectedPlan, navigate]);
  if (!selectedPlan) {
    return null;
  }
  const originalPlanPrice = "originalPrice" in selectedPlan ? selectedPlan.originalPrice : null;
  const planDiscountLabel = "discount" in selectedPlan ? selectedPlan.discount : null;
  const handleInputChange = (field, value) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  };
  const validatePaymentData = () => {
    if (!selectedMethod) {
      setError("Please select a payment method");
      return false;
    }
    if (selectedMethod.type === "wallet") {
      if (!paymentData.mobileNumber) {
        setError("Mobile number is required");
        return false;
      }
      if (!/^03\d{9}$/.test(paymentData.mobileNumber)) {
        setError("Please enter a valid Pakistani mobile number (03XXXXXXXXX)");
        return false;
      }
    }
    if (selectedMethod.type === "card") {
      if (!paymentData.cardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv) {
        setError("Please fill in all card details");
        return false;
      }
      if (paymentData.cardNumber.replace(/\s/g, "").length < 16) {
        setError("Please enter a valid card number");
        return false;
      }
    }
    return true;
  };
  const handlePayment = async () => {
    var _a;
    if (!user || !selectedPlan || !selectedMethod) return;
    if (!validatePaymentData()) return;
    setLoading(true);
    setError(null);
    try {
      const orderId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const safepayRequest = {
        amount: selectedPlan.price * 100,
        currency: "PKR",
        order_id: orderId,
        customer_email: user.email || "customer@example.com",
        customer_name: ((_a = user.user_metadata) == null ? void 0 : _a.full_name) || "Customer",
        source: "custom"
      };
      const response = await fetch(
        `${void 0}/functions/v1/initiate-safepay-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${void 0}`
          },
          body: JSON.stringify(safepayRequest)
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Payment initiation failed");
      }
      await supabase.from("payment_transactions").insert({
        order_id: orderId,
        user_id: user.id,
        plan_id: planId,
        amount: selectedPlan.price,
        payment_method: selectedMethod.id,
        status: "pending",
        transaction_id: result.tracker
      });
      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Safepay error:", err);
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };
  if (!selectedPlan) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b bg-card", children: /* @__PURE__ */ jsx("div", { className: "container max-w-4xl mx-auto px-4 py-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate("/subscription"),
          className: "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Back" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium", children: "2" }),
        /* @__PURE__ */ jsx("span", { className: "text-primary font-medium", children: "Payment Method" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "container max-w-4xl mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-2", children: "Select Payment Method" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Choose how you'd like to pay for your subscription" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: paymentMethods.map((method) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSelectedMethod(method),
            className: `p-4 rounded-lg border-2 transition-all text-left ${(selectedMethod == null ? void 0 : selectedMethod.id) === method.id ? "border-primary bg-primary/5" : "border-input hover:border-primary/50"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
                /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary", children: method.icon }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-medium", children: method.name }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: method.description })
                ] })
              ] }),
              (selectedMethod == null ? void 0 : selectedMethod.id) === method.id && /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Check, { className: "w-5 h-5 text-primary" }) })
            ]
          },
          method.id
        )) }),
        selectedMethod && /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Payment Details" }),
          selectedMethod.type === "wallet" && /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "mobile", children: "Mobile Number" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "mobile",
                type: "tel",
                value: paymentData.mobileNumber,
                onChange: (e) => handleInputChange("mobileNumber", e.target.value),
                placeholder: "03001234567",
                maxLength: 11
              }
            ),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Enter your ",
              selectedMethod.name,
              " registered mobile number"
            ] })
          ] }) }),
          selectedMethod.type === "card" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "cardNumber", children: "Card Number" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "cardNumber",
                  value: paymentData.cardNumber,
                  onChange: (e) => handleInputChange("cardNumber", formatCardNumber(e.target.value)),
                  placeholder: "1234 5678 9012 3456",
                  maxLength: 19
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "expiryMonth", children: "Month" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    id: "expiryMonth",
                    value: paymentData.expiryMonth,
                    onChange: (e) => handleInputChange("expiryMonth", e.target.value),
                    className: "w-full h-10 rounded-md border border-input bg-background px-3 text-sm",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "MM" }),
                      Array.from({ length: 12 }, (_, i) => /* @__PURE__ */ jsx("option", { value: String(i + 1).padStart(2, "0"), children: String(i + 1).padStart(2, "0") }, i + 1))
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "expiryYear", children: "Year" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    id: "expiryYear",
                    value: paymentData.expiryYear,
                    onChange: (e) => handleInputChange("expiryYear", e.target.value),
                    className: "w-full h-10 rounded-md border border-input bg-background px-3 text-sm",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "YY" }),
                      Array.from({ length: 10 }, (_, i) => {
                        const year = (/* @__PURE__ */ new Date()).getFullYear() + i;
                        return /* @__PURE__ */ jsx("option", { value: year.toString().slice(-2), children: year.toString().slice(-2) }, year);
                      })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "cvv", children: "CVV" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "cvv",
                    value: paymentData.cvv,
                    onChange: (e) => handleInputChange("cvv", e.target.value.replace(/\D/g, "")),
                    placeholder: "123",
                    maxLength: 4
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "cardHolderName", children: "Card Holder Name" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "cardHolderName",
                  value: paymentData.cardHolderName,
                  onChange: (e) => handleInputChange("cardHolderName", e.target.value),
                  placeholder: "John Doe"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "cnic", children: "CNIC Number (Optional)" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "cnic",
                  value: paymentData.cnicNumber,
                  onChange: (e) => handleInputChange("cnicNumber", e.target.value.replace(/\D/g, "")),
                  placeholder: "1234567890123",
                  maxLength: 13
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "May be required for verification purposes" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-primary/5 rounded-lg", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Your payment will be processed securely through Safepay" }) })
        ] }),
        error && /* @__PURE__ */ jsxs("div", { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5 text-destructive" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: error })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Order Summary" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Plan:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: selectedPlan.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Billing:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                "Every ",
                selectedPlan.period
              ] })
            ] }),
            originalPlanPrice !== null && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Original Price:" }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground line-through", children: [
                "Rs ",
                originalPlanPrice.toLocaleString()
              ] })
            ] }),
            planDiscountLabel && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Discount:" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-green-600", children: planDiscountLabel })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "border-t pt-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Total:" }),
              /* @__PURE__ */ jsxs("span", { className: "text-xl font-bold text-primary", children: [
                "Rs ",
                selectedPlan.price.toLocaleString()
              ] })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-muted/30 border rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(Shield, { className: "w-5 h-5 text-primary mt-0.5" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-medium text-sm", children: "Secure Payment" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your payment information is encrypted and processed securely by Safepay." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handlePayment,
            disabled: !selectedMethod || loading,
            className: "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
            children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }),
              "Processing..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Lock, { className: "w-5 h-5" }),
              "Pay Rs ",
              selectedPlan.price.toLocaleString()
            ] })
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-center text-muted-foreground", children: "By continuing, you agree to our Terms of Service and Privacy Policy" })
      ] })
    ] }) })
  ] });
}
export {
  SubscriptionPaymentPage
};
