const CATEGORIES = [
  "Business",
  "Finance & Investing",
  "Self-Help",
  "Psychology",
  "Career Growth",
  "Entrepreneurship",
  "Productivity",
  "Philosophy",
  "History",
  "Politics",
  "Science Fiction",
  "Technology",
  "Biographies",
  "Religion",
  "Spirituality",
  "Travel",
  "Mathematics",
  "Science",
  "Health"
];
[
  { id: "1", name: "All", slug: "all" },
  ...CATEGORIES.map((category, index) => ({
    id: (index + 2).toString(),
    name: category,
    slug: category.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and")
  }))
];
export {
  CATEGORIES as C
};
