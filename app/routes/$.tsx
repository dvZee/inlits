import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import App from '@/App';

export function loader({ params }: LoaderFunctionArgs) {
  params['*'];
  return null;
}

export const meta: MetaFunction = ({ location }) => {
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);

  let title = "Inlits: Urdu Audiobooks, Book Summaries & Self Growth";
  let description = "Read and listen to thousands of premium book summaries, audiobooks, and e-books in Urdu. Expand your mind and invest in your personal growth with Inlits.";

  if (pathname === "/") {
    title = "Inlits: Urdu Audiobooks, Book Summaries & Self Growth";
    description = "Read and listen to thousands of premium book summaries, audiobooks, and e-books in Urdu. Expand your mind and invest in your personal growth with Inlits.";
  } else if (pathname === "/search") {
    const query = searchParams.get("q");
    if (query) {
      const decodedQuery = decodeURIComponent(query);
      title = `Urdu Summary of "${decodedQuery}" | Listen & Read on Inlits`;
      description = `Access the complete Urdu audiobook summary and key takeaways of "${decodedQuery}" on Inlits. Start listening and investing in your growth today.`;
    } else {
      title = "Search Book Summaries & Audiobooks in Urdu - Inlits";
      description = "Search and discover Urdu summaries, audiobooks, and e-books on business, self-help, psychology, and productivity on Inlits.";
    }
  } else if (pathname.startsWith("/player/")) {
    const parts = pathname.split("/");
    const idParam = parts[parts.length - 1];
    const isPodcast = idParam ? idParam.startsWith("podcast") : false;
    
    let contentName = "";
    if (idParam) {
      const slugParts = idParam.split("-");
      const cleanedParts = slugParts.filter(p => p !== "audiobook" && p !== "podcast" && isNaN(Number(p)));
      contentName = cleanedParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }

    if (contentName) {
      title = `Urdu Summary of "${contentName}" | Listen on Inlits`;
      description = `Listen to the comprehensive Urdu audiobook summary of "${contentName}" on Inlits. Access key insights and learn on the go.`;
    } else {
      title = isPodcast ? "Listen to Premium Urdu Podcasts - Inlits" : "Listen to Premium Urdu Audiobook Summaries - Inlits";
      description = isPodcast 
        ? "Explore premium Urdu podcasts on business, productivity, and mindset on Inlits."
        : "Listen to high-quality Urdu audiobook summaries of bestselling books on Inlits.";
    }
  } else if (pathname.startsWith("/reader/")) {
    const parts = pathname.split("/");
    const idParam = parts[parts.length - 1];
    let contentName = "";
    if (idParam) {
      const slugParts = idParam.split("-");
      const cleanedParts = slugParts.filter(p => p !== "ebook" && p !== "book" && isNaN(Number(p)));
      contentName = cleanedParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }

    if (contentName) {
      title = `Read "${contentName}" Urdu Summary & E-Book | Inlits`;
      description = `Read key takeaways, notes, and structured summaries of "${contentName}" in Urdu on Inlits. Expand your knowledge anywhere.`;
    } else {
      title = "Read Premium Urdu Summaries & E-Books - Inlits";
      description = "Read high-quality structured Urdu summaries and e-books on business, self-help, and productivity on Inlits.";
    }
  } else if (pathname === "/library") {
    title = "My Library | Personal Growth & Learning Goals - Inlits";
    description = "Track your learning goals, saved summaries, premium audiobooks, and history in your personal Inlits library.";
  } else if (pathname === "/community") {
    title = "Inlits Community | Book Clubs, Discussions & Study Groups";
    description = "Join Urdu book clubs, start discussions, form study groups, and take learning challenges with the Inlits community.";
  } else if (pathname === "/request-book") {
    title = "Request a Book Summary - Inlits Premium";
    description = "Request any book summary you want, and the Inlits team will research, write, and record it in Urdu in under 72 hours.";
  } else if (pathname === "/subscription") {
    title = "Inlits Premium Plans | Invest in Your Personal Growth";
    description = "Unlock unlimited Urdu audiobook summaries, e-books, high-quality ad-free audio, and custom book requests with Inlits Premium.";
  } else if (pathname === "/about") {
    title = "About Inlits | Urdu Audiobooks & Summaries Platform";
    description = "Discover the mission of Inlits. We make world-class books and summaries accessible in Urdu to empower learners across the globe.";
  } else if (pathname === "/contact") {
    title = "Contact Inlits Support | We are Here to Help";
    description = "Have questions or feedback? Get in touch with the Inlits support team for help with your account, billing, or suggestions.";
  } else if (pathname === "/privacy") {
    title = "Privacy Policy - Inlits";
    description = "Read the Inlits privacy policy to understand how we collect, use, and protect your personal information.";
  } else if (pathname === "/terms") {
    title = "Terms of Service - Inlits";
    description = "Read the Inlits terms of service and conditions for using our platform, audiobooks, and subscriptions.";
  }

  const schemas: any[] = [
    {
      "script:ldjson": {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Inlits",
        "url": "https://inlits.com",
        "logo": "https://inlits.com/Black%20&%20Blue%20Minimalist%20Modern%20Initial%20Font%20Logo.png",
        "description": "Professional Urdu Audiobook Summaries & E-Books platform."
      }
    },
    {
      "script:ldjson": {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Inlits",
        "url": "https://inlits.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://inlits.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    }
  ];

  if (pathname.startsWith("/player/")) {
    const parts = pathname.split("/");
    const idParam = parts[parts.length - 1];
    let contentName = "";
    if (idParam) {
      const slugParts = idParam.split("-");
      const cleanedParts = slugParts.filter(p => p !== "audiobook" && p !== "podcast" && isNaN(Number(p)));
      contentName = cleanedParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
    if (contentName) {
      schemas.push({
        "script:ldjson": {
          "@context": "https://schema.org",
          "@type": "Audiobook",
          "name": contentName,
          "description": `Listen to the comprehensive Urdu audiobook summary of "${contentName}" on Inlits.`,
          "readBy": {
            "@type": "Person",
            "name": "Inlits Narrators"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Inlits"
          }
        }
      });
    }
  } else if (pathname.startsWith("/reader/")) {
    const parts = pathname.split("/");
    const idParam = parts[parts.length - 1];
    let contentName = "";
    if (idParam) {
      const slugParts = idParam.split("-");
      const cleanedParts = slugParts.filter(p => p !== "ebook" && p !== "book" && isNaN(Number(p)));
      contentName = cleanedParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
    if (contentName) {
      schemas.push({
        "script:ldjson": {
          "@context": "https://schema.org",
          "@type": "Book",
          "name": contentName,
          "description": `Read structured Urdu summaries, takeaways, and lessons of "${contentName}" on Inlits.`,
          "publisher": {
            "@type": "Organization",
            "name": "Inlits"
          }
        }
      });
    }
  }

  return [
    { title },
    { name: "description", content: description },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { charSet: "utf-8" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Inlits" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...schemas,
  ];
};

export default function CatchAllRoute() {
  return <App />;
}
