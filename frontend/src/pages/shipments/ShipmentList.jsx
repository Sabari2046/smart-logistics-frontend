import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  Modal,
  Form,
  Tooltip,
  App,
} from 'antd';
import {
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  StopOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { shipmentService } from '../../services/shipmentService';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusTag from '../../components/StatusTag';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Option } = Select;

const ShipmentList = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role } = useSelector((state) => state.auth);

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || null);
  const [priorityFilter, setPriorityFilter] = useState(null);

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusForm] = Form.useForm();

  useEffect(() => {
    fetchShipments();
  }, [statusFilter, priorityFilter]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getAll({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setShipments(data);
    } catch (error) {
      // Handled by global axios
    } finally {
      setLoading(false);
    }
  };

  const handleCancelShipment = async (id) => {
    try {
      await shipmentService.cancel(id);
      message.success('Shipment cancelled successfully');
      fetchShipments();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to cancel shipment');
    }
  };

  const handleOpenStatusModal = (shipment) => {
    setSelectedShipment(shipment);
    statusForm.setFieldsValue({
      status: shipment.shipmentStatus,
      location: shipment.pickupCity,
      description: '',
    });
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (values) => {
    try {
      setStatusLoading(true);
      await shipmentService.updateStatus(selectedShipment.id, values);
      message.success('Shipment status updated and tracking event logged');
      setStatusModalOpen(false);
      fetchShipments();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const filteredShipments = shipments.filter((s) => {
    const q = search.toLowerCase();
    return (
      !search ||
      s.trackingNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.pickupCity.toLowerCase().includes(q) ||
      s.deliveryCity.toLowerCase().includes(q) ||
      (s.vehicleNumber && s.vehicleNumber.toLowerCase().includes(q)) ||
      (s.driverName && s.driverName.toLowerCase().includes(q))
    );
  });

  const totalCount = shipments.length;
  const pendingCount = shipments.filter((s) => s.shipmentStatus === 'PENDING').length;
  const inTransitCount = shipments.filter((s) => s.shipmentStatus === 'IN_TRANSIT' || s.shipmentStatus === 'OUT_FOR_DELIVERY' || s.shipmentStatus === 'PICKED_UP').length;
  const deliveredCount = shipments.filter((s) => s.shipmentStatus === 'DELIVERED').length;
  const delayedCount = shipments.filter((s) => s.isDelayed || s.shipmentStatus === 'DELAYED').length;

  const columns = [
    {
      title: 'Tracking #',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (text, record) => (
        <div>
          <Link to={`/shipments/${record.id}`} style={{ fontWeight: 700, color: '#1677ff' }}>
            {text}
          </Link>
          {record.isDelayed && (
            <div>
              <Tag color="red" style={{ fontSize: '10px', padding: '0 4px', fontWeight: 600 }}>
                DELAYED
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          {record.companyName && <span style={{ fontSize: '11px', color: '#8c8c8c' }}>{record.companyName}</span>}
        </div>
      ),
    },
    {
      title: 'Origin → Destination',
      key: 'route',
      render: (_, record) => (
        <div style={{ fontSize: '13px' }}>
          <div><strong>From:</strong> {record.pickupCity}</div>
          <div><strong>To:</strong> {record.deliveryCity}</div>
        </div>
      ),
    },
    {
      title: 'Weight & Priority',
      key: 'weight',
      render: (_, record) => (
        <div>
          <span>{record.weightKg} kg</span>
          <div>
            <Tag color={record.priority === 'URGENT' ? 'volcano' : record.priority === 'EXPRESS' ? 'blue' : 'default'} style={{ fontSize: '11px' }}>
              {record.priority}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Assigned Vehicle / Driver',
      key: 'assignment',
      render: (_, record) => (
        <div>
          {record.vehicleNumber ? (
            <div><CarOutlined style={{ marginRight: '4px', color: '#1677ff' }} /> <Tag color="blue">{record.vehicleNumber}</Tag></div>
          ) : (
            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>No vehicle</div>
          )}
          {record.driverName ? (
            <div style={{ fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>{record.driverName}</div>
          ) : (
            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>No driver</div>
          )}
        </div>
      ),
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/shipments/${record.id}`)}
            title="View Details"
          />

          {role === 'ROLE_ADMIN' && record.shipmentStatus === 'PENDING' && (
            <Button
              type="primary"
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={() => navigate(`/shipments/${record.id}/assign`)}
            >
              Smart Assign
            </Button>
          )}

          {role === 'ROLE_ADMIN' && record.shipmentStatus !== 'DELIVERED' && record.shipmentStatus !== 'CANCELLED' && (
            <Button
              type="default"
              size="small"
              onClick={() => handleOpenStatusModal(record)}
            >
              Status
            </Button>
          )}

          {(record.shipmentStatus === 'PENDING' || record.shipmentStatus === 'APPROVED') && (
            <Popconfirm
              title="Cancel Shipment"
              description="Are you sure you want to cancel this consignment?"
              onConfirm={() => handleCancelShipment(record.id)}
              okText="Yes, Cancel"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<StopOutlined />} title="Cancel Shipment" />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Shipment & Dispatch Management"
        subtitle="Review, approve, smart-assign freight resources, and monitor real-time delivery lifecycle statuses."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/shipments/create')}>
            Book New Shipment
          </Button>
        }
      />

      {/* Top Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={8} lg={4}>
          <StatCard
            title="Total Shipments"
            value={totalCount}
            icon={<InboxOutlined />}
            color="#1677ff"
            onClick={() => setStatusFilter(null)}
          />
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <StatCard
            title="Pending Review"
            value={pendingCount}
            icon={<ClockCircleOutlined />}
            color="#faad14"
            onClick={() => setStatusFilter('PENDING')}
          />
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <StatCard
            title="In Transit / Active"
            value={inTransitCount}
            icon={<SyncOutlined spin />}
            color="#13c2c2"
          />
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <StatCard
            title="Delivered Successfully"
            value={deliveredCount}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
            onClick={() => setStatusFilter('DELIVERED')}
          />
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <StatCard
            title="Delayed Alerts"
            value={delayedCount}
            icon={<ExclamationCircleOutlined />}
            color="#ff4d4f"
            onClick={() => setStatusFilter('DELAYED')}
          />
        </Col>
      </Row>

      {/* Filter Bar */}
      <Card style={{ borderRadius: '14px', marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Search by tracking number, customer, city, vehicle, driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={7}>
            <Select
              placeholder="Filter by Status"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="ASSIGNED">Assigned</Option>
              <Option value="PICKUP_SCHEDULED">Pickup Scheduled</Option>
              <Option value="PICKED_UP">Picked Up</Option>
              <Option value="IN_TRANSIT">In Transit</Option>
              <Option value="OUT_FOR_DELIVERY">Out for Delivery</Option>
              <Option value="DELIVERED">Delivered</Option>
              <Option value="DELAYED">Delayed</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Col>
          <Col xs={12} md={7}>
            <Select
              placeholder="Filter by Priority"
              value={priorityFilter}
              onChange={setPriorityFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="NORMAL">Normal Priority</Option>
              <Option value="EXPRESS">Express Priority</Option>
              <Option value="URGENT">Urgent Priority</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: '14px' }} styles={{ body: { padding: '0 0 12px 0' } }}>
        {loading ? (
          <LoadingSpinner tip="Loading shipments and dispatches..." />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredShipments}
            rowKey="id"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>

      {/* Admin Status Transition Modal */}
      {selectedShipment && (
        <Modal
          title={<span style={{ fontWeight: 700 }}>Update Status: {selectedShipment.trackingNumber}</span>}
          open={statusModalOpen}
          onCancel={() => setStatusModalOpen(false)}
          footer={null}
          destroyOnHidden
        >
          <Form form={statusForm} layout="vertical" onFinish={handleUpdateStatus} style={{ marginTop: '16px' }}>
            <Form.Item
              name="status"
              label="New Shipment Status"
              rules={[{ required: true, message: 'Status is required' }]}
            >
              <Select>
                <Option value="PENDING">PENDING</Option>
                <Option value="APPROVED">APPROVED</Option>
                <Option value="ASSIGNED">ASSIGNED</Option>
                <Option value="PICKUP_SCHEDULED">PICKUP_SCHEDULED</Option>
                <Option value="PICKED_UP">PICKED_UP</Option>
                <Option value="IN_TRANSIT">IN_TRANSIT</Option>
                <Option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</Option>
                <Option value="DELIVERED">DELIVERED</Option>
                <Option value="DELAYED">DELAYED</Option>
              </Select>
            </Form.Item>

            <Form.Item name="location" label="Current Milestone / City Location">
              <Input placeholder="e.g. Coimbatore Hub" />
            </Form.Item>

            <Form.Item name="description" label="Status Update Note / Event Description">
              <Input.TextArea rows={3} placeholder="e.g. Package arrived at regional sorting terminal." />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button onClick={() => setStatusModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={statusLoading}>
                Confirm Update
              </Button>
            </div>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default ShipmentList;
