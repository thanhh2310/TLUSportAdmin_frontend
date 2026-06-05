import axiosInstance from "./axiosInstance";

const userServices = {
  getAllUsers: async (pageNumber = 1, pageSize = 10) => {
    const res = await axiosInstance.get(
      `/users?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
    return res.data;
  },

  getUsersByRole: async (roleName, pageNumber = 1, pageSize = 10) => {
    const res = await axiosInstance.get(
      `/users/role/${roleName}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
    return res.data;
  },

  createUser: async (payload) => {
    const res = await axiosInstance.post("/users", payload);
    return res.data;
  },

  updateUser: async (id, payload) => {
    const res = await axiosInstance.put(`/users/${id}`, payload);
    return res.data;
  },

  toggleUserStatus: async (id) => {
    const res = await axiosInstance.patch(`/users/${id}/toggle-status`);
    return res.data;
  },

  getMyProfile: async () => {
    const res = await axiosInstance.get("/users/my-profile");
    return res.data;
  },
};

export default userServices;
