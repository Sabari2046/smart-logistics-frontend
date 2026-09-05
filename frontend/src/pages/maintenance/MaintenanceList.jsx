import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Select,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
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
  ToolOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { maintenanceService } from '../../services/maintenanceService';
import { vehicleService } from '../../services/vehicleService';
import PageHeader from '../../components/PageHeader';
import StatusTag from '../../components/StatusTag';

const { Text } = Typography;
const { Option } = Select;

const MaintenanceList = () => {
  const { message } = App.useApp();
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await maintenanceService.getAll(params);
      setRecords(data);
    } catch (error) {
      message.error(error.message || 'Failed to fetch maintenance logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to load vehicles', error);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchVehicles();
  }, [statusFilter]);

  const handleOpenCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      maintenanceType: 'ROUTINE_SERVICE',
      status: 'SCHEDULED',
      serviceDate: dayjs(),
      cost: 5000,
    });
    setModalVisible(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      vehicleId: record.vehicle?.id,
      maintenanceType: record.maintenanceType,
      serviceDate: record.serviceDate ? dayjs(record.serviceDate) : dayjs(),
      completedDate: record.completedDate ? dayjs(record.completedDate) : null,
      cost: record.cost,
      description: record.description,
      serviceProvider: record.serviceProvider,
      status: record.status,
      notes: record.notes,
    });
    setModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        serviceDate: values.serviceDate ? values.serviceDate.format('YYYY-MM-DD') : null,
        completedDate: values.completedDate ? values.completedDate.format('YYYY-MM-DD') : null,
      };

      if (editingRecord) {
        await maintenanceService.update(editingRecord.id, payload);
        message.success('Maintenance record updated successfully');
      } else {
        await maintenanceService.schedule(payload);
        message.success('Maintenance scheduled successfully');
      }
      setModalVisible(false);
      fetchRecords();
    } catch (error) {
      message.error(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (record, newStatus) => {
    try {
      const payload = {
        ...record,
        vehicleId: record.vehicle?.id,
        status: newStatus,
        completedDate: newStatus === 'COMPLETED' ? dayjs().format('YYYY-MM-DD') : record.completedDate,
      };
      await maintenanceService.update(record.id, payload);
      message.success(`Status updated to ${newStatus}`);
      fetchRecords();
    } catch (error) {
      message.error(error.message || 'Status update failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await maintenanceService.delete(id);
      message.success('Record deleted successfully');
      fetchRecords();
    } catch (error) {
      message.error(error.message || 'Failed to delete record');
    }
  };

  const columns = [
    {
      title: 'Vehicle',
      key: 'vehicle',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong style={{ fontSize: 14 }}>
            <CarOutlined style={{ marginRight: 6, color: '#1677ff' }} />
            {record.vehicle?.registrationNumber || 'N/A'}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.vehicle?.model} ({record.vehicle?.type})
          </Text>
        </Space>
      ),
    },
    {
      title: 'Service Type',
      key: 'type',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Tag color="purple" style={{ fontWeight: 500 }}>
            {record.maintenanceType?.replace('_', ' ')}
          </Tag>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description || 'No description provided'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Provider & Workshop',
      dataIndex: 'serviceProvider',
      key: 'provider',
      render: (val) => val || 'Internal Fleet Workshop',
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text style={{ fontSize: 13 }}>
            Scheduled: <strong>{record.serviceDate || 'N/A'}</strong>
          </Text>
          {record.completedDate && (
            <Text type="secondary" style={{ fontSize: 12, color: '#52c41a' }}>
              Done: {record.completedDate}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => (
        <Text strong style={{ color: '#1677ff', fontSize: 14 }}>
          ₹{Number(cost || 0).toLocaleString()}
        </Text>
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
          {record.status === 'SCHEDULED' && (
            <Tooltip title="Mark In Progress">
              <Button
                type="link"
                size="small"
                icon={<ClockCircleOutlined />}
                onClick={() => handleQuickStatus(record, 'IN_PROGRESS')}
              >
                Start
              </Button>
            </Tooltip>
          )}
          {record.status === 'IN_PROGRESS' && (
            <Tooltip title="Mark Completed">
              <Button
                type="link"
                size="small"
                style={{ color: '#52c41a' }}
                icon={<CheckCircleOutlined />}
                onClick={() => handleQuickStatus(record, 'COMPLETED')}
              >
                Complete
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Record"
            description="Are you sure you want to delete this maintenance record?"
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
        title="Fleet Maintenance & Service"
        subtitle="Manage routine servicing, repairs, parts replacement, and fleet roadworthiness"
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Maintenance' },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Schedule Maintenance
          </Button>
        }
      />

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by Status"
              value={statusFilter || undefined}
              onChange={(val) => setStatusFilter(val || '')}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="SCHEDULED">SCHEDULED</Option>
              <Option value="IN_PROGRESS">IN_PROGRESS</Option>
              <Option value="COMPLETED">COMPLETED</Option>
              <Option value="CANCELLED">CANCELLED</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Maintenance Record' : 'Schedule Vehicle Service'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnHidden
        width={650}
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
                name="vehicleId"
                label="Select Vehicle"
                rules={[{ required: true, message: 'Please select vehicle' }]}
              >
                <Select placeholder="Choose vehicle">
                  {vehicles.map((v) => (
                    <Option key={v.id} value={v.id}>
                      {v.registrationNumber} - {v.model} ({v.type})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item
                name="maintenanceType"
                label="Maintenance Type"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="ROUTINE_SERVICE">ROUTINE SERVICE</Option>
                  <Option value="OIL_CHANGE">OIL CHANGE</Option>
                  <Option value="TIRE_ROTATION">TIRE ROTATION</Option>
                  <Option value="BRAKE_INSPECTION">BRAKE INSPECTION</Option>
                  <Option value="ENGINE_REPAIR">ENGINE REPAIR</Option>
                  <Option value="BATTERY_CHECK">BATTERY CHECK</Option>
                  <Option value="EMISSION_TEST">EMISSION TEST</Option>
                  <Option value="ACCIDENT_REPAIR">ACCIDENT REPAIR</Option>
                  <Option value="GENERAL_INSPECTION">GENERAL INSPECTION</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="serviceDate"
                label="Scheduled Date"
                rules={[{ required: true, message: 'Please select service date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="completedDate" label="Completion Date (Optional)">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="cost"
                label="Service Cost (₹)"
                rules={[{ required: true, message: 'Please enter cost' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="serviceProvider" label="Service Workshop / Provider">
                <Input placeholder="e.g. Authorized Tata Service Hub" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Service Description"
            rules={[{ required: true, message: 'Please provide service details' }]}
          >
            <Input.TextArea rows={2} placeholder="e.g. 50,000km major overhaul and synthetic oil replacement" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="status" label="Service Status" rules={[{ required: true }]}>
                <Select>
                  <Option value="SCHEDULED">SCHEDULED</Option>
                  <Option value="IN_PROGRESS">IN_PROGRESS</Option>
                  <Option value="COMPLETED">COMPLETED</Option>
                  <Option value="CANCELLED">CANCELLED</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="notes" label="Technician Notes">
                <Input placeholder="e.g. Replaced front brake pads" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingRecord ? 'Update Record' : 'Schedule Service'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MaintenanceList;
