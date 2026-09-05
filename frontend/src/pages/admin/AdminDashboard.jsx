import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Typography, Button, Space, Alert, Tag, Tooltip } from 'antd';
import {
  InboxOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CarOutlined,
  TeamOutlined,
  HomeOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  ToolOutlined,
  PlusOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import StatCard from '../../components/StatCard';
import StatusTag from '../../components/StatusTag';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Title, Text } = Typography;

const PIE_COLORS = ['#1677ff', '#52c41a', '#faad14', '#722ed1', '#13c2c2', '#ff4d4f', '#8c8c8c'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getAdminStats();
      setStats(data);
    } catch (error) {
      // Handled by global axios
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner tip="Loading real-time fleet & shipment metrics..." />;
  }

  // Format monthly deliveries for Recharts
  const monthlyChartData = stats?.monthlyDeliveries
    ? Object.entries(stats.monthlyDeliveries).map(([month, count]) => ({
        month,
        deliveries: count,
      }))
    : [];

  // Format shipment status distribution for Pie Chart
  const statusChartData = stats?.shipmentStatusDistribution
    ? Object.entries(stats.shipmentStatusDistribution)
        .filter(([_, count]) => count > 0)
        .map(([name, value]) => ({
          name: name.replace(/_/g, ' '),
          value,
        }))
    : [];

  // Format vehicle type distribution for Bar Chart
  const vehicleChartData = stats?.vehicleTypeDistribution
    ? Object.entries(stats.vehicleTypeDistribution).map(([type, count]) => ({
        type: type.replace(/_/g, ' '),
        count,
      }))
    : [];

  const recentColumns = [
    {
      title: 'Tracking #',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (text, record) => (
        <Link to={`/shipments/${record.id}`} style={{ fontWeight: 600, color: '#1677ff' }}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.companyName && <span style={{ fontSize: '11px', color: '#8c8c8c' }}>{record.companyName}</span>}
        </div>
      ),
    },
    {
      title: 'Origin → Destination',
      key: 'route',
      render: (_, record) => (
        <span style={{ fontSize: '13px' }}>
          {record.pickupCity} → {record.deliveryCity}
        </span>
      ),
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicleNumber',
      key: 'vehicleNumber',
      render: (text) => text ? <Tag color="blue">{text}</Tag> : <Text type="secondary">Unassigned</Text>,
    },
    {
      title: 'Driver',
      dataIndex: 'driverName',
      key: 'driverName',
      render: (text) => text || <Text type="secondary">Unassigned</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'shipmentStatus',
      key: 'shipmentStatus',
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      render: (date) => (date ? new Date(date).toLocaleDateString() : '—'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/shipments/${record.id}`)}
          >
            Details
          </Button>
          {record.shipmentStatus === 'PENDING' && (
            <Button
              type="primary"
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={() => navigate(`/shipments/${record.id}/assign`)}
            >
              Assign
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Fleet & Logistics Control Center"
        subtitle="Real-time operational overview of active dispatches, fleet capacity, drivers, and tracking."
        extra={
          <Space>
            <Button type="default" icon={<CarOutlined />} onClick={() => navigate('/vehicles')}>
              Fleet View
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/shipments/create')}>
              New Shipment
            </Button>
          </Space>
        }
      />

      {/* Alert Banners (Delay Detection & Vehicle Service Due) */}
      <div style={{ marginBottom: '24px' }}>
        {stats?.delayedShipments > 0 && (
          <Alert
            message={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <strong>{stats.delayedShipments} Delayed Shipment(s) Detected</strong>: Consignments past their estimated delivery window requiring dispatch attention.
                </span>
                <Button size="small" danger onClick={() => navigate('/shipments?status=DELAYED')}>
                  Inspect Delayed Shipments →
                </Button>
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: '12px', borderRadius: '10px' }}
          />
        )}

        {stats?.maintenanceAlerts?.length > 0 && (
          <Alert
            message={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <strong>{stats.maintenanceAlerts.length} Vehicle Maintenance / Insurance Alert(s)</strong>: Scheduled service or insurance renewals requiring action.
                </span>
                <Button size="small" type="dashed" onClick={() => navigate('/maintenance')}>
                  Review Maintenance Schedule →
                </Button>
              </div>
            }
            type="warning"
            showIcon
            style={{ borderRadius: '10px' }}
          />
        )}
      </div>

      {/* Row 1: Primary KPI Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={8} lg={4}>
          <StatCard
            title="Total Shipments"
            value={stats?.totalShipments}
            icon={<InboxOutlined />}
            color="#1677ff"
            onClick={() => navigate('/shipments')}
          />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard
            title="Active Dispatches"
            value={stats?.activeShipments}
            icon={<SyncOutlined spin />}
            color="#13c2c2"
            onClick={() => navigate('/shipments')}
          />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard
            title="Delivered"
            value={stats?.deliveredShipments}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
            onClick={() => navigate('/shipments?status=DELIVERED')}
          />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard
            title="Pending Review"
            value={stats?.pendingShipments}
            icon={<ClockCircleOutlined />}
            color="#faad14"
            onClick={() => navigate('/shipments?status=PENDING')}
          />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard
            title="Delayed Shipments"
            value={stats?.delayedShipments}
            icon={<ExclamationCircleOutlined />}
            color="#ff4d4f"
            onClick={() => navigate('/shipments')}
          />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard
            title="Available Vehicles"
            value={`${stats?.availableVehicles} / ${stats?.totalVehicles}`}
            icon={<CarOutlined />}
            color="#722ed1"
            onClick={() => navigate('/vehicles')}
          />
        </Col>
      </Row>

      {/* Row 2: Secondary Quick Metric Chips */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" style={{ borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Total Drivers</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1f1f1f' }}>{stats?.totalDrivers}</div>
            <div style={{ fontSize: '11px', color: '#52c41a' }}>{stats?.availableDrivers} Available</div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" style={{ borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Drivers on Trip</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1677ff' }}>{stats?.onDeliveryDrivers}</div>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Active trips</div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" style={{ borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Maintenance Fleet</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#fa8c16' }}>{stats?.maintenanceVehicles}</div>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>In service garage</div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" style={{ borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Customers</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1f1f1f' }}>{stats?.totalCustomers}</div>
            <div style={{ fontSize: '11px', color: '#52c41a' }}>Verified corporate</div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" style={{ borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Logistics Hubs</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1f1f1f' }}>{stats?.totalWarehouses}</div>
            <div style={{ fontSize: '11px', color: '#1677ff' }}>Hub network</div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" style={{ borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Freight Routes</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1f1f1f' }}>{stats?.totalRoutes}</div>
            <div style={{ fontSize: '11px', color: '#722ed1' }}>Corridors active</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            size="small"
            style={{
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '100%',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/reports')}
          >
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>Analytics Hub</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Detailed Reports →</div>
            </div>
            <BarChartOutlined style={{ fontSize: '28px', color: 'rgba(255,255,255,0.8)' }} />
          </Card>
        </Col>
      </Row>

      {/* Row 3: Analytics Visualizations */}
      <Row gutter={[20, 20]} style={{ marginBottom: '24px' }}>
        {/* Monthly Deliveries Area Chart */}
        <Col xs={24} lg={14}>
          <Card
            title={<span style={{ fontWeight: 700 }}>Monthly Shipment Throughput</span>}
            style={{ borderRadius: '14px', height: '100%' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="deliveryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1677ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#1677ff" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#8c8c8c" fontSize={12} tickLine={false} />
                  <YAxis stroke="#8c8c8c" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="deliveries"
                    stroke="#1677ff"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#deliveryGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Shipment Status Distribution Donut Chart */}
        <Col xs={24} lg={10}>
          <Card
            title={<span style={{ fontWeight: 700 }}>Shipment Status Distribution</span>}
            style={{ borderRadius: '14px', height: '100%' }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ height: '280px', width: '100%' }}>
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8c8c8c' }}>
                  No shipment status records yet.
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Row 4: Recent Shipments Management Table */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Recent Dispatches & Shipments</span>
            <Button type="link" onClick={() => navigate('/shipments')}>
              View All Shipments →
            </Button>
          </div>
        }
        style={{ borderRadius: '14px' }}
        styles={{ body: { padding: '0 0 12px 0' } }}
      >
        <Table
          columns={recentColumns}
          dataSource={stats?.recentShipments || []}
          rowKey="id"
          pagination={false}
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;
