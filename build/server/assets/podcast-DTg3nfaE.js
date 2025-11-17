import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { u as useAuth, s as supabase } from "./server-build-B2NqiNl4.js";
import { ChevronLeft, AlertCircle, Image, Upload, ChevronDown } from "lucide-react";
import { I as Input } from "./input-BlbeFG63.js";
import { L as Label } from "./label-BBggIstM.js";
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
function NewPodcastPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;
      if (!target.closest("[data-dropdown]")) {
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
  const handleAudioChange = (e) => {
    var _a, _b;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    const extension = (_b = file.name.split(".").pop()) == null ? void 0 : _b.toLowerCase();
    if (!extension || !SUPPORTED_AUDIO_FORMATS.includes(extension)) {
      setError(`Unsupported file format. Please upload ${SUPPORTED_AUDIO_FORMATS.join(", ")} files`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 500MB");
      return;
    }
    setAudioFile(file);
    setError(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile || !audioFile) {
      setError("Please select an audio file");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title");
      const description = formData.get("description");
      const duration = formData.get("duration");
      const tags = formData.get("tags").split(",").map((tag) => tag.trim());
      if (selectedCategories.length === 0) {
        setError("At least one category is required");
        return;
      }
      let coverUrl = "";
      if (coverImage) {
        const fileExt = coverImage.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${profile.id}/${fileName}`;
        const { error: coverError } = await supabase.storage.from("audiobook-covers").upload(filePath, coverImage);
        if (coverError) throw coverError;
        const { data: { publicUrl } } = supabase.storage.from("audiobook-covers").getPublicUrl(filePath);
        coverUrl = publicUrl;
      }
      const audioExt = audioFile.name.split(".").pop();
      const audioFileName = `${Math.random()}.${audioExt}`;
      const audioFilePath = `${profile.id}/${audioFileName}`;
      const { error: audioUploadError } = await supabase.storage.from("audiobooks").upload(audioFilePath, audioFile);
      if (audioUploadError) throw audioUploadError;
      const { data: { publicUrl: audioUrl } } = supabase.storage.from("audiobooks").getPublicUrl(audioFilePath);
      const { error: insertError } = await supabase.from("podcast_episodes").insert({
        title,
        description,
        category: selectedCategories[0] || null,
        // Keep first category for backward compatibility
        categories: selectedCategories,
        cover_url: coverUrl,
        audio_url: audioUrl,
        duration,
        author_id: profile.id,
        status: "draft",
        tags,
        file_type: audioExt,
        file_size: audioFile.size
      });
      if (insertError) throw insertError;
      navigate(`/dashboard/${profile.username}/content`);
    } catch (error2) {
      console.error("Error creating podcast episode:", error2);
      setError(error2 instanceof Error ? error2.message : "Failed to create podcast episode");
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
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "New Podcast Episode" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Create a new podcast episode" })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "mb-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: error })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx(Label, { children: "Cover Image" }),
        /* @__PURE__ */ jsxs("div", { className: "aspect-square w-48 relative rounded-lg border-2 border-dashed hover:border-primary/50 transition-colors", children: [
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
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx(Label, { children: "Audio File" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                accept: ".mp3,.wav,.m4a,.aac",
                onChange: handleAudioChange,
                className: "hidden",
                id: "audio-file",
                required: true
              }
            ),
            /* @__PURE__ */ jsxs(
              "label",
              {
                htmlFor: "audio-file",
                className: "flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors cursor-pointer",
                children: [
                  /* @__PURE__ */ jsx(Upload, { className: "w-4 h-4" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm", children: audioFile ? audioFile.name : "Upload audio file" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Supported formats: MP3, WAV, M4A, AAC (max 500MB)" })
          ] }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "text",
              name: "duration",
              placeholder: "Duration (e.g., 12:34)",
              className: "w-32",
              required: true
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
            placeholder: "Enter episode title",
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
            name: "description",
            placeholder: "What's this episode about?",
            className: "min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "tags", children: "Tags" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "tags",
            name: "tags",
            placeholder: "Enter tags separated by commas"
          }
        )
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
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Select multiple categories that best describe your podcast" })
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
            disabled: loading || !audioFile,
            className: "px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50",
            children: loading ? "Creating..." : "Create Episode"
          }
        )
      ] })
    ] })
  ] });
}
export {
  NewPodcastPage
};
