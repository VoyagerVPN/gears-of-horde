"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Save, AlertTriangle,
  ChevronDown, ExternalLink, HelpCircle
} from "lucide-react";
import * as Select from "@radix-ui/react-select";
import DatePicker from "@/components/ui/DatePicker";
import GameVersionSelector from "@/components/ui/GameVersionSelector";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { ModData, ModStatusType, TagData } from "@/types/mod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogButton,
  DialogField,
  dialogInputClass,
} from "@/components/ui/Dialog";
import { useTranslations, useLocale } from "next-intl";
import { STATUS_OPTIONS } from "@/lib/mod-constants";



/** Data structure for mod updates */
export interface ModUpdateData {
  version: string;
  gameVersion: string;
  status: ModStatusType;
  isSaveBreaking: boolean;
  eventType?: string;
  description?: string;
  date?: string;
  changes?: string[];
  sourceUrl?: string;
}

interface UpdateModModalProps {
  isOpen: boolean;
  onClose: () => void;
  mod: ModData | null;
  onSave: (updatedData: ModUpdateData) => void;
  gameVersionTags?: TagData[];
  onGameVersionTagsRefresh?: () => void;
}

export default function UpdateModModal({
  isOpen,
  onClose,
  mod,
  onSave,
  gameVersionTags = [],
  onGameVersionTagsRefresh
}: UpdateModModalProps) {
  const t = useTranslations('Common');
  const t_modal = useTranslations('UpdateModModal');
  const t_common = useTranslations('Common');
  const locale = useLocale() as 'en' | 'ru';
  const [formData, setFormData] = useState({
    version: "",
    gameVersion: "",
    status: "active" as ModStatusType,
    isSaveBreaking: false,
    date: "",
    description: "",
    sourceUrl: "",
    changes: [] as string[]
  });



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
    const hasChangelogDetails = formData.changes.some(line => line.trim() !== "");
    return isVersionChanged || gameVersionChanged || wipeChanged || hasChangelogDetails;
  }, [formData, mod, isVersionChanged]);

  const autoDescription = useMemo(() => {
    if (!mod) return "";
    if (isVersionChanged) {
      return t_modal('autoDescReleased', { version: formData.version });
    } else {
      const actionMap: Record<string, string> = {
        'active': t_modal('statusActionResumed'),
        'on_hold': t_modal('statusActionPaused'),
        'discontinued': t_modal('statusActionDiscontinued'),
        'upcoming': t_modal('statusActionAnnounced'),
        'unknown': t_modal('statusActionUpdated')
      };
      const action = actionMap[formData.status] || actionMap['unknown'];
      return t_modal('autoDescDevelopment', { title: mod.title, action });
    }
  }, [isVersionChanged, formData.version, formData.status, mod, t_modal]);



  if (!mod) return null;

  const handleSave = () => {
    const finalDescription = formData.description.trim() || autoDescription;
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

  const handleChangesChange = (html: string) => {
    const lines = htmlToArray(html);
    setFormData(prev => ({ ...prev, changes: lines }));
  };

  const currentStatusConfig = STATUS_OPTIONS.find(o => o.value === formData.status);
  const StatusIcon = currentStatusConfig?.icon || HelpCircle;



  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="xl">
        {/* Fixed modal corners by removing bg-surface class */}
        <DialogHeader className="border-b border-white/10 rounded-t-xl">
          <DialogTitle>{t_modal('title')}</DialogTitle>
          <DialogDescription>
            {t_modal('deployingChangesFor')} <span className="text-primary font-bold">{mod.title}</span>
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* 1. Meta Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <DialogField label={t_modal('newVersion')} smallLabel>
              <input
                id="mod-version"
                name="version"
                type="text"
                value={formData.version}
                onChange={e => setFormData({ ...formData, version: e.target.value })}
                className={`${dialogInputClass} font-mono h-[42px] selection:bg-primary/30 selection:text-white ${formData.version !== mod.version ? 'border-primary/40' : ''}`}
              />
            </DialogField>

            {/* Game Version Selector */}
            <DialogField label={t_modal('gameVersion')} smallLabel>
              <GameVersionSelector
                value={formData.gameVersion}
                onChange={(val) => setFormData({ ...formData, gameVersion: val })}
                gameVersionTags={gameVersionTags}
                onTagsRefresh={onGameVersionTagsRefresh}
                currentVersion={mod.gameVersion}
              />
            </DialogField>

            {/* Status Select */}
            <DialogField label={t_modal('status')} smallLabel>
              <Select.Root value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as ModStatusType })}>
                <Select.Trigger className="w-full flex items-center justify-between bg-black/20 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-lg p-2.5 text-sm text-white outline-none h-[42px] group">
                  <Select.Value asChild>
                    <div className="flex items-center gap-2">
                      <StatusIcon size={16} className={currentStatusConfig?.color} />
                      <span>{t_common(`statuses.${formData.status}`)}</span>
                    </div>
                  </Select.Value>
                  <Select.Icon>
                    <ChevronDown size={16} className="text-textMuted group-hover:text-white opacity-50" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content className="overflow-hidden bg-surface border border-white/10 rounded-lg shadow-xl z-[150]">
                    <Select.Viewport className="p-1">
                      {STATUS_OPTIONS.map((option) => {
                        const OptionIcon = option.icon;
                        const isCurrent = mod.status === option.value;
                        return (
                          <Select.Item key={option.value} value={option.value} className="flex items-center justify-between px-2 py-2 text-sm text-textMuted hover:text-white hover:bg-white/10 rounded cursor-pointer outline-none data-[state=checked]:text-white data-[state=checked]:bg-white/5 group">
                            <Select.ItemText asChild>
                              <div className="flex items-center gap-2">
                                <OptionIcon size={16} className={option.color} />
                                {t_common(`statuses.${option.value}`)}
                              </div>
                            </Select.ItemText>
                            <div className="flex items-center gap-2">
                              {isCurrent && (
                                <span className="text-[9px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                  {t('current')}
                                </span>
                              )}
                            </div>
                          </Select.Item>
                        )
                      })}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </DialogField>
          </div>

          {/* 2. Date & Wipe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <DialogField label={t_modal('releaseDate')} smallLabel>
              <div className="flex items-center bg-black/20 border border-white/10 hover:border-white/30 rounded-lg px-3 h-[42px] transition-colors">
                <DatePicker
                  value={formData.date ? new Date(formData.date) : undefined}
                  onChange={(date) => setFormData({ ...formData, date: date ? date.toISOString() : "" })}
                  placeholder={t('pickDate')}
                  className="flex-1"
                  locale={locale}
                />
              </div>
            </DialogField>

            <div
              onClick={() => setFormData({ ...formData, isSaveBreaking: !formData.isSaveBreaking })}
              className={`border rounded-lg flex gap-3 items-center px-3 h-[42px] cursor-pointer transition-colors ${formData.isSaveBreaking ? 'bg-red-500/10 border-red-500/20' : 'bg-black/20 border-white/10 hover:border-white/30'}`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${formData.isSaveBreaking ? 'border-red-500 bg-red-500 text-white' : 'border-white/20 bg-black/40'}`}>
                {formData.isSaveBreaking && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className={formData.isSaveBreaking ? "text-red-500" : "text-textMuted"} size={16} />
                <div className={`font-bold text-xs uppercase font-exo2 ${formData.isSaveBreaking ? "text-red-400" : "text-white"}`}>{t_modal('wipeRequired')}</div>
              </div>
            </div>
          </div>

          {/* 3. Description & Source URL */}
          <div className="space-y-4">
            <DialogField label={t_modal('updateDescription')} smallLabel>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-textMuted opacity-60">{t_modal('leaveEmptyForAutoGeneration')}</span>
              </div>
              <textarea
                id="update-description"
                name="description"
                rows={2}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className={`${dialogInputClass} resize-none leading-relaxed selection:bg-primary/30 selection:text-white`}
                placeholder={autoDescription}
              />
            </DialogField>

            <DialogField label={t_modal('sourceUrl')} smallLabel>
              <div className="relative">
                <input
                  id="source-url"
                  name="sourceUrl"
                  type="text"
                  value={formData.sourceUrl}
                  onChange={e => setFormData({ ...formData, sourceUrl: e.target.value })}
                  className={`${dialogInputClass} pl-8 selection:bg-primary/30 selection:text-white`}
                  placeholder="e.g. https://discord.com/channels/..."
                />
                <ExternalLink size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-textMuted opacity-50" />
              </div>
            </DialogField>
          </div>

          {/* 4. Changelog Details - Matching EditableChangelog styling */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest font-exo2">{t_modal('changelogDetails')}</h3>
            <RichTextEditor
              id="changelog"
              name="changes"
              value={arrayToHtml(formData.changes)}
              onChange={handleChangesChange}
              placeholder={t_modal('changelogPlaceholder')}
              minHeight="100px"
            />
          </div>
        </DialogBody>

        {/* Fixed modal corners - removed bg-surface */}
        <DialogFooter className="border-t border-white/10 rounded-b-xl">
          <DialogButton variant="secondary" onClick={onClose}>
            {t_modal('cancel')}
          </DialogButton>
          <DialogButton
            variant="primary"
            onClick={handleSave}
            className={!isContentUpdate ? "bg-zinc-700 hover:bg-zinc-600" : ""}
          >
            <Save size={16} />
            {isContentUpdate ? t_modal('publishUpdate') : t_modal('publishStatusChange')}
          </DialogButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}