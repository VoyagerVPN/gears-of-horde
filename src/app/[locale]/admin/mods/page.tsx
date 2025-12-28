"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "@/i18n/routing";
import {
  Plus, Edit, Eye,
  Trash2, Globe, Check, X, ExternalLink, RefreshCw,
  ArrowUp, ArrowDown, ArrowUpDown, Package, User
} from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import { fetchAllMods, fetchPendingSuggestions, approveTranslationSuggestion, rejectTranslationSuggestion, updateModAction, deleteModAction } from "@/app/actions/admin-actions";
import { fetchPendingModSubmissions, rejectModSubmission } from "@/app/actions/mod-submission-actions";
import { fetchTagsByCategory } from "@/app/actions/tag-actions";
import { ModData, TranslationSuggestion, ModSubmission, TagData } from "@/types/mod";
import Image from "next/image";
import UpdateModModal from "@/components/mod/UpdateModModal";
import Tag from "@/components/ui/Tag";
import AuthorTag from "@/components/AuthorTag";
import VersionTag from "@/components/VersionTag";
import DateDisplay from "@/components/DateDisplay";
import { useToast } from "@/components/ui/Toast";
import UnifiedTopBar from "@/components/ui/UnifiedTopBar";

import { useTranslations } from 'next-intl';

type SortColumn = 'title' | 'author' | 'gameVersion' | 'version' | 'tags' | 'status' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

// Sort icon component
const SortIcon = ({ column, currentSortColumn, sortDirection }: { column: SortColumn, currentSortColumn: SortColumn, sortDirection: SortDirection }) => {
  if (currentSortColumn !== column) {
    return <ArrowUpDown size={14} className="opacity-30" />;
  }
  return sortDirection === 'asc'
    ? <ArrowUp size={14} className="text-primary" />
    : <ArrowDown size={14} className="text-primary" />;
};

