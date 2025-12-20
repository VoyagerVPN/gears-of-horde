"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from 'next-intl';
import { Plus, Trash2, Merge, RefreshCw, FolderEdit, FolderX, Gamepad2, Check } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import { fetchAllTags, createTag, updateTag, deleteTag, mergeTags, renameCategory, deleteCategory, TagData } from "@/app/actions/tag-actions";
import TagModal from "@/components/tags/TagModal";
import MergeTagModal from "@/components/tags/MergeTagModal";
import CategoryEditModal from "@/components/tags/CategoryEditModal";
import MergeCategoryModal from "@/components/tags/MergeCategoryModal";
import Tag from "@/components/ui/Tag";

export default function AdminTagsPage() {
    const t = useTranslations('Admin');
    const [tags, setTags] = useState<TagData[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<TagData | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [createCategory, setCreateCategory] = useState<string | undefined>(undefined);
    const [sortOption, setSortOption] = useState<'name' | 'usage'>('name');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Modals state
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [isMergeTagModalOpen, setIsMergeTagModalOpen] = useState(false);
    const [isCategoryEditModalOpen, setIsCategoryEditModalOpen] = useState(false);
    const [isMergeCategoryModalOpen, setIsMergeCategoryModalOpen] = useState(false);

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const loadTags = async () => {
            const loadedTags = await fetchAllTags();
            setTags(loadedTags);
        };
        loadTags();
    }, [refreshTrigger]);

    // Group tags by category
    const groupedTags = useMemo(() => {
        const groups: Record<string, TagData[]> = {};

        // Filter first
        const filtered = tags.filter(tag =>
            tag.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tag.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tag.category ?? '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.forEach(tag => {
            const category = tag.category ?? 'tag';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(tag);
        });

        // Sort tags within groups
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => {
                if (sortOption === 'name') {
                    return a.displayName.localeCompare(b.displayName);
                } else {
                    return (b.usageCount ?? 0) - (a.usageCount ?? 0);
                }
            });
        });

        return groups;
    }, [tags, searchQuery, sortOption]);

    // Get sorted categories
    const categories = useMemo(() => {
        const uniqueCategories = new Set([...Object.keys(groupedTags), 'author', 'tag']);
        return Array.from(uniqueCategories).sort();
    }, [groupedTags]);

    const allCategories = useMemo(() => {
        return Array.from(new Set(tags.map(t => t.category ?? 'tag').filter(Boolean))).sort() as string[];
    }, [tags]);

    // Tag Actions
    const handleCreateTag = (category?: string) => {
        setSelectedTag(null);
        setCreateCategory(category);
        setIsTagModalOpen(true);
    };

    const handleEditTag = (tag: TagData) => {
        setSelectedTag(tag);
        setCreateCategory(undefined);
        setIsTagModalOpen(true);
    };

    const handleDeleteTag = async (e: React.MouseEvent, tag: TagData) => {
        e.stopPropagation(); // Prevent opening edit modal
        if (tag.id) {
            setDeleteConfirmId(tag.id);
        }
    };

    const handleConfirmDelete = async (e: React.MouseEvent, tag: TagData) => {
        e.stopPropagation();
        if (tag.id) {
            const result = await deleteTag(tag.id);
            if (result.success) {
                setRefreshTrigger(prev => prev + 1);
                setDeleteConfirmId(null);
            } else {
                console.error("Failed to delete tag:", result.error);
                alert("Failed to delete tag");
            }
        }
    };

    // Close delete confirm when clicking elsewhere (using useEffect)
    useEffect(() => {
        const handleClickOutside = () => setDeleteConfirmId(null);
        if (deleteConfirmId) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [deleteConfirmId]);

    const handleSaveTag = async (data: { category: string; value: string; displayName: string; color?: string }) => {
        if (selectedTag && selectedTag.id) {
            const result = await updateTag(selectedTag.id, data);
            if (!result.success) {
                alert(`Failed to update tag: ${result.error}`);
                return;
            }
        } else {
            const result = await createTag(data);
            if (!result.success) {
                alert(`Failed to create tag: ${result.error}`);
                return;
            }
        }
        setRefreshTrigger(prev => prev + 1);
    };

    const handleMergeTagClick = (e: React.MouseEvent, tag: TagData) => {
        e.stopPropagation();
        setSelectedTag(tag);
        setIsMergeTagModalOpen(true);
    };

    const handleMergeTags = async (targetId: string) => {
        if (!selectedTag || !selectedTag.id) return;
        const result = await mergeTags({ sourceId: selectedTag.id, targetId });
        if (result.success) {
            setRefreshTrigger(prev => prev + 1);
        } else {
            alert(`Failed to merge tags: ${result.error}`);
        }
    };

    // Category Actions
    const handleEditCategory = (category: string) => {
        setSelectedCategory(category);
        setIsCategoryEditModalOpen(true);
    };

    const handleMergeCategory = (category: string) => {
        setSelectedCategory(category);
        setIsMergeCategoryModalOpen(true);
    };

    const handleDeleteCategory = async (category: string) => {
        if (confirm(t('deleteCategoryConfirm', { category }))) {
            try {
                await deleteCategory(category);
                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                console.error("Failed to delete category:", error);
            }
        }
    };

    const handleSaveCategory = async (oldCategory: string, newCategory: string) => {
        await renameCategory(oldCategory, newCategory);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleMergeCategories = async (targetCategory: string) => {
        if (!selectedCategory) return;
        await renameCategory(selectedCategory, targetCategory); // Reuse rename logic which handles merging
        setRefreshTrigger(prev => prev + 1);
    };

    const getCategoryDisplayName = (category: string) => {
        switch (category) {
            case 'gamever': return t('gameVersion');
            case 'tag': return t('tags');
            case 'author': return t('author');
            case 'lang': return t('lang');
            case 'status': return t('status');
            default: return category;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            <div className="max-w-[1600px] w-full mx-auto px-6 py-8 space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white font-exo2">{t('tagsManagement')}</h1>
                    <button
                        onClick={() => handleCreateTag()}
                        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-red-900/20 uppercase tracking-wider font-exo2"
                    >
                        <Plus size={18} /> {t('createTag')}
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-surface p-4 rounded-xl border border-white/5 shadow-sm">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t('searchTags')}
                        variant="compact"
                    />

                    <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
                        <div className="flex bg-black/20 rounded-md p-0.5 border border-white/10">
                            <button
                                onClick={() => setSortOption('name')}
                                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-colors ${sortOption === 'name' ? 'bg-white/10 text-white' : 'text-textMuted hover:text-white'}`}
                            >
                                {t('name')}
                            </button>
                            <button
                                onClick={() => setSortOption('usage')}
                                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-colors ${sortOption === 'usage' ? 'bg-white/10 text-white' : 'text-textMuted hover:text-white'}`}
                            >
                                {t('usage')}
                            </button>
                        </div>

                        <button
                            onClick={() => setRefreshTrigger(prev => prev + 1)}
                            className="p-2 hover:bg-white/10 rounded-lg text-textMuted hover:text-white transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {/* Categories List */}
                <div className="space-y-8">
                    {categories.map(category => (
                        <div key={category} className="bg-surface border border-white/5 rounded-xl overflow-hidden shadow-sm">
                            {/* Category Header */}
                            <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-white font-exo2 capitalize">
                                        {getCategoryDisplayName(category)}
                                    </h2>
                                    <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono text-textMuted">
                                        {(groupedTags[category] || []).length}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleMergeCategory(category)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded text-textMuted hover:text-yellow-400 transition-colors text-xs font-bold"
                                        title={t('mergeCategory')}
                                    >
                                        <Merge size={14} />
                                        {t('merge')}
                                    </button>
                                    <button
                                        onClick={() => handleEditCategory(category)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded text-textMuted hover:text-white transition-colors text-xs font-bold"
                                        title={t('editCategory')}
                                    >
                                        <FolderEdit size={14} />
                                        {t('edit')}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-500/10 rounded text-textMuted hover:text-red-400 transition-colors text-xs font-bold"
                                        title={t('deleteCategory')}
                                    >
                                        <FolderX size={14} />
                                        {t('delete')}
                                    </button>
                                </div>
                            </div>

                            {/* Tag Cloud */}
                            <div className="p-6">
                                <div className="flex flex-wrap gap-2">
                                    {(groupedTags[category] || []).map(tag => {
                                        const isConfirming = deleteConfirmId === tag.id;

                                        return (
                                            <div
                                                key={tag.id}
                                                className="group relative"
                                            >
                                                <Tag
                                                    variant="default"
                                                    className={`transition-all h-8 text-sm pr-1 ${isConfirming ? 'bg-black/40 border-primary/50' : 'hover:bg-white/10 hover:border-white/20'}`}
                                                    color={isConfirming ? undefined : (tag.color || undefined)}
                                                >
                                                    {category === 'gamever' && <Gamepad2 size={14} />}
                                                    <span
                                                        className="cursor-pointer"
                                                        onClick={() => handleEditTag(tag)}
                                                    >
                                                        {tag.displayName}
                                                    </span>
                                                    {category !== 'newscat' && (
                                                        <span className="opacity-50 cursor-pointer" onClick={() => handleEditTag(tag)}>({tag.usageCount})</span>
                                                    )}

                                                    {/* Controls Divider */}
                                                    <div className="h-4 w-px bg-white/10 mx-1" />

                                                    {/* Tag Actions */}
                                                    <div className="flex items-center gap-0.5">
                                                        {!isConfirming ? (
                                                            <>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleMergeTagClick(e, tag); }}
                                                                    className="p-1 hover:text-yellow-400 text-textMuted/50 transition-colors"
                                                                    title={t('merge')}
                                                                >
                                                                    <Merge size={12} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteTag(e, tag); }}
                                                                    className="p-1 hover:text-red-400 text-textMuted/50 transition-colors"
                                                                    title={t('delete')}
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleConfirmDelete(e, tag); }}
                                                                    className="p-1 text-primary hover:scale-110 transition-transform"
                                                                    title={t('confirm')}
                                                                >
                                                                    <Check size={12} />
                                                                </button>
                                                                <button
                                                                    disabled
                                                                    className="p-1 text-textMuted/30 cursor-not-allowed"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </Tag>
                                            </div>
                                        );
                                    })}
                                    <button
                                        onClick={() => handleCreateTag(category)}
                                        className="h-8 px-3 rounded border border-dashed border-white/20 text-textMuted hover:text-white hover:border-white/40 hover:bg-white/5 transition-all text-xs font-bold flex items-center gap-1"
                                    >
                                        <Plus size={14} />
                                        {t('add')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <div className="text-center py-20 text-textMuted">
                            {t('noTagsFound')}
                        </div>
                    )}
                </div>

                {/* Modals */}
                <TagModal
                    isOpen={isTagModalOpen}
                    onClose={() => setIsTagModalOpen(false)}
                    tag={selectedTag ? { ...selectedTag, id: selectedTag.id ?? '', category: selectedTag.category ?? 'tag', value: selectedTag.value ?? '' } : null}
                    onSave={handleSaveTag}
                    initialCategory={createCategory}
                    existingCategories={allCategories}
                />

                <MergeTagModal
                    isOpen={isMergeTagModalOpen}
                    onClose={() => setIsMergeTagModalOpen(false)}
                    sourceTag={selectedTag}
                    allTags={tags}
                    onMerge={handleMergeTags}
                />

                <CategoryEditModal
                    isOpen={isCategoryEditModalOpen}
                    onClose={() => setIsCategoryEditModalOpen(false)}
                    category={selectedCategory}
                    onSave={handleSaveCategory}
                />

                <MergeCategoryModal
                    isOpen={isMergeCategoryModalOpen}
                    onClose={() => setIsMergeCategoryModalOpen(false)}
                    sourceCategory={selectedCategory}
                    allCategories={allCategories}
                    onMerge={handleMergeCategories}
                />

            </div>
        </div>
    );
}
