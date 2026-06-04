import axiosInstance from "./axiosInstance";

const chatbotServices = {
  getStats: async () => {
    try {
      const res = await axiosInstance.get("/ai/admin/chatbot/stats");
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  getSessions: async (params = {}) => {
    try {
      const res = await axiosInstance.get("/ai/admin/chatbot/sessions", {
        params: {
          status: params.status || undefined,
          userId: params.userId || undefined,
          page: params.page || 1,
          size: params.size || 10,
        },
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  getSessionMessages: async (sessionId, page = 1, size = 100) => {
    try {
      const res = await axiosInstance.get(`/ai/admin/chatbot/sessions/${sessionId}/messages`, {
        params: { page, size },
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  closeSession: async (sessionId) => {
    try {
      const res = await axiosInstance.put(`/ai/admin/chatbot/sessions/${sessionId}/close`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  reopenSession: async (sessionId) => {
    try {
      const res = await axiosInstance.put(`/ai/admin/chatbot/sessions/${sessionId}/reopen`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};

export default chatbotServices;
