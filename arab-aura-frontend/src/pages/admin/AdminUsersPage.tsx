import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import type { AdminLayoutContextType } from "../../layouts/AdminLayout";
import {
  CloseIcon,
  CheckCircleIcon,
  PlusIcon,
  BellIcon,
  ShieldCheckIcon,
} from "../../components/Icons";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "seller" | "driver" | "collector" | "user";
  status: "active" | "suspended";
}

export const AdminUsersPage: React.FC = () => {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  const { isDarkMode } = useTheme();

  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: "USR-101",
      name: "عبدالرازق بدر",
      email: "abdelrazikrbadr@gmail.com",
      phone: "+20 100 123 4567",
      role: "admin",
      status: "active",
    },
    {
      id: "USR-102",
      name: "محمد أحمد",
      email: "seller@aura.com",
      phone: "+20 111 234 5678",
      role: "seller",
      status: "active",
    },
    {
      id: "USR-103",
      name: "محمود سعيد",
      email: "driver@aura.com",
      phone: "+20 122 345 6789",
      role: "driver",
      status: "active",
    },
    {
      id: "USR-104",
      name: "أحمد علي",
      email: "collector@aura.com",
      phone: "+20 155 456 7890",
      role: "collector",
      status: "active",
    },
    {
      id: "USR-105",
      name: "زياد ياسر",
      email: "ziad@aura.com",
      phone: "+20 109 876 5432",
      role: "user",
      status: "active",
    },
    {
      id: "USR-106",
      name: "سارة طارق",
      email: "sara@aura.com",
      phone: "+20 114 987 6543",
      role: "user",
      status: "suspended",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<
    "admin" | "seller" | "driver" | "collector" | "user"
  >("seller");

  // 💬 نظام مراسلة وتعميم الأدمن (Super Admin Messaging & Broadcast)
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgTargetUser, setMsgTargetUser] = useState<SystemUser | null>(null);
  const [msgTargetRole, setMsgTargetRole] = useState<string>("all");
  const [msgTitle, setMsgTitle] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [msgSuccessToast, setMsgSuccessToast] = useState("");

  const handleOpenDirectMessage = (user: SystemUser) => {
    setMsgTargetUser(user);
    setMsgTargetRole(user.role);
    setMsgTitle(`تنبيه إداري موجه إلى ${user.name}`);
    setShowMsgModal(true);
  };

  const handleOpenBroadcast = () => {
    setMsgTargetUser(null);
    setMsgTargetRole("all");
    setMsgTitle("إشعار وتعميم إداري رسمي من إدارة 3ARB AURA");
    setShowMsgModal(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    const targetLabel = msgTargetUser
      ? msgTargetUser.name
      : msgTargetRole === "all"
        ? "جميع مستخدمي المنصة"
        : `فئة (${msgTargetRole})`;
    setMsgSuccessToast(`تم إرسال الإشعار والرسالة بنجاح إلى ${targetLabel}!`);
    setShowMsgModal(false);
    setMsgTitle("");
    setMsgContent("");
    setMsgTargetUser(null);
    setTimeout(() => setMsgSuccessToast(""), 5000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newUser: SystemUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || "+20 100 000 0000",
      role: newRole,
      status: "active",
    };

    setUsers([newUser, ...users]);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewRole("seller");
    setShowAddModal(false);
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u,
      ),
    );
  };

  const handleDeleteUser = (id: string, name: string) => {
    const confirmText = isRtl
      ? `هل أنت متأكد من حذف المستخدم "${name}" نهائياً؟`
      : `Are you sure you want to permanently delete user "${name}"?`;
    if (window.confirm(confirmText)) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  };

  const t = {
    title: isRtl ? "إدارة المستخدمين والصلاحيات" : "User & Role Management",
    subtitle: isRtl
      ? "إضافة، حذف، وتعديل صلاحيات وحسابات المنصة والتحكم في حالتها"
      : "Add, modify, suspend, and manage all accounts across the platform",
    addUser: isRtl ? "إضافة حساب جديد" : "Add New User",
    searchPlaceholder: isRtl
      ? "بحث بالاسم، البريد الإلكتروني، أو المعرف..."
      : "Search by name, email, or ID...",
    allRoles: isRtl ? "جميع الأدوار" : "All Roles",
    roleAdmin: isRtl ? "أدمن" : "Admin",
    roleSeller: isRtl ? "بائع" : "Seller",
    roleDriver: isRtl ? "سائق" : "Driver",
    roleCollector: isRtl ? "مُجمّع" : "Collector",
    roleCustomer: isRtl ? "مستهلك" : "Customer",
    thId: isRtl ? "المعرف" : "ID",
    thUser: isRtl ? "المستخدم" : "User Info",
    thRole: isRtl ? "نوع الحساب" : "Role",
    thStatus: isRtl ? "الحالة" : "Status",
    thActions: isRtl ? "الإجراءات" : "Actions",
    active: isRtl ? "نشط" : "Active",
    suspended: isRtl ? "موقف" : "Suspended",
    suspendBtn: isRtl ? "إيقاف" : "Suspend",
    activateBtn: isRtl ? "تفعيل" : "Activate",
    deleteBtn: isRtl ? "حذف" : "Delete",
    modalTitle: isRtl ? "إضافة مستخدم جديد للنظام" : "Add New System Account",
    nameLabel: isRtl ? "الاسم الكامل" : "Full Name",
    emailLabel: isRtl ? "البريد الإلكتروني" : "Email Address",
    phoneLabel: isRtl ? "رقم الهاتف" : "Phone Number",
    roleLabel: isRtl ? "الصلاحية / الدور" : "Account Role",
    cancel: isRtl ? "إلغاء" : "Cancel",
    save: isRtl ? "حفظ الحساب" : "Save Account",
    noResults: isRtl
      ? "لا توجد نتائج مطابقة لبحثك الحالي"
      : "No users match your search criteria",
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <div
        className={`p-6 rounded-2xl border transition shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-black">{t.title}</h1>
          <p className="text-xs opacity-60 mt-1">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenBroadcast}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black transition cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <BellIcon className="w-4 h-4 text-slate-950" />
            <span>إرسال تعميم / رسالة للنظام</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-sm shrink-0 flex items-center gap-1.5"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{t.addUser}</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`p-4 rounded-xl border transition shadow-xs ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <span className="text-xs opacity-60 font-black">
            {isRtl ? "إجمالي الحسابات" : "Total Accounts"}
          </span>
          <p className="text-2xl font-black text-cyan-500 mt-1">{stats.total}</p>
        </div>

        <div
          className={`p-4 rounded-xl border transition shadow-xs ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <span className="text-xs opacity-60 font-black">
            {isRtl ? "الحسابات النشطة" : "Active Accounts"}
          </span>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {stats.active}
          </p>
        </div>

        <div
          className={`p-4 rounded-xl border transition shadow-xs ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <span className="text-xs opacity-60 font-black">
            {isRtl ? "الحسابات الموقوفة" : "Suspended Accounts"}
          </span>
          <p className="text-2xl font-black text-rose-500 mt-1">
            {stats.suspended}
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div
        className={`p-4 rounded-2xl border transition shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between ${
          isDarkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none transition ${
              isDarkMode
                ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-rose-500"
                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-rose-500"
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`w-full sm:w-auto px-3.5 py-2 text-xs font-black rounded-xl border outline-none cursor-pointer transition ${
              isDarkMode
                ? "bg-slate-950 border-slate-800 text-white hover:border-slate-700"
                : "bg-slate-50 border-slate-300 text-slate-900 hover:border-slate-400"
            }`}
          >
            <option value="all">{t.allRoles}</option>
            <option value="admin">{t.roleAdmin}</option>
            <option value="seller">{t.roleSeller}</option>
            <option value="driver">{t.roleDriver}</option>
            <option value="collector">{t.roleCollector}</option>
            <option value="user">{t.roleCustomer}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div
        className={`rounded-2xl border transition shadow-sm overflow-hidden ${
          isDarkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs font-black">
            <thead
              className={`border-b ${
                isDarkMode
                  ? "bg-slate-950/60 border-slate-800 text-white/70"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <tr>
                <th className="p-4 text-start">{t.thId}</th>
                <th className="p-4 text-start">{t.thUser}</th>
                <th className="p-4 text-start">{t.thRole}</th>
                <th className="p-4 text-start">{t.thStatus}</th>
                <th className="p-4 text-start">{t.thActions}</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDarkMode ? "divide-slate-800" : "divide-slate-200"
              }`}
            >
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center opacity-60">
                    {t.noResults}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className={`transition ${
                      isDarkMode
                        ? "hover:bg-slate-800/40"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-4 font-mono text-rose-500 font-bold">
                      {u.id}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-sm">{u.name}</div>
                      <div className="text-[11px] opacity-60 font-mono">
                        {u.email}
                      </div>
                      {u.phone && (
                        <div className="text-[10px] opacity-40 font-mono">
                          {u.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] uppercase font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          u.status === "active"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        }`}
                      >
                        {u.status === "active" ? t.active : t.suspended}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDirectMessage(u)}
                          className="px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                          title="إرسال رسالة مباشرة للمستخدم"
                        >
                          <BellIcon className="w-3.5 h-3.5" />
                          <span>رسالة</span>
                        </button>
                        <button
                          onClick={() => toggleStatus(u.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer ${
                            u.status === "active"
                              ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white"
                              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                          }`}
                        >
                          {u.status === "active" ? t.suspendBtn : t.activateBtn}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                        >
                          {t.deleteBtn}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div
            className={`border p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl transition ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-black text-sm">{t.modalTitle}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="text-[11px] opacity-70 block mb-1 font-bold">
                  {t.nameLabel} *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs outline-none border transition ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500"
                  }`}
                  placeholder="e.g. أحمد حسن"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] opacity-70 block mb-1 font-bold">
                  {t.emailLabel} *
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs outline-none border transition ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500"
                  }`}
                  placeholder="e.g. user@aura.com"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] opacity-70 block mb-1 font-bold">
                  {t.phoneLabel}
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs outline-none border transition ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500"
                  }`}
                  placeholder="+20 100 000 0000"
                />
              </div>

              <div>
                <label className="text-[11px] opacity-70 block mb-1 font-bold">
                  {t.roleLabel}
                </label>
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs outline-none border cursor-pointer transition ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="admin">أدمن (Admin)</option>
                  <option value="seller">بائع (Seller)</option>
                  <option value="driver">سائق (Driver)</option>
                  <option value="collector">مُجمّع (Collector)</option>
                  <option value="user">مستهلك (Customer)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 text-xs font-black rounded-xl cursor-pointer transition ${
                    isDarkMode
                      ? "bg-slate-800 hover:bg-slate-700 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer transition shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 💬 مودال إرسال رسالة مباشرة أو تعميم للنظام (Admin Messaging & Broadcast Modal) */}
      {showMsgModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`border p-6 rounded-2xl w-full max-w-lg space-y-4 shadow-2xl transition ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <BellIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-amber-500">
                    {msgTargetUser
                      ? `إرسال رسالة مباشرة للمستخدم (${msgTargetUser.name})`
                      : "إرسال تعميم وإشعار عام لكافة مستخدمي المنصة"}
                  </h3>
                  <p className="text-[10px] opacity-60">
                    يتم تسليم الإشعار فورياً في لوحة التحكم وتطبيق الطرف المستهدف
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMsgModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3.5 text-xs">
              {!msgTargetUser && (
                <div>
                  <label className="font-black block mb-1">تحديد الفئة المستهدفة بالتعميم:</label>
                  <select
                    value={msgTargetRole}
                    onChange={(e) => setMsgTargetRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold outline-none"
                  >
                    <option value="all">كافة مستخدمي المنصة (الجميع)</option>
                    <option value="seller">جميع البائعين وأصحاب المتاجر</option>
                    <option value="driver">جميع السائقين وكباتن التوصيل</option>
                    <option value="collector">جميع مُجمّعي المناطق والهبات</option>
                    <option value="user">جميع المستهلكين والعملاء</option>
                  </select>
                </div>
              )}

              <div>
                <label className="font-black block mb-1">عنوان الرسالة أو الإشعار:</label>
                <input
                  type="text"
                  value={msgTitle}
                  onChange={(e) => setMsgTitle(e.target.value)}
                  placeholder="مثال: تنبيه هام بخصوص تحديث خطوط التجميع والشحن"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold outline-none"
                />
              </div>

              <div>
                <label className="font-black block mb-1">نص الرسالة أو التعميم الإداري:</label>
                <textarea
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  placeholder="اكتب تفاصيل التوجيه الإداري هنا..."
                  rows={4}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMsgModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl cursor-pointer shadow-xs transition"
                >
                  إرسال الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* رسالة نجاح الإرسال */}
      {msgSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl font-black text-xs flex items-center gap-2 animate-bounce">
          <CheckCircleIcon className="w-4 h-4 text-white" />
          <span>{msgSuccessToast}</span>
        </div>
      )}
    </main>
  );
};

export default AdminUsersPage;
