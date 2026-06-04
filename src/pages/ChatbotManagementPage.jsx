import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import chatbotServices from "@/services/chatbotServices";
import ChatbotStatsCards from "@/components/chatbot/ChatbotStatsCards";
import ConversationList from "@/components/chatbot/ConversationList";
import ChatArea from "@/components/chatbot/ChatArea";

const ChatbotManagementPage = () => {
  // Stats state
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    closedSessions: 0,
    guestSessions: 0,
    authenticatedSessions: 0,
    todaySessions: 0,
    totalMessages: 0,
    userMessages: 0,
    botMessages: 0,
    systemMessages: 0,
    todayMessages: 0,
  });

  // Sessions and Active Chat state
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);

  // Filters state
  const [statusFilter, setStatusFilter] = useState(""); // "" (Tất cả), "ACTIVE", "CLOSED"
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(8);

  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Internal Notes State (persisted locally)
  const [notes, setNotes] = useState({}); // Key: sessionId, Value: Array of notes
  const [noteInput, setNoteInput] = useState("");

  // Load stats
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const res = await chatbotServices.getStats();
      if (res && res.code === 200) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Lỗi lấy thống kê chatbot:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load sessions
  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await chatbotServices.getSessions({
        status: statusFilter || null,
        page: currentPage,
        size: pageSize,
      });
      if (res && res.code === 200) {
        setSessions(res.data.items || []);
        setTotalPages(res.data.totalPage || 1);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách phiên chat:", error);
      toast.error("Không thể tải danh sách cuộc trò chuyện");
    } finally {
      setLoadingSessions(false);
    }
  };

  // Load active session messages
  const loadActiveMessages = async (sessionId, page = 1) => {
    try {
      setLoadingMessages(true);
      const res = await chatbotServices.getSessionMessages(sessionId, page, 50);
      if (res && res.code === 200) {
        if (page === 1) {
          setMessages(res.data.items || []);
        } else {
          setMessages((prev) => [...res.data.items, ...prev]);
        }
        setMessagesPage(page);
        setHasMoreMessages(page < res.data.totalPage);
      }
    } catch (error) {
      console.error("Lỗi tải tin nhắn:", error);
      toast.error("Không thể tải tin nhắn của phiên này");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadStats();
    const savedNotes = localStorage.getItem("chatbot_admin_notes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Reload sessions when filters or page changes
  useEffect(() => {
    loadSessions();
  }, [currentPage, statusFilter]);

  // Handle choosing a session
  const handleSelectSession = (session) => {
    setActiveSession(session);
    loadActiveMessages(session.id, 1);
  };

  // Archive/Close session
  const handleCloseSession = async (sessionId) => {
    try {
      setActionLoading(true);
      const res = await chatbotServices.closeSession(sessionId);
      if (res && res.code === 200) {
        toast.success("Đã đóng phiên chat và chuyển lưu trữ");
        loadStats();
        loadSessions();
        if (activeSession && activeSession.id === sessionId) {
          setActiveSession((prev) => ({ ...prev, sessionStatus: "CLOSED" }));
        }
      }
    } catch (error) {
      console.error("Lỗi đóng phiên chat:", error);
      toast.error("Không thể đóng phiên chat");
    } finally {
      setActionLoading(false);
    }
  };

  // Reopen session
  const handleReopenSession = async (sessionId) => {
    try {
      setActionLoading(true);
      const res = await chatbotServices.reopenSession(sessionId);
      if (res && res.code === 200) {
        toast.success("Đã mở lại phiên chat thành công");
        loadStats();
        loadSessions();
        if (activeSession && activeSession.id === sessionId) {
          setActiveSession((prev) => ({ ...prev, sessionStatus: "ACTIVE" }));
        }
      }
    } catch (error) {
      console.error("Lỗi mở lại phiên chat:", error);
      toast.error("Không thể mở lại phiên chat");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle adding internal note
  const handleAddNote = () => {
    if (!noteInput.trim() || !activeSession) return;
    const sessionId = activeSession.id;
    const newNote = {
      id: Date.now(),
      text: noteInput.trim(),
      createdAt: new Date().toISOString(),
      author: "Admin/Staff",
    };

    const updatedNotes = {
      ...notes,
      [sessionId]: [...(notes[sessionId] || []), newNote],
    };

    setNotes(updatedNotes);
    localStorage.setItem("chatbot_admin_notes", JSON.stringify(updatedNotes));
    setNoteInput("");
    toast.success("Đã thêm ghi chú nội bộ");
  };

  // Handle exporting chat to text file
  const handleExportChat = () => {
    if (!activeSession || messages.length === 0) return;

    let textContent = `LỊCH SỬ CHAT VỚI KHÁCH HÀNG\n`;
    textContent += `===============================\n`;
    textContent += `Phiên ID: ${activeSession.id}\n`;
    textContent += `Khách hàng: ${activeSession.userName || "Khách vãng lai"}\n`;
    textContent += `Email: ${activeSession.userEmail || "Chưa có"}\n`;
    textContent += `Trạng thái: ${activeSession.sessionStatus === "ACTIVE" ? "Đang hoạt động" : "Đã kết thúc"}\n`;
    textContent += `Thời gian bắt đầu: ${new Date(activeSession.createdAt).toLocaleString("vi-VN")}\n`;
    textContent += `===============================\n\n`;

    messages.forEach((msg) => {
      const time = new Date(msg.createdAt).toLocaleString("vi-VN");
      const sender = msg.senderType === "USER" ? "KHÁCH HÀNG" : "BOT TRỢ LÝ";
      textContent += `[${time}] ${sender}: ${msg.messageText}\n`;
      if (msg.retrievedProductIdList && msg.retrievedProductIdList.length > 0) {
        textContent += `   -> Gợi ý SP ID: ${msg.retrievedProductIdList.join(", ")}\n`;
      }
      textContent += `-------------------------------\n`;
    });

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat-history-${activeSession.id.substring(0, 8)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất và tải về lịch sử chat");
  };

  // Filter sessions locally by search term
  const filteredSessions = sessions.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchesName = s.userName && s.userName.toLowerCase().includes(term);
    const matchesEmail = s.userEmail && s.userEmail.toLowerCase().includes(term);
    const matchesId = s.id && s.id.toLowerCase().includes(term);
    const matchesMsg = s.lastMessage && s.lastMessage.toLowerCase().includes(term);
    return matchesName || matchesEmail || matchesId || matchesMsg;
  });

  return (
    <div>
      <PageHeader badge="AI Assistant" title="Quản lý Chatbot" />

      {/* 1. THỐNG KÊ CHATBOT CARDS */}
      <div className="mt-6">
        <ChatbotStatsCards stats={stats} loading={loadingStats} />
      </div>

      {/* 2. MAIN LAYOUT: Split Screen trái/phải */}
      <div className="mt-8 flex gap-6 items-stretch" style={{ height: "calc(100vh - 280px)", minHeight: "560px" }}>
        {/* CỘT TRÁI: DANH SÁCH HỘI THOẠI */}
        <div className="w-[360px] shrink-0 overflow-hidden">
          <ConversationList
            sessions={filteredSessions}
            activeSession={activeSession}
            onSelectSession={handleSelectSession}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            loading={loadingSessions}
          />
        </div>

        {/* CỘT PHẢI: KHUNG CHI TIẾT HỘI THOẠI */}
        <div className="flex-1 overflow-hidden">
          <ChatArea
            activeSession={activeSession}
            messages={messages}
            loadingMessages={loadingMessages}
            hasMoreMessages={hasMoreMessages}
            onLoadMoreMessages={() => loadActiveMessages(activeSession.id, messagesPage + 1)}
            onCloseSession={handleCloseSession}
            onReopenSession={handleReopenSession}
            onExportChat={handleExportChat}
            notes={notes}
            noteInput={noteInput}
            setNoteInput={setNoteInput}
            onAddNote={handleAddNote}
            actionLoading={actionLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatbotManagementPage;
