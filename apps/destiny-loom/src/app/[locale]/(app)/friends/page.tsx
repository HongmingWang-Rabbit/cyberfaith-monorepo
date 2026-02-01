"use client";

import { useState, useEffect, useCallback } from "react";

interface Friend {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  friendshipId: string;
}

interface PendingRequest {
  id: string;
  requesterId: string;
  status: string;
  createdAt: string;
  requester: { id: string; name: string; email: string; avatarUrl?: string } | null;
}

interface SearchUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Reading {
  id: string;
  type: string;
  result: any;
  createdAt: string;
}

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : null;
}

export default function FriendsPage() {
  const [tab, setTab] = useState<"friends" | "requests" | "search">("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendReadings, setFriendReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const headers = getAuthHeaders();

  const fetchFriends = useCallback(async () => {
    if (!headers) return;
    const res = await fetch("/api/friends", { headers });
    const data = await res.json();
    if (data.success) setFriends(data.data || []);
  }, []);

  const fetchRequests = useCallback(async () => {
    if (!headers) return;
    const res = await fetch("/api/friends/requests", { headers });
    const data = await res.json();
    if (data.success) setRequests(data.data || []);
  }, []);

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, [fetchFriends, fetchRequests]);

  const searchUsers = async () => {
    if (!headers || !searchQuery.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`, { headers });
    const data = await res.json();
    if (data.success) setSearchResults(data.data || []);
    setLoading(false);
  };

  const sendRequest = async (addresseeId: string) => {
    if (!headers) return;
    const res = await fetch("/api/friends/request", {
      method: "POST",
      headers,
      body: JSON.stringify({ addresseeId }),
    });
    const data = await res.json();
    setMessage(data.success ? "Friend request sent! ✨" : data.message || "Failed to send request");
    setTimeout(() => setMessage(""), 3000);
  };

  const acceptRequest = async (id: string) => {
    if (!headers) return;
    await fetch(`/api/friends/accept/${id}`, { method: "POST", headers });
    fetchRequests();
    fetchFriends();
    setMessage("Friend request accepted! 🤝");
    setTimeout(() => setMessage(""), 3000);
  };

  const rejectRequest = async (id: string) => {
    if (!headers) return;
    await fetch(`/api/friends/reject/${id}`, { method: "POST", headers });
    fetchRequests();
    setMessage("Request declined");
    setTimeout(() => setMessage(""), 3000);
  };

  const removeFriend = async (friendshipId: string) => {
    if (!headers) return;
    await fetch(`/api/friends/${friendshipId}`, { method: "DELETE", headers });
    fetchFriends();
    setSelectedFriend(null);
    setMessage("Friend removed");
    setTimeout(() => setMessage(""), 3000);
  };

  const viewFriendReadings = async (friend: Friend) => {
    if (!headers) return;
    setSelectedFriend(friend);
    const res = await fetch(`/api/friends/${friend.friendshipId}/readings`, { headers });
    const data = await res.json();
    if (data.success) setFriendReadings(data.data || []);
  };

  const readingTypeIcons: Record<string, string> = {
    mbti: "🧠", tarot: "🃏", "i-ching": "☯️", "four-pillars": "🏛️", zodiac: "⭐",
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Neural Network
        </h1>
        <p className="text-center text-gray-400 mb-8">Connect with fellow seekers in the digital cosmos</p>

        {/* Toast */}
        {message && (
          <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-cyan-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg shadow-cyan-500/20 animate-pulse">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          {(["friends", "requests", "search"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelectedFriend(null); }}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                tab === t
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25"
                  : "bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60 border border-gray-700"
              }`}
            >
              {t === "friends" && `Friends (${friends.length})`}
              {t === "requests" && `Requests (${requests.length})`}
              {t === "search" && "Search"}
            </button>
          ))}
        </div>

        {/* Friend Profile Card */}
        {selectedFriend && (
          <div className="mb-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 to-purple-950/30 p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/30">
                  {selectedFriend.avatarUrl ? (
                    <img src={selectedFriend.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    selectedFriend.name[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedFriend.name}</h2>
                  <p className="text-gray-400 text-sm">{selectedFriend.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFriend(null)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => removeFriend(selectedFriend.friendshipId)}
                  className="px-4 py-2 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-900/60 border border-red-800 transition-all"
                >
                  Remove
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Public Readings</h3>
            {friendReadings.length === 0 ? (
              <p className="text-gray-500 italic">No public readings shared yet</p>
            ) : (
              <div className="grid gap-3">
                {friendReadings.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/40 border border-gray-700/50 hover:border-cyan-500/30 transition-all">
                    <span className="text-2xl">{readingTypeIcons[r.type] || "📖"}</span>
                    <div className="flex-1">
                      <span className="text-white font-medium capitalize">{r.type.replace("-", " ")}</span>
                      <span className="text-gray-500 text-sm ml-3">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friends List */}
        {tab === "friends" && !selectedFriend && (
          <div className="space-y-3">
            {friends.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🌐</div>
                <p className="text-gray-400 text-lg">No connections yet</p>
                <p className="text-gray-500 text-sm mt-2">Search for fellow seekers to build your network</p>
              </div>
            ) : (
              friends.map((f) => (
                <div
                  key={f.id}
                  onClick={() => viewFriendReadings(f)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/60 border border-gray-700/50 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white shadow-md group-hover:shadow-cyan-500/30 transition-shadow">
                    {f.avatarUrl ? (
                      <img src={f.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      f.name[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium group-hover:text-cyan-300 transition-colors">{f.name}</p>
                    <p className="text-gray-500 text-sm">{f.email}</p>
                  </div>
                  <span className="text-gray-600 group-hover:text-cyan-400 transition-colors">→</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pending Requests */}
        {tab === "requests" && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-400 text-lg">No pending requests</p>
              </div>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/60 border border-purple-500/20 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold text-white">
                    {r.requester?.avatarUrl ? (
                      <img src={r.requester.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      r.requester?.name[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{r.requester?.name || "Unknown"}</p>
                    <p className="text-gray-500 text-sm">{r.requester?.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(r.id)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectRequest(r.id)}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-600 transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Search */}
        {tab === "search" && (
          <div>
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                placeholder="Search by name..."
                className="flex-1 px-4 py-3 rounded-xl bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/10 transition-all"
              />
              <button
                onClick={searchUsers}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 transition-all"
              >
                {loading ? "..." : "Search"}
              </button>
            </div>

            <div className="space-y-3">
              {searchResults.map((u) => (
                <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/60 border border-gray-700/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      u.name[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{u.name}</p>
                    <p className="text-gray-500 text-sm">{u.email}</p>
                  </div>
                  <button
                    onClick={() => sendRequest(u.id)}
                    className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all"
                  >
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
