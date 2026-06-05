import React from "react";
import { Search, Calendar, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { getPaginationRange } from "@/lib/utils";

const ConversationList = ({
  sessions,
  activeSession,
  onSelectSession,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  totalPages,
  loading,
}) => {
  // Helper to format date just like mockup: e.g. "10:32 AM", "Hôm qua", "2 ngày trước"
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    
    // Check if it is today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }

    // Check if it was yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    }

    // Difference in days
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      return `${diffDays} ngày trước`;
    }

    return date.toLocaleDateString("vi-VN");
  };

  const getInitials = (name) => {
    if (!name) return "KV";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };



  return (
    <div className="bg-white border border-neutral-200 rounded-[2rem] p-6 shadow-sm flex flex-col h-full overflow-hidden">
      <h3 className="text-xl font-black text-neutral-900 mb-5">Danh sách hội thoại</h3>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 mb-5 shrink-0">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 size-4" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-neutral-400 transition-colors"
          />
        </div>

        {/* Date Filter & Status Filter Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Date Picker Input Mock */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 size-4" />
            <input
              type="text"
              placeholder="Chọn ngày"
              readOnly
              className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-2xl text-xs font-semibold text-neutral-500 cursor-pointer focus:outline-none"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-neutral-200 rounded-2xl px-3 py-2 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-neutral-400 cursor-pointer"
          >
            <option value="">Trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="CLOSED">Đã kết thúc</option>
          </select>
        </div>
      </div>

      {/* Session list scroll area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 min-h-[350px]">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4 border border-neutral-100 rounded-3xl bg-neutral-50 animate-pulse">
              <div className="size-11 rounded-full bg-neutral-200 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/3" />
                  <div className="h-3 bg-neutral-200 rounded w-1/6" />
                </div>
                <div className="h-3 bg-neutral-200 rounded w-3/4" />
              </div>
            </div>
          ))
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-400">
            <MessageSquare className="size-12 opacity-20 mb-3" />
            <p className="text-sm font-bold">Không tìm thấy cuộc hội thoại nào</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = activeSession && activeSession.id === session.id;
            const isClosed = session.sessionStatus === "CLOSED";
            const initials = getInitials(session.userName);

            return (
              <button
                key={session.id}
                onClick={() => onSelectSession(session)}
                className={`w-full flex gap-3.5 p-4 border text-left transition-all rounded-[1.5rem] group cursor-pointer ${
                  isActive
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : "bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
                }`}
              >
                {/* Initials Avatar */}
                <div className={`size-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 border transition-all ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-700"
                    : "bg-blue-50 text-blue-700 border-blue-100 group-hover:scale-105"
                }`}>
                  {initials}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-black text-sm truncate text-neutral-900">
                      {session.userName || "Khách vãng lai"}
                    </span>
                    <span className="text-[11px] shrink-0 font-semibold text-neutral-400">
                      {formatTime(session.updatedAt)}
                    </span>
                  </div>
                  <p className="text-xs mt-1.5 truncate text-neutral-500">
                    {session.lastMessage || "(Chưa có tin nhắn)"}
                  </p>

                  <div className="flex items-center justify-between mt-2.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      !isClosed
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}>
                      {isClosed ? "Đã kết thúc" : "Đang hoạt động"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Pagination controls */}
      <div className="mt-4 border-t border-neutral-200 pt-4 shrink-0 flex items-center justify-center gap-1">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || loading}
          className="p-1.5 rounded-full hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronLeft className="size-4 text-neutral-600" />
        </button>

        {getPaginationRange(currentPage, totalPages).map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="w-8 text-center text-sm text-neutral-400 select-none font-bold">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || loading}
          className="p-1.5 rounded-full hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronRight className="size-4 text-neutral-600" />
        </button>
      </div>
    </div>
  );
};

export default ConversationList;
