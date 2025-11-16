import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { u as useAuth, s as supabase } from "./server-build-CQlMvEI0.js";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Link as Link$1, Image as Image$1, Undo, Redo, ChevronLeft, ChevronDown, Plus, X } from "lucide-react";
import { I as Input } from "./input-bMzHZGfT.js";
import { L as Label } from "./label-C6HnzAcQ.js";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { C as CATEGORIES } from "./categories-Cr-YSiwM.js";
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
function TipTapEditor({ content, onChange, placeholder = "Start writing..." }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg"
        }
      }),
      Link.configure({
        openOnClick: false
      })
    ],
    content,
    onUpdate: ({ editor: editor2 }) => {
      onChange(editor2.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[400px] focus:outline-none"
      }
    },
    editable: true,
    autofocus: "end"
  });
  if (!editor) {
    return null;
  }
  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };
  const setLink = () => {
    const url = window.prompt("Enter URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "border rounded-lg overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "border-b p-2 bg-muted/50 flex flex-wrap gap-1", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => editor.chain().focus().toggleBold().run(),
          className: `p-2 rounded hover:bg-accent transition-colors ${editor.isActive("bold") ? "bg-accent" : ""}`,
          title: "Bold",
          children: /* @__PURE__ */ jsx(Bold, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => editor.chain().focus().toggleItalic().run(),
          className: `p-2 rounded hover:bg-accent transition-colors ${editor.isActive("italic") ? "bg-accent" : ""}`,
          title: "Italic",
          children: /* @__PURE__ */ jsx(Italic, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-border mx-1 my-auto" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          className: `p-2 rounded hover:bg-accent transition-colors ${editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""}`,
          title: "Heading 1",
          children: /* @__PURE__ */ jsx(Heading1, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          className: `p-2 rounded hover:bg-accent transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}`,
          title: "Heading 2",
          children: /* @__PURE__ */ jsx(Heading2, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-border mx-1 my-auto" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => editor.chain().focus().toggleBulletList().run(),
          className: `p-2 rounded hover:bg-accent transition-colors ${editor.isActive("bulletList") ? "bg-accent" : ""}`,
          title: "Bullet List",
          children: /* @__PURE__ */ jsx(List, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
          className: `p-2 rounded hover:bg-accent transition-colors ${editor.isActive("orderedList") ? "bg-accent" : ""}`,
          title: "Numbered List",
          children: /* @__PURE__ */ jsx(ListOrdered, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => editor.chain().focus().toggleBlockquote().run(),
          className: `p-2 rounded hover:bg-accent transition-colors ${editor.isActive("blockquote") ? "bg-accent" : ""}`,
          title: "Quote",
          children: /* @__PURE__ */ jsx(Quote, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-border mx-1 my-auto" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: setLink,
          className: `p-2 rounded hover:bg-accent transition-colors ${editor.isActive("link") ? "bg-accent" : ""}`,
          title: "Add Link",
          children: /* @__PURE__ */ jsx(Link$1, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: addImage,
          className: "p-2 rounded hover:bg-accent transition-colors",
          title: "Add Image",
          children: /* @__PURE__ */ jsx(Image$1, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-border mx-1 my-auto" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => editor.chain().focus().undo().run(),
          disabled: !editor.can().undo(),
          className: "p-2 rounded hover:bg-accent transition-colors disabled:opacity-50",
          title: "Undo",
          children: /* @__PURE__ */ jsx(Undo, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => editor.chain().focus().redo().run(),
          disabled: !editor.can().redo(),
          className: "p-2 rounded hover:bg-accent transition-colors disabled:opacity-50",
          title: "Redo",
          children: /* @__PURE__ */ jsx(Redo, { className: "w-4 h-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-4", children: /* @__PURE__ */ jsx(EditorContent, { editor }) })
  ] });
}
function NewArticlePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [content, setContent] = useState("");
  const [showSeriesDialog, setShowSeriesDialog] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [series, setSeries] = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSeriesDropdown, setShowSeriesDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("draft");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [creatingNewSeries, setCreatingNewSeries] = useState(false);
  const [title, setTitle] = useState("");
  const state = location.state;
  const isEditMode = state == null ? void 0 : state.editMode;
  const editItem = state == null ? void 0 : state.item;
  useEffect(() => {
    if (isEditMode && editItem) {
      setTitle(editItem.title || "");
      setContent(editItem.content || "");
      setSelectedStatus(editItem.status || "draft");
      setSelectedCategory(editItem.category || "");
      const categories = editItem.categories ?? (editItem.category ? [editItem.category] : []);
      setSelectedCategories(categories);
      if (editItem.cover_url) {
        setPreviewUrl(editItem.cover_url);
      }
    }
  }, [isEditMode, editItem]);
  useEffect(() => {
    const loadSeries = async () => {
      if (!profile) return;
      try {
        const { data, error: error2 } = await supabase.from("series").select("*").eq("author_id", profile.id).order("created_at", { ascending: false });
        if (error2) throw error2;
        setSeries(data || []);
        if (isEditMode && (editItem == null ? void 0 : editItem.series_id)) {
          const editSeries = data == null ? void 0 : data.find((s) => s.id === editItem.series_id);
          if (editSeries) {
            setSelectedSeries(editSeries);
          }
        }
      } catch (error2) {
        console.error("Error loading series:", error2);
        setError("Failed to load series. Please try again.");
      } finally {
        setLoadingSeries(false);
      }
    };
    loadSeries();
  }, [profile, isEditMode, editItem]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;
      if (!target.closest("[data-dropdown]")) {
        setShowStatusDropdown(false);
        setShowSeriesDropdown(false);
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  const handleImageChange = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Cover image must be less than 2MB");
      return;
    }
    setCoverImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };
  const handleCreateSeries = async (e) => {
    e.preventDefault();
    if (!profile) {
      setError("You must be logged in to create series");
      return;
    }
    setCreatingNewSeries(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const title2 = formData.get("title");
    const description = formData.get("description");
    try {
      const { data, error: error2 } = await supabase.from("series").insert({
        title: title2,
        description,
        author_id: profile.id
      }).select().single();
      if (error2) throw error2;
      setSeries((prev) => [data, ...prev]);
      setSelectedSeries(data);
      setShowSeriesDialog(false);
    } catch (error2) {
      console.error("Error creating series:", error2);
      setError(error2 instanceof Error ? error2.message : "Failed to create series");
    } finally {
      setCreatingNewSeries(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!content.trim()) {
      setError("Content is required");
      return;
    }
    if (selectedCategories.length === 0) {
      setError("At least one category is required");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      let coverUrl = previewUrl;
      if (coverImage) {
        const fileExt = coverImage.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${profile.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("article-covers").upload(filePath, coverImage);
        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(uploadError.message || "Failed to upload cover image");
        }
        const { data: { publicUrl } } = supabase.storage.from("article-covers").getPublicUrl(filePath);
        coverUrl = publicUrl;
      }
      const articleData = {
        title,
        content,
        cover_url: coverUrl,
        author_id: profile.id,
        status: selectedStatus,
        series_id: selectedSeries == null ? void 0 : selectedSeries.id,
        category: selectedCategories[0] || null,
        // Keep first category for backward compatibility
        categories: selectedCategories,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (isEditMode && editItem) {
        const { error: updateError } = await supabase.from("articles").update(articleData).eq("id", editItem.id).eq("author_id", profile.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("articles").insert(articleData);
        if (insertError) throw insertError;
      }
      setSuccess(true);
      setTimeout(() => {
        navigate(`/dashboard/${profile.username}/content`);
      }, 1500);
    } catch (error2) {
      console.error("Error saving article:", error2);
      setError(error2 instanceof Error ? error2.message : "Failed to save article");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate(-1),
          className: "p-2 hover:bg-[#1B4AB1] hover:text-white rounded-lg transition-colors text-primary",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: isEditMode ? "Edit Article" : "New Article" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: isEditMode ? "Update your article" : "Create a new article or blog post" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx(Label, { children: "Cover Image" }),
        /* @__PURE__ */ jsxs("div", { className: "relative transition-colors border-2 border-dashed rounded-lg aspect-video border-muted hover:border-primary/50 group", children: [
          previewUrl ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: previewUrl,
                alt: "Cover preview",
                className: "object-cover w-full h-full rounded-lg"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center transition-opacity rounded-lg opacity-0 bg-black/50 group-hover:opacity-100", children: /* @__PURE__ */ jsx("span", { className: "text-sm text-white", children: "Change Image" }) })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Image$1, { className: "w-8 h-8 mb-2" }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-center", children: [
              /* @__PURE__ */ jsx("p", { children: "Click or drag to upload cover image" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs", children: "Maximum size: 2MB" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              accept: "image/*",
              onChange: handleImageChange,
              className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "title", children: "Title" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "title",
            name: "title",
            value: title,
            onChange: (e) => setTitle(e.target.value),
            placeholder: "Enter article title",
            required: true,
            className: "focus-visible:ring-2 focus-visible:ring-primary"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", "data-dropdown": true, children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setShowStatusDropdown(!showStatusDropdown),
                className: "w-full h-10 px-3 text-left flex items-center justify-between rounded-md border border-input bg-background text-sm transition-colors hover:bg-[#1B4AB1] hover:text-white",
                children: [
                  /* @__PURE__ */ jsx("span", { children: selectedStatus === "draft" ? "Draft" : selectedStatus === "published" ? "Published" : "Archived" }),
                  /* @__PURE__ */ jsx(
                    ChevronDown,
                    {
                      className: `w-4 h-4 transition-transform duration-200 ${showStatusDropdown ? "rotate-180" : ""}`
                    }
                  )
                ]
              }
            ),
            showStatusDropdown && /* @__PURE__ */ jsx("div", { className: "absolute z-50 w-full py-1 mt-1 duration-100 border rounded-md shadow-lg bg-background animate-in fade-in-0 zoom-in-95", children: ["draft", "published", "archived"].map((status) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setSelectedStatus(status);
                  setShowStatusDropdown(false);
                },
                className: `w-full px-3 py-1.5 text-sm text-left transition-colors hover:bg-[#1B4AB1] hover:text-white rounded-md ${selectedStatus === status ? "bg-[#1B4AB1] text-white" : ""}`,
                children: status.charAt(0).toUpperCase() + status.slice(1)
              },
              status
            )) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Series" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", "data-dropdown": true, children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setShowSeriesDropdown(!showSeriesDropdown),
                className: "w-full h-10 px-3 text-left flex items-center justify-between rounded-md border border-input bg-background text-sm transition-colors hover:bg-[#1B4AB1] hover:text-white",
                children: [
                  /* @__PURE__ */ jsx("span", { children: (selectedSeries == null ? void 0 : selectedSeries.title) || "No Series" }),
                  /* @__PURE__ */ jsx(
                    ChevronDown,
                    {
                      className: `w-4 h-4 transition-transform duration-200 ${showSeriesDropdown ? "rotate-180" : ""}`
                    }
                  )
                ]
              }
            ),
            showSeriesDropdown && /* @__PURE__ */ jsxs("div", { className: "absolute z-50 w-full py-1 mt-1 duration-100 border rounded-md shadow-lg bg-background animate-in fade-in-0 zoom-in-95", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setSelectedSeries(null);
                    setShowSeriesDropdown(false);
                  },
                  className: `w-full px-3 py-1.5 text-sm text-left transition-colors hover:bg-[#1B4AB1] hover:text-white rounded-md ${!selectedSeries ? "bg-[#1B4AB1] text-white" : ""}`,
                  children: "No Series"
                }
              ),
              series.map((s) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setSelectedSeries(s);
                    setShowSeriesDropdown(false);
                  },
                  className: `w-full px-3 py-1.5 text-sm text-left transition-colors hover:bg-[#1B4AB1] hover:text-white rounded-md ${(selectedSeries == null ? void 0 : selectedSeries.id) === s.id ? "bg-[#1B4AB1] text-white" : ""}`,
                  children: s.title
                },
                s.id
              )),
              /* @__PURE__ */ jsx("div", { className: "px-1 pt-1 mt-1 border-t", children: /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setShowSeriesDialog(true);
                    setShowSeriesDropdown(false);
                  },
                  className: "w-full px-2 py-1.5 text-sm text-primary rounded-md hover:bg-[#1B4AB1] hover:text-white transition-colors flex items-center gap-1",
                  children: [
                    /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                    "Create New Series"
                  ]
                }
              ) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Categories" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", "data-dropdown": true, children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setShowCategoryDropdown(!showCategoryDropdown),
                className: "w-full h-10 px-3 text-left flex items-center justify-between rounded-md border border-input bg-background text-sm transition-colors hover:bg-[#1B4AB1] hover:text-white",
                children: [
                  /* @__PURE__ */ jsx("span", { children: selectedCategories.length === 0 ? "Select Categories" : selectedCategories.length === 1 ? selectedCategories[0] : `${selectedCategories.length} categories selected` }),
                  /* @__PURE__ */ jsx(
                    ChevronDown,
                    {
                      className: `w-4 h-4 transition-transform duration-200 ${showCategoryDropdown ? "rotate-180" : ""}`
                    }
                  )
                ]
              }
            ),
            showCategoryDropdown && /* @__PURE__ */ jsxs("div", { className: "absolute z-50 w-full py-2 mt-1 duration-100 border rounded-md shadow-lg bg-background animate-in fade-in-0 zoom-in-95 max-h-60 overflow-y-auto", children: [
              /* @__PURE__ */ jsx("div", { className: "px-3 py-2 text-xs text-muted-foreground border-b", children: "Select only relevant categories" }),
              CATEGORIES.map((category) => /* @__PURE__ */ jsxs(
                "label",
                {
                  className: `flex items-center gap-2 w-full px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground rounded-md ${selectedCategories.includes(category) ? "bg-primary text-primary-foreground" : ""}`,
                  children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: selectedCategories.includes(category),
                        onChange: (e) => {
                          if (e.target.checked) {
                            setSelectedCategories((prev) => [...prev, category]);
                          } else {
                            setSelectedCategories((prev) => prev.filter((c) => c !== category));
                          }
                        },
                        className: "rounded border-input"
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { children: category })
                  ]
                },
                category
              )),
              /* @__PURE__ */ jsx("div", { className: "px-3 py-2 border-t", children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setSelectedCategories([]);
                  },
                  className: "text-xs text-muted-foreground hover:text-primary transition-colors",
                  children: "Clear all"
                }
              ) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "content", children: "Content" }),
        /* @__PURE__ */ jsx(
          TipTapEditor,
          {
            content,
            onChange: setContent,
            placeholder: "Write your article content here..."
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "px-4 py-3 text-sm rounded-lg bg-destructive/10 text-destructive", children: error }),
      success && /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 text-sm text-green-500 rounded-lg bg-green-500/10", children: [
        "Article ",
        isEditMode ? "updated" : "created",
        " successfully! Redirecting..."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => navigate(-1),
            className: "px-4 py-2 text-sm rounded-lg border hover:bg-accent transition-colors",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2",
            children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" }),
              isEditMode ? "Updating..." : "Creating..."
            ] }) : isEditMode ? "Update Article" : "Create Article"
          }
        )
      ] })
    ] }),
    showSeriesDialog && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        onClick: () => setShowSeriesDialog(false),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-background rounded-xl shadow-xl w-full max-w-[400px] mx-4 animate-in fade-in-0 zoom-in-95 duration-200",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [
                /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Create New Series" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowSeriesDialog(false),
                    className: "p-1 hover:bg-[#1B4AB1] hover:text-white rounded-lg transition-colors",
                    children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("form", { onSubmit: handleCreateSeries, className: "p-4 space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "series-title", children: "Title" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      id: "series-title",
                      name: "title",
                      placeholder: "Enter series title",
                      required: true,
                      className: "focus-visible:ring-2 focus-visible:ring-primary"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "series-description", children: "Description" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      id: "series-description",
                      name: "description",
                      placeholder: "Enter series description",
                      className: "w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors",
                      required: true
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowSeriesDialog(false),
                      className: "px-4 py-2 text-sm rounded-lg border border-input hover:bg-[#1B4AB1] hover:text-white transition-colors",
                      children: "Cancel"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "submit",
                      disabled: creatingNewSeries,
                      className: "px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-[#1B4AB1] hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2",
                      children: creatingNewSeries ? /* @__PURE__ */ jsxs(Fragment, { children: [
                        /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" }),
                        "Creating..."
                      ] }) : "Create Series"
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      }
    )
  ] });
}
export {
  NewArticlePage
};
