import React, { useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { usePlatform } from "../../context/PlatformContext";
import type { PlatformOrder, OrderStatus } from "../../context/PlatformContext";
import type { AdminLayoutContextType } from "../../layouts/AdminLayout";
import { LeafletJourneyTracker } from "../../components/LeafletJourneyTracker";
import {
  EditIcon,
  TrashIcon,
  EyeIcon,
  MapIcon,
  CloseIcon,
  CheckCircleIcon,
  ClockIcon,
  PackageIcon,
  BuildingIcon,
  TruckIcon,
  LightningIcon,
  PhoneIcon,
  CrownIcon,
  RefreshIcon,
  StoreIcon,
  UserIcon,
  ShieldCheckIcon,
  StarIcon,
  CartIcon,
  MapPinIcon,
  CameraIcon,
  DocumentTextIcon,
  ChatIcon,
} from "../../components/Icons";

export const AdminOrdersPage: React.FC = () => {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const { orders, updateOrderStatus, updateOrderDetails, deleteOrder } =
    usePlatform();

  const { isDarkMode } = useTheme();

  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<PlatformOrder | null>(null);
  const [detailsOrder, setDetailsOrder] = useState<PlatformOrder | null>(null);
  const [journeyOrder, setJourneyOrder] = useState<PlatformOrder | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // فورم التعديل للأدمن
  const [editStatus, setEditStatus] = useState<OrderStatus>("pending");
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editTotal, setEditTotal] = useState<number>(0);

  const openEditModal = (order: PlatformOrder) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditCustomerName(order.customerName);
    setEditPhone(order.phone);
    setEditAddress(order.address);
    setEditTotal(order.totalAmount);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    updateOrderDetails(selectedOrder.id, {
      status: editStatus,
      customerName: editCustomerName,
      phone: editPhone,
      address: editAddress,
      totalAmount: Number(editTotal),
    });

    if (editStatus !== selectedOrder.status) {
      updateOrderStatus(
        selectedOrder.id,
        editStatus,
        "Super Admin (تعديل مباشر من الإدارة)",
        "تم تعديل الحالة بواسطة مدير النظام",
      );
    }

    setIsEditModalOpen(false);
  };

  const handleDelete = (orderId: string) => {
    const confirmMsg = isRtl
      ? `هل أنت متأكد من حذف الطلب رقم ${orderId} نهائياً من قاعدة بيانات المنصة؟`
      : `Are you sure you want to permanently delete order ${orderId}?`;
    if (window.confirm(confirmMsg)) {
      deleteOrder(orderId);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.phone.includes(searchTerm) ||
      (ord.sellerName &&
        ord.sellerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ord.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || ord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return {
          label: isRtl ? "قيد الانتظار" : "Pending",
          cls: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        };
      case "processing":
        return {
          label: isRtl ? "قيد التجهيز" : "Processing",
          cls: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        };
      case "ready_for_collection":
        return {
          label: isRtl ? "جاهز للمُجمّع" : "Ready for Hub",
          cls: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        };
      case "collected_in_hub":
        return {
          label: isRtl ? "في مركز التجميع" : "In Hub",
          cls: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        };
      case "out_for_delivery":
        return {
          label: isRtl ? "مع السائق في الطريق" : "Out for Delivery",
          cls: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        };
      case "delivered":
        return {
          label: isRtl ? "تم التسليم بنجاح" : "Delivered",
          cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        };
      case "cancelled":
        return {
          label: isRtl ? "ملغي" : "Cancelled",
          cls: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        };
    }
  };

  const t = {
    title: isRtl ? "إدارة ومراقبة كافة الطلبات" : "Platform Orders Control",
    subtitle: isRtl
      ? "تتبع حركة الطلبات بين المستهلك، البائع، المُجمّع، والسائق مع صلاحيات التعديل والحذف الكاملة للأدمن"
      : "Complete order management across all roles with full admin edit and delete authority",
    searchPlaceholder: isRtl
      ? "بحث برقم الطلب، اسم العميل، الهاتف، أو اسم المتجر..."
      : "Search order ID, customer, phone, or store...",
    allStatus: isRtl ? "كافة الحالات" : "All Statuses",
    totalOrders: isRtl ? "إجمالي الطلبات" : "Total Orders",
    deliveredOrders: isRtl ? "الطلبات المسلمة" : "Delivered Orders",
    activeDelivery: isRtl ? "قيد التوصيل" : "Active In-transit",
    pendingOrders: isRtl ? "بانتظار الإجراء" : "Pending Actions",
    thId: isRtl ? "رقم الطلب" : "Order ID",
    thCustomer: isRtl ? "العميل والعنوان" : "Customer & Address",
    thSeller: isRtl ? "المتجر والمنتجات" : "Store & Items",
    thTotal: isRtl ? "المبلغ والدفع" : "Total & Payment",
    thStatus: isRtl ? "الحالة الحالية" : "Current Status",
    thActions: isRtl ? "إجراءات الأدمن" : "Admin Actions",
    editBtn: isRtl ? "تعديل" : "Edit",
    deleteBtn: isRtl ? "حذف" : "Delete",
    editModalTitle: isRtl ? "تعديل بيانات وحالة الطلب" : "Edit Order Information",
    saveBtn: isRtl ? "حفظ التعديلات" : "Save Changes",
    cancelBtn: isRtl ? "إلغاء" : "Cancel",
    noOrdersFound: isRtl
      ? "لا توجد طلبات مطابقة للتصفية المحددة"
      : "No orders match your search criteria",
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div
        className={`p-6 rounded-2xl border transition shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold inline-flex items-center gap-1.5">
              <CrownIcon className="w-3.5 h-3.5 text-rose-500" />
              <span>{isRtl ? "تحكم إداري شامل" : "Super Admin Privilege"}</span>
            </span>
            <span className="text-xs opacity-50 font-mono">
              Live Synchronized Store
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">{t.title}</h1>
          <p className="text-xs opacity-60 mt-1">{t.subtitle}</p>
        </div>
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
          <span className="text-xs opacity-60 font-black">{t.totalOrders}</span>
          <p className="text-2xl font-black text-cyan-500 mt-1">{orders.length}</p>
        </div>

        <div
          className={`p-4 rounded-xl border transition shadow-xs ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <span className="text-xs opacity-60 font-black">
            {t.deliveredOrders}
          </span>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {orders.filter((o) => o.status === "delivered").length}
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
            {t.activeDelivery}
          </span>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {
              orders.filter(
                (o) =>
                  o.status === "out_for_delivery" ||
                  o.status === "collected_in_hub" ||
                  o.status === "ready_for_collection",
              ).length
            }
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
            {t.pendingOrders}
          </span>
          <p className="text-2xl font-black text-rose-500 mt-1">
            {
              orders.filter(
                (o) => o.status === "pending" || o.status === "processing",
              ).length
            }
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-2xl border transition shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between ${
          isDarkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="w-full sm:w-80">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`w-full sm:w-auto px-3.5 py-2 text-xs font-black rounded-xl border outline-none cursor-pointer transition ${
              isDarkMode
                ? "bg-slate-950 border-slate-800 text-white hover:border-slate-700"
                : "bg-slate-50 border-slate-300 text-slate-900 hover:border-slate-400"
            }`}
          >
            <option value="all">{t.allStatus}</option>
            <option value="pending">{isRtl ? "قيد الانتظار" : "Pending"}</option>
            <option value="processing">
              {isRtl ? "قيد التجهيز" : "Processing"}
            </option>
            <option value="ready_for_collection">
              {isRtl ? "جاهز للمُجمّع" : "Ready for Hub"}
            </option>
            <option value="collected_in_hub">
              {isRtl ? "في مركز التجميع" : "In Hub"}
            </option>
            <option value="out_for_delivery">
              {isRtl ? "مع السائق في الطريق" : "Out for Delivery"}
            </option>
            <option value="delivered">
              {isRtl ? "تم التسليم" : "Delivered"}
            </option>
            <option value="cancelled">
              {isRtl ? "ملغي" : "Cancelled"}
            </option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
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
                <th className="p-4 text-start">{t.thCustomer}</th>
                <th className="p-4 text-start">{t.thSeller}</th>
                <th className="p-4 text-start">{t.thTotal}</th>
                <th className="p-4 text-start">{t.thStatus}</th>
                <th className="p-4 text-start">{t.thActions}</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDarkMode ? "divide-slate-800" : "divide-slate-200"
              }`}
            >
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center opacity-60">
                    {t.noOrdersFound}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  return (
                    <tr
                      key={ord.id}
                      className={`transition ${
                        isDarkMode
                          ? "hover:bg-slate-800/40"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="p-4 font-mono font-bold text-amber-500">
                        <div>{ord.id}</div>
                        <span className="text-[10px] opacity-50 block font-normal">
                          {ord.createdAt}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-sm">
                          {ord.customerName}
                        </div>
                        <div className="text-[11px] opacity-70 font-mono">
                          {ord.phone}
                        </div>
                        <div className="text-[10px] opacity-50 line-clamp-1 flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{ord.address}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                          <StoreIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{ord.sellerName || "متجر معتمد"}</span>
                        </span>
                        <div className="text-[11px] opacity-60 mt-0.5">
                          {ord.items.length}{" "}
                          {isRtl ? "منتجات" : "items"} (
                          {ord.items.map((i) => i.productTitle).slice(0, 1).join(", ")}
                          {ord.items.length > 1 ? "..." : ""})
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold font-mono text-emerald-500 text-sm">
                          {ord.totalAmount} EGP
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 uppercase font-mono">
                          {ord.paymentMethod} •{" "}
                          {ord.paymentStatus === "paid" ? "تم الدفع" : "غير مدفوع"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setDetailsOrder(ord)}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-blue-600/15 text-blue-400 hover:bg-blue-600 hover:text-white transition cursor-pointer flex items-center gap-1"
                            title="عرض تفاصيل الأوردر الكاملة"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                            <span>{isRtl ? "التفاصيل" : "Details"}</span>
                          </button>
                          <button
                            onClick={() => setJourneyOrder(ord)}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-amber-500/15 text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer flex items-center gap-1"
                            title="تتبع مسار الرحلة والخريطة الحية"
                          >
                            <MapIcon className="w-3.5 h-3.5" />
                            <span>{isRtl ? "المسار" : "Route"}</span>
                          </button>
                          <button
                            onClick={() => openEditModal(ord)}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-indigo-600/15 text-indigo-400 hover:bg-indigo-600 hover:text-white transition cursor-pointer flex items-center gap-1"
                            title="تعديل تفاصيل وأوردر"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                            <span>{t.editBtn}</span>
                          </button>
                          <button
                            onClick={() => handleDelete(ord.id)}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-rose-600/15 text-rose-500 hover:bg-rose-600 hover:text-white transition cursor-pointer flex items-center gap-1"
                            title="حذف الأوردر من النظام"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                            <span>{t.deleteBtn}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Order Modal */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div
            className={`border p-6 rounded-2xl w-full max-w-lg space-y-4 shadow-2xl transition max-h-[90vh] overflow-y-auto ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-black text-sm">{t.editModalTitle}</h3>
                <span className="font-mono text-xs text-amber-500 font-bold">
                  {selectedOrder.id}
                </span>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="text-[11px] opacity-70 block mb-1 font-bold">
                  {isRtl ? "تغيير حالة الطلب في النظام" : "Update Order Status"}
                </label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs outline-none border cursor-pointer font-bold transition ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 text-amber-400"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="pending">قيد الانتظار (Pending)</option>
                  <option value="processing">قيد التجهيز (Processing)</option>
                  <option value="ready_for_collection">
                    جاهز للمُجمّع (Ready for Pickup)
                  </option>
                  <option value="collected_in_hub">
                    تم التجميع في الـ Hub (Collected)
                  </option>
                  <option value="out_for_delivery">
                    مع السائق في الطريق (Out for Delivery)
                  </option>
                  <option value="delivered">تم التسليم بنجاح (Delivered)</option>
                  <option value="cancelled">إلغاء الطلب (Cancelled)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] opacity-70 block mb-1 font-bold">
                    {isRtl ? "اسم العميل" : "Customer Name"}
                  </label>
                  <input
                    type="text"
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs outline-none border transition ${
                      isDarkMode
                        ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] opacity-70 block mb-1 font-bold">
                    {isRtl ? "رقم هاتف العميل" : "Customer Phone"}
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs outline-none border transition ${
                      isDarkMode
                        ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500"
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] opacity-70 block mb-1 font-bold">
                  {isRtl ? "عنوان التسليم المفصل" : "Delivery Address"}
                </label>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  rows={2}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs outline-none border transition ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] opacity-70 block mb-1 font-bold">
                  {isRtl ? "المبلغ الإجمالي (EGP)" : "Total Amount (EGP)"}
                </label>
                <input
                  type="number"
                  value={editTotal}
                  onChange={(e) => setEditTotal(Number(e.target.value))}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs outline-none border transition font-mono ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500"
                  }`}
                  required
                />
              </div>

              {/* Items Summary in Modal */}
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  isDarkMode
                    ? "bg-slate-950 border-slate-800"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <span className="font-bold opacity-70 block">
                  {isRtl ? "محتويات الطلب:" : "Order Items:"}
                </span>
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between opacity-80">
                    <span>
                      {it.qty}x {it.productTitle} ({it.size || "M"})
                    </span>
                    <span className="font-mono">
                      {it.unitPrice * it.qty} EGP
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className={`px-4 py-2 text-xs font-black rounded-xl cursor-pointer transition ${
                    isDarkMode
                      ? "bg-slate-800 hover:bg-slate-700 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer transition shadow-xs"
                >
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👁️ مودال التفاصيل الكاملة للأوردر الشامل للأدمن */}
      {detailsOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            className={`max-w-3xl w-full p-5 sm:p-6 rounded-3xl border shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto transition ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* الهيدر */}
            <div className="flex justify-between items-center border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center font-bold">
                  <DocumentTextIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-sm sm:text-base">
                      {isRtl ? "تفاصيل الطلب والبيانات الشاملة" : "Order Full Details"}
                    </h3>
                    <span className="font-mono text-amber-500 font-black text-sm">
                      {detailsOrder.id}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-md font-black inline-flex items-center gap-1 ${
                        detailsOrder.shippingType === "express"
                          ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                          : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      }`}
                    >
                      {detailsOrder.shippingType === "express" ? (
                        <>
                          <LightningIcon className="w-3 h-3" />
                          <span>شحن فوري Express</span>
                        </>
                      ) : (
                        <>
                          <PackageIcon className="w-3 h-3" />
                          <span>شحن مجمع بالهب</span>
                        </>
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] opacity-60 font-mono block mt-0.5">
                    {detailsOrder.createdAt}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setDetailsOrder(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* 4 بطاقات تفصيلية للأطراف الأربعة: المستهلك، البائع، السائق، المنتجات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. بطاقة تفاصيل المستهلك */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 text-xs ${
                  isDarkMode
                    ? "bg-slate-950/70 border-slate-800"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between font-black text-indigo-400 border-b pb-2 border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-indigo-400" />
                    <span>{isRtl ? "1. تفاصيل المستهلك (Consumer)" : "1. Consumer Details"}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
                    {detailsOrder.customerEmail || "customer@aura.com"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="opacity-60">{isRtl ? "اسم العميل:" : "Name:"}</span>
                    <span className="font-bold">{detailsOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-60">{isRtl ? "رقم الهاتف:" : "Phone:"}</span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${detailsOrder.phone}`}
                        className="font-mono font-bold text-amber-500 hover:underline"
                      >
                        {detailsOrder.phone}
                      </a>
                      <a
                        href={`https://wa.me/2${detailsOrder.phone.replace(/^0/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition"
                        title="واتساب مباشر مع المستهلك"
                      >
                        <PhoneIcon className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">{isRtl ? "المحافظة والمدينة:" : "Gov / City:"}</span>
                    <span className="font-bold">
                      {detailsOrder.governorate} - {detailsOrder.city}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-60 block text-[10px]">{isRtl ? "العنوان السكني المفصل:" : "Full Address:"}</span>
                    <p className="font-bold mt-0.5 text-[11px] opacity-90 flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{detailsOrder.address}</span>
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/30">
                    <span className="opacity-60">{isRtl ? "كود الاستلام الأمني (OTP):" : "Customer OTP:"}</span>
                    <span className="font-mono font-black text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-md">
                      {detailsOrder.otpCode || "4821"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. بطاقة تفاصيل البائع والمتجر */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 text-xs ${
                  isDarkMode
                    ? "bg-slate-950/70 border-slate-800"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between font-black text-amber-500 border-b pb-2 border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <StoreIcon className="w-4 h-4 text-amber-500" />
                    <span>{isRtl ? "2. تفاصيل البائع والمتجر (Seller)" : "2. Seller & Store Details"}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                    <span>متجر معتمد</span>
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="opacity-60">{isRtl ? "اسم المتجر / البراند:" : "Store Name:"}</span>
                    <span className="font-bold text-amber-400">{detailsOrder.sellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">{isRtl ? "الفرع ونقطة الاستلام:" : "Pickup Location:"}</span>
                    <span className="font-bold text-[11px]">{detailsOrder.sellerAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">{isRtl ? "هاتف المتجر:" : "Store Phone:"}</span>
                    <a
                      href="tel:01122334455"
                      className="font-mono font-bold text-indigo-400 hover:underline"
                    >
                      {detailsOrder.sellerPhone || "01122334455"}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">{isRtl ? "السجل التجاري والضريبي:" : "Commercial Reg:"}</span>
                    <span className="font-mono text-[11px] opacity-80">
                      {detailsOrder.sellerCommercialReg || "CR-49210-GIZA"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/30">
                    <span className="opacity-60">{isRtl ? "ربط السوشيال ميديا:" : "Social Scraper:"}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold flex items-center gap-1">
                      <CameraIcon className="w-3 h-3 text-purple-400" />
                      <span>Instagram & FB Sync</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. بطاقة تفاصيل السائق والأسطول */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 text-xs ${
                  isDarkMode
                    ? "bg-slate-950/70 border-slate-800"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between font-black text-cyan-400 border-b pb-2 border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="w-4 h-4 text-cyan-400" />
                    <span>{isRtl ? "3. تفاصيل السائق والأسطول (Driver)" : "3. Driver & Transport"}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold flex items-center gap-1">
                    <StarIcon className="w-3 h-3 text-amber-400" filled />
                    <span>{detailsOrder.driverRating || "4.9 (142 رحلة)"}</span>
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="opacity-60">{isRtl ? "اسم الكابتن:" : "Driver Name:"}</span>
                    <span className="font-bold text-cyan-300">
                      {detailsOrder.driverName || "الكابتن أحمد محمود"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-60">{isRtl ? "هاتف السائق المباشر:" : "Driver Contact:"}</span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href="tel:+201092242607"
                        className="font-mono font-bold text-amber-500 hover:underline"
                      >
                        {detailsOrder.driverPhone || "+20 109 224 2607"}
                      </a>
                      <a
                        href="https://wa.me/201092242607"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition"
                      >
                        <PhoneIcon className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">{isRtl ? "نوع المركبة ولوحة الأرقام:" : "Vehicle & Plate:"}</span>
                    <span className="font-bold text-[11px]">
                      {detailsOrder.driverVehicle || "فان دايو كاري"} • {detailsOrder.driverPlate || "أ ب جـ 4589"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">{isRtl ? "نقطة تجميع الحي (Micro-Hub):" : "Micro-Hub Point:"}</span>
                    <span className="font-bold text-[11px]">مقر المُجمّع (حي الأشجار - 6 أكتوبر)</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/30">
                    <span className="opacity-60">{isRtl ? "رقم الحزمة المجمعة:" : "Package Batch ID:"}</span>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {detailsOrder.packageId || "شحن مباشر Express"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. ملخص الشحن واللوجستيات */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 text-xs ${
                  isDarkMode
                    ? "bg-slate-950/70 border-slate-800"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between font-black text-emerald-400 border-b pb-2 border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="w-4 h-4 text-emerald-400" />
                    <span>{isRtl ? "بيانات الشحن والرحلة" : "Shipping & Journey Info"}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-black inline-flex items-center gap-1 ${
                      detailsOrder.shippingType === "express"
                        ? "bg-rose-500/20 text-rose-500"
                        : "bg-indigo-500/20 text-indigo-400"
                    }`}
                  >
                    {detailsOrder.shippingType === "express" ? (
                      <>
                        <LightningIcon className="w-3 h-3" />
                        <span>فوري خلال ساعتين</span>
                      </>
                    ) : (
                      <>
                        <PackageIcon className="w-3 h-3" />
                        <span>مجمع بالهب الإقليمي</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="opacity-60">{isRtl ? "المسار اللوجستي:" : "Route:"}</span>
                    <span className="font-bold">6 أكتوبر ➔ {detailsOrder.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">{isRtl ? "مسافة الرحلة المقدرة:" : "Distance:"}</span>
                    <span className="font-mono font-bold">{detailsOrder.distanceKm || 4.2} كم</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">{isRtl ? "تاريخ ووقت الإنشاء:" : "Created At:"}</span>
                    <span className="font-mono text-[11px] opacity-80">{detailsOrder.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">{isRtl ? "إجمالي وزن الشحنة التقديري:" : "Estimated Weight:"}</span>
                    <span className="font-mono font-bold">1.4 كجم</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/30">
                    <span className="opacity-60">{isRtl ? "حالة الأوردر الحالية:" : "Current Status:"}</span>
                    <span className="font-bold text-amber-400">{detailsOrder.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* تفاصيل المنتجات والقطع */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black opacity-80 flex items-center gap-1.5 text-indigo-400">
                  <CartIcon className="w-4 h-4 text-indigo-400" />
                  <span>{isRtl ? "4. تفاصيل المنتجات ومواصفاتها (Products & Items)" : "4. Products & Items Details"}</span>
                </span>
                <span className="text-[10px] opacity-60 font-mono">
                  {detailsOrder.items.length} {isRtl ? "منتجات في الشحنة" : "items in package"}
                </span>
              </div>

              <div className="space-y-2">
                {detailsOrder.items.map((it, idx) => (
                  <div
                    key={it.id || idx}
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      isDarkMode
                        ? "bg-slate-950 border-slate-800"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {it.imageUrl && (
                        <img
                          src={it.imageUrl}
                          alt={it.productTitle}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-700/50"
                        />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-xs">{it.productTitle}</h4>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            SKU: AURA-{it.productId ? it.productId.toUpperCase() : "PROD-" + (idx + 101)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[10px] opacity-70 flex-wrap">
                          <span>البراند: <strong>{it.brandName || detailsOrder.sellerName}</strong></span>
                          <span>•</span>
                          <span>المقاس: <strong>{it.size || "M"}</strong></span>
                          <span>•</span>
                          <span>اللون: <strong>{it.color || "افتراضي"}</strong></span>
                          <span>•</span>
                          <span>الكمية: <strong>{it.qty}</strong></span>
                          <span>•</span>
                          <span>سعر القطعة: <strong className="font-mono text-amber-500">{it.unitPrice} EGP</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:text-left shrink-0">
                      <div className="font-mono font-black text-emerald-500 text-sm">
                        {it.unitPrice * it.qty} EGP
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold inline-flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                        <span>مفحوص وجاهز</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* الملخص المالي والحسابي */}
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                isDarkMode
                  ? "bg-slate-950/90 border-slate-800"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex justify-between opacity-70">
                <span>{isRtl ? "سعر المنتجات الفرعي:" : "Subtotal:"}</span>
                <span className="font-mono">
                  {detailsOrder.totalAmount - (detailsOrder.shippingType === "express" ? 75 : 35)} EGP
                </span>
              </div>
              <div className="flex justify-between opacity-70">
                <span>{isRtl ? "رسوم الشحن والتوصيل:" : "Shipping Fee:"}</span>
                <span className="font-mono">
                  {detailsOrder.shippingType === "express" ? "75 EGP (فوري Express)" : "35 EGP (مجمع عادي)"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t font-black text-sm">
                <span>{isRtl ? "المبلغ الإجمالي المستحق:" : "Total Amount:"}</span>
                <span className="font-mono text-emerald-500 text-base">
                  {detailsOrder.totalAmount} EGP
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px] opacity-75">
                <span>{isRtl ? "طريقة وحالة الدفع:" : "Payment & Status:"}</span>
                <span className="font-mono uppercase px-2 py-0.5 rounded bg-slate-500/10 text-slate-300 flex items-center gap-1">
                  <span>{detailsOrder.paymentMethod} •</span>
                  {detailsOrder.paymentStatus === "paid" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                      <span>تم الدفع إلكترونياً</span>
                    </span>
                  ) : (
                    <span>دفع نقدي COD عند الاستلام</span>
                  )}
                </span>
              </div>
            </div>

            {/* سجل العمليات والتدقيق الإداري الكامل */}
            <div
              className={`p-4 rounded-2xl border space-y-2 text-xs ${
                isDarkMode
                  ? "bg-slate-950/70 border-slate-800"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <span className="font-black text-[11px] opacity-70 flex items-center gap-1.5">
                <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRtl ? "سجل الحركة والتدقيق الكامل (Timeline & Audit Trail):" : "Timeline Audit Log:"}</span>
              </span>
              <div className="space-y-2">
                {detailsOrder.timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 text-[11px] border-b border-slate-800/20 pb-1.5 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span className="font-black">
                          {isRtl ? item.titleAr : item.titleEn}
                        </span>
                        {item.actor && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold">
                            {item.actor}
                          </span>
                        )}
                      </div>
                      {item.note && (
                        <p className="text-[10px] opacity-60 mt-0.5 ms-3">
                          {item.note}
                        </p>
                      )}
                    </div>
                    <span className="font-mono opacity-50 text-[10px] shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* أزرار الإجراءات الإدارية */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const target = detailsOrder;
                    setDetailsOrder(null);
                    setJourneyOrder(target);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>{isRtl ? "تتبع مسار الرحلة والخريطة الحية" : "Live GPS Route Map"}</span>
                </button>
                <button
                  onClick={() => {
                    const target = detailsOrder;
                    setDetailsOrder(null);
                    openEditModal(target);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <EditIcon className="w-3.5 h-3.5" />
                  <span>{isRtl ? "تعديل الطلب" : "Edit Order"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => {
                    const toDelete = detailsOrder.id;
                    setDetailsOrder(null);
                    handleDelete(toDelete);
                  }}
                  className="px-4 py-2.5 bg-rose-600/15 text-rose-500 hover:bg-rose-600 hover:text-white font-black rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>{isRtl ? "حذف الأوردر" : "Delete"}</span>
                </button>
                <button
                  onClick={() => setDetailsOrder(null)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-black rounded-xl text-xs transition cursor-pointer"
                >
                  {isRtl ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🗺️ مودال تتبع مسار الرحلة والخريطة الحية للأدمن (Live GPS Journey Tracker) */}
      {journeyOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            className={`max-w-2xl w-full p-5 sm:p-6 rounded-3xl border shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            {/* الهيدر */}
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-xs">
                  {journeyOrder.shippingType === "express" ? (
                    <LightningIcon className="w-5 h-5 text-slate-950" />
                  ) : (
                    <TruckIcon className="w-5 h-5 text-slate-950" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-indigo-500">
                      {isRtl
                        ? `تتبع مسار شحنة (${journeyOrder.id})`
                        : `Live Journey Tracking (${journeyOrder.id})`}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-black inline-flex items-center gap-1 ${
                        journeyOrder.shippingType === "express"
                          ? "bg-rose-500/20 text-rose-500"
                          : "bg-indigo-500/20 text-indigo-500"
                      }`}
                    >
                      {journeyOrder.shippingType === "express" ? (
                        <>
                          <LightningIcon className="w-3 h-3" />
                          <span>{isRtl ? "فوري Express" : "Instant Express"}</span>
                        </>
                      ) : (
                        <>
                          <PackageIcon className="w-3 h-3" />
                          <span>{isRtl ? "مجمع بالهب" : "Hub Consolidated"}</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-60">
                    {journeyOrder.sellerName} (6 أكتوبر) ➔ {journeyOrder.city} ({journeyOrder.governorate})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setJourneyOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 font-black cursor-pointer text-sm transition"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* 🗺️ خريطة المسار الحي المباشرة باستخدام Leaflet & OpenStreetMap */}
            <LeafletJourneyTracker order={journeyOrder} heightClass="h-64 sm:h-72" />

            {/* كارت الكابتن وأزرار الاتصال المباشرة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                    <TruckIcon className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs">
                      {journeyOrder.driverName || "الكابتن أحمد محمود"}
                    </h4>
                    <span className="text-[10px] opacity-60 flex items-center gap-1 mt-0.5">
                      <StarIcon className="w-3 h-3 text-amber-400" filled />
                      <span>4.9 (142 {isRtl ? "رحلة ناجحة" : "completed trips"}) • {isRtl ? "سيارة فان لوجستية" : "Logistics Van"}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href="tel:+201092242607"
                    className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center"
                    title={isRtl ? "اتصال هاتف" : "Phone Call"}
                  >
                    <PhoneIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://wa.me/201092242607"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center"
                    title={isRtl ? "محادثة مباشر" : "Direct Chat"}
                  >
                    <ChatIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* كارت كود التسليم OTP للعميل */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold block">
                    {isRtl ? "كود التحقق الأمني (OTP):" : "Security Verification (OTP):"}
                  </span>
                  <span className="text-xl font-mono font-black text-indigo-400 tracking-wider">
                    {journeyOrder.otpCode || "4821"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold inline-flex items-center gap-1">
                    <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                    <span>{isRtl ? "جاهز للمطابقة" : "Ready for Verification"}</span>
                  </span>
                  <p className="text-[9px] opacity-60 mt-1">
                    {isRtl ? "يُعطى للكابتن عند الاستلام" : "Give to driver on delivery"}
                  </p>
                </div>
              </div>
            </div>

            {/* مراحل الرحلة اللوجستية */}
            <div
              className={`p-4 rounded-2xl border space-y-2 text-xs ${
                isDarkMode
                  ? "bg-slate-950/70 border-slate-800"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-[11px] opacity-70">
                <MapIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRtl ? "مراحل مسار الرحلة اللوجستية:" : "Trip Milestones:"}</span>
              </div>
              <div className="space-y-2">
                {journeyOrder.timeline.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-bold">
                        {isRtl ? step.titleAr : step.titleEn}
                      </span>
                      {step.actor && (
                        <span className="text-[10px] opacity-60">
                          ({step.actor})
                        </span>
                      )}
                    </div>
                    <span className="font-mono opacity-50 text-[10px]">
                      {step.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* الأزرار بالأسفل */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  const target = journeyOrder;
                  setJourneyOrder(null);
                  setDetailsOrder(target);
                }}
                className="px-4 py-2 bg-indigo-600/15 text-indigo-400 hover:bg-indigo-600 hover:text-white font-black rounded-xl text-xs transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <EyeIcon className="w-4 h-4" />
                <span>{isRtl ? "عرض تفاصيل الطلب الإدارية" : "View Full Details"}</span>
              </button>
              <button
                onClick={() => setJourneyOrder(null)}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-black rounded-xl text-xs transition cursor-pointer"
              >
                {isRtl ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminOrdersPage;
