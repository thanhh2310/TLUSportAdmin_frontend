import React, { useRef, useEffect } from "react";
import { Archive, RefreshCw, Trash2, Download, MessageSquare } from "lucide-react";
import AdminChatProductCard from "./AdminChatProductCard";
import { toast } from "sonner";

const ChatArea = ({
  activeSession,
  messages,
  loadingMessages,
  hasMoreMessages,
  onLoadMoreMessages,
  onCloseSession,
  onReopenSession,
  onExportChat,
  notes,
  noteInput,
  setNoteInput,
  onAddNote,
  actionLoading,
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, notes]);

  const getInitials = (name) => {
    if (!name) return "KV";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleDeleteClick = () => {
    toast.error("Hệ thống chưa hỗ trợ xoá phiên chat vật lý để bảo toàn dữ liệu kiểm toán");
  };

  const activeSessionNotes = activeSession ? (notes[activeSession.id] || []) : [];

  return (
    <div className="bg-white border border-neutral-200 rounded-[2rem] shadow-sm flex flex-col h-full overflow-hidden">
      {!activeSession ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400">
          <div className="size-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300 mb-4 border border-dashed border-neutral-200">
            <MessageSquare className="size-10" />
          </div>
          <h3 className="text-lg font-black text-neutral-800">Không có hội thoại nào được chọn</h3>
          <p className="text-sm font-medium mt-1.5 max-w-sm text-neutral-500">
            Hãy chọn một cuộc hội thoại từ danh sách bên trái để theo dõi chi tiết nội dung trò chuyện.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header Profile Details */}
          <div className="px-6 py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              {/* initials avatar */}
              <div className="size-11 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-black text-sm border-2 border-white shadow-sm shrink-0">
                {getInitials(activeSession.userName)}
              </div>
              <div>
                <h4 className="font-black text-neutral-900 leading-tight">
                  {activeSession.userName || "Khách vãng lai"}
                </h4>
                <p className="text-xs text-neutral-500 mt-1 font-medium flex flex-wrap gap-x-2 gap-y-0.5">
                  {activeSession.userEmail && <span>Email: {activeSession.userEmail}</span>}
                  <span>• SĐT: 0987 654 321</span> {/* Số SĐT mẫu theo thiết kế mockup */}
                </p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              {/* Close/Reopen session */}
              {activeSession.sessionStatus === "ACTIVE" ? (
                <button
                  onClick={() => onCloseSession(activeSession.id)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 disabled:opacity-60 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <Archive className="size-3.5" />
                  Lưu trữ
                </button>
              ) : (
                <button
                  onClick={() => onReopenSession(activeSession.id)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 rounded-2xl text-xs font-bold transition-all cursor-pointer border-none shadow-sm"
                >
                  <RefreshCw className="size-3.5" />
                  Mở lại
                </button>
              )}

              {/* Delete chat mockup button */}
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Trash2 className="size-3.5" />
                Xóa hội thoại
              </button>

              {/* Export chat button */}
              <button
                onClick={onExportChat}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-100 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                title="Xuất lịch sử chat ra tệp tin TXT"
              >
                <Download className="size-3.5" />
                Xuất chat
              </button>
            </div>
          </div>

          {/* Messages & Notes Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#f5f6f1]/30 flex flex-col gap-4 min-h-[250px]">
            {/* Load more messages button */}
            {hasMoreMessages && (
              <button
                onClick={onLoadMoreMessages}
                disabled={loadingMessages}
                className="self-center py-1.5 px-4 bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 text-[11px] font-bold rounded-full cursor-pointer shadow-sm transition-all mb-3"
              >
                {loadingMessages ? "Đang tải..." : "Tải tin nhắn cũ hơn"}
              </button>
            )}

            {/* Render message bubbles */}
            {messages.map((msg) => {
              const isUser = msg.senderType === "USER";
              const time = new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              });

              return (
                <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  {/* Bot Logo Icon */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full border border-neutral-200 bg-white flex items-center justify-center mr-2 shrink-0 self-start mt-1 shadow-sm overflow-hidden">
                      <img src="/logo/TLUSportLogo.svg" alt="logo" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 max-w-[75%]">
                    <div className={`px-4 py-2.5 rounded-2xl leading-relaxed text-sm ${
                      isUser
                        ? "bg-blue-100 text-neutral-900 rounded-tr-none shadow-sm"
                        : "bg-white border border-neutral-200 text-neutral-800 rounded-tl-none shadow-sm"
                    }`}>
                      <p className="whitespace-pre-line text-xs font-semibold leading-relaxed">
                        {msg.messageText}
                      </p>
                    </div>

                    {/* Suggested products carousel */}
                    {!isUser && msg.retrievedProductIdList && msg.retrievedProductIdList.length > 0 && (
                      <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none max-w-full">
                        {msg.retrievedProductIdList.map((pid) => (
                          <AdminChatProductCard key={pid} productId={pid} />
                        ))}
                      </div>
                    )}

                    <span className={`text-[10px] text-neutral-400 font-bold ${isUser ? "text-right mr-1" : "text-left ml-1"}`}>
                      {time}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Render internal notes if any */}
            {activeSessionNotes.length > 0 && (
              <div className="mt-8 flex flex-col gap-2.5 shrink-0">
                <div className="flex items-center gap-2 border-b border-dashed border-amber-200 pb-2">
                  <span className="inline-flex size-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Ghi chú nội bộ</span>
                </div>
                {activeSessionNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl flex flex-col gap-1">
                    <p className="text-xs font-semibold text-neutral-800 leading-relaxed">{note.text}</p>
                    <span className="text-[9px] text-amber-600 font-black self-end uppercase">
                      {new Date(note.createdAt).toLocaleString("vi-VN")} • {note.author}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Internal Notes typing area at bottom */}
          <div className="px-5 py-4 bg-white border-t border-neutral-200 shrink-0">
            <div className="flex gap-3 items-center mb-2">
              <input
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onAddNote()}
                placeholder="Ghi chú nội bộ..."
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400 transition-colors"
              />
              <button
                onClick={onAddNote}
                disabled={!noteInput.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer border-none shadow-sm shrink-0"
              >
                Thêm ghi chú
              </button>
            </div>
            <span className="text-[11px] text-neutral-400 select-none">
              Ghi chú chỉ hiển thị với admin, khách hàng không thấy nội dung này.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
