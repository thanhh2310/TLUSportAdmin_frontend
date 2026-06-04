import React from "react";
import { Edit3, Lock, Unlock, Loader2 } from "lucide-react";

const ROLE_MAP = {
  ROLE_ADMIN: { label: "Admin", cls: "border-rose-300 text-neutral-700" },
  ROLE_STAFF: { label: "Nhân viên", cls: "text-neutral-700" },
  ROLE_USER: { label: "Khách hàng", cls: "border-neutral-300 text-neutral-600" },
};

const getRoleBadge = (role) => {
  const item = ROLE_MAP[role] || { label: role, cls: "border-neutral-300 text-neutral-500" };
  return (
    <span
      key={role}
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border bg-transparent ${item.cls}`}
    >
      {item.label}
    </span>
  );
};

const UsersTable = ({ users, isLoading, page, totalPages, setPage, onEdit, onToggleStatus }) => {
  if (isLoading) {
    return (
      <div className="w-full text-center py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-neutral-500 size-8" />
        <span className="text-neutral-500 font-bold">Đang tải danh sách người dùng...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-16 text-center shadow-sm">
        <h3 className="text-xl font-black text-neutral-900">Không tìm thấy tài khoản nào</h3>
        <p className="mt-2 text-sm font-medium text-neutral-500">
          Không có tài khoản nào phù hợp với tìm kiếm của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <th className="px-6 py-4">Họ và tên</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Số điện thoại</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-center w-36">Tác vụ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-extrabold text-neutral-900">
                    {user.lastName} {user.firstName}
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-neutral-700">{user.email}</td>
                <td className="px-6 py-4 font-semibold text-neutral-600">
                  {user.phoneNumber || (
                    <span className="text-neutral-300 italic text-xs">Chưa cập nhật</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles ? (
                      Array.from(user.roles).map((role) => getRoleBadge(role))
                    ) : (
                      <span className="text-neutral-300 italic text-xs">Chưa cập nhật</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-neutral-500 text-xs font-medium">
                  {user.createdAt ? (
                    new Date(user.createdAt).toLocaleDateString("vi-VN")
                  ) : (
                    <span className="text-neutral-300 italic text-xs">Chưa cập nhật</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-transparent text-neutral-700">
                    {user.isActive ? "Hoạt động" : "Bị khóa"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 shadow-sm transition-colors cursor-pointer"
                      title="Sửa thông tin"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(user)}
                      className={`p-2 rounded-xl border shadow-sm transition-colors cursor-pointer ${
                        user.isActive
                          ? "border-rose-100 bg-white hover:bg-rose-50 text-rose-500 hover:text-rose-600"
                          : "border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700"
                      }`}
                      title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                    >
                      {user.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-4">
          <span className="text-xs font-bold text-neutral-500">
            Trang {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Trang trước
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
