"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2, Wand2, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  migrateProductCategories,
  seedStarterCategories,
  updateCategory,
  updateSubcategory,
} from "@/lib/actions/categories";

const inputClassName =
  "w-full rounded-xl border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const ghostButtonClassName =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#525252] transition-colors hover:bg-brand-soft hover:text-brand disabled:cursor-not-allowed disabled:opacity-40";
const saveButtonClassName =
  "cursor-pointer rounded-full bg-brand px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60";
const cancelButtonClassName =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#8A8A8A] transition-colors hover:bg-[#F5F5F5] hover:text-[#1A1A1A]";

export function CategoryManager({ categories = [], unassignedCount = 0 }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(() => new Set());
  const [pending, setPending] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [editingParent, setEditingParent] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [addingSubFor, setAddingSubFor] = useState(null);
  const [subDraft, setSubDraft] = useState("");

  const [deleting, setDeleting] = useState(null);

  const refresh = () => router.refresh();

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const run = async (key, task, successMessage) => {
    setPending(key);
    try {
      await task();
      toast.success(successMessage, { duration: 4000 });
      refresh();
      return true;
    } catch (error) {
      toast.error(error?.message || "Something went wrong. Please try again.", {
        duration: 6000,
      });
      return false;
    } finally {
      setPending(null);
    }
  };

  const handleAddCategory = async (event) => {
    event.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    const ok = await run(
      "add-category",
      () => createCategory({ name }),
      `Category “${name}” created`,
    );
    if (ok) {
      setNewCategoryName("");
      setIsAddingCategory(false);
    }
  };

  const handleSaveParent = async (category) => {
    const name = editingParent?.name?.trim();
    if (!name) return;
    const ok = await run(
      `parent-${category._id}`,
      () => updateCategory(category._id, { name }),
      `Category renamed to “${name}”`,
    );
    if (ok) setEditingParent(null);
  };

  const handleAddSub = async (category) => {
    const name = subDraft.trim();
    if (!name) return;
    const ok = await run(
      `add-sub-${category._id}`,
      () => createSubcategory(category._id, { name }),
      `Sub-category “${name}” added`,
    );
    if (ok) {
      setAddingSubFor(null);
      setSubDraft("");
    }
  };

  const handleSaveSub = async (category, sub) => {
    const name = editingSub?.name?.trim();
    if (!name) return;
    const ok = await run(
      `sub-${sub._id}`,
      () => updateSubcategory(category._id, sub._id, { name }),
      `Sub-category renamed to “${name}”`,
    );
    if (ok) setEditingSub(null);
  };

  const handleDeleteParent = async () => {
    const { category } = deleting;
    if (!category) return;
    const ok = await run(
      `del-${category._id}`,
      () => deleteCategory(category._id),
      `Category “${category.name}” deleted`,
    );
    if (ok) setDeleting(null);
  };

  const handleDeleteSub = async () => {
    const { category, sub } = deleting ?? {};
    if (!category || !sub) return;
    const ok = await run(
      `del-sub-${sub._id}`,
      () => deleteSubcategory(category._id, sub._id),
      `Sub-category “${sub.name}” deleted`,
    );
    if (ok) setDeleting(null);
  };

  const handleSeed = async () => {
    const ok = await run("seed", () => seedStarterCategories(), "Starter categories added");
    if (!ok) return;
    const result = await migrateProductCategories().catch(() => null);
    if (result) {
      toast.success(
        `Moved ${result.updatedProducts ?? 0} existing product(s) onto the new categories`,
        { duration: 6000 },
      );
      refresh();
    }
  };

  const handleMigrate = async () => {
    const ok = await run(
      "migrate",
      () => migrateProductCategories(),
      "Existing products re-linked to categories",
    );
    if (ok) return;
  };

  return (
    <div className="flex flex-col gap-5">
      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
          <p className="text-sm text-smoke">
            No categories yet. Create your first one, or start from the suggested
            set (Swing Chair, Furniture, Women&apos;s, Others).
          </p>
          <button
            type="button"
            onClick={handleSeed}
            disabled={pending === "seed"}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Wand2 size={14} />
            {pending === "seed" ? "Adding…" : "Add starter categories"}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleMigrate}
            disabled={pending === "migrate"}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold tracking-[0.12em] text-ink uppercase transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Wand2 size={14} />
            {pending === "migrate" ? "Re-linking…" : "Re-link existing products"}
          </button>
          {unassignedCount > 0 ? (
            <span className="text-xs text-smoke">
              {unassignedCount} product(s) not in any category
            </span>
          ) : null}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {categories.map((category) => {
          const isOpen = expanded.has(category._id);
          const subs = Array.isArray(category.subcategories) ? category.subcategories : [];
          const isEditingParent = editingParent?.id === category._id;
          const isAddingSub = addingSubFor === category._id;

          return (
            <div key={category._id} className="rounded-2xl border border-line bg-white">
              <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5">
                <button
                  type="button"
                  onClick={() => toggleExpanded(category._id)}
                  aria-expanded={isOpen}
                  aria-label={`Toggle sub-categories of ${category.name}`}
                  className={ghostButtonClassName}
                >
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {isEditingParent ? (
                  <input
                    autoFocus
                    value={editingParent.name}
                    onChange={(event) =>
                      setEditingParent((prev) => ({ ...prev, name: event.target.value }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSaveParent(category);
                      }
                      if (event.key === "Escape") setEditingParent(null);
                    }}
                    className={`${inputClassName} max-w-xs`}
                    aria-label={`Rename ${category.name}`}
                  />
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{category.name}</p>
                    <p className="truncate text-xs text-fog">
                     {category.productCount ?? 0} product
                      {(category.productCount ?? 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  {isEditingParent ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSaveParent(category)}
                        disabled={pending === `parent-${category._id}`}
                        className={saveButtonClassName}
                      >
                        {pending === `parent-${category._id}` ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingParent(null)}
                        className={cancelButtonClassName}
                        aria-label="Cancel rename"
                      >
                        <X size={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href={`/categories/${category.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className={saveButtonClassName}
                      >
                        View
                      </a>
                      <button
                        type="button"
                        onClick={() => setEditingParent({ id: category._id, name: category.name })}
                        className={ghostButtonClassName}
                        aria-label={`Rename ${category.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting({ type: "category", category })}
                        className={ghostButtonClassName}
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isOpen ? (
                <div className="border-t border-line px-4 py-3.5 sm:px-5">
                  {subs.length === 0 && !isAddingSub ? (
                    <p className="text-xs text-fog">No sub-categories yet.</p>
                  ) : null}
                  <ul className="flex flex-col gap-1.5">
                    {subs.map((sub) => {
                      const isEditingSub = editingSub?.id === sub._id;
                      return (
                        <li key={sub._id} className="flex flex-wrap items-center gap-2">
                          {isEditingSub ? (
                            <input
                              autoFocus
                              value={editingSub.name}
                              onChange={(event) =>
                                setEditingSub((prev) => ({ ...prev, name: event.target.value }))
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  handleSaveSub(category, sub);
                                }
                                if (event.key === "Escape") setEditingSub(null);
                              }}
                              className={`${inputClassName} max-w-xs`}
                              aria-label={`Rename ${sub.name}`}
                            />
                          ) : (
                            <>
                              <span className="min-w-0 flex-1 truncate text-sm text-ink">
                                {sub.name}
                              </span>
                              <span className="shrink-0 text-xs text-fog">
                                 {sub.productCount ?? 0}
                              </span>
                            </>
                          )}

                          <div className="flex items-center gap-1">
                            {isEditingSub ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSaveSub(category, sub)}
                                  disabled={pending === `sub-${sub._id}`}
                                  className={saveButtonClassName}
                                >
                                  {pending === `sub-${sub._id}` ? "Saving…" : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingSub(null)}
                                  className={cancelButtonClassName}
                                  aria-label="Cancel rename"
                                >
                                  <X size={15} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setEditingSub({ id: sub._id, name: sub.name })}
                                  className={ghostButtonClassName}
                                  aria-label={`Rename ${sub.name}`}
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleting({ type: "sub", category, sub })}
                                  className={ghostButtonClassName}
                                  aria-label={`Delete ${sub.name}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {isAddingSub ? (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleAddSub(category);
                      }}
                      className="mt-3 flex items-center gap-2"
                    >
                      <input
                        autoFocus
                        value={subDraft}
                        onChange={(event) => setSubDraft(event.target.value)}
                        placeholder="Sub-category name"
                        className={`${inputClassName} max-w-xs`}
                        aria-label="New sub-category name"
                      />
                      <button
                        type="submit"
                        disabled={pending === `add-sub-${category._id}`}
                        className={saveButtonClassName}
                      >
                        {pending === `add-sub-${category._id}` ? "Adding…" : "Add"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingSubFor(null);
                          setSubDraft("");
                        }}
                        className={cancelButtonClassName}
                        aria-label="Cancel adding sub-category"
                      >
                        <X size={15} />
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingSubFor(category._id)}
                      className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold tracking-[0.1em] text-brand uppercase hover:underline"
                    >
                      <Plus size={13} />
                      Add sub-category
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {isAddingCategory ? (
        <form
          onSubmit={handleAddCategory}
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3.5 sm:px-5"
        >
          <input
            autoFocus
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            placeholder="Category name, e.g. Swing Chair"
            className={`${inputClassName} max-w-sm`}
            aria-label="New category name"
          />
          <button
            type="submit"
            disabled={pending === "add-category"}
            className={saveButtonClassName}
          >
            {pending === "add-category" ? "Adding…" : "Add"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingCategory(false);
              setNewCategoryName("");
            }}
            className={cancelButtonClassName}
            aria-label="Cancel adding category"
          >
            <X size={15} />
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingCategory(true)}
          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-[#1A1A1A] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-brand"
        >
          <Plus size={15} strokeWidth={2} />
          ADD CATEGORY
        </button>
      )}

      {deleting?.type === "category" ? (
        <ConfirmDeleteDialog
          title="Delete category"
          body={`Delete “${deleting.category.name}”? Categories that still contain products cannot be deleted.`}
          isPending={pending === `del-${deleting.category._id}`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDeleteParent}
        />
      ) : null}

      {deleting?.type === "sub" ? (
        <ConfirmDeleteDialog
          title="Delete sub-category"
          body={`Delete “${deleting.sub.name}”? Sub-categories that still contain products cannot be deleted.`}
          isPending={pending === `del-sub-${deleting.sub._id}`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDeleteSub}
        />
      ) : null}
    </div>
  );
}

function ConfirmDeleteDialog({ title, body, isPending = false, onCancel, onConfirm }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
            <Trash2 size={18} strokeWidth={1.75} />
          </span>
          <h2 className="font-serif text-xl text-[#1A1A1A]">{title}</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#525252]">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="cursor-pointer rounded-full border border-[#E5E5E5] bg-transparent px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#1A1A1A] uppercase transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}