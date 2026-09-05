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
  Progress,
  Typography,
  Tooltip,
  App,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { warehouseService } from '../../services/warehouseService';
import PageHeader from '../../components/PageHeader';
import StatusTag from '../../components/StatusTag';

const { Text } = Typography;
const { Option } = Select;

const WarehouseList = () => {
  const { message } = App.useApp();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const data = await warehouseService.getAll({ search });
      setWarehouses(data);
    } catch (error) {
      message.error(error.message || 'Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingWarehouse(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'ACTIVE',
      capacity: 1000,
      currentStock: 0,
    });
    setModalVisible(true);
  };

  const handleOpenEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    form.setFieldsValue({
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location,
      address: warehouse.address,
      capacity: warehouse.capacity,
      currentStock: warehouse.currentStock,
      managerName: warehouse.managerName,
      contactPhone: warehouse.contactPhone,
      status: warehouse.status,
    });
    setModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      setSubmitting(true);
      if (editingWarehouse) {
        await warehouseService.update(editingWarehouse.id, values);
        message.success('Warehouse updated successfully');
      } else {
        await warehouseService.create(values);
        message.success('Warehouse created successfully');
      }
      setModalVisible(false);
      fetchWarehouses();
    } catch (error) {
      message.error(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await warehouseService.delete(id);
      message.success('Warehouse deleted successfully');
      fetchWarehouses();
    } catch (error) {
      message.error(error.message || 'Failed to delete warehouse');
    }
  };

  const columns = [
    {
      title: 'Warehouse',
      key: 'name',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong style={{ fontSize: 15 }}>
            <HomeOutlined style={{ marginRight: 6, color: '#1677ff' }} />
            {record.name}
          </Text>
          <Tag color="blue">{record.code}</Tag>
        </Space>
      ),
    },
    {
      title: 'Location & Address',
      key: 'location',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong>{record.location}</Text>
          <Text orientation="secondary" style={{ fontSize: 12 }}>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {record.address}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Capacity Utilization',
      key: 'capacity',
      width: 240,
      render: (_, record) => {
        const percent = record.capacity > 0 ? Math.round((record.currentStock / record.capacity) * 100) : 0;
        let strokeColor = '#52c41a';
        if (percent > 85) strokeColor = '#f5222d';
        else if (percent > 65) strokeColor = '#faad14';

        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.currentStock} / {record.capacity} units
              </Text>
              <Text strong style={{ fontSize: 12 }}>{percent}%</Text>
            </div>
            <Progress percent={percent} strokeColor={strokeColor} size="small" showInfo={false} />
          </div>
        );
      },
    },
    {
      title: 'Manager',
      key: 'manager',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text>
            <UserOutlined style={{ marginRight: 4, color: '#8c8c8c' }} />
            {record.managerName || 'N/A'}
          </Text>
          {record.contactPhone && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <PhoneOutlined style={{ marginRight: 4 }} />
              {record.contactPhone}
            </Text>
          )}
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
          <Tooltip title="Edit Warehouse">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Warehouse"
            description="Are you sure you want to delete this warehouse?"
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
        title="Warehouses & Hubs"
        subtitle="Manage regional distribution centers, storage hubs, and inventory capacity"
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Warehouses' },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Add Warehouse
          </Button>
        }
      />

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by name, code, or city..."
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
          dataSource={warehouses}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
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
          <Row gutter={16}>
            <Col xs={24} sm={14}>
              <Form.Item
                name="name"
                label="Warehouse Name"
                rules={[{ required: true, message: 'Please enter warehouse name' }]}
              >
                <Input placeholder="e.g. North Hub Chennai" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item
                name="code"
                label="Warehouse Code"
                rules={[{ required: true, message: 'Please enter warehouse code' }]}
              >
                <Input placeholder="e.g. WH-CHE-01" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="location"
                label="City / Location"
                rules={[{ required: true, message: 'Please enter location city' }]}
              >
                <Input placeholder="e.g. Chennai" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Operating Status"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="ACTIVE">ACTIVE</Option>
                  <Option value="INACTIVE">INACTIVE</Option>
                  <Option value="FULL">FULL</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Street Address"
            rules={[{ required: true, message: 'Please enter full address' }]}
          >
            <Input.TextArea rows={2} placeholder="e.g. Plot 45, Ambattur Industrial Estate" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="capacity"
                label="Total Capacity (units)"
                rules={[{ required: true, message: 'Please enter total capacity' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="currentStock"
                label="Current Stock (units)"
                rules={[{ required: true, message: 'Please enter current stock' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="managerName" label="Manager Name">
                <Input placeholder="e.g. Rajesh Kumar" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactPhone" label="Contact Phone">
                <Input placeholder="e.g. +91 98765 43210" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default WarehouseList;
