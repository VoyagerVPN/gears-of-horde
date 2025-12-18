"use client";

import { useState } from "react";
import { X, Send, Globe, Link as LinkIcon, User } from "lucide-react";

interface SuggestLocalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  modSlug: string;
  modTitle: string;
}

export default function SuggestLocalizationModal({ isOpen, onClose, modSlug, modTitle }: SuggestLocalizationModalProps) {
  const [formData, setFormData] = useState({ code: "", url: "", author: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/mods/${modSlug}/suggest-localization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({ code: "", url: "", author: "" });
      }, 2000);

    } catch (err) {
      setError("Failed to submit suggestion. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-[#191919] border border-white/10 rounded-xl w-full max-w-[448px] shadow-2xl overflow-hidden flex flex-col relative">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-surface">
          <div>
            <h2 className="text-xl font-bold text-white font-exo2 uppercase tracking-wide flex items-center gap-2">
              Suggest Translation
            </h2>
            <p className="text-xs text-textMuted mt-1">
              Contribute a new language for <span className="text-primary font-bold">{modTitle}</span>
            </p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 bg-[#191919]">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-green-500 animate-in fade-in zoom-in">
              <Send size={48} className="mb-4" />
              <p className="text-lg font-bold uppercase">Thank you!</p>
              <p className="text-sm text-textMuted">Your suggestion has been submitted for review.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
                  {error}
                </div>
              )}

              {/* Language Code */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-textMuted uppercase flex items-center gap-1">
                  <Globe size={10} /> Language Code (e.g., FR, DE, UA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-black/20 border border-white/10 focus:border-primary/50 rounded-lg p-3 text-sm text-white font-mono outline-none uppercase placeholder:text-white/20"
                  placeholder="XX"
                />
              </div>

              {/* Download URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-textMuted uppercase flex items-center gap-1">
                  <LinkIcon size={10} /> Download URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 focus:border-primary/50 rounded-lg p-3 text-sm text-white outline-none placeholder:text-white/20"
                  placeholder="https://..."
                />
              </div>

              {/* Author Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-textMuted uppercase flex items-center gap-1">
                  <User size={10} /> Your Name / Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 focus:border-primary/50 rounded-lg p-3 text-sm text-white outline-none placeholder:text-white/20"
                  placeholder="Credit goes to..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.code || !formData.url || !formData.author}
                className="w-full mt-6 px-6 py-3 text-xs font-bold text-white bg-primary hover:bg-red-600 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-900/20 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
              >
                {isSubmitting ? "Submitting..." : <><Send size={16} /> Submit Suggestion</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}