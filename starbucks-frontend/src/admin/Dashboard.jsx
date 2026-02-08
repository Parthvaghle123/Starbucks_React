import { useState, useEffect } from 'react';
import { Users, ShoppingCart, DollarSign, Activity } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';
import './Products.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          console.error('No admin token found');
          return;
        }

        const response = await axios.get('http://localhost:4500/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { totalUsers, totalOrders, totalRevenue, recentOrders } = response.data;
        setStats({ totalUsers, totalOrders, totalRevenue });
        setRecentOrders(recentOrders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'status-completed',
      pending: 'status-pending',
      cancelled: 'status-cancelled',
      Approved: 'status-completed',
      Cancelled: 'status-cancelled',
    };
    return `status-badge ${statusClasses[status] || 'status-pending'}`;
  };

  if (loading) {
    return (
      <div className="dashboard-root">
        <div className="loading">
          <Activity className="animate-spin" size={24} />
          <span style={{ marginLeft: '0.5rem' }}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard-root">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to your admin dashboard</p>
      </div>
      <hr/>
      {/* small, controlled hr */}
      <hr className="dashboard-hr" />

      <div className="page-content">
        {/* Stats */}
        <div className="products-stats-grid">
          <div className="products-stat-card total-products">
            <div className="products-stat-header">
              <span className="products-stat-label">Total Users</span>
              <Users size={20} className="products-stat-icon" />
            </div>
            <div className="products-stat-value">
              {stats.totalUsers.toLocaleString()}
            </div>
            <span className="products-stat-subtext">
              All registered users in the system
            </span>
          </div>

          <div className="products-stat-card active-products">
            <div className="products-stat-header">
              <span className="products-stat-label">Total Orders</span>
              <ShoppingCart size={20} className="products-stat-icon" />
            </div>
            <div className="products-stat-value">
              {stats.totalOrders.toLocaleString()}
            </div>
            <span className="products-stat-subtext">
              Orders placed across all customers
            </span>
          </div>

          <div className="products-stat-card menu-products">
            <div className="products-stat-header">
              <span className="products-stat-label">Total Revenue</span>
              <DollarSign size={20} className="products-stat-icon" />
            </div>
            <div className="products-stat-value">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <span className="products-stat-subtext">
              Cumulative revenue from all orders
            </span>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Orders</h2>
          </div>
          <div className="order-table-container">
            {recentOrders.length === 0 ? (
              <p className="no-orders">No recent orders.</p>
            ) : (
              <table className="order-table">
                <thead >
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.orderId}</td>
                      <td>{order.username}</td>
                      <td>₹{order.total}</td>
                      <td>
                        <span className={getStatusBadge(order.status)}>{order.status}</span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
