import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import userServices from "@/services/userServices";
import UserFilters from "@/components/users/UserFilters";
import UsersTable from "@/components/users/UsersTable";
import UserCreateModal from "@/components/users/UserCreateModal";
import UserEditModal from "@/components/users/UserEditModal";

const EMPTY_FORM = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  roles: ["ROLE_USER"],
  isActive: true,
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userServices.getAllUsers(page, pageSize);
      if (res && res.data) {
        setUsers(res.data.items || []);
        setTotalPages(res.data.totalPage || 1);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      toast.error("Không thể tải danh sách người dùng từ hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, roles: [role] }));
  };

  const openCreateModal = () => {
    setFormData(EMPTY_FORM);
    setIsCreateOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      roles: user.roles ? Array.from(user.roles) : ["ROLE_USER"],
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await userServices.createUser(formData);
      toast.success("Tạo tài khoản người dùng thành công!");
      setIsCreateOpen(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo tài khoản mới.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await userServices.updateUser(selectedUser.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        roles: formData.roles,
      });
      toast.success("Cập nhật thông tin tài khoản thành công!");
      setIsEditOpen(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật tài khoản.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const actionText = user.isActive ? "khóa" : "kích hoạt";
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản ${user.email}?`)) return;
    try {
      await userServices.toggleUserStatus(user.id);
      toast.success(`Đã ${actionText} tài khoản thành công!`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || `Không thể ${actionText} tài khoản.`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const matchesSearch =
      u.email?.toLowerCase().includes(searchLower) ||
      u.phoneNumber?.includes(searchLower) ||
      fullName.includes(searchLower);
    const matchesRole = !roleFilter || (u.roles && Array.from(u.roles).includes(roleFilter));
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          badge="Thành viên"
          title="Quản lý người dùng"
          description="Quản lý và cấp quyền tài khoản Quản trị viên, Nhân viên và Khách hàng trong hệ thống."
        />
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-black text-white hover:bg-neutral-800 active:bg-black transition-all cursor-pointer shadow-sm"
        >
          <UserPlus size={18} />
          Thêm tài khoản
        </button>
      </div>

      <UserFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        totalCount={filteredUsers.length}
      />

      <UsersTable
        users={filteredUsers}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        onEdit={openEditModal}
        onToggleStatus={handleToggleStatus}
      />

      <UserCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        formData={formData}
        onChange={handleInputChange}
        onRoleChange={handleRoleChange}
        onSubmit={handleCreateSubmit}
        actionLoading={actionLoading}
      />

      <UserEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        selectedUser={selectedUser}
        formData={formData}
        onChange={handleInputChange}
        onRoleChange={handleRoleChange}
        onSubmit={handleEditSubmit}
        actionLoading={actionLoading}
      />
    </div>
  );
};

export default UsersPage;
