import React, { useState, useEffect } from 'react';
import {
  useNavigate,
  Link } from 'react-router-dom';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Popconfirm,
  Row,
  Col,
  Typography,
  App,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CompassOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { shipmentService } from '../../services/shipmentService';
import { generateDeliveryOtp } from '../../utils/otpUtil';
import PageHeader from '../../components/PageHeader';
import StatusTag from '../../components/StatusTag';

const { Text } = Typography;
const { Option } = Select;

const MyShipments = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchMyShipments = async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getMyShipments();
      setShipments(data);
    } catch (error) {
      message.error(error.message || 'Failed to fetch your shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyShipments();
  }, []);

  const handleCancelShipment = async (id) => {
    try {
      await shipmentService.cancel(id);
      message.success('Consignment cancelled successfully');
      fetchMyShipments();
    } catch (error) {
      message.error(error.message || 'Failed to cancel consignment');
    }
  };

  const filteredShipments = shipments.filter((item) => {
    const matchesSearch =
      !search ||
      item.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
      item.recipientName?.toLowerCase().includes(search.toLowerCase()) ||
      item.deliveryCity?.toLowerCase().includes(search.toLowerCase()) ||
      item.pickupCity?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Tracking Waybill # & OTP',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (trackingNumber, record) => (
        <Space orientation="vertical" size={2}>
          <Link to={`/shipments/${record.id}`} style={{ fontWeight: 600, color: '#1677ff' }}>
            {trackingNumber}
          </Link>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.packageDescription || 'Parcel'}
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
      title: 'Origin & Destination',
      key: 'route',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text style={{ fontSize: 13 }}>
            From: <strong>{record.pickupCity}</strong>
          </Text>
          <Text style={{ fontSize: 13 }}>
            To: <strong>{record.deliveryCity}</strong>
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Recipient: {record.recipientName} ({record.recipientPhone})
          </Text>
        </Space>
      ),
    },
    {
      title: 'Weight & Freight Cost',
      key: 'cost',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
            ₹{Number(record.estimatedCost || 0).toLocaleString()}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Weight: {record.weightKg} kg
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
      title: 'Booked On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (date ? new Date(date).toLocaleDateString() : 'N/A'),
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
              <Button size="small" danger icon={<CloseCircleOutlined />}>
                Cancel
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="My Consignments & Parcels"
        subtitle="Manage all your booked freight orders, track milestone movements, or cancel pending bookings"
        breadcrumbs={[
          { title: 'Dashboard', href: '/customer/dashboard' },
          { title: 'My Shipments' },
        ]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/shipments/create')}
          >
            Book New Shipment
          </Button>
        }
      />

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={14} md={8}>
            <Input
              placeholder="Search by tracking #, recipient or city..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={10} md={6}>
            <Select
              placeholder="Filter by Status"
              value={statusFilter || undefined}
              onChange={(val) => setStatusFilter(val || '')}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="PENDING">PENDING</Option>
              <Option value="ASSIGNED">ASSIGNED</Option>
              <Option value="PICKED_UP">PICKED_UP</Option>
              <Option value="IN_TRANSIT">IN_TRANSIT</Option>
              <Option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</Option>
              <Option value="DELIVERED">DELIVERED</Option>
              <Option value="CANCELLED">CANCELLED</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={filteredShipments}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default MyShipments;
