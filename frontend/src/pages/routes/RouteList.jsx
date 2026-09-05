import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Select,
  InputNumber,
  Tag,
  Popconfirm,
  Row,
  Col,
  Typography,
  Tooltip,
  App,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { routeService } from '../../services/routeService';
import PageHeader from '../../components/PageHeader';
import StatusTag from '../../components/StatusTag';

const { Text } = Typography;
const { Option } = Select;

const RouteList = () => {
  const { message } = App.useApp();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const data = await routeService.getAll({ search });
      setRoutes(data);
    } catch (error) {
      message.error(error.message || 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingRoute(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'ACTIVE',
      distanceKm: 100,
      estimatedDurationHours: 3.0,
      baseFuelCost: 1500,
      tollCharges: 200,
    });
    setModalVisible(true);
  };

  const handleOpenEdit = (route) => {
    setEditingRoute(route);
    form.setFieldsValue({
      name: route.name,
      sourceLocation: route.sourceLocation,
      destinationLocation: route.destinationLocation,
      distanceKm: route.distanceKm,
      estimatedDurationHours: route.estimatedDurationHours,
      baseFuelCost: route.baseFuelCost,
      tollCharges: route.tollCharges,
      status: route.status,
    });
    setModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      setSubmitting(true);
      if (editingRoute) {
        await routeService.update(editingRoute.id, values);
        message.success('Route updated successfully');
      } else {
        await routeService.create(values);
        message.success('Route corridor created successfully');
      }
      setModalVisible(false);
      fetchRoutes();
    } catch (error) {
      message.error(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await routeService.delete(id);
      message.success('Route deleted successfully');
      fetchRoutes();
    } catch (error) {
      message.error(error.message || 'Failed to delete route');
    }
  };

  const columns = [
    {
      title: 'Corridor Name',
      key: 'name',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong style={{ fontSize: 14 }}>
            <CompassOutlined style={{ marginRight: 6, color: '#1677ff' }} />
            {record.name}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Source -> Destination',
      key: 'corridor',
      render: (_, record) => (
        <Space align="center" size={8}>
          <Tag color="cyan" style={{ fontSize: 13, padding: '2px 8px' }}>
            {record.sourceLocation}
          </Tag>
          <ArrowRightOutlined style={{ color: '#8c8c8c' }} />
          <Tag color="blue" style={{ fontSize: 13, padding: '2px 8px' }}>
            {record.destinationLocation}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Distance & Duration',
      key: 'metrics',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong>{record.distanceKm} km</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ~{record.estimatedDurationHours} hours transit
          </Text>
        </Space>
      ),
    },
    {
      title: 'Est. Logistics Cost',
      key: 'costs',
      render: (_, record) => {
        const total = (Number(record.baseFuelCost) || 0) + (Number(record.tollCharges) || 0);
        return (
          <Space orientation="vertical" size={2}>
            <Text strong style={{ color: '#52c41a' }}>₹{total.toLocaleString()}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Fuel: ₹{record.baseFuelCost} | Toll: ₹{record.tollCharges}
            </Text>
          </Space>
        );
      },
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
          <Tooltip title="Edit Route">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Route"
            description="Are you sure you want to delete this route?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Corridors & Routes"
        subtitle="Manage transit corridors, distance calculations, fuel budgets, and toll costs"
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Routes' },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Add Route Corridor
          </Button>
        }
      />

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by route, source or destination..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={routes}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingRoute ? 'Edit Route Corridor' : 'Add New Route Corridor'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnHidden
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="Route Name"
            rules={[{ required: true, message: 'Please enter route name' }]}
          >
            <Input placeholder="e.g. Chennai to Bangalore Express Corridor" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="sourceLocation"
                label="Origin / Source"
                rules={[{ required: true, message: 'Please enter source city' }]}
              >
                <Input placeholder="e.g. Chennai" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="destinationLocation"
                label="Destination"
                rules={[{ required: true, message: 'Please enter destination city' }]}
              >
                <Input placeholder="e.g. Bangalore" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="distanceKm"
                label="Distance (km)"
                rules={[{ required: true, message: 'Please enter distance' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="estimatedDurationHours"
                label="Transit Duration (Hours)"
                rules={[{ required: true, message: 'Please enter estimated hours' }]}
              >
                <InputNumber min={0.1} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="baseFuelCost"
                label="Base Fuel Cost (₹)"
                rules={[{ required: true, message: 'Please enter estimated fuel cost' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tollCharges"
                label="Toll Charges (₹)"
                rules={[{ required: true, message: 'Please enter estimated toll charges' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="Route Operational Status"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="INACTIVE">INACTIVE</Option>
              <Option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</Option>
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingRoute ? 'Update Corridor' : 'Save Corridor'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RouteList;
