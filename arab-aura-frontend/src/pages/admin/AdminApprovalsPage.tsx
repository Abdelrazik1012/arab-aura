import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import type { AdminLayoutContextType } from "../../layouts/AdminLayout";
import {
  CloseIcon,
  CheckCircleIcon,
  ClockIcon,
  RefreshIcon,
} from "../../components/Icons";

export interface StoreContract {
  id: string;
  storeName: string;
  ownerName: string;
  phone?: string;
  contractType: string;
  commissionRate: string;
  requestDate: string;
  status: "pending" | "approved" | "terminated";
}

export const AdminApprovalsPage: React.FC = () => {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  const { isDarkMode } = useTheme();

  const [contracts, setContracts] = useState<StoreContract[]>([
    {
      id: "CTR-501",
      storeName: "متجر النيل للأزياء",
      ownerName: "إبراهيم محمد",
      phone: "+20 101 234 5678",
      contractType: "شراكة تجارية ولوجستية",
      commissionRate: "12%",
      requestDate: "2026-11-01",
      status: "pending",
    },
    {
      id: "CTR-502",
      storeName: "تكنولوجي هب",
      ownerName: "مصطفى عبد الله",
      phone: "+20 112 345 6789",
      contractType: "توريد إلكترونيات وأجهزة",
      commissionRate: "8%",
      requestDate: "2026-10-24",
      status: "approved",
    },
    {
      id: "CTR-503",
      storeName: "أورا للأحذية والشنط",
      ownerName: "سارة خالد",
      phone: "+20 123 456 7890",
      contractType: "شراكة براندات محلية",
      commissionRate: "10%",
      requestDate: "2026-11-03",
      status: "pending",
    },
    {
      id: "CTR-504",
      storeName: "عالم الرياضة الأصلي",
      ownerName: "كريم يوسف",
      phone: "+20 155 987 6543",
      contractType: "ملابس رياضية ومعدات",
      commissionRate: "15%",
      requestDate: "2026-09-15",
      status: "terminated",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newContractType, setNewContractType] = useState("شراكة تجارية ولوجستية");
  const [newCommission, setNewCommission] = useState("10%");

  const handleApprove = (id: string) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c)),
    );
  };

  const handleTerminate = (id: string) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "terminated" } : c)),
    );
  };

  const handleReactivate = (id: string) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c)),
    );
  };

  const handleAddContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newOwnerName.trim()) return;

    const newContract: StoreContract = {
      id: `CTR-${Math.floor(500 + Math.random() * 500)}`,
      storeName: newStoreName.trim(),
      ownerName: newOwnerName.trim(),
      phone: newPhone.trim() || "+20 100 000 0000",
      contractType: newContractType,
      commissionRate: newCommission.trim() || "10%",
      requestDate: new Date().toISOString().split("T")[0],
      status: "pending",
    };

    setContracts([newContract, ...contracts]);
    setNewStoreName("");
    setNewOwnerName("");
    setNewPhone("");
    setShowAddModal(false);
  };

  const filteredContracts = contracts.filter((c) => {
    const matchesFilter =
      filterStatus === "all" || c.status === filterStatus;
    const matchesSearch =
      c.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contractType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: contracts.length,
    pending: contracts.filter((c) => c.status === "pending").length,
    approved: contracts.filter((c) => c.status === "approved").length,
    terminated: contracts.filter((c) => c.status === "terminated").length,
  };

  const t = {
    title: isRtl
      ? "مراجعة العقود واعتمادات المتاجر"
      : "Contracts & Store Approvals",
    subtitle: isRtl
      ? "التحكم في عقود المتاجر، اعتماد الشراكات الجديدة، وإدارة نسب العمولة"
      : "Review merchant applications, approve new stores, and control agreements",
    addContract: isRtl ? "إضافة تعاقد جديد" : "New Merchant Contract",
    tabAll: isRtl ? "الكل" : "All",
    tabPending: isRtl ? "قيد المراجعة" : "Pending",
    tabApproved: isRtl ? "المعتمدة" : "Approved",
    tabTerminated: isRtl ? "الملغاة" : "Terminated",
    searchPlaceholder: isRtl
      ? "بحث باسم المتجر، المالك، أو رقم العقد..."
      : "Search by store, owner, or contract ID...",
    statusPending: isRtl ? "قيد المراجعة" : "Pending",
    statusApproved: isRtl ? "معتمد ومفعّل" : "Approved",
    statusTerminated: isRtl ? "ملغي" : "Terminated",
    commission: isRtl ? "نسبة المنصة" : "Fee Rate",
    owner: isRtl ? "المالك" : "Owner",
    phone: isRtl ? "الهاتف" : "Phone",
    date: isRtl ? "تاريخ التقديم" : "Date",
    approveBtn: isRtl ? "اعتماد العقد" : "Approve",
    terminateBtn: isRtl ? "إلغاء التعاقد" : "Terminate",
    reactivateBtn: isRtl ? "إعادة التفعيل" : "Reactivate",
    modalTitle: isRtl
      ? "تسجيل عقد واعتماد متجر جديد"
      : "Create New Store Contract",
    storeNameLabel: isRtl ? "اسم المتجر / البراند" : "Store / Brand Name",
    ownerNameLabel: isRtl ? "اسم المالك / المفوض" : "Owner / Representative Name",
    phoneLabel: isRtl ? "رقم الهاتف للتواصل" : "Contact Phone",
    contractTypeLabel: isRtl ? "نوع التعاقد" : "Contract Agreement Type",
    commissionLabel: isRtl ? "نسبة عمولة المنصة (%)" : "Commission Rate (%)",
    cancel: isRtl ? "إلغاء" : "Cancel",
    save: isRtl ? "تسجيل العقد" : "Register Contract",
    noContracts: isRtl
      ? "لا توجد عقود مطابقة للتصفية الحالية"
      : "No contracts match current filter",
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
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

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-sm shrink-0"
        >
          + {t.addContract}
        </button>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-xl border transition shadow-xs ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <span className="text-xs opacity-60 font-black">
            {isRtl ? "إجمالي العقود" : "Total Contracts"}
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
            {isRtl ? "بانتظار الاعتماد" : "Pending Review"}
          </span>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {stats.pending}
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
            {isRtl ? "العقود المعتمدة" : "Active Contracts"}
          </span>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {stats.approved}
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
            {isRtl ? "العقود الملغاة" : "Terminated"}
          </span>
          <p className="text-2xl font-black text-rose-500 mt-1">
            {stats.terminated}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div
        className={`p-4 rounded-2xl border transition shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between ${
          isDarkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              filterStatus === "all"
                ? "bg-rose-600 text-white"
                : isDarkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {t.tabAll} ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              filterStatus === "pending"
                ? "bg-amber-600 text-white"
                : isDarkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {t.tabPending} ({stats.pending})
          </button>
          <button
            onClick={() => setFilterStatus("approved")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              filterStatus === "approved"
                ? "bg-emerald-600 text-white"
                : isDarkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {t.tabApproved} ({stats.approved})
          </button>
          <button
            onClick={() => setFilterStatus("terminated")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              filterStatus === "terminated"
                ? "bg-rose-700 text-white"
                : isDarkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {t.tabTerminated} ({stats.terminated})
          </button>
        </div>

        <div className="w-full sm:w-72">
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
      </div>

      {/* Contracts List */}
      <div
        className={`rounded-2xl border transition shadow-sm overflow-hidden ${
          isDarkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        <div
          className={`divide-y ${
            isDarkMode ? "divide-slate-800" : "divide-slate-200"
          }`}
        >
          {filteredContracts.length === 0 ? (
            <div className="p-12 text-center opacity-60 text-xs font-bold">
              {t.noContracts}
            </div>
          ) : (
            filteredContracts.map((item) => (
              <div
                key={item.id}
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                  isDarkMode
                    ? "hover:bg-slate-800/30"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-amber-500 text-xs font-black">
                      {item.id}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                      {item.contractType}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold border ${
                        item.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : item.status === "pending"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }`}
                    >
                      {item.status === "approved"
                        ? t.statusApproved
                        : item.status === "pending"
                          ? t.statusPending
                          : t.statusTerminated}
                    </span>
                  </div>

                  <h3 className="font-black text-sm sm:text-base mt-1">
                    {item.storeName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs opacity-70">
                    <span>
                      {t.owner}: <strong>{item.ownerName}</strong>
                    </span>
                    {item.phone && (
                      <span className="font-mono">
                        {t.phone}: {item.phone}
                      </span>
                    )}
                    <span>
                      {t.commission}:{" "}
                      <strong className="text-emerald-500 font-mono">
                        {item.commissionRate}
                      </strong>
                    </span>
                    <span className="opacity-60 text-[11px] font-mono">
                      {t.date}: {item.requestDate}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs"
                      >
                        {t.approveBtn}
                      </button>
                      <button
                        onClick={() => handleTerminate(item.id)}
                        className="px-3.5 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-black transition cursor-pointer"
                      >
                        {t.terminateBtn}
                      </button>
                    </>
                  )}

                  {item.status === "approved" && (
                    <button
                      onClick={() => handleTerminate(item.id)}
                      className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-black transition cursor-pointer"
                    >
                      {t.terminateBtn}
                    </button>
                  )}

                  {item.status === "terminated" && (
                    <button
                      onClick={() => handleReactivate(item.id)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-black transition cursor-pointer"
                    >
                      {t.reactivateBtn}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Contract Modal */}
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

            <form onSubmit={handleAddContract} className="space-y-3">
              <div>
                <label className="text-[11px] opacity-70 block mb-1 font-bold">
                  {t.storeNameLabel} *
                </label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs outline-none border transition ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500"
                  }`}
                  placeholder="e.g. متجر الأناقة العصرية"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] opacity-70 block mb-1 font-bold">
                  {t.ownerNameLabel} *
                </label>
                <input
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs outline-none border transition ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500"
                  }`}
                  placeholder="e.g. محمود كامل"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] opacity-70 block mb-1 font-bold">
                    {t.contractTypeLabel}
                  </label>
                  <select
                    value={newContractType}
                    onChange={(e) => setNewContractType(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs outline-none border cursor-pointer transition ${
                      isDarkMode
                        ? "bg-slate-950 border-slate-800 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="شراكة تجارية ولوجستية">شراكة لوجستية</option>
                    <option value="توريد إلكترونيات وأجهزة">توريد إلكترونيات</option>
                    <option value="شراكة براندات محلية">براند محلي</option>
                    <option value="توريد أزياء وموضة">أزياء وموضة</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] opacity-70 block mb-1 font-bold">
                    {t.commissionLabel}
                  </label>
                  <input
                    type="text"
                    value={newCommission}
                    onChange={(e) => setNewCommission(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs outline-none border transition ${
                      isDarkMode
                        ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500"
                    }`}
                    placeholder="10%"
                  />
                </div>
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
    </main>
  );
};

export default AdminApprovalsPage;
