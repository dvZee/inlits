import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { EmailVerificationBanner } from "@/components/email-verification-banner";
import { CategoriesScroll } from "@/components/content/categories-scroll";
import { Home } from "@/pages/home";

export async function loader({ request }: LoaderFunctionArgs) {
  // Use hardcoded credentials for server-side (same as in supabase.ts)
  const supabaseUrl = "https://yvjrakgbqqazedjltflw.supabase.co";
  const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anJha2dicXFhemVkamx0Zmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMjIyNTIsImV4cCI6MjA1MjY5ODI1Mn0.tFpht9qLcCeilgnd9vmbF4abiJi96FvzmGZCOXL2DiU";

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  try {
    // Fetch all data in parallel including views and likes
    const [
      audiobooksResult,
      booksResult,
      podcastsResult,
      viewsData,
      likesData,
    ] = await Promise.all([
      supabase
        .from("audiobooks")
        .select(
          `
          id,
          title,
          description,
          cover_url,
          created_at,
          featured,
          category,
          categories,
          author:profiles!audiobooks_author_id_fkey (
            id,
            name,
            avatar_url,
            username
          )
        `
        )
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false }),

      supabase
        .from("books")
        .select(
          `
          id,
          title,
          description,
          cover_url,
          created_at,
          featured,
          category,
          author:profiles!books_author_id_fkey (
            id,
            name,
            avatar_url,
            username
          )
        `
        )
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false }),

      supabase
        .from("podcast_episodes")
        .select(
          `
          id,
          title,
          description,
          cover_url,
          duration,
          created_at,
          featured,
          category,
          categories,
          author:profiles!podcast_episodes_author_id_fkey (
            id,
            name,
            avatar_url,
            username
          )
        `
        )
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false }),

      supabase.from("content_views").select("content_id, content_type"),
      supabase
        .from("ratings")
        .select("content_id, content_type, rating")
        .eq("rating", 5),
    ]);

    return json({
      audiobooks: audiobooksResult.data || [],
      books: booksResult.data || [],
      podcasts: podcastsResult.data || [],
      articles: [],
      views: viewsData.data || [],
      likes: likesData.data || [],
    });
  } catch (error) {
    return json({
      audiobooks: [],
      books: [],
      podcasts: [],
      articles: [],
      views: [],
      likes: [],
    });
  }
}

const categories = [
  { id: "1", name: "All", slug: "all" },
  { id: "2", name: "Business", slug: "business" },
  { id: "3", name: "Finance & Investing", slug: "finance-investing" },
  { id: "4", name: "Self-Help", slug: "self-help" },
  { id: "5", name: "Psychology", slug: "psychology" },
  { id: "6", name: "Career Growth", slug: "career-growth" },
  { id: "7", name: "Entrepreneurship", slug: "entrepreneurship" },
  { id: "8", name: "Productivity", slug: "productivity" },
  { id: "9", name: "Philosophy", slug: "philosophy" },
  { id: "10", name: "History", slug: "history" },
  { id: "11", name: "Politics", slug: "politics" },
  { id: "13", name: "Technology", slug: "technology" },
  { id: "14", name: "Biographies", slug: "biographies" },
  { id: "15", name: "Religion", slug: "religion" },
  { id: "16", name: "Spirituality", slug: "spirituality" },
  { id: "17", name: "Travel", slug: "travel" },
  { id: "19", name: "Science", slug: "science" },
  { id: "20", name: "Health", slug: "health" },
  { id: "12", name: "Science Fiction", slug: "science-fiction" },
];

export default function IndexRoute() {
  const initialData = useLoaderData<typeof loader>();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <EmailVerificationBanner />
      <Sidebar onCollapse={setSidebarCollapsed} defaultCollapsed={false} />
      <CategoriesScroll
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        collapsed={sidebarCollapsed}
      />
      <main
        className={`transition-all duration-300 pt-[7.5rem] ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="container px-4 mx-auto pt-6">
          <Home initialData={initialData} selectedCategory={selectedCategory} />
        </div>
      </main>
    </div>
  );
}
