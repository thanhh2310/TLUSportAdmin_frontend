import React from "react";
import { Search } from "lucide-react";
import { getAdminRole } from "@/lib/auth";

const ROLE_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "ROLE_USER", label: "Khách hàng" },
  { value: "ROLE_STAFF", label: "Nhân viên" },
];

const UserFilters = ({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  totalCount,
}) => {
  const role = getAdminRole();
  const isStaff = role === "ROLE_STAFF";

  return (
    <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-3xl border border-neutral-200 shadow-sm">
      <div className="flex flex-wrap gap-3 items-center flex-1">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-neutral-300 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200 text-sm font-medium"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 size-5" />
        </div>

        {!isStaff && (
          <div className="flex items-center gap-1.5">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRoleFilter(opt.value)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  roleFilter === opt.value
                    ? "bg-neutral-950 border-neutral-950 text-white"
                    : "bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs font-bold text-neutral-400 shrink-0">
        Hiển thị: {totalCount} tài khoản
      </div>
    </div>
  );
};

export default UserFilters;
