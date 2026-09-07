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
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Popconfirm,
  Rate,
  App,
} from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { driverService } from '../../services/driverService';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusTag from '../../components/StatusTag';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Option } = Select;

const DriverList = () => {
  const { message } = App.useApp();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  // History Drawer / Modal
  const [selectedDriverHistory, setSelectedDriverHistory] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await driverService.getAll();
      setDrivers(data);
    } catch (error) {
      // Handled by global axios
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (driver = null) => {
    setEditingDriver(driver);
    if (driver) {
      form.setFieldsValue({
        fullName: driver.fullName,
        email: driver.email,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber,
        licenseType: driver.licenseType,
        licenseExpiryDate: driver.licenseExpiryDate ? dayjs(driver.licenseExpiryDate) : null,
        experienceYears: driver.experienceYears,
        availabilityStatus: driver.availabilityStatus,
        rating: driver.rating,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        availabilityStatus: 'AVAILABLE',
        experienceYears: 2,
        rating: 5.0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveDriver = async (values) => {
    try {
      setModalLoading(true);
      const payload = {
        ...values,
        licenseExpiryDate: values.licenseExpiryDate ? values.licenseExpiryDate.format('YYYY-MM-DD') : null,
      };

      if (editingDriver) {
        await driverService.update(editingDriver.id, payload);
        message.success('Driver profile updated successfully');
      } else {
        await driverService.create(payload);
        message.success('New driver enrolled successfully');
      }

      setIsModalOpen(false);
      fetchDrivers();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save driver profile.';
      message.error(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteDriver = async (id) => {
    try {
      await driverService.delete(id);
      message.success('Driver removed from active staff');
      fetchDrivers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete driver');
    }
  };

  const handleViewHistory = async (driver) => {
    setSelectedDriverHistory(driver);
    setIsHistoryOpen(true);
    try {
      setHistoryLoading(true);
      const data = await driverService.getHistory(driver.id);
      setHistoryList(data);
    } catch (error) {
      message.error('Failed to load driver trip history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    const s = search.toLowerCase();
    const matchSearch =
      !search ||
      d.fullName.toLowerCase().includes(s) ||
      d.email.toLowerCase().includes(s) ||
      (d.phone && d.phone.includes(s)) ||
      d.licenseNumber.toLowerCase().includes(s);
    const matchStatus = !statusFilter || d.availabilityStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalDrivers = drivers.length;
  const availableCount = drivers.filter((d) => d.availabilityStatus === 'AVAILABLE').length;
  const onDeliveryCount = drivers.filter((d) => d.availabilityStatus === 'ON_DELIVERY').length;
  const offDutyCount = drivers.filter((d) => d.availabilityStatus === 'OFF_DUTY').length;

  const columns = [
    {
      title: 'Driver',
      key: 'driver',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, color: '#1f1f1f' }}>{record.fullName}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Contact Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '—',
    },
    {
      title: 'Commercial License #',
      dataIndex: 'licenseNumber',
      key: 'licenseNumber',
      render: (lic, record) => (
        <div>
          <span style={{ fontWeight: 600 }}>{lic}</span>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{record.licenseType}</div>
        </div>
      ),
    },
    {
      title: 'Experience',
      dataIndex: 'experienceYears',
      key: 'experienceYears',
      render: (exp) => `${exp || 0} Years`,
    },
    {
      title: 'Availability',
      dataIndex: 'availabilityStatus',
      key: 'availabilityStatus',
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space size="small">
          <Rate disabled allowHalf defaultValue={rating || 5} style={{ fontSize: '13px' }} />
          <strong style={{ fontSize: '12px' }}>{rating ? rating.toFixed(1) : '5.0'}</strong>
        </Space>
      ),
    },
    {
      title: 'Deliveries',
      dataIndex: 'totalDeliveries',
      key: 'totalDeliveries',
      render: (count) => <Tag color="green"><strong>{count || 0}</strong> completed</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<HistoryOutlined />}
            onClick={() => handleViewHistory(record)}
            title="Trip History"
          />
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Remove Driver"
            description="Are you sure you want to deactivate and remove this driver?"
            onConfirm={() => handleDeleteDriver(record.id)}
            okText="Yes, Remove"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Driver Management"
        subtitle="Manage certified freight drivers, license verification, performance ratings, and delivery dispatches."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
            Enroll New Driver
          </Button>
        }
      />

      {/* Top Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <StatCard
            title="Total Certified Drivers"
            value={totalDrivers}
            icon={<TeamOutlined />}
            color="#1677ff"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Available for Dispatch"
            value={availableCount}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="On Active Delivery"
            value={onDeliveryCount}
            icon={<SyncOutlined spin />}
            color="#13c2c2"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Off Duty"
            value={offDutyCount}
            icon={<UserOutlined />}
            color="#8c8c8c"
          />
        </Col>
      </Row>

      {/* Filter Bar */}
      <Card style={{ borderRadius: '14px', marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Search driver by name, email, phone, license number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={10}>
            <Select
              placeholder="Availability Filter"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="AVAILABLE">Available</Option>
              <Option value="ASSIGNED">Assigned</Option>
              <Option value="ON_DELIVERY">On Delivery</Option>
              <Option value="OFF_DUTY">Off Duty</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: '14px' }} styles={{ body: { padding: '0 0 12px 0' } }}>
        {loading ? (
          <LoadingSpinner tip="Loading driver personnel..." />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredDrivers}
            rowKey="id"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>

      {/* Add / Edit Driver Modal */}
      <Modal
        title={<span style={{ fontWeight: 700 }}>{editingDriver ? 'Edit Driver Profile' : 'Enroll New Commercial Driver'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={680}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSaveDriver} style={{ marginTop: '16px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="fullName"
                label="Driver Full Name"
                rules={[{ required: true, message: 'Driver name is required' }]}
              >
                <Input placeholder="e.g. Arun Kumar" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email (Login Username)"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Enter valid email' },
                ]}
              >
                <Input placeholder="driver@transbayx.com" disabled={!!editingDriver} />
              </Form.Item>
            </Col>
          </Row>

          {!editingDriver && (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="password" label="Temporary Password (Defaults to Driver@123)">
                  <Input.Password placeholder="Driver@123" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="phone" label="Phone Number (10 digits)">
                  <Input placeholder="9876500001" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="licenseNumber"
                label="Commercial Driving License #"
                rules={[{ required: true, message: 'License number is required' }]}
              >
                <Input placeholder="e.g. TN-38-2018-009871" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="licenseType" label="License Vehicle Class">
                <Select placeholder="Select License Type">
                  <Option value="Light Commercial Vehicle (LCV)">Light Commercial Vehicle (LCV)</Option>
                  <Option value="Medium Freight Transport (MCV)">Medium Freight Transport (MCV)</Option>
                  <Option value="Heavy Commercial Vehicle (HCV)">Heavy Commercial Vehicle (HCV)</Option>
                  <Option value="Multi-Axle Articulated">Multi-Axle Articulated</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="experienceYears" label="Experience (Years)">
                <InputNumber style={{ width: '100%' }} min={0} max={40} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="rating" label="Initial Rating (1-5)">
                <InputNumber style={{ width: '100%' }} min={1} max={5} step={0.1} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="availabilityStatus"
                label="Availability Status"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="AVAILABLE">Available</Option>
                  <Option value="ASSIGNED">Assigned</Option>
                  <Option value="ON_DELIVERY">On Delivery</Option>
                  <Option value="OFF_DUTY">Off Duty</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="licenseExpiryDate" label="License Expiry Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={modalLoading}>
              {editingDriver ? 'Save Changes' : 'Enroll Driver'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Driver Trip History Modal */}
      {selectedDriverHistory && (
        <Modal
          title={
            <span style={{ fontWeight: 700 }}>
              Trip & Delivery History: {selectedDriverHistory.fullName}
            </span>
          }
          open={isHistoryOpen}
          onOk={() => setIsHistoryOpen(false)}
          onCancel={() => setIsHistoryOpen(false)}
          footer={[
            <Button key="close" type="primary" onClick={() => setIsHistoryOpen(false)}>
              Done
            </Button>,
          ]}
          width={760}
        >
          {historyLoading ? (
            <LoadingSpinner tip="Loading trip history..." minHeight={180} />
          ) : historyList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#8c8c8c' }}>
              No completed trips recorded for this driver yet.
            </div>
          ) : (
            <Table
              dataSource={historyList}
              rowKey="id"
              pagination={{ defaultPageSize: 5 }}
              columns={[
                {
                  title: 'Tracking #',
                  dataIndex: 'trackingNumber',
                  key: 'trackingNumber',
                  render: (text) => <strong>{text}</strong>,
                },
                {
                  title: 'Vehicle',
                  dataIndex: 'vehicleNumber',
                  key: 'vehicleNumber',
                  render: (text) => text || '—',
                },
                {
                  title: 'Destination',
                  dataIndex: 'deliveryAddress',
                  key: 'deliveryAddress',
                  render: (addr) => <span style={{ fontSize: '12px' }}>{addr}</span>,
                },
                {
                  title: 'Delivery Status',
                  dataIndex: 'deliveryStatus',
                  key: 'deliveryStatus',
                  render: (status) => <StatusTag status={status} />,
                },
              ]}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default DriverList;
