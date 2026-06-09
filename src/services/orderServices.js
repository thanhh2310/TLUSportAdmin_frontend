import axiosInstance from "./axiosInstance";

const orderServices = {
  getAllOrders: async (page = 1, size = 10) => {
    const res = await axiosInstance.get("/orders/all", {
      params: { page, size },
    });
    return res.data;
  },

  searchOrders: async ({ orderId, paymentMethodCode, minTotal, maxTotal, page = 1, size = 10 }) => {
    const res = await axiosInstance.get("/orders/search", {
      params: { orderId, paymentMethodCode, minTotal, maxTotal, page, size },
    });
    return res.data;
  },


  confirmOrder: async (orderId) => {
    const res = await axiosInstance.put(`/orders/${orderId}/confirm`);
    return res.data;
  },

  shipOrder: async (orderId) => {
    const res = await axiosInstance.put(`/orders/${orderId}/ship`);
    return res.data;
  },

  deliverOrder: async (orderId) => {
    const res = await axiosInstance.put(`/orders/${orderId}/deliver`);
    return res.data;
  },

  cancelOrder: async (orderId) => {
    const res = await axiosInstance.put(`/orders/${orderId}/cancel`);
    return res.data;
  },

  getReturnByOrderId: async (orderId) => {
    const res = await axiosInstance.get(`/order-returns/orders/${orderId}`);
    return res.data;
  },

  approveReturn: async (returnId, data) => {
    const res = await axiosInstance.put(`/order-returns/${returnId}/approve`, data);
    return res.data;
  },

  rejectReturn: async (returnId, data) => {
    const res = await axiosInstance.put(`/order-returns/${returnId}/reject`, data);
    return res.data;
  },
};

export default orderServices;
