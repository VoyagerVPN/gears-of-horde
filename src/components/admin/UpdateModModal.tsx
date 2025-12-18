"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X, Save, AlertTriangle,
  CheckCircle2, PauseCircle, Ban, ArrowUpCircle, HelpCircle,
  Calendar as CalendarIcon, ChevronDown, Check, Link as LinkIcon, ExternalLink
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import * as Select from "@radix-ui/react-select";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import DateDisplay from "@/components/DateDisplay";
import { ModData, ModStatusType } from "@/types/mod";
import { STATUS_OPTIONS } from "@/lib/mod-constants";

interface UpdateModModalProps {
  isOpen: boolean;
  onClose: () => void;
  mod: ModData | null;
  onSave: (updatedData: any) => void;
  locale?: 'en' | 'ru';
}

export default function UpdateModModal({ isOpen, onClose, mod, onSave, locale = 'en' }: UpdateModModalProps) {
  const [formData, setFormData] = useState({
    version: "",
    gameVersion: "",
    status: "active" as ModStatusType,
    isSaveBreaking: false,
    date: "",
    description: "",
    sourceUrl: "",
    changes: [] as string[] // Массив строк
  });

  // Блокировка скролла body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (mod && isOpen) {
      setFormData({
        version: mod.version,
        gameVersion: mod.gameVersion,
        status: mod.status,
        isSaveBreaking: false,
        date: new Date().toISOString(),
        description: "",
        sourceUrl: "",
        changes: [""]
      });
    }
  }, [mod, isOpen]);

  const isVersionChanged = mod ? formData.version !== mod.version : false;
  const isContentUpdate = useMemo(() => {
    if (!mod) return false;
    const gameVersionChanged = formData.gameVersion !== mod.gameVersion;
    const wipeChanged = formData.isSaveBreaking === true;
    // Проверяем, есть ли непустые строки в чейнджлоге
    const hasChangelogDetails = formData.changes.some(line => line.trim() !== "");
    return isVersionChanged || gameVersionChanged || wipeChanged || hasChangelogDetails;
  }, [formData, mod, isVersionChanged]);

  const autoDescription = useMemo(() => {
    if (!mod) return "";
    if (isVersionChanged) {
      return locale === 'ru' ? `${formData.version} вышла.` : `${formData.version} released.`;
    } else {
      const statusMap: Record<string, { en: string, ru: string }> = {
        'active': { en: 'resumed', ru: 'возобновлена' },
        'on_hold': { en: 'paused', ru: 'приостановлена' },
        'discontinued': { en: 'discontinued', ru: 'прекращена' },
        'upcoming': { en: 'announced', ru: 'анонсирована' },
        'unknown': { en: 'updated', ru: 'обновлена' }
      };
      const action = statusMap[formData.status]?.[locale] || statusMap['unknown'][locale];
      return locale === 'ru' ? `Разработка ${mod.title} ${action}.` : `Development of ${mod.title} ${action}.`;
    }
  }, [isVersionChanged, formData.version, formData.status, mod, locale]);


  if (!isOpen || !mod) return null;

  // --- HANDLERS ---

  const handleSave = () => {
    const finalDescription = formData.description.trim() || autoDescription;

    // Очищаем пустые строки из чейнджлога перед сохранением
    const cleanChanges = formData.changes
      .map(line => line.trim())
      .filter(line => line.length > 0);

    onSave({
      ...formData,
      description: finalDescription,
      changes: cleanChanges,
      eventType: isContentUpdate ? 'update' : 'status_change'
    });
    onClose();
  };

  // Обработчик изменения textarea чейнджлога
  const handleChangesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Разбиваем текст по переносам строк, сохраняя структуру для редактирования
    const lines = e.target.value.split("\n");
    setFormData(prev => ({ ...prev, changes: lines }));
  };

  const currentStatusConfig = STATUS_OPTIONS.find(o => o.value === formData.status);
  const StatusIcon = currentStatusConfig?.icon || HelpCircle;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto py-10">
      <div className="bg-[#191919] border border-white/10 rounded-xl w-full max-w-[672px] shadow-2xl flex flex-col my-auto relative max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-surface sticky top-0 z-10 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-white font-exo2 uppercase tracking-wide flex items-center gap-2">
              Update Mod
            </h2>
            <p className="text-xs text-textMuted mt-1">
              Deploying changes for <span className="text-primary font-bold">{mod.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 bg-[#191919] overflow-y-auto custom-scrollbar">

          {/* 1. Meta Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-textMuted uppercase">New Version</label>
              <input
                type="text"
                value={formData.version}
                onChange={e => setFormData({ ...formData, version: e.target.value })}
                className={`w-full bg-black/20 border focus:border-primary/50 rounded-lg p-2.5 text-sm text-white font-mono outline-none transition-colors h-[42px] ${formData.version !== mod.version ? 'border-primary/40 bg-primary/5' : 'border-white/10'}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-textMuted uppercase">Game Version</label>
              <input
                type="text"
                value={formData.gameVersion}
                onChange={e => setFormData({ ...formData, gameVersion: e.target.value })}
                className="w-full bg-black/20 border border-white/10 focus:border-primary/50 rounded-lg p-2.5 text-sm text-white font-mono outline-none h-[42px]"
              />
            </div>

            {/* Radix Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-textMuted uppercase">Status</label>
              <Select.Root value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as ModStatusType })}>
                <Select.Trigger className="w-full flex items-center justify-between bg-black/20 border border-white/10 hover:border-white/30 focus:border-primary/50 rounded-lg p-2.5 text-sm text-white outline-none h-[42px] group">
                  <Select.Value asChild>
                    <div className="flex items-center gap-2">
                      <StatusIcon size={16} className={currentStatusConfig?.color} />
                      <span>{currentStatusConfig?.label}</span>
                    </div>
                  </Select.Value>
                  <Select.Icon>
                    <ChevronDown size={16} className="text-textMuted group-hover:text-white opacity-50" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content className="overflow-hidden bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-[150]">
                    <Select.Viewport className="p-1">
                      {STATUS_OPTIONS.map((option) => {
                        const OptionIcon = option.icon;
                        const isCurrent = mod.status === option.value;
                        return (
                          <Select.Item key={option.value} value={option.value} className="flex items-center justify-between px-2 py-2 text-sm text-textMuted hover:text-white hover:bg-white/10 rounded cursor-pointer outline-none data-[state=checked]:text-white data-[state=checked]:bg-white/5 group">
                            <Select.ItemText asChild>
                              <div className="flex items-center gap-2">
                                <OptionIcon size={16} className={option.color} />
                                {option.label}
                              </div>
                            </Select.ItemText>
                            <div className="flex items-center gap-2">
                              {isCurrent && (
                                <span className="text-[9px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                  Current
                                </span>
                              )}
                              <Select.ItemIndicator>
                                <Check size={14} className="text-primary" />
                              </Select.ItemIndicator>
                            </div>
                          </Select.Item>
                        )
                      })}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>

          {/* 2. Date & Wipe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-textMuted uppercase flex items-center gap-1">
                <CalendarIcon size={10} /> Release Date
              </label>
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button className="w-full flex items-center justify-between bg-black/20 border border-white/10 hover:border-white/30 rounded-lg p-2.5 text-sm text-white transition-colors group h-[42px]">
                    <span className="font-mono text-xs">
                      <DateDisplay date={formData.date} locale={locale} />
                    </span>
                    <ChevronDown size={16} className="text-textMuted group-hover:text-white opacity-50" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="z-[150] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl p-2 animate-in fade-in zoom-in-95"
                    align="start"
                  >
                    <style jsx global>{`
                          .rdp { --rdp-cell-size: 32px; --rdp-accent-color: #ce4729; --rdp-background-color: #2d2d2d; margin: 0; }
                          .rdp-day_selected:not([disabled]) { background-color: var(--color-primary); color: white; }
                          .rdp-day:hover:not([disabled]):not(.rdp-day_selected) { background-color: rgba(255,255,255,0.1); }
                          .rdp-caption_label { color: white; font-family: var(--font-exo2); }
                          .rdp-head_cell { color: #a1a1a1; font-size: 0.8rem; }
                          .rdp-day { color: #ededed; font-size: 0.9rem; }
                          .rdp-button:hover:not([disabled]) { color: var(--color-primary); }
                        `}</style>
                    <DayPicker
                      mode="single"
                      selected={formData.date ? new Date(formData.date) : undefined}
                      onSelect={(date) => setFormData({ ...formData, date: date ? date.toISOString() : "" })}
                      required
                    />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>

            <div
              onClick={() => setFormData({ ...formData, isSaveBreaking: !formData.isSaveBreaking })}
              className={`border rounded-lg flex gap-3 items-center px-3 h-[42px] cursor-pointer transition-colors ${formData.isSaveBreaking ? 'bg-red-500/10 border-red-500/20' : 'bg-black/20 border-white/10 hover:border-white/30'}`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${formData.isSaveBreaking ? 'border-red-500 bg-red-500 text-white' : 'border-white/20 bg-black/40'}`}>
                {formData.isSaveBreaking && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className={formData.isSaveBreaking ? "text-red-500" : "text-textMuted"} size={16} />
                <div>
                  <div className={`font-bold text-xs uppercase mb-0.5 font-exo2 ${formData.isSaveBreaking ? "text-red-400" : "text-white"}`}>Wipe Required</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Description & Source URL */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-textMuted uppercase">Update Description (News Feed)</label>
                <span className="text-[9px] text-textMuted opacity-60">Leave empty for auto-generation</span>
              </div>
              <textarea
                rows={2}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-black/20 border border-white/10 focus:border-primary/50 rounded-lg p-3 text-sm text-white placeholder:text-white/20 outline-none resize-none"
                placeholder={autoDescription}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-textMuted uppercase flex items-center gap-1">
                <LinkIcon size={10} /> Source URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.sourceUrl}
                  onChange={e => setFormData({ ...formData, sourceUrl: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 focus:border-primary/50 rounded-lg pl-8 pr-3 py-2 text-sm text-white outline-none"
                  placeholder="e.g. https://discord.com/channels/..."
                />
                <ExternalLink size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-textMuted opacity-50" />
              </div>
            </div>
          </div>

          {/* 4. Changelog Details (TEXTAREA) */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest font-exo2">Changelog Details</h3>
            </div>

            <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
              <textarea
                rows={6}
                value={formData.changes.join("\n")} // Соединяем массив в текст для отображения
                onChange={handleChangesChange}
                className="w-full p-4 bg-transparent text-sm text-textMuted focus:text-white placeholder:text-textMuted/30 outline-none resize-y font-mono leading-relaxed"
                placeholder={`- Fixed critical bug\n- Added new weapon\n- Improved performance`}
              />
              <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 text-[10px] text-textMuted italic">
                Enter each change on a new line.
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-surface flex justify-end gap-3 sticky bottom-0 rounded-b-xl z-10">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-textMuted hover:text-white border border-white/10 rounded-lg transition-colors hover:bg-white/5 uppercase tracking-wider">
            Cancel
          </button>
          <button onClick={handleSave} className={`px-6 py-2 text-xs font-bold text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg uppercase tracking-wider ${isContentUpdate ? 'bg-primary hover:bg-red-600 shadow-red-900/20' : 'bg-zinc-700 hover:bg-zinc-600 shadow-zinc-900/20'}`}>
            <Save size={16} />
            {isContentUpdate ? "Publish Update" : "Publish Status Change"}
          </button>
        </div>

      </div>
    </div>
  );
}