"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  subscriptionTier: string;
  isActive: boolean;
  createdAt: string;
  readingCount: number;
}

function getToken(): string | null {
  try {
    const stored = localStorage.getItem("cyberfaith_auth");
    if (!stored) return null;
    return JSON.parse(stored).tokens.accessToken;
  } catch {
    return null;
  }
}

export function AdminUsersTable() {
  const t = useTranslations("admin");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    if (!token) return;

    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data.data || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateUser = async (id: string, updates: Record<string, string>) => {
    const token = getToken();
    if (!token) return;

    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    fetchUsers();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder={t("users.searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2 rounded-lg border border-border bg-card/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card/50 backdrop-blur-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left p-3">{t("users.name")}</th>
              <th className="text-left p-3">{t("users.email")}</th>
              <th className="text-left p-3">{t("users.role")}</th>
              <th className="text-left p-3">{t("users.tier")}</th>
              <th className="text-right p-3">{t("users.readings")}</th>
              <th className="text-left p-3">{t("users.joined")}</th>
              <th className="text-left p-3">{t("users.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">{t("loading")}</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">{t("users.noResults")}</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    onChange={(e) => updateUser(u.id, { role: e.target.value })}
                    className="bg-transparent border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-3">
                  <select
                    value={u.subscriptionTier}
                    onChange={(e) => updateUser(u.id, { subscriptionTier: e.target.value })}
                    className="bg-transparent border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="free">free</option>
                    <option value="pro">pro</option>
                  </select>
                </td>
                <td className="p-3 text-right font-mono">{u.readingCount}</td>
                <td className="p-3 text-muted-foreground text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <span className={`inline-block w-2 h-2 rounded-full ${u.isActive ? "bg-green-400" : "bg-red-400"}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("pagination.showing", { from: (page - 1) * 20 + 1, to: Math.min(page * 20, total), total })}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-border disabled:opacity-30 hover:bg-muted/50"
            >
              ←
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-border disabled:opacity-30 hover:bg-muted/50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