export default function AdminModsPage() {
  const t = useTranslations('Admin');
  const t_common = useTranslations('Common');
  const { showToast } = useToast();
  const [selectedMod, setSelectedMod] = useState<ModData | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mods, setMods] = useState<ModData[]>([]);
  const [suggestions, setSuggestions] = useState<TranslationSuggestion[]>([]);
  const [modSubmissions, setModSubmissions] = useState<ModSubmission[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [rejectingSubmissionId, setRejectingSubmissionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [gameVersionTags, setGameVersionTags] = useState<TagData[]>([]);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortColumn>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const loadData = async () => {
      const [loadedMods, loadedSuggestions, loadedModSubmissions, loadedGameVersionTags] = await Promise.all([
        fetchAllMods(),
        fetchPendingSuggestions(),
        fetchPendingModSubmissions(),
        fetchTagsByCategory('gamever')
      ]);
      setMods(loadedMods);
      setSuggestions(loadedSuggestions);
      setModSubmissions(loadedModSubmissions);
      setGameVersionTags(loadedGameVersionTags);
    };
    loadData();
  }, [refreshTrigger]);

  const handleUpdateClick = (mod: ModData) => {
    setSelectedMod(mod);
    setIsUpdateModalOpen(true);
  };

  const handleSaveUpdate = async (updates: Partial<ModData>) => {
    if (!selectedMod) return;

    try {
      await updateModAction(selectedMod.slug, {
        ...updates
      });
      setRefreshTrigger(prev => prev + 1); // Refresh list
    } catch (error) {
      console.error("Failed to update mod:", error);
      showToast(t('updateModError'), 'error');
    }
  };

  const handleDelete = async (slug: string) => {
    if (confirm(t('deleteModConfirm'))) {
      try {
        await deleteModAction(slug);
        setRefreshTrigger(prev => prev + 1);
        showToast(t('deleteModSuccess'), 'success');
      } catch (error) {
        console.error("Failed to delete mod:", error);
        showToast(t('deleteModError'), 'error');
      }
    }
  };

  const handleApprove = async (id: string) => {
    await approveTranslationSuggestion(id);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReject = async (id: string) => {
    await rejectTranslationSuggestion(id);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRejectModSubmission = async () => {
    if (!rejectingSubmissionId || !rejectionReason.trim()) return;
    await rejectModSubmission(rejectingSubmissionId, rejectionReason);
    setRejectingSubmissionId(null);
    setRejectionReason("");
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle column header click
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, start with ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // SortIcon removed from here

  // Filter and sort mods
  const filteredAndSortedMods = useMemo(() => {
    // First filter
    const result = mods.filter(mod =>
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'gameVersion':
          comparison = a.gameVersion.localeCompare(b.gameVersion);
          break;
        case 'version':
          comparison = a.version.localeCompare(b.version);
          break;
        case 'tags':
          comparison = (a.tags?.length || 0) - (b.tags?.length || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'updatedAt':
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [mods, searchQuery, sortColumn, sortDirection]);

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="max-w-[1600px] w-full mx-auto pb-8">

        {/* === PENDING TRANSLATIONS DASHBOARD === */}
        {suggestions.length > 0 && (
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-primary" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-exo2">{t('pendingTranslations')}</h2>
                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{suggestions.length}</span>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="min-w-[120px]">
                      <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-0.5">{t('mod')}</div>
                      <div className="text-sm font-bold text-white">{suggestion.modSlug}</div>
                    </div>
                    <div className="min-w-[80px]">
                      <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-0.5">{t('lang')}</div>
                      <div className="text-sm font-mono font-bold text-primary">{suggestion.languageCode}</div>
                    </div>
                    <div className="min-w-[150px]">
                      <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-0.5">{t('author')}</div>
                      <div className="text-sm text-white">{suggestion.author}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-0.5">{t('link')}</div>
                      <a href={suggestion.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline">
                        {suggestion.link} <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(suggestion.id)}
                      className="p-2 hover:bg-white/10 text-textMuted hover:text-red-500 rounded-lg transition-colors"
                      title={t('reject')}
                    >
                      <X size={18} />
                    </button>
                    <button
                      onClick={() => handleApprove(suggestion.id)}
                      className="px-3 py-1.5 bg-primary hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-red-900/20"
                      title={t('approve')}
                    >
                      <Check size={14} /> {t('approve')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === PENDING MOD SUBMISSIONS DASHBOARD === */}
        {modSubmissions.length > 0 && (
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-amber-500" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-exo2">{t('pendingModSubmissions')}</h2>
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{modSubmissions.length}</span>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {modSubmissions.map((submission) => (
                <div key={submission.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Submitter Avatar */}
                    <div className="flex items-center gap-2 min-w-[140px]">
                      {submission.submitterImage ? (
                        <Image
                          src={submission.submitterImage}
                          alt={submission.submitterName}
                          width={28}
                          height={28}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
                          <User size={14} className="text-textMuted" />
                        </div>
                      )}
                      <span className="text-sm text-white font-medium truncate">{submission.submitterName}</span>
                    </div>

                    {/* Mod Title */}
                    <div className="min-w-[200px]">
                      <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-0.5">{t('modName')}</div>
                      <div className="text-sm font-bold text-white">{submission.title}</div>
                    </div>

                    {/* Author */}
                    <div className="min-w-[120px]">
                      <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-0.5">{t('author')}</div>
                      <div className="text-sm text-white">{submission.author}</div>
                    </div>

                    {/* Version */}
                    <div className="min-w-[80px]">
                      <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-0.5">{t('version')}</div>
                      <div className="text-sm font-mono text-primary">{submission.version}</div>
                    </div>

                    {/* Game Version */}
                    <div className="min-w-[80px]">
                      <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-0.5">{t('gameVersion')}</div>
                      <div className="text-sm font-mono text-textMuted">{submission.gameVersion}</div>
                    </div>

                    {/* Note if exists */}
                    {submission.submitterNote && (
                      <div className="max-w-[200px]">
                        <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-0.5">{t('note')}</div>
                        <div className="text-xs text-textMuted truncate" title={submission.submitterNote}>{submission.submitterNote}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRejectingSubmissionId(submission.id)}
                      className="p-2 hover:bg-white/10 text-textMuted hover:text-red-500 rounded-lg transition-colors"
                      title={t('reject')}
                    >
                      <X size={18} />
                    </button>
                    <Link href={`/editor?fromSubmission=${submission.id}`}>
                      <button
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-900/20"
                        title={t('reviewSubmission')}
                      >
                        <Edit size={14} /> {t('review')}
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectingSubmissionId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setRejectingSubmissionId(null)}>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-white mb-4">{t('rejectSubmission')}</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('rejectionReasonPlaceholder')}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-textMuted text-sm resize-none h-24 focus:outline-none focus:border-primary"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => { setRejectingSubmissionId(null); setRejectionReason(""); }}
                  className="px-4 py-2 text-sm font-bold text-textMuted hover:text-white border border-white/10 rounded-lg transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleRejectModSubmission}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('reject')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <UnifiedTopBar title={t('modsCatalog')}>
          <Link href="/editor">
            <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-red-900/20 uppercase tracking-wider font-exo2">
              <Plus size={18} /> {t('addNewMod')}
            </button>
          </Link>
        </UnifiedTopBar>

        <div className="px-6 lg:px-8 space-y-8">
          {/* Toolbar */}
          <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-white/5 shadow-sm">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('searchMods')}
              variant="compact"
            />
          </div>

          {/* Table */}
          <div className="bg-surface border border-white/5 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-white/5 text-textMuted uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th
                    className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors select-none w-[20%]"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      {t('modName')}
                      <SortIcon column="title" currentSortColumn={sortColumn} sortDirection={sortDirection} />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors select-none w-[10%]"
                    onClick={() => handleSort('author')}
                  >
                    <div className="flex items-center gap-2">
                      {t('author')}
                      <SortIcon column="author" currentSortColumn={sortColumn} sortDirection={sortDirection} />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors select-none w-[8%]"
                    onClick={() => handleSort('gameVersion')}
                  >
                    <div className="flex items-center gap-2">
                      {t('gameVersion')}
                      <SortIcon column="gameVersion" currentSortColumn={sortColumn} sortDirection={sortDirection} />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors select-none w-[8%]"
                    onClick={() => handleSort('version')}
                  >
                    <div className="flex items-center gap-2">
                      {t('version')}
                      <SortIcon column="version" currentSortColumn={sortColumn} sortDirection={sortDirection} />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors select-none w-[15%]"
                    onClick={() => handleSort('tags')}
                  >
                    <div className="flex items-center gap-2">
                      {t('tags')}
                      <SortIcon column="tags" currentSortColumn={sortColumn} sortDirection={sortDirection} />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors select-none w-[8%]"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      {t('status')}
                      <SortIcon column="status" currentSortColumn={sortColumn} sortDirection={sortDirection} />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors select-none w-[10%]"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center gap-2">
                      {t('lastUpdated')}
                      <SortIcon column="updatedAt" currentSortColumn={sortColumn} sortDirection={sortDirection} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right w-[140px]">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAndSortedMods.map((mod) => (
                  <tr key={mod.slug} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-bold text-white text-base truncate max-w-0" title={mod.title}>{mod.title}</td>
                    <td className="px-6 py-4">
                      <AuthorTag author={mod.author} href={`/mods?author=${encodeURIComponent(mod.author)}`} />
                    </td>
                    <td className="px-6 py-4">
                      <VersionTag
                        type="game"
                        version={mod.gameVersion}
                        color={mod.tags.find(t => t.category === 'gamever')?.color || undefined}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <VersionTag type="mod" version={mod.version} />
                    </td>
                    <td className="px-6 py-4 overflow-hidden">
                      <div className="flex flex-nowrap gap-1 overflow-hidden">
                        {mod.tags.filter(tag => tag.category !== 'author' && tag.category !== 'gamever').slice(0, 3).map(tag => (
                          <Tag key={tag.id || tag.displayName} color={tag.color || undefined} className="text-[10px] px-1.5 py-0.5 whitespace-nowrap">
                            {tag.displayName}
                          </Tag>
                        ))}
                        {mod.tags.filter(t => t.category !== 'author' && t.category !== 'gamever').length > 3 && (
                          <span className="text-[10px] text-textMuted self-center whitespace-nowrap">+{mod.tags.filter(t => t.category !== 'author' && t.category !== 'gamever').length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Tag category="status" value={mod.status}>
                        {t_common(`statuses.${mod.status}`)}
                      </Tag>
                    </td>
                    <td className="px-6 py-4 text-textMuted text-xs">
                      {mod.updatedAt ? (
                        <DateDisplay date={mod.updatedAt} locale="en" />
                      ) : (
                        t('recently')
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link href={`/mods/${mod.slug}`} target="_blank">
                          <button className="p-2 hover:bg-white/10 rounded text-textMuted hover:text-blue-400 transition-colors" title={t('viewLive')}>
                            <Eye size={16} />
                          </button>
                        </Link>

                        <button
                          onClick={() => handleUpdateClick(mod)}
                          className="p-2 hover:bg-white/10 rounded text-textMuted hover:text-green-400 transition-colors"
                          title={t('quickUpdate')}
                        >
                          <RefreshCw size={16} />
                        </button>

                        <Link href={`/editor/${mod.slug}`}>
                          <button className="p-2 hover:bg-white/10 rounded text-textMuted hover:text-white transition-colors" title={t('fullEdit')}>
                            <Edit size={16} />
                          </button>
                        </Link>

                        <button
                          onClick={() => handleDelete(mod.slug)}
                          className="p-2 hover:bg-red-500/10 rounded text-textMuted hover:text-red-400 transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <UpdateModModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            mod={selectedMod}
            onSave={handleSaveUpdate}
            gameVersionTags={gameVersionTags}
            onGameVersionTagsRefresh={() => fetchTagsByCategory('gamever').then(setGameVersionTags)}
          />
        </div>
      </div>
    </div>
  );
}
