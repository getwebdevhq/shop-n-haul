"use client";

import { useState, useEffect, useRef } from "react";
import { uploadMediaAction, deleteMediaAction, listMediaAction } from "@/actions/media";
import { toast } from "sonner";
import { Folder, Upload, Copy, Trash2, Loader2, Eye } from "lucide-react";
import Image from "next/image";

const FOLDERS = ["products", "categories", "banners", "logos", "misc"];

interface MediaFile {
  name: string;
  url: string;
  created_at: string;
}

export default function MediaLibraryPage() {
  const [activeFolder, setActiveFolder] = useState("products");
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files when active folder changes
  const loadFiles = async (folder: string) => {
    setLoading(true);
    try {
      const res = await listMediaAction(folder);
      if (res.success && res.files) {
        setFiles(res.files);
      } else {
        toast.error(res.error || "Failed to load media files");
      }
    } catch (err) {
      toast.error("Error fetching media files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(activeFolder);
  }, [activeFolder]);

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);
    const toastId = toast.loading(`Uploading ${selectedFile.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", activeFolder);

      const res = await uploadMediaAction(formData);
      if (res.success) {
        toast.success("File uploaded successfully", { id: toastId });
        loadFiles(activeFolder);
      } else {
        toast.error(res.error || "Upload failed", { id: toastId });
      }
    } catch (err) {
      toast.error("Upload failed", { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle file deletion
  const handleDelete = async (url: string) => {
    if (!confirm("Are you sure you want to delete this file permanently?")) return;

    const toastId = toast.loading("Deleting file...");
    try {
      const res = await deleteMediaAction(url);
      if (res.success) {
        toast.success("File deleted successfully", { id: toastId });
        loadFiles(activeFolder);
      } else {
        toast.error(res.error || "Deletion failed", { id: toastId });
      }
    } catch (err) {
      toast.error("Deletion failed", { id: toastId });
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="font-display text-4xl font-light tracking-wide">Media Library</h1>
          <p className="text-stone/40 text-xs mt-1">Upload and manage product assets and logos.</p>
        </div>
        
        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-6 py-3.5 bg-gold text-charcoal hover:bg-ivory hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] transition-colors duration-500 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Uploading..." : "Upload Asset"}
          </button>
        </div>
      </div>

      {/* Folder Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone/10 pb-4">
        {FOLDERS.map((folder) => (
          <button
            key={folder}
            onClick={() => setActiveFolder(folder)}
            className={`px-4 py-2 text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer ${
              activeFolder === folder
                ? "text-gold border-b-2 border-gold"
                : "text-stone/40 hover:text-ivory"
            }`}
          >
            <span className="flex items-center gap-2">
              <Folder className="w-3.5 h-3.5" />
              {folder}
            </span>
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <p className="text-xs text-stone/40 uppercase tracking-widest">Loading assets...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center border border-dashed border-stone/20 py-24 space-y-3">
          <Folder className="w-8 h-8 text-stone/20 mx-auto" />
          <p className="text-xs text-stone/40 uppercase tracking-widest">No files in this folder.</p>
          <p className="text-[10px] text-stone/50">Upload an image to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {files.map((file) => (
            <div
              key={file.url}
              className="bg-[#161616] border border-stone/10 group relative flex flex-col justify-between overflow-hidden aspect-square"
            >
              {/* Thumbnail Container */}
              <div className="relative flex-1 bg-stone/5 flex items-center justify-center overflow-hidden">
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleCopyUrl(file.url)}
                    title="Copy URL"
                    className="p-3 bg-[#111111] text-gold hover:bg-gold hover:text-charcoal transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.url)}
                    title="Delete Asset"
                    className="p-3 bg-[#111111] text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filename Footer */}
              <div className="p-3 bg-[#131313] border-t border-stone/10 flex items-center justify-between gap-2">
                <span className="text-[10px] text-stone/60 truncate font-mono flex-1">
                  {file.name}
                </span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone/40 hover:text-gold transition-colors"
                  title="View full image"
                >
                  <Eye className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
