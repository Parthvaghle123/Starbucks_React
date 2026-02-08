import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Eye,
  Filter,
  Package,
  Calendar,
  CreditCard,
  User,
  Phone,
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  Activity
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Orders.css";
import "./Products.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    axios
      .get("http://localhost:4500/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setOrders(res.data);
        setFilteredOrders(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== "All Status") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (newStatus === "Cancelled") {
      const confirmCancel = window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      );
      if (!confirmCancel) return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      await axios.put(
        `http://localhost:4500/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        )
      );

      alert(`Order status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status.");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-root">
        <div className="loading">
          <Activity className="animate-spin" size={24} />
          <span style={{ marginLeft: '0.5rem' }}>Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container">
     <div className="page-header">
          <h1>Order Management</h1>
          <p>Manage and track all orders efficiently</p>
        </div>
        <hr />

      {/* Order Statistics */}
      <div className="products-stats-grid">
        <div className="products-stat-card total-products">
          <div className="products-stat-header">
            <span className="products-stat-label">Total Orders</span>
            <Package size={20} className="products-stat-icon" />
          </div>
          <div className="products-stat-value">{orders.length}</div>
          <span className="products-stat-subtext">
            All orders placed in the system
          </span>
        </div>

        <div className="products-stat-card menu-products">
          <div className="products-stat-header">
            <span className="products-stat-label">Total Revenue</span>
            <DollarSign size={20} className="products-stat-icon" />
          </div>
          <div className="products-stat-value">
            ₹
            {orders
              .reduce((sum, order) => sum + (order.total || 0), 0)
              .toFixed(2)}
          </div>
          <span className="products-stat-subtext">
            Revenue generated from all orders
          </span>
        </div>

        <div className="products-stat-card orders-cancelled">
          <div className="products-stat-header">
            <span className="products-stat-label">Cancelled Orders</span>
            <Package size={20} className="products-stat-icon" />
          </div>
          <div className="products-stat-value">
            {orders.filter((order) => order.status === "Cancelled").length}
          </div>
          <span className="products-stat-subtext">
            Orders cancelled by admin or user
          </span>
        </div>

        <div className="products-stat-card active-products">
          <div className="products-stat-header">
            <span className="products-stat-label">Completed Orders</span>
            <CheckCircle size={20} className="products-stat-icon" />
          </div>
          <div className="products-stat-value">
            {
              orders.filter(
                (order) =>
                  order.status === "Approved" || order.status === "completed"
              ).length
            }
          </div>
          <span className="products-stat-subtext">
            Orders approved / marked as completed
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-filter-container">
        <div className="search-input position-relative flex-grow-1">
          <Search
            size={18}
            className="search-icon position-absolute"
            style={{ top: "50%", left: "15px", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            className="form-control ps-5"
            placeholder="Search by Order ID, Customer Name, Email, or Phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown d-flex align-items-center gap-2">
          <Filter size={18} className="text-muted" />
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Table Container with Scroll */}
      <div className="orders-table-container">
        <div className="table-responsive">
        <table className="table table-striped table-hover align-middle mb-0 modern-table">
          <thead>
            <tr>
                <th className="order-id-col">Order ID</th>
                <th className="customer-col">Customer</th>
                <th className="items-col">Items</th>
                <th className="total-col">Total</th>
                <th className="status-col">Status</th>
                <th className="date-col">Order Date</th>
                <th className="payment-col">Payment</th>
                <th className="action-col">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                  <td className="order-id-col">
                  <span className="order-id">
                    #{order.orderId || order._id?.slice(-6)}
                  </span>
                </td>
                  <td className="customer-col">
                  <div className="customer-info">
                    <div className="customer-name">
                      <User size={16} className="me-1" />
                      {order.username}
                    </div>
                    <div className="customer-details small text-muted">
                      <div>
                        <Mail size={12} className="me-1" />
                        {order.email}
                      </div>
                      <div>
                        <Phone size={12} className="me-1" />
                        {order.phone}
                      </div>
                    </div>
                  </div>
                </td>
                  <td className="items-col">
                  <button
                    className="btn view-items-btn"
                    onClick={() => setSelectedOrder(order)}
                    data-bs-toggle="modal"
                    data-bs-target="#itemsModal"
                  >
                    <Eye size={16} className="me-1" />
                    View ({order.items?.length || 0})
                  </button>
                </td>
                  <td className="total-col">
                  <span className="total-amount">₹{order.total}</span>
                </td>
                  <td className="status-col">
                    <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                </td>
                  <td className="date-col">
                    <div className="date-info">
                  <Calendar size={14} className="me-1" />
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })
                    : "N/A"}
                    </div>
                </td>
                  <td className="payment-col">
                    <div className="payment-info">
                  <CreditCard size={14} className="me-1" />
                  {order.paymentMethod || "Cash on Delivery"}
                    </div>
                </td>
                  <td className="action-col">
                  <button
                    className="btn cancel-btn"
                    onClick={() => updateOrderStatus(order._id, "Cancelled")}
                    disabled={order.status === "Cancelled"}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <Package size={48} className="text-muted mb-3" />
            <h5>No orders found</h5>
            <p className="mb-0">Try adjusting your search or filter criteria</p>
          </div>
        )}
        </div>
      </div>

      {/* Modal */}
      <div
        className="modal fade"
        id="itemsModal"
        tabIndex="-1"
        aria-labelledby="itemsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="itemsModalLabel">
                <Package size={20} className="me-1" />
                Order Details - #
                {selectedOrder?.orderId || selectedOrder?._id?.slice(-6)}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="customer-info-modal">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Customer:</strong> {selectedOrder?.username}</p>
                    <p><strong>Email:</strong> {selectedOrder?.email}</p>
                    <p><strong>Phone:</strong> {selectedOrder?.phone}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Date:</strong>{" "}
                      {selectedOrder?.createdAt
                        ? new Date(selectedOrder.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              weekday: "long",
                              day: "2-digit",
                              month: "long",
                              year: "numeric"
                            }
                          )
                        : "N/A"}
                    </p>
                    <p><strong>Payment:</strong> {selectedOrder?.paymentMethod || "Cash on Delivery"}</p>
                    <p><strong>Status:</strong> <span className={`status-badge status-${selectedOrder?.status?.toLowerCase()}`}>{selectedOrder?.status}</span></p>
                  </div>
                </div>
              </div>

              {selectedOrder?.items?.length > 0 ? (
                <div className="table-responsive ">
                <table className="table  table-striped table-hover items-table-modal mb-0 t1">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name || item.title || "Unknown Item"}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price}</td>
                        <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="grand-total-row">
                      <td colSpan="3 " className="text-end fs-5 ">Grand Total:</td>
                      <td className="fs-5 text-success">₹{selectedOrder.total}</td>
                    </tr>
                  </tfoot>
                </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Package size={48} className="text-muted mb-3" />
                  <p className="text-muted mb-0">No items found in this order.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary fw-bold"
                style={{ width: '120px' }}
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
