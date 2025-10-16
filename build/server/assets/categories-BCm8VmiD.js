const CATEGORIES = [
  "Business",
  "Finance & Investing",
  "Philosophy",
  "Religion",
  "History",
  "Politics",
  "Literature",
  "Fiction",
  "Romance",
  "Thriller",
  "Mystery",
  "Science Fiction",
  "Fantasy",
  "Spirituality",
  "Self-Help",
  "Entrepreneurship",
  "Leadership",
  "Biographies",
  "Arts",
  "Music",
  "Cinema & Media",
  "Productivity",
  "Career Growth",
  "Travel",
  "Mathematics",
  "Science",
  "Technology",
  "Health",
  "Psychology"
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
