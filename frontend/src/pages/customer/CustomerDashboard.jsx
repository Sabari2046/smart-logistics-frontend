import React, { useState, useEffect } from 'react';
import {
  useNavigate,
  Link } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Typography,
  Space,
  Input,
  Tag,
  Popconfirm,
  App,
} from 'antd';
import {
  RocketOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { customerService } from '../../services/customerService';
import { shipmentService } from '../../services/shipmentService';
import { generateDeliveryOtp } from '../../utils/otpUtil';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusTag from '../../components/StatusTag';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Text, Title } = Typography;

const CustomerDashboard = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await customerService.getDashboard();
      setStats(data);
    } catch (error) {
      message.error(error.message || 'Failed to load customer dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTrackQuickSearch = (e) => {
    e.preventDefault();
    if (!trackingInput.trim()) {
      message.warning('Please enter a tracking number');
      return;
    }
    navigate(`/track/${encodeURIComponent(trackingInput.trim())}`);
  };

  const handleCancelShipment = async (id) => {
    try {
      await shipmentService.cancel(id);
      message.success('Shipment cancelled successfully');
      fetchDashboardData();
    } catch (error) {
      message.error(error.message || 'Failed to cancel shipment');
    }
  };

  const columns = [
    {
      title: 'Tracking # & Delivery OTP',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (trackingNumber, record) => (
        <Space orientation="vertical" size={2}>
          <Link to={`/shipments/${record.id}`} style={{ fontWeight: 600, color: '#1677ff' }}>
            {trackingNumber}
          </Link>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.packageDescription || 'General Parcel'}
          </Text>
          {record.status !== 'DELIVERED' && record.status !== 'CANCELLED' && (
            <Tag color="green" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginTop: '2px', width: 'fit-content' }}>
              OTP: {generateDeliveryOtp(record)}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Destination',
      key: 'destination',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong>{record.deliveryCity || record.destinationCity}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            To: {record.recipientName}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Cost & Priority',
      key: 'cost',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong style={{ color: '#52c41a' }}>
            ₹{Number(record.estimatedCost || 0).toLocaleString()}
          </Text>
          <StatusTag status={record.priority} />
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<CompassOutlined />}
            onClick={() => navigate(`/track/${record.trackingNumber}`)}
          >
            Track
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/shipments/${record.id}`)}
          >
            Details
          </Button>
          {(record.status === 'PENDING' || record.status === 'CREATED') && (
            <Popconfirm
              title="Cancel Consignment"
              description="Are you sure you want to cancel this booking?"
              onConfirm={() => handleCancelShipment(record.id)}
              okText="Yes, Cancel"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger>
                Cancel
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (loading && !stats) {
    return <LoadingSpinner tip="Loading your customer portal..." />;
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Customer Freight Portal"
        subtitle="Manage your booked shipments, track consignments live, and request new dispatches"
        extra={
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/shipments/create')}
          >
            Book New Shipment
          </Button>
        }
      />

      {/* KPI Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Bookings"
            value={stats?.totalShipments || 0}
            icon={<RocketOutlined />}
            color="#1677ff"
            bgColor="#e6f4ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Active In-Transit"
            value={stats?.activeShipments || 0}
            icon={<ClockCircleOutlined />}
            color="#fa8c16"
            bgColor="#fff7e6"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Delivered Successfully"
            value={stats?.deliveredShipments || 0}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
            bgColor="#f6ffed"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Pending Dispatch"
            value={stats?.pendingShipments || 0}
            icon={<CloseCircleOutlined />}
            color="#722ed1"
            bgColor="#f9f0ff"
          />
        </Col>
      </Row>

      {/* Live Track Search Card */}
      <Card
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, #0958d9 0%, #1677ff 100%)',
          color: '#ffffff',
          borderRadius: 12,
        }}
        styles={{ body: { padding: '24px 32px' } }}
      >
        <Row align="middle" gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Title level={4} style={{ color: '#ffffff', margin: 0 }}>
              Live Parcel Radar & Milestone Tracker
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 13 }}>
              Enter any valid waybill or consignment number for real-time dispatch telematics.
            </Text>
          </Col>
          <Col xs={24} md={12}>
            <form onSubmit={handleTrackQuickSearch} style={{ display: 'flex', gap: 8 }}>
              <Input
                size="large"
                placeholder="e.g. SLF202610001"
                prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                style={{ borderRadius: 8 }}
              />
              <Button
                size="large"
                type="primary"
                htmlType="submit"
                style={{
                  background: '#52c41a',
                  borderColor: '#52c41a',
                  fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                Track Live
              </Button>
            </form>
          </Col>
        </Row>
      </Card>

      {/* Recent Orders Section */}
      <Card
        title="Recent Consignments"
        extra={
          <Button type="link" onClick={() => navigate('/customer/shipments')}>
            View All Shipments &rarr;
          </Button>
        }
        bordered={false}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={stats?.recentShipments || []}
          rowKey="id"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default CustomerDashboard;
