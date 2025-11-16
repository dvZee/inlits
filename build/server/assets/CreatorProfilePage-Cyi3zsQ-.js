var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import React__default, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { w as withRetry, s as supabase, I as ImageLoader, u as useAuth, f as formatTimeAgo, g as getTextLanguageClass } from "./server-build-CQlMvEI0.js";
import { Loader2, AlertCircle, Upload, X, Image, Send, CheckCircle, Edit, MessageSquare, Bell, Share2, ChevronLeft, ChevronRight, Target, Clock, BookOpen, Pause, Users, Star, Filter, ArrowUpDown, Download, Lock, Headphones, Play, Eye, Calendar, FileText, Mic } from "lucide-react";
import { I as Input } from "./input-bMzHZGfT.js";
import { L as Label } from "./label-C6HnzAcQ.js";
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
class StorageManager {
  constructor() {
    __publicField(this, "maxRetries", 3);
    __publicField(this, "maxFileSize", 100 * 1024 * 1024);
    // 100MB
    __publicField(this, "allowedImageTypes", ["image/jpeg", "image/png", "image/webp"]);
    __publicField(this, "allowedAudioTypes", ["audio/mpeg", "audio/wav", "audio/aac", "audio/m4a"]);
    __publicField(this, "allowedBookTypes", ["application/pdf", "application/epub+zip", "application/x-mobipocket-ebook"]);
  }
  validateFile(file, bucket) {
    if (file.size > this.maxFileSize) {
      throw new Error(`File size must be less than ${this.maxFileSize / 1024 / 1024}MB`);
    }
    if (bucket.includes("covers") || bucket === "message-images") {
      if (!this.allowedImageTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed types: ${this.allowedImageTypes.join(", ")}`);
      }
    } else if (bucket === "audiobooks") {
      if (!this.allowedAudioTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed types: ${this.allowedAudioTypes.join(", ")}`);
      }
    } else if (bucket === "books") {
      if (!this.allowedBookTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed types: ${this.allowedBookTypes.join(", ")}`);
      }
    }
  }
  generateFilePath(file, customPath) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    return customPath || `${timestamp}-${randomString}.${extension}`;
  }
  async upload({ bucket, file, path, onProgress }) {
    try {
      this.validateFile(file, bucket);
      const filePath = this.generateFilePath(file, path);
      const { data, error } = await withRetry(
        async () => {
          const uploadPromise = supabase.storage.from(bucket).upload(filePath, file, {
            cacheControl: "3600",
            upsert: false
          });
          if (onProgress) {
            const interval = setInterval(() => {
              onProgress(Math.random() * 100);
            }, 100);
            const result = await uploadPromise;
            clearInterval(interval);
            onProgress(100);
            return result;
          }
          return uploadPromise;
        },
        this.maxRetries
      );
      if (error) throw error;
      if (!data) throw new Error("No data received from upload");
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
      try {
        const response = await fetch(publicUrl, { method: "HEAD" });
        if (!response.ok) {
          throw new Error(`Failed to verify file access: ${response.status}`);
        }
      } catch (error2) {
        console.error("File verification failed:", error2);
        throw new Error("Uploaded file is not publicly accessible");
      }
      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }
  async download({ bucket, path }) {
    try {
      const { data, error } = await withRetry(
        () => supabase.storage.from(bucket).download(path),
        this.maxRetries
      );
      if (error) throw error;
      if (!data) throw new Error("No data received");
      return data;
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  }
  async remove(bucket, path) {
    try {
      const { error } = await withRetry(
        () => supabase.storage.from(bucket).remove([path]),
        this.maxRetries
      );
      if (error) throw error;
    } catch (error) {
      console.error("Remove error:", error);
      throw error;
    }
  }
  getPublicUrl(bucket, path) {
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  }
}
const storageManager = new StorageManager();
function FileUpload({
  bucket,
  onUploadComplete,
  onError,
  accept,
  maxSize = 100 * 1024 * 1024,
  // 100MB default
  className = "",
  children
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    await handleFiles(files);
  }, []);
  const handleFileChange = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await handleFiles(files);
  }, []);
  const handleFiles = async (files) => {
    const file = files[0];
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      onError == null ? void 0 : onError(new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`));
      return;
    }
    if (accept && !accept.split(",").some((type) => file.type.match(type.trim()))) {
      setError(`Invalid file type. Accepted types: ${accept}`);
      onError == null ? void 0 : onError(new Error(`Invalid file type. Accepted types: ${accept}`));
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const url = await storageManager.upload({
        bucket,
        file,
        onProgress: setProgress
      });
      onUploadComplete(url);
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error("Upload failed");
      setError(error2.message);
      onError == null ? void 0 : onError(error2);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onDragEnter: handleDragEnter,
      onDragOver: (e) => e.preventDefault(),
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      className: `relative ${className}`,
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            accept,
            onChange: handleFileChange,
            className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
            disabled: uploading
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors ${isDragging ? "border-primary bg-primary/5" : error ? "border-destructive/50 bg-destructive/5" : "border-muted-foreground/20 hover:border-primary/50"}`,
            children: children || /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center p-4 text-center", children: uploading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 mb-2 animate-spin text-primary" }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium", children: [
                "Uploading... ",
                progress.toFixed(0),
                "%"
              ] })
            ] }) : error ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "w-8 h-8 mb-2 text-destructive" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: error })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Upload, { className: "w-8 h-8 mb-2 text-muted-foreground" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Drop file here or click to upload" }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                "Maximum file size: ",
                maxSize / 1024 / 1024,
                "MB"
              ] })
            ] }) })
          }
        )
      ]
    }
  );
}
function ImageUpload({
  bucket,
  onUploadComplete,
  onError,
  className = "",
  aspectRatio = "square",
  defaultImage,
  maxSize = 2 * 1024 * 1024
  // 2MB default for images
}) {
  const [previewUrl, setPreviewUrl] = useState(defaultImage || null);
  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[2/3]"
  }[aspectRatio];
  const handleUploadComplete = (url) => {
    setPreviewUrl(url);
    onUploadComplete(url);
  };
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onUploadComplete("");
  };
  return /* @__PURE__ */ jsx("div", { className: `relative ${aspectRatioClass} ${className}`, children: previewUrl ? /* @__PURE__ */ jsxs("div", { className: "relative w-full h-full", children: [
    /* @__PURE__ */ jsx(
      ImageLoader,
      {
        src: previewUrl,
        alt: "Preview",
        className: "w-full h-full object-cover rounded-lg"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors rounded-lg group", children: /* @__PURE__ */ jsx("div", { className: "flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleRemoveImage,
        className: "p-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition-colors",
        children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 text-white" })
      }
    ) }) })
  ] }) : /* @__PURE__ */ jsx(
    FileUpload,
    {
      bucket,
      accept: "image/jpeg,image/png,image/webp",
      maxSize,
      onUploadComplete: handleUploadComplete,
      onError,
      className: "w-full h-full",
      children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Image, { className: "w-8 h-8 mb-2" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Click or drag to upload" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs mt-1", children: [
          "Maximum size: ",
          maxSize / 1024 / 1024,
          "MB"
        ] })
      ] })
    }
  ) });
}
function CreatorMessageDialog({
  recipientId,
  recipientName,
  recipientAvatar,
  onClose
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  useEffect(() => {
    const loadMessages = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.from("messages").select("*").or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`).order("created_at", { ascending: true });
        if (error) throw error;
        setMessages(data || []);
        await supabase.from("messages").update({ read: true }).eq("recipient_id", user.id).eq("sender_id", recipientId);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
    const channel = supabase.channel("messages").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `sender_id=eq.${recipientId},recipient_id=eq.${user == null ? void 0 : user.id}`
      },
      async (payload) => {
        if (payload.eventType === "INSERT") {
          setMessages((prev) => [...prev, payload.new]);
          await supabase.from("messages").update({ read: true }).eq("id", payload.new.id);
        }
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, recipientId]);
  useEffect(() => {
    var _a;
    (_a = messagesEndRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newMessage]);
  const handleSend = async () => {
    if (!user || !newMessage.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content: newMessage.trim(),
        type: "text"
      });
      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };
  const handleImageUpload = async (url) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content: url,
        type: "image"
      });
      if (error) throw error;
      setShowImageUpload(false);
    } catch (error) {
      console.error("Error sending image:", error);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-background rounded-lg shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full overflow-hidden bg-muted", children: recipientAvatar ? /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: recipientAvatar,
                    alt: recipientName,
                    className: "w-full h-full object-cover"
                  }
                ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium", children: recipientName[0].toUpperCase() }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-medium", children: recipientName }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Creator" })
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onClose,
                  className: "p-2 hover:bg-accent rounded-lg transition-colors",
                  children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: [
              loading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin text-muted-foreground" }) }) : messages.length > 0 ? messages.map((message) => {
                const isOwn = message.sender_id === (user == null ? void 0 : user.id);
                return /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `flex ${isOwn ? "justify-end" : "justify-start"}`,
                    children: /* @__PURE__ */ jsxs("div", { className: `max-w-[70%] ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg px-4 py-2`, children: [
                      message.type === "text" ? /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap break-words text-sm", children: message.content }) : /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: message.content,
                          alt: "Message",
                          className: "rounded max-w-full",
                          onLoad: () => {
                            var _a;
                            return (_a = messagesEndRef.current) == null ? void 0 : _a.scrollIntoView();
                          }
                        }
                      ),
                      /* @__PURE__ */ jsx("p", { className: "text-xs opacity-70 mt-1", children: new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      }) })
                    ] })
                  },
                  message.id
                );
              }) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: "No messages yet" }),
              /* @__PURE__ */ jsx("div", { ref: messagesEndRef })
            ] }),
            showImageUpload && /* @__PURE__ */ jsxs("div", { className: "p-4 border-t", children: [
              /* @__PURE__ */ jsx(
                ImageUpload,
                {
                  bucket: "message-images",
                  onUploadComplete: handleImageUpload,
                  aspectRatio: "square",
                  className: "w-full h-48"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setShowImageUpload(false),
                  className: "w-full mt-2 px-4 py-2 text-sm rounded-lg border hover:bg-accent transition-colors",
                  children: "Cancel"
                }
              )
            ] }),
            !showImageUpload && /* @__PURE__ */ jsx("div", { className: "p-4 border-t", children: /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1 relative", children: [
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    ref: textareaRef,
                    value: newMessage,
                    onChange: (e) => setNewMessage(e.target.value),
                    onKeyPress: handleKeyPress,
                    placeholder: "Type a message...",
                    className: "w-full px-4 py-2 pr-12 text-sm rounded-lg border bg-background resize-none max-h-32 focus:outline-none focus:ring-2 focus:ring-primary",
                    rows: 1
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowImageUpload(true),
                    className: "absolute right-2 bottom-2 p-1 hover:bg-accent rounded transition-colors",
                    children: /* @__PURE__ */ jsx(Image, { className: "w-5 h-5 text-muted-foreground" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleSend,
                  disabled: !newMessage.trim() || sending,
                  className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2",
                  children: sending ? /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "w-5 h-5" })
                }
              )
            ] }) })
          ]
        }
      )
    }
  );
}
function EditProfileDialog({ onClose }) {
  const { user, profile, setProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: ""
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || ""
      });
      setAvatarPreview(profile.avatar_url || "");
      setCoverPreview(profile.cover_url || "");
    }
  }, [profile]);
  const handleAvatarChange = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar image must be less than 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };
  const handleCoverChange = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Cover image must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setError(null);
  };
  const uploadImage = async (file, bucket) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user == null ? void 0 : user.id}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      let avatarUrl = profile.avatar_url;
      let coverUrl = profile.cover_url;
      if (avatarFile) {
        setUploadingAvatar(true);
        avatarUrl = await uploadImage(avatarFile, "article-covers");
      }
      if (coverFile) {
        setUploadingCover(true);
        coverUrl = await uploadImage(coverFile, "article-covers");
      }
      const { error: updateError } = await supabase.from("profiles").update({
        name: formData.name,
        bio: formData.bio,
        avatar_url: avatarUrl,
        cover_url: coverUrl,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", user.id);
      if (updateError) throw updateError;
      setProfile({
        ...profile,
        name: formData.name,
        bio: formData.bio,
        avatar_url: avatarUrl,
        cover_url: coverUrl
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
      setUploadingAvatar(false);
      setUploadingCover(false);
    }
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-background rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Edit Profile" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onClose,
                  className: "p-2 hover:bg-accent rounded-full transition-colors",
                  children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-4 space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Cover Image" }),
                /* @__PURE__ */ jsxs("div", { className: "relative aspect-video rounded-lg border-2 border-dashed hover:border-primary/50 transition-colors overflow-hidden", children: [
                  coverPreview ? /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: coverPreview,
                      alt: "Cover preview",
                      className: "w-full h-full object-cover"
                    }
                  ) : /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Upload, { className: "w-8 h-8 mb-2" }),
                    /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Click to upload cover image" })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "file",
                      accept: "image/*",
                      onChange: handleCoverChange,
                      className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    }
                  ),
                  uploadingCover && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/50 flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin text-white" }) })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Recommended size: 1600x400. Maximum file size: 5MB" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Profile Picture" }),
                /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxs("div", { className: "relative w-24 h-24 rounded-full border-2 border-dashed hover:border-primary/50 transition-colors overflow-hidden", children: [
                  avatarPreview ? /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: avatarPreview,
                      alt: "Avatar preview",
                      className: "w-full h-full object-cover"
                    }
                  ) : /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Upload, { className: "w-6 h-6 mb-1" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-center", children: "Upload" })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "file",
                      accept: "image/*",
                      onChange: handleAvatarChange,
                      className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    }
                  ),
                  uploadingAvatar && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/50 flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin text-white" }) })
                ] }) }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Recommended size: 400x400. Maximum file size: 2MB" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Full Name" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "name",
                    value: formData.name,
                    onChange: (e) => setFormData((prev) => ({ ...prev, name: e.target.value })),
                    placeholder: "Enter your full name"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "bio", children: "Bio" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    id: "bio",
                    value: formData.bio,
                    onChange: (e) => setFormData((prev) => ({ ...prev, bio: e.target.value })),
                    className: "w-full px-3 py-2 rounded-md border bg-background min-h-[80px] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary",
                    placeholder: "Tell us about yourself...",
                    maxLength: 500
                  }
                ),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  formData.bio.length,
                  "/500 characters"
                ] })
              ] }),
              error && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive", children: [
                /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm", children: error })
              ] }),
              success && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400", children: [
                /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Profile updated successfully!" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: onClose,
                    className: "px-4 py-2 text-sm rounded-lg border hover:bg-accent transition-colors",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    disabled: loading || uploadingAvatar || uploadingCover,
                    className: "px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2",
                    children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
                      "Saving..."
                    ] }) : "Save Changes"
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  );
}
function CreatorHeader({ profile, stats }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [shareTooltipText, setShareTooltipText] = useState("Copy link");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [followerCount, setFollowerCount] = useState(stats.total_followers);
  const isOwnProfile = (user == null ? void 0 : user.id) === profile.id;
  const statsRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const checkScrollButtons = () => {
    if (statsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = statsRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  };
  const handleScroll = (direction) => {
    if (statsRef.current) {
      const scrollAmount = 200;
      statsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };
  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, []);
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || user.id === profile.id) return;
      try {
        const { data, error } = await supabase.from("followers").select("id").eq("creator_id", profile.id).eq("follower_id", user.id).maybeSingle();
        if (error && error.code !== "PGRST116") {
          console.error("Error checking follow status:", error);
          return;
        }
        setIsFollowing(!!data);
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };
    checkFollowStatus();
  }, [user, profile.id]);
  const handleFollow = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        setIsFollowing(false);
        setFollowerCount((prev) => Math.max(0, prev - 1));
        const { error } = await supabase.from("followers").delete().eq("creator_id", profile.id).eq("follower_id", user.id);
        if (error) {
          console.error("Error unfollowing:", error);
          setIsFollowing(true);
          setFollowerCount((prev) => prev + 1);
        }
      } else {
        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
        const { error } = await supabase.from("followers").insert({
          creator_id: profile.id,
          follower_id: user.id
        });
        if (error) {
          console.error("Error following:", error);
          setIsFollowing(false);
          setFollowerCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    } finally {
      setFollowLoading(false);
    }
  };
  const handleMessage = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowMessageDialog(true);
  };
  const handleNotifications = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setNotificationsEnabled(!notificationsEnabled);
  };
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.name} on Inlits`,
          text: `Check out ${profile.name}'s profile on Inlits`,
          url: window.location.href
        });
        setShareTooltipText("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareTooltipText("Link copied!");
      }
      setShowShareTooltip(true);
      setTimeout(() => {
        setShowShareTooltip(false);
        setShareTooltipText("Copy link");
      }, 2e3);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error sharing:", error);
        setShareTooltipText("Failed to share");
        setShowShareTooltip(true);
        setTimeout(() => {
          setShowShareTooltip(false);
          setShareTooltipText("Copy link");
        }, 2e3);
      }
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative -mt-14", children: [
    /* @__PURE__ */ jsxs("div", { className: "h-48 md:h-64 bg-gradient-to-r from-primary/5 to-primary/10 relative -mx-4 md:mx-0", children: [
      profile.cover_url ? /* @__PURE__ */ jsx(
        "img",
        {
          src: profile.cover_url,
          alt: "Cover",
          className: "w-full h-full object-cover"
        }
      ) : /* @__PURE__ */ jsx(
        "img",
        {
          src: "https://images.unsplash.com/photo-1519791883288-dc8bd696e667",
          alt: "Cover",
          className: "w-full h-full object-cover opacity-50"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "container max-w-7xl mx-auto px-4 -mt-32 relative z-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-6 items-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col w-full md:hidden items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-28 h-28 rounded-full border-4 border-background overflow-hidden bg-muted shadow-lg", children: profile.avatar_url ? /* @__PURE__ */ jsx(
            "img",
            {
              src: profile.avatar_url,
              alt: profile.name || profile.username,
              className: "w-full h-full object-cover"
            }
          ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-medium", children: profile.username[0].toUpperCase() }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center mt-4", children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-xl font-bold text-foreground", children: [
              profile.name || profile.username,
              profile.verified && /* @__PURE__ */ jsx("span", { className: "inline-block ml-2 text-primary", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ) }) })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
              "@",
              profile.username
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-3", children: [
              isOwnProfile ? /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setShowEditDialog(true),
                  className: "px-3 py-1.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors whitespace-nowrap flex items-center gap-1",
                  children: [
                    /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4" }),
                    "Edit Profile"
                  ]
                }
              ) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleFollow,
                    disabled: followLoading,
                    className: `px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${isFollowing ? "bg-primary/10 text-primary hover:bg-primary hover:text-white" : "bg-primary text-white hover:bg-primary/90"}`,
                    children: followLoading ? "Loading..." : isFollowing ? "Following" : "Follow"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleMessage,
                    className: "p-1.5 rounded-full hover:bg-primary hover:text-white transition-colors",
                    title: "Send message",
                    children: /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleNotifications,
                    className: `p-1.5 rounded-full transition-colors hover:bg-primary hover:text-white ${notificationsEnabled ? "text-primary hover:text-white" : ""}`,
                    title: notificationsEnabled ? "Notifications on" : "Notifications off",
                    children: /* @__PURE__ */ jsx(Bell, { className: "w-4 h-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleShare,
                  className: "p-1.5 rounded-full hover:bg-primary hover:text-white transition-colors relative",
                  title: "Share profile",
                  children: /* @__PURE__ */ jsx(Share2, { className: "w-4 h-4" })
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-start gap-4 flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-muted shadow-lg", children: profile.avatar_url ? /* @__PURE__ */ jsx(
            "img",
            {
              src: profile.avatar_url,
              alt: profile.name || profile.username,
              className: "w-full h-full object-cover"
            }
          ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-medium", children: profile.username[0].toUpperCase() }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-foreground", children: [
                  profile.name || profile.username,
                  profile.verified && /* @__PURE__ */ jsx("span", { className: "inline-block ml-2 text-primary", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      d: "M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      strokeLinecap: "round",
                      strokeLinejoin: "round"
                    }
                  ) }) })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
                  "@",
                  profile.username
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
                isOwnProfile ? /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setShowEditDialog(true),
                    className: "px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors whitespace-nowrap flex items-center gap-1",
                    children: [
                      /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4" }),
                      "Edit Profile"
                    ]
                  }
                ) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: handleFollow,
                      disabled: followLoading,
                      className: `px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${isFollowing ? "bg-primary/10 text-primary hover:bg-primary hover:text-white" : "bg-primary text-white hover:bg-primary/90"} ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`,
                      children: followLoading ? "Loading..." : isFollowing ? "Following" : "Follow"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: handleMessage,
                      className: "p-2 rounded-full hover:bg-primary hover:text-white transition-colors",
                      title: "Send message",
                      children: /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: handleNotifications,
                      className: `p-2 rounded-full transition-colors hover:bg-primary hover:text-white ${notificationsEnabled ? "text-primary hover:text-white" : ""}`,
                      title: notificationsEnabled ? "Notifications on" : "Notifications off",
                      children: /* @__PURE__ */ jsx(Bell, { className: "w-4 h-4" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: handleShare,
                    className: "p-2 rounded-full hover:bg-primary hover:text-white transition-colors relative",
                    title: "Share profile",
                    onMouseEnter: () => setShowShareTooltip(true),
                    onMouseLeave: () => setShowShareTooltip(false),
                    children: [
                      /* @__PURE__ */ jsx(Share2, { className: "w-4 h-4" }),
                      showShareTooltip && /* @__PURE__ */ jsx("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-black/90 rounded whitespace-nowrap", children: shareTooltipText })
                    ]
                  }
                )
              ] })
            ] }),
            profile.bio && /* @__PURE__ */ jsx("p", { className: "mt-2 text-muted-foreground", children: profile.bio }),
            /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-6 mt-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: followerCount.toLocaleString() }),
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground ml-1", children: "followers" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: stats.total_content.toLocaleString() }),
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground ml-1", children: "content" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: stats.avg_rating }),
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground ml-1", children: "rating" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: stats.total_views.toLocaleString() }),
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground ml-1", children: "views" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      profile.bio && /* @__PURE__ */ jsx("p", { className: "mt-6 text-center md:hidden text-muted-foreground", children: profile.bio }),
      /* @__PURE__ */ jsx("div", { className: "relative mt-4 md:hidden", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        showLeftArrow && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleScroll("left"),
            className: "shrink-0 h-full px-2 flex items-center justify-center bg-gradient-to-r from-background via-background to-transparent",
            children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            ref: statsRef,
            className: "flex items-center gap-4 text-sm overflow-x-auto scrollbar-hide scroll-smooth flex-1",
            onScroll: checkScrollButtons,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "shrink-0", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: followerCount.toLocaleString() }),
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground ml-1", children: "followers" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "shrink-0", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: stats.total_content.toLocaleString() }),
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground ml-1", children: "content" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "shrink-0", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: stats.avg_rating }),
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground ml-1", children: "rating" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "shrink-0", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: stats.total_views.toLocaleString() }),
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground ml-1", children: "views" })
              ] })
            ]
          }
        ),
        showRightArrow && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleScroll("right"),
            className: "shrink-0 h-full px-2 flex items-center justify-center bg-gradient-to-l from-background via-background to-transparent",
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" })
          }
        )
      ] }) })
    ] }),
    showAuthModal && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
        onClick: () => setShowAuthModal(false),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-background rounded-lg p-6 max-w-md mx-4 text-center space-y-4",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-primary mx-auto" }),
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Sign in required" }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Please sign in to interact with creators and their content." }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowAuthModal(false),
                    className: "px-4 py-2 rounded-lg border hover:bg-primary hover:text-white transition-colors",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => navigate("/signin"),
                    className: "px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors",
                    children: "Sign in"
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    showMessageDialog && /* @__PURE__ */ jsx(
      CreatorMessageDialog,
      {
        recipientId: profile.id,
        recipientName: profile.name || profile.username,
        recipientAvatar: profile.avatar_url,
        onClose: () => setShowMessageDialog(false)
      }
    ),
    showEditDialog && /* @__PURE__ */ jsx(EditProfileDialog, { onClose: () => setShowEditDialog(false) })
  ] });
}
function IntellectualIdentity({ stats, userId, isOwnProfile }) {
  const { user } = useAuth();
  const [readingStats, setReadingStats] = useState({
    want_to_consume: 0,
    consuming: 0,
    completed: 0,
    paused: 0
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadReadingStats = async () => {
      const targetUserId = userId ?? (user == null ? void 0 : user.id);
      if (!targetUserId) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.from("reading_status").select("status").eq("user_id", targetUserId);
        if (error) throw error;
        const statusCounts = (data || []).reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {});
        setReadingStats({
          want_to_consume: statusCounts.want_to_consume || 0,
          consuming: statusCounts.consuming || 0,
          completed: statusCounts.completed || 0,
          paused: statusCounts.paused || 0
        });
      } catch (error) {
        console.error("Error loading reading stats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadReadingStats();
  }, [user, userId]);
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-4 md:space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Intellectual Identity" }) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 md:p-4 text-center animate-pulse", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 md:w-10 md:h-10 rounded-lg bg-muted mx-auto mb-2" }),
        /* @__PURE__ */ jsx("div", { className: "h-6 bg-muted rounded mb-1" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded" })
      ] }, i)) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4 md:space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Intellectual Identity" }),
      (isOwnProfile ?? (!userId || (user == null ? void 0 : user.id) === userId)) && /* @__PURE__ */ jsx(
        Link,
        {
          to: "/library",
          className: "text-sm text-primary hover:underline",
          children: "Update Preferences"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 md:p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2", children: /* @__PURE__ */ jsx(Target, { className: "w-4 h-4 md:w-5 md:h-5 text-primary" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-lg md:text-xl font-bold", children: readingStats.want_to_consume }),
        /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm text-muted-foreground", children: "Want to Experience" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 md:p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2", children: /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 md:w-5 md:h-5 text-primary" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-lg md:text-xl font-bold", children: readingStats.consuming }),
        /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm text-muted-foreground", children: "Currently Experiencing" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 md:p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2", children: /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4 md:w-5 md:h-5 text-primary" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-lg md:text-xl font-bold", children: readingStats.completed }),
        /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm text-muted-foreground", children: "Experienced" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 md:p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2", children: /* @__PURE__ */ jsx(Pause, { className: "w-4 h-4 md:w-5 md:h-5 text-primary" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-lg md:text-xl font-bold", children: readingStats.paused }),
        /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm text-muted-foreground", children: "Paused" })
      ] })
    ] })
  ] });
}
function ProfileContributions({ recentActivity, userId, isOwnProfile }) {
  const { user } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const loadContributions = async () => {
      const targetUserId = userId ?? (user == null ? void 0 : user.id);
      if (!targetUserId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const { data: commentsData, error: commentsError } = await supabase.from("comments").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false }).limit(5);
        if (commentsError) throw commentsError;
        const { data: ratingsData, error: ratingsError } = await supabase.from("ratings").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false }).limit(5);
        if (ratingsError) throw ratingsError;
        const allContributions = [
          ...(commentsData || []).map((comment) => ({
            id: comment.id,
            type: "comment",
            title: `Comment on ${comment.content_type}`,
            excerpt: comment.content.substring(0, 100) + (comment.content.length > 100 ? "..." : ""),
            content_type: comment.content_type,
            content_id: comment.content_id,
            timestamp: comment.created_at
          })),
          ...(ratingsData || []).map((rating) => ({
            id: rating.id,
            type: "rating",
            title: `Rated ${rating.content_type}`,
            excerpt: `Gave ${rating.rating} star${rating.rating !== 1 ? "s" : ""}`,
            content_type: rating.content_type,
            content_id: rating.content_id,
            timestamp: rating.created_at,
            rating: rating.rating
          }))
        ];
        allContributions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setContributions(allContributions.slice(0, 5));
      } catch (err) {
        console.error("Error loading contributions:", err);
        setError(err instanceof Error ? err.message : "Failed to load contributions");
      } finally {
        setLoading(false);
      }
    };
    loadContributions();
  }, [user, userId]);
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Contributions" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin text-muted-foreground" }) })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Contributions" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8 text-center", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-8 h-8 text-destructive mx-auto" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: error })
      ] }) })
    ] });
  }
  if (contributions.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Contributions" }),
      /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
        /* @__PURE__ */ jsx(MessageSquare, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "No contributions yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Start engaging with content by leaving comments and ratings" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Contributions" }),
      (isOwnProfile ?? (!userId || (user == null ? void 0 : user.id) === userId)) && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("button", { className: "text-sm text-primary hover:underline", children: "View all" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: contributions.map((contribution) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "bg-card border rounded-lg p-6 space-y-4",
        children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "capitalize", children: contribution.type }),
              /* @__PURE__ */ jsx("span", { children: "•" }),
              /* @__PURE__ */ jsx("span", { children: formatTimeAgo(contribution.timestamp) }),
              /* @__PURE__ */ jsx("span", { children: "•" }),
              /* @__PURE__ */ jsx("span", { className: "capitalize", children: contribution.content_type })
            ] }),
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: contribution.title })
          ] }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: contribution.excerpt }),
          contribution.type === "rating" && contribution.rating && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(
            "span",
            {
              className: `text-lg ${i < contribution.rating ? "text-yellow-500" : "text-muted-foreground"}`,
              children: "★"
            },
            i
          )) })
        ]
      },
      contribution.id
    )) })
  ] });
}
function ProfileCircles() {
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-6", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Circles" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Connect with like-minded learners" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Users, { className: "w-8 h-8 text-primary" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "Circles Coming Soon!" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4 max-w-sm mx-auto", children: "We're working on exciting features to help you connect with like-minded learners and form study circles." }),
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }),
        /* @__PURE__ */ jsx("span", { children: "Feature in development" })
      ] })
    ] })
  ] });
}
function ProfileAchievements({ stats }) {
  const achievements = [
    {
      id: "1",
      name: "First Steps",
      description: "Complete your first content",
      icon: "🎯",
      progress: Math.min((stats == null ? void 0 : stats.completed_content) || 0, 1),
      total: 1,
      unlocked: ((stats == null ? void 0 : stats.completed_content) || 0) >= 1
    },
    {
      id: "2",
      name: "Bookworm",
      description: "Experience 10 pieces of content",
      icon: "📚",
      progress: Math.min((stats == null ? void 0 : stats.completed_content) || 0, 10),
      total: 10,
      unlocked: ((stats == null ? void 0 : stats.completed_content) || 0) >= 10
    },
    {
      id: "3",
      name: "Engaged Learner",
      description: "Write 5 comments or reviews",
      icon: "💬",
      progress: Math.min((stats == null ? void 0 : stats.totalComments) || 0, 5),
      total: 5,
      unlocked: ((stats == null ? void 0 : stats.totalComments) || 0) >= 5
    },
    {
      id: "4",
      name: "Community Member",
      description: "Join your first book club",
      icon: "👥",
      progress: Math.min((stats == null ? void 0 : stats.bookClubsJoined) || 0, 1),
      total: 1,
      unlocked: ((stats == null ? void 0 : stats.bookClubsJoined) || 0) >= 1
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Achievements" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Track your progress" })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "text-sm text-primary hover:underline", disabled: true, children: "View all" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: achievements.map((achievement) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "space-y-2",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg", children: /* @__PURE__ */ jsx("span", { className: achievement.unlocked ? "" : "grayscale opacity-50", children: achievement.icon }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium text-sm", children: achievement.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: achievement.description })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
              achievement.progress,
              "/",
              achievement.total
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-full transition-all ${achievement.unlocked ? "bg-primary" : "bg-muted-foreground"}`,
              style: {
                width: `${achievement.progress / achievement.total * 100}%`
              }
            }
          ) })
        ]
      },
      achievement.id
    )) })
  ] });
}
function CreatorHome({ profile, stats, recentContent, isOwnProfile }) {
  const navigate = useNavigate();
  const recentRowRef = React__default.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = React__default.useState(false);
  const [canScrollRight, setCanScrollRight] = React__default.useState(false);
  const recentItems = [
    ...recentContent.articles.map((item) => ({
      ...item,
      type: "article",
      description: item.excerpt
    })),
    ...recentContent.books.map((item) => ({
      ...item,
      type: "book"
    })),
    ...recentContent.audiobooks.map((item) => ({
      ...item,
      type: "audiobook"
    })),
    ...recentContent.podcasts.map((item) => ({
      ...item,
      type: "podcast"
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
  const hasSeries = recentItems.some((item) => item.series_id);
  const seriesIds = new Set(recentItems.filter((item) => item.series_id).map((item) => item.series_id));
  const handleContentClick = (type, id) => {
    switch (type) {
      case "article":
        navigate(`/reader/article-${id}`);
        break;
      case "book":
        navigate(`/reader/book-${id}`);
        break;
      case "audiobook":
      case "podcast":
        navigate(`/player/${type}-${id}`);
        break;
    }
  };
  const achievementsStats = {
    completed_content: (stats == null ? void 0 : stats.total_content) ?? 0,
    totalComments: (stats == null ? void 0 : stats.total_comments) ?? 0,
    bookClubsJoined: (stats == null ? void 0 : stats.total_followers) ?? 0
  };
  const placeholderForType = (type, id) => `https://placehold.co/400x600?text=${encodeURIComponent(type.toUpperCase())}`;
  const updateScrollButtons = (container) => {
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };
  const scrollRow = (direction) => {
    const container = recentRowRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    const target = direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;
    container.scrollTo({ left: target, behavior: "smooth" });
  };
  const handleRowScroll = (ref) => {
    updateScrollButtons(ref.current);
  };
  React__default.useEffect(() => {
    updateScrollButtons(recentRowRef.current);
    const handleResize = () => updateScrollButtons(recentRowRef.current);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("section", { className: "bg-card border rounded-lg p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Recently Posted" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => scrollRow("left"),
              className: "p-2 rounded-full border hover:bg-accent transition-colors disabled:opacity-50",
              "aria-label": "Scroll left",
              disabled: !canScrollLeft,
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => scrollRow("right"),
              className: "p-2 rounded-full border hover:bg-accent transition-colors disabled:opacity-50",
              "aria-label": "Scroll right",
              disabled: !canScrollRight,
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "flex gap-4 overflow-x-auto scrollbar-hide pb-4",
          ref: recentRowRef,
          onScroll: () => handleRowScroll(recentRowRef),
          children: recentItems.map((item) => /* @__PURE__ */ jsxs(
            "div",
            {
              onClick: () => handleContentClick(item.type, item.id),
              className: "group space-y-3 cursor-pointer flex-shrink-0 w-44",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "relative aspect-[2/3] rounded-lg overflow-hidden bg-muted", children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: item.cover_url || placeholderForType(item.type, item.id),
                      alt: item.title,
                      className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/90 text-xs", children: /* @__PURE__ */ jsx("span", { className: "capitalize", children: item.type }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(
                    "h3",
                    {
                      className: `text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors ${getTextLanguageClass(item.title)}`,
                      children: item.title
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 fill-yellow-500 text-yellow-500" }),
                      /* @__PURE__ */ jsx("span", { children: item.rating != null ? item.rating.toFixed(1) : "-" })
                    ] }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      item.views != null ? item.views.toLocaleString() : "-",
                      " views"
                    ] })
                  ] })
                ] })
              ]
            },
            `${item.type}-${item.id}`
          ))
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-8", children: [
        /* @__PURE__ */ jsx(IntellectualIdentity, { userId: profile.id, isOwnProfile }),
        /* @__PURE__ */ jsx(ProfileContributions, { userId: profile.id, isOwnProfile })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsx(ProfileCircles, {}),
        /* @__PURE__ */ jsx(ProfileAchievements, { stats: achievementsStats })
      ] })
    ] }),
    hasSeries && /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold", children: [
          "Series (",
          seriesIds.size,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/dashboard/${profile.username}/content?tab=series`,
            className: "flex items-center gap-1 text-sm text-primary hover:underline",
            children: [
              "View all series",
              /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6", children: Array.from(seriesIds).map((seriesId, index) => {
        const seriesContent = recentItems.filter((item) => item.series_id === seriesId);
        const firstItem = seriesContent[0];
        return /* @__PURE__ */ jsx("div", { className: "group space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "aspect-[2/3] relative rounded-lg overflow-hidden bg-muted", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: (firstItem == null ? void 0 : firstItem.cover_url) || placeholderForType("series"),
              alt: "Series Cover",
              className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4", children: /* @__PURE__ */ jsxs("div", { className: "text-white", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-medium text-sm", children: [
              "Series ",
              index + 1
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/80", children: [
              seriesContent.length,
              " items"
            ] })
          ] }) })
        ] }) }, seriesId);
      }) })
    ] })
  ] });
}
function CreatorArticles({ profile }) {
  const { user } = useAuth();
  useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isOwnProfile = (user == null ? void 0 : user.id) === profile.id;
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: articlesData, error: articlesError } = await supabase.from("articles").select("*").eq("author_id", profile.id).eq("status", "published").order(sortBy === "recent" ? "created_at" : "views", { ascending: false });
        if (articlesError) throw articlesError;
        const articlesWithStats = await Promise.all(
          (articlesData || []).map(async (article) => {
            const { count: viewCount } = await supabase.from("content_views").select("*", { count: "exact", head: true }).eq("content_id", article.id).eq("content_type", "article");
            const { data: ratings } = await supabase.from("ratings").select("rating").eq("content_id", article.id).eq("content_type", "article");
            const avgRating = (ratings == null ? void 0 : ratings.length) ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;
            const wordCount = article.content.trim().split(/\s+/).length;
            const readTime = Math.max(1, Math.ceil(wordCount / 200));
            return {
              ...article,
              excerpt: article.excerpt || article.content.substring(0, 150) + "...",
              views: viewCount || 0,
              rating: avgRating,
              readTime
            };
          })
        );
        setArticles(articlesWithStats);
      } catch (err) {
        console.error("Error loading articles:", err);
        setError(err instanceof Error ? err.message : "Failed to load articles");
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, [profile.id, sortBy]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: "animate-pulse", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-48 h-32 bg-muted rounded-lg" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/2" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/4" })
      ] })
    ] }) }, i)) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
      /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-medium", children: "Failed to load articles" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error })
    ] });
  }
  if (articles.length === 0) {
    if (isOwnProfile) {
      return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "No articles published yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2", children: "Articles you publish will appear here" }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: `/dashboard/${profile.username}/content/new/article`,
            className: "inline-flex items-center justify-center px-4 py-2 mt-4 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors",
            children: "Create your first article"
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "No articles published yet" }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-2", children: [
        profile.name || profile.username,
        " hasn't published any articles yet"
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Articles" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
          "Published articles by ",
          profile.name || profile.username
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-primary/50 transition-colors", children: [
          /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Filter" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSortBy(sortBy === "recent" ? "popular" : "recent"),
            className: "flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-primary/50 transition-colors",
            children: [
              /* @__PURE__ */ jsx(ArrowUpDown, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: sortBy === "recent" ? "Most Recent" : "Most Popular" })
            ]
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6", children: articles.map((article) => /* @__PURE__ */ jsxs(
      Link,
      {
        to: `/reader/article-${article.id}`,
        className: "flex gap-6 p-4 rounded-lg border hover:border-primary/50 transition-colors",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-48 h-32 rounded-lg overflow-hidden bg-muted shrink-0", children: article.cover_url ? /* @__PURE__ */ jsx(
            "img",
            {
              src: article.cover_url,
              alt: article.title,
              className: "w-full h-full object-cover",
              onError: (e) => {
                const img = e.target;
                img.src = `https://source.unsplash.com/random/400x300?writing&sig=${article.id}`;
              }
            }
          ) : /* @__PURE__ */ jsx(
            "img",
            {
              src: `https://source.unsplash.com/random/400x300?writing&sig=${article.id}`,
              alt: article.title,
              className: "w-full h-full object-cover"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("h2", { className: `text-lg font-medium hover:text-primary transition-colors ${getTextLanguageClass(article.title)}`, children: article.title }),
            /* @__PURE__ */ jsx("p", { className: `mt-1 text-sm text-muted-foreground line-clamp-2 ${getTextLanguageClass(article.excerpt)}`, children: article.excerpt }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-2 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 fill-yellow-500 text-yellow-500" }),
                /* @__PURE__ */ jsx("span", { children: article.rating.toFixed(1) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  article.readTime,
                  " min read"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                article.views.toLocaleString(),
                " views"
              ] }),
              /* @__PURE__ */ jsx("span", { children: "•" }),
              /* @__PURE__ */ jsx("span", { children: new Date(article.created_at).toLocaleDateString() })
            ] })
          ] })
        ]
      },
      article.id
    )) })
  ] });
}
function CreatorEbooks({ profile }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isOwnProfile = (user == null ? void 0 : user.id) === profile.id;
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: booksData, error: booksError } = await supabase.from("books").select("*").eq("author_id", profile.id).eq("status", "published").order(sortBy === "recent" ? "created_at" : "views", { ascending: false });
        if (booksError) throw booksError;
        const booksWithStats = await Promise.all(
          (booksData || []).map(async (book) => {
            const { count: viewCount } = await supabase.from("content_views").select("*", { count: "exact", head: true }).eq("content_id", book.id).eq("content_type", "book");
            const { data: ratings } = await supabase.from("ratings").select("rating").eq("content_id", book.id).eq("content_type", "book");
            const avgRating = (ratings == null ? void 0 : ratings.length) ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;
            return {
              ...book,
              views: viewCount || 0,
              rating: avgRating,
              isPremium: book.price > 0
            };
          })
        );
        setBooks(booksWithStats);
      } catch (err) {
        console.error("Error loading books:", err);
        setError(err instanceof Error ? err.message : "Failed to load books");
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [profile.id, sortBy]);
  const handleReadNow = async (book) => {
    if (!user && book.isPremium) {
      navigate("/signin");
      return;
    }
    try {
      if (user) {
        await supabase.from("content_views").insert({
          content_id: book.id,
          content_type: "book",
          viewer_id: user.id,
          viewed_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      navigate(`/reader/book-${book.id}`);
    } catch (error2) {
      console.error("Error recording view:", error2);
    }
  };
  const handleDownload = async (book) => {
    if (!user) return;
    try {
      await supabase.from("content_views").insert({
        content_id: book.id,
        content_type: "book",
        viewer_id: user.id,
        viewed_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (book.file_url) {
        window.open(book.file_url, "_blank");
      }
    } catch (error2) {
      console.error("Error downloading book:", error2);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "animate-pulse", children: [
      /* @__PURE__ */ jsx("div", { className: "aspect-[2/3] bg-muted rounded-lg mb-4" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/2" })
      ] })
    ] }, i)) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
      /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-medium", children: "Failed to load books" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error })
    ] });
  }
  if (books.length === 0) {
    if (isOwnProfile) {
      return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "No books published yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2", children: "Books you publish will appear here" }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: `/dashboard/${profile.username}/content/new/book`,
            className: "inline-flex items-center justify-center px-4 py-2 mt-4 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors",
            children: "Create your first book"
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "No books published yet" }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-2", children: [
        profile.name || profile.username,
        " hasn't published any books yet"
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "E-Books" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
          "Published books by ",
          profile.name || profile.username
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-primary/50 transition-colors", children: [
          /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Filter" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSortBy(sortBy === "recent" ? "popular" : "recent"),
            className: "flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-primary/50 transition-colors",
            children: [
              /* @__PURE__ */ jsx(ArrowUpDown, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: sortBy === "recent" ? "Most Recent" : "Most Popular" })
            ]
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6", children: books.map((book) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex flex-col bg-card border rounded-lg overflow-hidden hover:border-primary/50 transition-colors",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "aspect-[2/3] relative", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: book.cover_url || `https://source.unsplash.com/random/400x600?book&sig=${book.id}`,
                alt: book.title,
                className: "w-full h-full object-cover"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" }),
            book.isPremium && /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium", children: "Premium" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-2", children: [
              /* @__PURE__ */ jsx("h3", { className: `font-medium line-clamp-2 hover:text-primary transition-colors ${getTextLanguageClass(book.title)}`, children: book.title }),
              /* @__PURE__ */ jsx("p", { className: `text-sm text-muted-foreground mt-1 line-clamp-2 ${getTextLanguageClass(book.description)}`, children: book.description })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground mb-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 fill-yellow-500 text-yellow-500" }),
                /* @__PURE__ */ jsx("span", { children: book.rating.toFixed(1) })
              ] }),
              /* @__PURE__ */ jsx("span", { children: "•" }),
              /* @__PURE__ */ jsxs("span", { children: [
                book.views.toLocaleString(),
                " readers"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-auto", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleReadNow(book),
                  className: "flex-1 px-3 py-1.5 text-sm text-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                  children: "Read Now"
                }
              ),
              user ? /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDownload(book),
                  className: "px-3 py-1.5 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
                  title: "Download",
                  children: /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" })
                }
              ) : /* @__PURE__ */ jsx(
                Link,
                {
                  to: "/signin",
                  className: "px-3 py-1.5 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
                  title: "Sign in to download",
                  children: /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4" })
                }
              )
            ] })
          ] })
        ]
      },
      book.id
    )) })
  ] });
}
function CreatorAudiobooks({ profile }) {
  const { user } = useAuth();
  useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [audiobooks, setAudiobooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [expandedAudiobook, setExpandedAudiobook] = useState(null);
  const [audioElements] = useState(/* @__PURE__ */ new Map());
  const isOwnProfile = (user == null ? void 0 : user.id) === profile.id;
  useEffect(() => {
    const loadAudiobooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: audiobooksData, error: audiobooksError } = await supabase.from("audiobooks").select(`
            *,
            chapters:audiobook_chapters (
              id,
              title,
              audio_url,
              duration,
              "order"
            )
          `).eq("author_id", profile.id).eq("status", "published").order(sortBy === "recent" ? "created_at" : "views", { ascending: false });
        if (audiobooksError) throw audiobooksError;
        const audiobooksWithStats = await Promise.all(
          (audiobooksData || []).map(async (audiobook) => {
            var _a;
            const { count: viewCount } = await supabase.from("content_views").select("*", { count: "exact", head: true }).eq("content_id", audiobook.id).eq("content_type", "audiobook");
            const { data: ratings } = await supabase.from("ratings").select("rating").eq("content_id", audiobook.id).eq("content_type", "audiobook");
            const avgRating = (ratings == null ? void 0 : ratings.length) ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;
            const sortedChapters = ((_a = audiobook.chapters) == null ? void 0 : _a.sort((a, b) => a.order - b.order)) || [];
            return {
              ...audiobook,
              views: viewCount || 0,
              rating: avgRating,
              isPremium: audiobook.price > 0,
              chapters: sortedChapters
            };
          })
        );
        setAudiobooks(audiobooksWithStats);
      } catch (err) {
        console.error("Error loading audiobooks:", err);
        setError(err instanceof Error ? err.message : "Failed to load audiobooks");
      } finally {
        setLoading(false);
      }
    };
    loadAudiobooks();
  }, [profile.id, sortBy]);
  const handlePlay = async (chapterId, audioUrl, index, isPremium) => {
    if (isPremium && index > 0 && !user) {
      return;
    }
    try {
      if (playing) {
        const currentAudio = audioElements.get(playing);
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }
      if (playing === chapterId) {
        setPlaying(null);
        return;
      }
      let audio = audioElements.get(chapterId);
      if (!audio) {
        audio = new Audio(audioUrl);
        audioElements.set(chapterId, audio);
      }
      await audio.play();
      setPlaying(chapterId);
      audio.onended = () => {
        setPlaying(null);
      };
    } catch (error2) {
      console.error("Error playing audio:", error2);
      setPlaying(null);
    }
  };
  useEffect(() => {
    return () => {
      audioElements.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      audioElements.clear();
    };
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: "animate-pulse", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-32 h-48 bg-muted rounded-lg" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/2" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/4" })
      ] })
    ] }) }, i)) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
      /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-medium", children: "Failed to load audiobooks" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error })
    ] });
  }
  if (audiobooks.length === 0) {
    if (isOwnProfile) {
      return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "No audiobooks published yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2", children: "Audiobooks you publish will appear here" }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: `/dashboard/${profile.username}/content/new/audiobook`,
            className: "inline-flex items-center justify-center px-4 py-2 mt-4 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors",
            children: "Create your first audiobook"
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "No audiobooks published yet" }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-2", children: [
        profile.name || profile.username,
        " hasn't published any audiobooks yet"
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Audiobooks" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
          "Published audiobooks by ",
          profile.name || profile.username
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-primary/50 transition-colors", children: [
          /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Filter" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSortBy(sortBy === "recent" ? "popular" : "recent"),
            className: "flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-primary/50 transition-colors",
            children: [
              /* @__PURE__ */ jsx(ArrowUpDown, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: sortBy === "recent" ? "Most Recent" : "Most Popular" })
            ]
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6", children: audiobooks.map((audiobook) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "bg-card border rounded-lg overflow-hidden",
        children: [
          /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-6", children: [
            /* @__PURE__ */ jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-32 h-48 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: audiobook.cover_url || `https://source.unsplash.com/random/400x600?audiobook&sig=${audiobook.id}`,
                alt: audiobook.title,
                className: "w-full h-full object-cover"
              }
            ) }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground mb-1", children: [
                  /* @__PURE__ */ jsx("span", { children: audiobook.category || "Audiobook" }),
                  audiobook.isPremium && /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("span", { children: "•" }),
                    /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Premium" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: audiobook.title }),
                /* @__PURE__ */ jsx("p", { className: `text-muted-foreground mt-2 line-clamp-2 ${getTextLanguageClass(audiobook.description)}`, children: audiobook.description })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-6 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Headphones, { className: "w-4 h-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Narrated by ",
                    audiobook.narrator
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 fill-yellow-500 text-yellow-500" }),
                  /* @__PURE__ */ jsx("span", { children: audiobook.rating.toFixed(1) })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                  audiobook.views.toLocaleString(),
                  " listeners"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: user ? `/player/audiobook-${audiobook.id}` : "/signin",
                    className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                    children: user ? "Listen Now" : "Sign in to Listen"
                  }
                ),
                audiobook.price > 0 && /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium", children: [
                  "$",
                  audiobook.price
                ] })
              ] })
            ] })
          ] }) }),
          audiobook.chapters && audiobook.chapters.length > 0 && /* @__PURE__ */ jsx("div", { className: "border-t", children: /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Preview" }),
              audiobook.chapters.length > 1 && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setExpandedAudiobook(
                    expandedAudiobook === audiobook.id ? null : audiobook.id
                  ),
                  className: "text-sm text-primary hover:underline",
                  children: expandedAudiobook === audiobook.id ? "Show Less" : "Show All"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              audiobook.chapters.slice(0, expandedAudiobook === audiobook.id ? void 0 : 1).map((chapter, index) => {
                const isLocked = index > 0 && !user;
                return /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: `flex items-center gap-4 p-3 rounded-lg transition-colors ${isLocked ? "bg-muted/5" : "hover:bg-[#1B4AB1] hover:text-white group"}`,
                    children: [
                      isLocked ? /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 text-muted-foreground" }) }) : /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => handlePlay(chapter.id.toString(), chapter.audio_url, index, audiobook.isPremium),
                          className: `w-8 h-8 rounded-full flex items-center justify-center transition-colors ${playing === chapter.id.toString() ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:bg-white group-hover:text-[#1B4AB1]"}`,
                          children: playing === chapter.id.toString() ? /* @__PURE__ */ jsx(Pause, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Play, { className: "w-4 h-4 ml-0.5" })
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxs("h4", { className: `font-medium truncate ${getTextLanguageClass(chapter.title)}`, children: [
                          index + 1,
                          ". ",
                          chapter.title
                        ] }),
                        /* @__PURE__ */ jsx("p", { className: `text-sm transition-colors ${isLocked ? "text-muted-foreground" : "text-muted-foreground group-hover:text-white/90"}`, children: chapter.duration })
                      ] }),
                      isLocked && /* @__PURE__ */ jsx(
                        Link,
                        {
                          to: "/signin",
                          className: "px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full transition-colors",
                          children: "Sign in to listen"
                        }
                      )
                    ]
                  },
                  chapter.id
                );
              }),
              audiobook.chapters.length > 1 && !user && expandedAudiobook !== audiobook.id && /* @__PURE__ */ jsx("div", { className: "text-center pt-2", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
                audiobook.chapters.length - 1,
                " more ",
                audiobook.chapters.length - 1 === 1 ? "chapter" : "chapters",
                " available after sign in"
              ] }) })
            ] })
          ] }) })
        ]
      },
      audiobook.id
    )) })
  ] });
}
function CreatorPodcasts({ profile }) {
  const { user } = useAuth();
  useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(null);
  const isOwnProfile = (user == null ? void 0 : user.id) === profile.id;
  useEffect(() => {
    const loadEpisodes = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: episodesData, error: episodesError } = await supabase.from("podcast_episodes").select("*").eq("author_id", profile.id).eq("status", "published").order(sortBy === "recent" ? "created_at" : "views", { ascending: false });
        if (episodesError) throw episodesError;
        const episodesWithStats = await Promise.all(
          (episodesData || []).map(async (episode) => {
            const { count: viewCount } = await supabase.from("content_views").select("*", { count: "exact", head: true }).eq("content_id", episode.id).eq("content_type", "podcast");
            const { data: ratings } = await supabase.from("ratings").select("rating").eq("content_id", episode.id).eq("content_type", "podcast");
            const avgRating = (ratings == null ? void 0 : ratings.length) ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;
            return {
              ...episode,
              views: viewCount || 0,
              rating: avgRating
            };
          })
        );
        setEpisodes(episodesWithStats);
      } catch (err) {
        console.error("Error loading podcast episodes:", err);
        setError(err instanceof Error ? err.message : "Failed to load podcast episodes");
      } finally {
        setLoading(false);
      }
    };
    loadEpisodes();
  }, [profile.id, sortBy]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: "animate-pulse", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-48 h-48 bg-muted rounded-lg" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/2" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-1/4" })
      ] })
    ] }) }, i)) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
      /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-medium", children: "Failed to load podcast episodes" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error })
    ] });
  }
  if (episodes.length === 0) {
    if (isOwnProfile) {
      return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "No podcast episodes published yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2", children: "Episodes you publish will appear here" }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: `/dashboard/${profile.username}/content/new/podcast`,
            className: "inline-flex items-center justify-center px-4 py-2 mt-4 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors",
            children: "Create your first episode"
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "No podcast episodes published yet" }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-2", children: [
        profile.name || profile.username,
        " hasn't published any episodes yet"
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Podcasts" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
          "Published episodes by ",
          profile.name || profile.username
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-primary/50 transition-colors", children: [
          /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Filter" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSortBy(sortBy === "recent" ? "popular" : "recent"),
            className: "flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-primary/50 transition-colors",
            children: [
              /* @__PURE__ */ jsx(ArrowUpDown, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: sortBy === "recent" ? "Most Recent" : "Most Popular" })
            ]
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6", children: episodes.map((episode) => /* @__PURE__ */ jsx(
      "div",
      {
        className: "bg-card border rounded-lg overflow-hidden",
        children: /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-6", children: [
          /* @__PURE__ */ jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-48 h-48 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: episode.cover_url || `https://source.unsplash.com/random/400x400?podcast&sig=${episode.id}`,
              alt: episode.title,
              className: "w-full h-full object-cover"
            }
          ) }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground mb-1", children: [
                /* @__PURE__ */ jsx("span", { children: episode.category || "Podcast" }),
                /* @__PURE__ */ jsx("span", { children: "•" }),
                /* @__PURE__ */ jsx("span", { children: episode.duration })
              ] }),
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: episode.title }),
              /* @__PURE__ */ jsx("p", { className: `text-muted-foreground mt-2 line-clamp-2 ${getTextLanguageClass(episode.description)}`, children: episode.description })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-6 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 fill-yellow-500 text-yellow-500" }),
                /* @__PURE__ */ jsx("span", { children: episode.rating.toFixed(1) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-muted-foreground" }),
                /* @__PURE__ */ jsx("span", { children: episode.duration })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                episode.views.toLocaleString(),
                " listeners"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: new Date(episode.created_at).toLocaleDateString() })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: `/player/podcast-${episode.id}`,
                  className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                  children: "Listen Now"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setPlaying(playing === episode.id ? null : episode.id),
                  className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors",
                  children: playing === episode.id ? /* @__PURE__ */ jsx(Pause, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Play, { className: "w-5 h-5 ml-0.5" })
                }
              )
            ] })
          ] })
        ] }) })
      },
      episode.id
    )) })
  ] });
}
function CreatorSeries({ profile }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("recent");
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSeries, setExpandedSeries] = useState(null);
  const isOwnProfile = (user == null ? void 0 : user.id) === profile.id;
  useEffect(() => {
    const loadSeries = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: seriesData, error: seriesError } = await supabase.from("series").select("*").eq("author_id", profile.id).order(sortBy === "recent" ? "updated_at" : "created_at", { ascending: false });
        if (seriesError) throw seriesError;
        const seriesWithContent = await Promise.all(
          (seriesData || []).map(async (seriesItem) => {
            const [articlesResult, booksResult, audiobooksResult, podcastsResult] = await Promise.all([
              supabase.from("articles").select("id, title, created_at, cover_url, view_count").eq("series_id", seriesItem.id).eq("status", "published").order("created_at", { ascending: false }),
              supabase.from("books").select("id, title, created_at, cover_url, view_count").eq("series_id", seriesItem.id).eq("status", "published").order("created_at", { ascending: false }),
              supabase.from("audiobooks").select("id, title, created_at, cover_url, view_count").eq("series_id", seriesItem.id).eq("status", "published").order("created_at", { ascending: false }),
              supabase.from("podcast_episodes").select("id, title, created_at, cover_url, view_count").eq("series_id", seriesItem.id).eq("status", "published").order("created_at", { ascending: false })
            ]);
            const transformContent = (items, type) => (items || []).map((item) => ({
              id: item.id,
              title: item.title,
              created_at: item.created_at,
              cover_url: item.cover_url,
              type,
              views: item.view_count ?? 0
            }));
            const allContent = [
              ...transformContent(articlesResult.data, "article"),
              ...transformContent(booksResult.data, "book"),
              ...transformContent(audiobooksResult.data, "audiobook"),
              ...transformContent(podcastsResult.data, "podcast")
            ];
            allContent.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const totalViews = allContent.reduce((sum, item) => sum + (item.views || 0), 0);
            const latestContent = allContent.length > 0 ? allContent[0] : null;
            return {
              ...seriesItem,
              content_count: allContent.length,
              total_views: totalViews,
              latest_content: latestContent,
              content_items: allContent
            };
          })
        );
        setSeries(seriesWithContent);
      } catch (err) {
        console.error("Error loading series:", err);
        setError(err instanceof Error ? err.message : "Failed to load series");
      } finally {
        setLoading(false);
      }
    };
    loadSeries();
  }, [profile.id, sortBy]);
  const handleContentClick = (item) => {
    switch (item.type) {
      case "article":
        navigate(`/reader/article-${item.id}`);
        break;
      case "book":
        navigate(`/reader/book-${item.id}`);
        break;
      case "audiobook":
      case "podcast":
        navigate(`/player/${item.type}-${item.id}`);
        break;
    }
  };
  const getContentIcon = (type) => {
    switch (type) {
      case "article":
        return /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" });
      case "book":
        return /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4" });
      case "audiobook":
        return /* @__PURE__ */ jsx(Headphones, { className: "w-4 h-4" });
      case "podcast":
        return /* @__PURE__ */ jsx(Mic, { className: "w-4 h-4" });
      default:
        return /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" });
    }
  };
  const formatContentType = (type) => {
    switch (type) {
      case "article":
        return "Article";
      case "book":
        return "Book";
      case "audiobook":
        return "Audiobook";
      case "podcast":
        return "Podcast";
      default:
        return type;
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "animate-pulse", children: /* @__PURE__ */ jsx("div", { className: "bg-card border rounded-lg p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-32 h-48 bg-muted rounded-lg" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-1/2" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-1/4" })
      ] })
    ] }) }) }, i)) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
      /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-medium", children: "Failed to load series" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error })
    ] });
  }
  if (series.length === 0) {
    if (isOwnProfile) {
      return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "No series created yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2", children: "Create content and organize it into series to help readers follow your stories" }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: `/dashboard/${profile.username}/content/new/article`,
            className: "inline-flex items-center justify-center px-4 py-2 mt-4 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors",
            children: "Create your first content"
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "No series published yet" }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-2", children: [
        profile.name || profile.username,
        " hasn't created any series yet"
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Series" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
          "Organized content collections by ",
          profile.name || profile.username
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-primary/50 transition-colors", children: [
          /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Filter" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSortBy(sortBy === "recent" ? "popular" : "recent"),
            className: "flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-primary/50 transition-colors",
            children: [
              /* @__PURE__ */ jsx(ArrowUpDown, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: sortBy === "recent" ? "Most Recent" : "Most Popular" })
            ]
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-6", children: series.map((seriesItem) => {
      var _a;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-card border rounded-lg overflow-hidden",
          children: [
            /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-6", children: [
              /* @__PURE__ */ jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-32 h-48 rounded-lg overflow-hidden bg-muted", children: ((_a = seriesItem.latest_content) == null ? void 0 : _a.cover_url) ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: seriesItem.latest_content.cover_url,
                  alt: seriesItem.title,
                  className: "w-full h-full object-cover"
                }
              ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsx(BookOpen, { className: "w-8 h-8 text-muted-foreground" }) }) }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h2", { className: `text-xl font-semibold ${getTextLanguageClass(seriesItem.title)}`, children: seriesItem.title }),
                  /* @__PURE__ */ jsx("p", { className: `text-muted-foreground mt-2 line-clamp-2 ${getTextLanguageClass(seriesItem.description)}`, children: seriesItem.description })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-6 text-sm", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4 text-muted-foreground" }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      seriesItem.content_count,
                      " episodes"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4 text-muted-foreground" }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      seriesItem.total_views.toLocaleString(),
                      " total views"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-muted-foreground" }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      "Started ",
                      new Date(seriesItem.created_at).toLocaleDateString()
                    ] })
                  ] }),
                  seriesItem.latest_content && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Latest:" }),
                    /* @__PURE__ */ jsx("span", { children: new Date(seriesItem.latest_content.created_at).toLocaleDateString() })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setExpandedSeries(expandedSeries === seriesItem.id ? null : seriesItem.id),
                      className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                      children: expandedSeries === seriesItem.id ? "Hide Episodes" : "View Episodes"
                    }
                  ),
                  seriesItem.latest_content && /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => handleContentClick(seriesItem.latest_content),
                      className: "flex items-center gap-2 text-sm text-primary hover:underline",
                      children: [
                        "Read Latest Episode",
                        /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
                      ]
                    }
                  )
                ] })
              ] })
            ] }) }),
            expandedSeries === seriesItem.id && /* @__PURE__ */ jsx("div", { className: "border-t bg-muted/30", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium mb-4", children: "Episodes in this series" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-3", children: seriesItem.content_items.map((item, index) => /* @__PURE__ */ jsxs(
                "div",
                {
                  onClick: () => handleContentClick(item),
                  className: "flex items-center gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium", children: seriesItem.content_items.length - index }),
                    /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-lg overflow-hidden bg-muted", children: item.cover_url ? /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: item.cover_url,
                        alt: item.title,
                        className: "w-full h-full object-cover"
                      }
                    ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center", children: getContentIcon(item.type) }) }),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [
                          getContentIcon(item.type),
                          /* @__PURE__ */ jsx("span", { className: "capitalize", children: formatContentType(item.type) })
                        ] }),
                        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "•" }),
                        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: new Date(item.created_at).toLocaleDateString() })
                      ] }),
                      /* @__PURE__ */ jsx("h4", { className: `font-medium line-clamp-1 hover:text-primary transition-colors ${getTextLanguageClass(item.title)}`, children: item.title }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1 text-xs text-muted-foreground", children: [
                        /* @__PURE__ */ jsx(Eye, { className: "w-3 h-3" }),
                        /* @__PURE__ */ jsxs("span", { children: [
                          (item.views || 0).toLocaleString(),
                          " views"
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" })
                  ]
                },
                item.id
              )) }),
              seriesItem.content_items.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
                /* @__PURE__ */ jsx(BookOpen, { className: "w-8 h-8 mx-auto mb-2 opacity-50" }),
                /* @__PURE__ */ jsx("p", { children: "No episodes in this series yet" })
              ] })
            ] }) })
          ]
        },
        seriesItem.id
      );
    }) })
  ] });
}
const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};
function CreatorProfilePage({ usernameOverride, viewerId } = {}) {
  const { username: routeUsername } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const username = usernameOverride ?? routeUsername;
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatorData, setCreatorData] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const tabsRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const checkScrollButtons = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  };
  const handleScroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };
  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, []);
  useEffect(() => {
    const loadCreatorData = async () => {
      var _a, _b, _c, _d;
      if (!username) return;
      try {
        setLoading(true);
        setError(null);
        setDebugInfo(null);
        const isUserIdParam = isUUID(username);
        const { data: creatorData2, error: creatorError } = await supabase.rpc("get_creator_profile_fast", { username });
        if (creatorError) {
          console.error("Creator data error:", creatorError);
          setDebugInfo({ creator_error: creatorError });
          throw creatorError;
        }
        if (!(creatorData2 == null ? void 0 : creatorData2[0])) {
          console.error("No creator data returned");
          setDebugInfo({ creator_data: creatorData2 });
          throw new Error("Failed to load creator data");
        }
        const data = creatorData2[0];
        setIsOwnProfile((viewerId ?? (user == null ? void 0 : user.id) ?? null) === data.profile.id);
        const normalizedProfile = {
          ...data.profile,
          role: data.profile.role ?? "creator",
          expertise: data.profile.expertise ?? [],
          social_links: data.profile.social_links ?? {}
        };
        data.profile = normalizedProfile;
        data.recent_content = {
          articles: ((_a = data.recent_content) == null ? void 0 : _a.articles) || [],
          books: ((_b = data.recent_content) == null ? void 0 : _b.books) || [],
          audiobooks: ((_c = data.recent_content) == null ? void 0 : _c.audiobooks) || [],
          podcasts: ((_d = data.recent_content) == null ? void 0 : _d.podcasts) || []
        };
        console.log("Featured content check:", {
          articles: data.recent_content.articles.filter((a) => a.featured),
          books: data.recent_content.books.filter((b) => b.featured),
          audiobooks: data.recent_content.audiobooks.filter((ab) => ab.featured),
          podcasts: data.recent_content.podcasts.filter((p) => p.featured)
        });
        setCreatorData(data);
      } catch (err) {
        console.error("Error in loadCreatorData:", err);
        setError(err instanceof Error ? err.message : "Failed to load creator data");
      } finally {
        setLoading(false);
      }
    };
    loadCreatorData();
  }, [username, viewerId, user == null ? void 0 : user.id]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Loading creator profile..." })
    ] }) });
  }
  if (error || !creatorData) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center space-y-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Creator not found" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error || "The creator you're looking for doesn't exist or has been removed." }),
      false,
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate(-1),
          className: "text-primary hover:underline",
          children: "Go back"
        }
      )
    ] }) });
  }
  const headerProfile = {
    id: creatorData.profile.id,
    username: creatorData.profile.username,
    name: creatorData.profile.name ?? creatorData.profile.username,
    avatar_url: creatorData.profile.avatar_url ?? `https://source.unsplash.com/random/100x100?face&sig=${creatorData.profile.id}`,
    cover_url: creatorData.profile.cover_url ?? "",
    bio: creatorData.profile.bio ?? "",
    verified: creatorData.profile.verified ?? false
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col", children: [
    /* @__PURE__ */ jsx(
      CreatorHeader,
      {
        profile: headerProfile,
        stats: creatorData.stats
      }
    ),
    /* @__PURE__ */ jsxs("main", { className: "flex-1", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b relative", children: /* @__PURE__ */ jsxs("div", { className: "container max-w-7xl mx-auto px-4", children: [
        showLeftArrow && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleScroll("left"),
            className: "md:hidden absolute left-0 top-0 bottom-0 z-10 px-2 flex items-center justify-center bg-gradient-to-r from-background via-background to-transparent",
            children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsx(
          "nav",
          {
            ref: tabsRef,
            className: "flex overflow-x-auto scrollbar-hide scroll-smooth",
            onScroll: checkScrollButtons,
            children: [
              { id: "home", label: "Home" },
              { id: "articles", label: "Articles" },
              { id: "series", label: "Series" },
              { id: "books", label: "E-Books" },
              { id: "audiobooks", label: "Audiobooks" },
              { id: "podcasts", label: "Podcasts" }
            ].map((tab) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setActiveTab(tab.id),
                className: `shrink-0 px-4 py-4 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
                children: tab.label
              },
              tab.id
            ))
          }
        ),
        showRightArrow && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleScroll("right"),
            className: "md:hidden absolute right-0 top-0 bottom-0 z-10 px-2 flex items-center justify-center bg-gradient-to-l from-background via-background to-transparent",
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "container max-w-7xl mx-auto px-4 py-8", children: [
        activeTab === "home" && /* @__PURE__ */ jsx(
          CreatorHome,
          {
            profile: creatorData.profile,
            stats: creatorData.stats,
            recentContent: creatorData.recent_content,
            isOwnProfile
          }
        ),
        activeTab === "articles" && /* @__PURE__ */ jsx(CreatorArticles, { profile: creatorData.profile }),
        activeTab === "series" && /* @__PURE__ */ jsx(CreatorSeries, { profile: creatorData.profile }),
        activeTab === "books" && /* @__PURE__ */ jsx(CreatorEbooks, { profile: creatorData.profile }),
        activeTab === "audiobooks" && /* @__PURE__ */ jsx(CreatorAudiobooks, { profile: creatorData.profile }),
        activeTab === "podcasts" && /* @__PURE__ */ jsx(CreatorPodcasts, { profile: creatorData.profile })
      ] })
    ] })
  ] });
}
export {
  CreatorProfilePage
};
