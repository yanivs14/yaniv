import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, X, Image as ImageIcon, Video } from "lucide-react";

export default function MediaUpload({ value, onChange, type = "image", label }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch {}
    setUploading(false);
  };

  const isVideo = type === "video" || (value && value.match(/\.(mp4|webm|mov|avi)$/i));

  return (
    <div>
      {label && <label className="text-xs font-bold text-[#1D2120] uppercase tracking-wider mb-2 block">{label}</label>}
      {value ? (
        <div className="relative">
          {isVideo ? (
            <video src={value} className="w-full rounded-2xl bg-black max-h-64" controls />
          ) : (
            <img src={value} alt="" className="w-full rounded-2xl object-cover max-h-64" />
          )}
          <button type="button" onClick={() => onChange("")} className="absolute top-2 right-2 w-8 h-8 bg-[#1D2120] text-white rounded-full flex items-center justify-center hover:bg-[#2a302e]">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-[#1D2120]/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-[#6B6B6B] hover:border-[#D4F658] hover:bg-[#D4F658]/5 transition-all"
        >
          {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : type === "video" ? <Video className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
          <span className="text-sm font-medium">{uploading ? "Uploading..." : `Upload ${type} from computer`}</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept={type === "video" ? "video/*" : "image/*"} className="hidden" onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])} />
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste URL..."
        className="w-full mt-2 border border-[#1D2120]/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#D4F658] bg-[#F5F5F3]"
      />
    </div>
  );
}