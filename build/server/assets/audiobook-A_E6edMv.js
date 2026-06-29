import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { u as useAuth, s as supabase } from "./server-build-BGC-wbDo.js";
import { ChevronLeft, AlertCircle, Image, ChevronDown, Plus, Trash2, Upload, X } from "lucide-react";
import { I as Input } from "./input-bCdpbejb.js";
import { L as Label } from "./label-B7hQ0ymw.js";
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
const SUPPORTED_AUDIO_FORMATS = ["mp3", "wav", "m4a", "aac"];
const MAX_FILE_SIZE = 500 * 1024 * 1024;
function NewAudiobookPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [chapters, setChapters] = useState([
    { id: "1", title: "Chapter 1", audioFile: null, duration: "00:00" }
  ]);
  const [error, setError] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSeriesDropdown, setShowSeriesDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("draft");
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFullBook, setIsFullBook] = useState(true);
  const [series, setSeries] = useState([]);
  const [showSeriesDialog, setShowSeriesDialog] = useState(false);
  const [creatingNewSeries, setCreatingNewSeries] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [narrator, setNarrator] = useState("");
  const state = location.state;
  const isEditMode = state == null ? void 0 : state.editMode;
  const editItem = state == null ? void 0 : state.item;
  useEffect(() => {
    var _a;
    if (isEditMode && editItem) {
      setTitle(editItem.title || "");
      setDescription(editItem.description || "");
      setSelectedStatus(editItem.status || "draft");
      setPrice(((_a = editItem.price) == null ? void 0 : _a.toString()) || "0");
      setNarrator(editItem.narrator || "");
      setSelectedCategory(editItem.category || "");
      const categories = editItem.categories ?? (editItem.category ? [editItem.category] : []);
      setSelectedCategories(categories);
      setIsFullBook(editItem.isFullBook ?? true);
      if (editItem.cover_url) {
        setPreviewUrl(editItem.cover_url);
      }
      if (editItem.chapters) {
        setChapters(editItem.chapters.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          audioFile: null,
          duration: chapter.duration
        })));
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
      }
    };
    loadSeries();
  }, [profile, isEditMode, editItem]);
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
  const handleAudioChange = async (id, file) => {
    var _a;
    const extension = (_a = file.name.split(".").pop()) == null ? void 0 : _a.toLowerCase();
    if (!extension || !SUPPORTED_AUDIO_FORMATS.includes(extension)) {
      setError(`Unsupported file format. Please upload ${SUPPORTED_AUDIO_FORMATS.join(", ")} files`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 500MB");
      return;
    }
    try {
      const duration = await getAudioDuration(file);
      const formattedDuration = formatDuration(duration);
      setChapters(
        (prev) => prev.map(
          (chapter) => chapter.id === id ? { ...chapter, audioFile: file, duration: formattedDuration } : chapter
        )
      );
      setError(null);
    } catch (error2) {
      console.error("Error getting audio duration:", error2);
      setError("Failed to process audio file. Please try again.");
    }
  };
  const getAudioDuration = (file) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      audio.addEventListener("loadedmetadata", () => {
        URL.revokeObjectURL(objectUrl);
        resolve(audio.duration);
      });
      audio.addEventListener("error", () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load audio file"));
      });
      audio.src = objectUrl;
    });
  };
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        title: `Chapter ${prev.length + 1}`,
        audioFile: null,
        duration: "00:00"
      }
    ]);
  };
  const removeChapter = (id) => {
    if (chapters.length > 1) {
      setChapters((prev) => prev.filter((chapter) => chapter.id !== id));
    }
  };
  const updateChapter = (id, field, value) => {
    setChapters(
      (prev) => prev.map(
        (chapter) => chapter.id === id ? { ...chapter, [field]: value } : chapter
      )
    );
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
    const description2 = formData.get("description");
    try {
      const { data, error: error2 } = await supabase.from("series").insert({
        title: title2,
        description: description2,
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
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    if (!narrator.trim()) {
      setError("Narrator is required");
      return;
    }
    if (!selectedCategory) {
      if (selectedCategories.length === 0) {
        setError("At least one category is required");
        return;
      }
    }
    if (!isEditMode && chapters.some((chapter) => !chapter.audioFile)) {
      setError("Please upload audio files for all chapters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let coverUrl = previewUrl;
      if (coverImage) {
        const fileExt = coverImage.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${profile.id}/${fileName}`;
        console.log("Uploading cover image:", filePath);
        const { error: coverError } = await supabase.storage.from("audiobook-covers").upload(filePath, coverImage);
        if (coverError) {
          console.error("Cover upload error:", coverError);
          throw new Error(`Failed to upload cover image: ${coverError.message}`);
        }
        const { data: { publicUrl } } = supabase.storage.from("audiobook-covers").getPublicUrl(filePath);
        coverUrl = publicUrl;
      }
      const audiobookData = {
        title,
        description,
        cover_url: coverUrl,
        price: parseFloat(price) || 0,
        narrator,
        author_id: profile.id,
        status: selectedStatus,
        series_id: selectedSeries == null ? void 0 : selectedSeries.id,
        category: selectedCategories[0] || null,
        // Keep first category for backward compatibility
        categories: selectedCategories,
        is_full_book: isFullBook,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log("Creating audiobook with data:", audiobookData);
      if (isEditMode && editItem) {
        const { error: updateError } = await supabase.from("audiobooks").update(audiobookData).eq("id", editItem.id).eq("author_id", profile.id);
        if (updateError) {
          console.error("Audiobook update error:", updateError);
          throw updateError;
        }
        const { data: existingChapters } = await supabase.from("audiobook_chapters").select("id").eq("audiobook_id", editItem.id);
        const existingChapterIds = (existingChapters == null ? void 0 : existingChapters.map((c) => c.id)) || [];
        const currentChapterIds = chapters.map((c) => c.id);
        const chaptersToDelete = existingChapterIds.filter((id) => !currentChapterIds.includes(id));
        if (chaptersToDelete.length > 0) {
          const { error: deleteError } = await supabase.from("audiobook_chapters").delete().in("id", chaptersToDelete);
          if (deleteError) {
            console.error("Chapter deletion error:", deleteError);
            throw deleteError;
          }
        }
        for (const chapter of chapters) {
          if (chapter.audioFile) {
            const audioExt = chapter.audioFile.name.split(".").pop();
            const audioFileName = `${Math.random()}.${audioExt}`;
            const audioFilePath = `${profile.id}/${editItem.id}/${audioFileName}`;
            console.log("Uploading chapter audio:", audioFilePath);
            const { error: uploadError } = await supabase.storage.from("audiobooks").upload(audioFilePath, chapter.audioFile);
            if (uploadError) {
              console.error("Chapter audio upload error:", uploadError);
              throw uploadError;
            }
            const { data: { publicUrl: audioUrl } } = supabase.storage.from("audiobooks").getPublicUrl(audioFilePath);
            const { error: chapterError } = await supabase.from("audiobook_chapters").update({
              title: chapter.title,
              audio_url: audioUrl,
              duration: chapter.duration
            }).eq("id", chapter.id).eq("audiobook_id", editItem.id);
            if (chapterError) {
              console.error("Chapter update error:", chapterError);
              throw chapterError;
            }
          } else {
            const { error: chapterError } = await supabase.from("audiobook_chapters").update({
              title: chapter.title,
              duration: chapter.duration
            }).eq("id", chapter.id).eq("audiobook_id", editItem.id);
            if (chapterError) {
              console.error("Chapter update error:", chapterError);
              throw chapterError;
            }
          }
        }
      } else {
        console.log("Creating new audiobook...");
        const { error: insertError, data: audiobook } = await supabase.from("audiobooks").insert(audiobookData).select().single();
        if (insertError) {
          console.error("Audiobook creation error:", insertError);
          throw insertError;
        }
        console.log("Audiobook created:", audiobook);
        for (const [index, chapter] of chapters.entries()) {
          if (!chapter.audioFile) continue;
          const audioExt = chapter.audioFile.name.split(".").pop();
          const audioFileName = `${Math.random()}.${audioExt}`;
          const audioFilePath = `${profile.id}/${audiobook.id}/${audioFileName}`;
          console.log("Uploading chapter audio:", audioFilePath);
          const { error: uploadError } = await supabase.storage.from("audiobooks").upload(audioFilePath, chapter.audioFile);
          if (uploadError) {
            console.error("Chapter audio upload error:", uploadError);
            throw uploadError;
          }
          const { data: { publicUrl: audioUrl } } = supabase.storage.from("audiobooks").getPublicUrl(audioFilePath);
          const { error: chapterError } = await supabase.from("audiobook_chapters").insert({
            audiobook_id: audiobook.id,
            title: chapter.title,
            audio_url: audioUrl,
            duration: chapter.duration,
            order: index + 1
          });
          if (chapterError) {
            console.error("Chapter creation error:", chapterError);
            throw chapterError;
          }
        }
      }
      navigate(`/dashboard/${profile.username}/content`);
    } catch (error2) {
      console.error("Error saving audiobook:", error2);
      setError(error2 instanceof Error ? error2.message : "Failed to save audiobook");
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
          className: "p-2 hover:bg-accent rounded-lg transition-colors",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: isEditMode ? "Edit Audiobook" : "New Audiobook" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: isEditMode ? "Update your audiobook" : "Create a new audiobook" })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "mb-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: error })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx(Label, { children: "Cover Image" }),
        /* @__PURE__ */ jsxs("div", { className: "aspect-[2/3] w-48 relative rounded-lg border-2 border-dashed hover:border-primary/50 transition-colors", children: [
          previewUrl ? /* @__PURE__ */ jsx(
            "img",
            {
              src: previewUrl,
              alt: "Cover preview",
              className: "w-full h-full object-cover rounded-lg"
            }
          ) : /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Image, { className: "w-8 h-8 mb-2" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-center px-4", children: "Click or drag to upload cover image" })
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
            value: title,
            onChange: (e) => setTitle(e.target.value),
            placeholder: "Enter audiobook title",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "description", children: "Description" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "description",
            value: description,
            onChange: (e) => setDescription(e.target.value),
            placeholder: "What's your audiobook about?",
            className: "min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", "data-dropdown": true, children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setShowStatusDropdown(!showStatusDropdown),
                className: "w-full h-10 px-3 text-left flex items-center justify-between rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent",
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
                className: `w-full px-3 py-1.5 text-sm text-left transition-colors hover:bg-accent rounded-md ${selectedStatus === status ? "bg-primary/10 text-primary" : ""}`,
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
                className: "w-full h-10 px-3 text-left flex items-center justify-between rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent",
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
                  className: `w-full px-3 py-1.5 text-sm text-left transition-colors hover:bg-accent rounded-md ${!selectedSeries ? "bg-primary/10 text-primary" : ""}`,
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
                  className: `w-full px-3 py-1.5 text-sm text-left transition-colors hover:bg-accent rounded-md ${(selectedSeries == null ? void 0 : selectedSeries.id) === s.id ? "bg-primary/10 text-primary" : ""}`,
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
                  className: "w-full px-2 py-1.5 text-sm text-primary rounded-md hover:bg-accent transition-colors flex items-center gap-1",
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
                className: "w-full h-10 px-3 text-left flex items-center justify-between rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent",
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
              /* @__PURE__ */ jsx("div", { className: "px-3 py-2 text-xs text-muted-foreground border-b", children: "Select multiple categories (recommended: 2-3)" }),
              CATEGORIES.map((category) => /* @__PURE__ */ jsxs(
                "label",
                {
                  className: `flex items-center gap-2 w-full px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-accent ${selectedCategories.includes(category) ? "bg-primary/10 text-primary" : ""}`,
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
        /* @__PURE__ */ jsx(Label, { children: "Type" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "radio",
                checked: isFullBook,
                onChange: () => setIsFullBook(true),
                className: "w-4 h-4 border-input"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Full Audiobook" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "radio",
                checked: !isFullBook,
                onChange: () => setIsFullBook(false),
                className: "w-4 h-4 border-input"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Book Summary" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "narrator", children: "Narrator" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "narrator",
            value: narrator,
            onChange: (e) => setNarrator(e.target.value),
            placeholder: "Enter narrator's name",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "price", children: "Price" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", children: "$" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "price",
              type: "number",
              min: "0",
              step: "0.01",
              value: price,
              onChange: (e) => setPrice(e.target.value),
              className: "pl-7",
              placeholder: "0.00"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Leave empty or set to 0 for free content" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(Label, { children: "Chapters" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: addChapter,
              className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Add Chapter" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: chapters.map((chapter) => /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-4 rounded-lg border", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                value: chapter.title,
                onChange: (e) => updateChapter(chapter.id, "title", e.target.value),
                placeholder: "Chapter title",
                className: "max-w-sm"
              }
            ),
            chapters.length > 1 && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => removeChapter(chapter.id),
                className: "p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors",
                children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "file",
                  accept: ".mp3,.wav,.m4a,.aac",
                  onChange: (e) => {
                    var _a;
                    const file = (_a = e.target.files) == null ? void 0 : _a[0];
                    if (file) handleAudioChange(chapter.id, file);
                  },
                  className: "hidden",
                  id: `audio-${chapter.id}`
                }
              ),
              /* @__PURE__ */ jsxs(
                "label",
                {
                  htmlFor: `audio-${chapter.id}`,
                  className: "flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx(Upload, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm", children: chapter.audioFile ? chapter.audioFile.name : "Upload audio file" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Supported formats: MP3, WAV, M4A, AAC (max 500MB)" })
            ] }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "text",
                value: chapter.duration,
                readOnly: true,
                placeholder: "Duration",
                className: "w-32 bg-muted"
              }
            )
          ] })
        ] }, chapter.id)) })
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
            className: "px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50",
            children: loading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
              /* @__PURE__ */ jsx("span", { children: isEditMode ? "Updating..." : "Creating..." })
            ] }) : isEditMode ? "Update Audiobook" : "Create Audiobook"
          }
        )
      ] })
    ] }),
    showSeriesDialog && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
        onClick: () => setShowSeriesDialog(false),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-background rounded-xl shadow-xl w-[400px] mx-4 relative animate-in fade-in-0 zoom-in-95 duration-200",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [
                /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Create New Series" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowSeriesDialog(false),
                    className: "p-1 hover:bg-accent rounded-lg transition-colors",
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
                      required: true
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
                      className: "w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
                      className: "px-4 py-2 text-sm rounded-lg border hover:bg-accent transition-colors",
                      children: "Cancel"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "submit",
                      disabled: creatingNewSeries,
                      className: "px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2",
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
  NewAudiobookPage
};
