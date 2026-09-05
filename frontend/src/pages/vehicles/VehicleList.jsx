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
  Tooltip,
  App,
} from 'antd';
import {
  CarOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { vehicleService } from '../../services/vehicleService';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusTag from '../../components/StatusTag';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Option } = Select;

const VehicleList = () => {
  const { message } = App.useApp();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [fuelFilter, setFuelFilter] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  // Details Modal State
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (error) {
      // Handled by global axios
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vehicle = null) => {
    setEditingVehicle(vehicle);
    if (vehicle) {
      form.setFieldsValue({
        ...vehicle,
        insuranceExpiryDate: vehicle.insuranceExpiryDate ? dayjs(vehicle.insuranceExpiryDate) : null,
        registrationExpiryDate: vehicle.registrationExpiryDate ? dayjs(vehicle.registrationExpiryDate) : null,
        lastServiceDate: vehicle.lastServiceDate ? dayjs(vehicle.lastServiceDate) : null,
        nextServiceDate: vehicle.nextServiceDate ? dayjs(vehicle.nextServiceDate) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: 'AVAILABLE',
        fuelType: 'DIESEL',
        vehicleType: 'VAN',
        manufacturingYear: new Date().getFullYear(),
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveVehicle = async (values) => {
    try {
      setModalLoading(true);
      const payload = {
        ...values,
        insuranceExpiryDate: values.insuranceExpiryDate ? values.insuranceExpiryDate.format('YYYY-MM-DD') : null,
        registrationExpiryDate: values.registrationExpiryDate ? values.registrationExpiryDate.format('YYYY-MM-DD') : null,
        lastServiceDate: values.lastServiceDate ? values.lastServiceDate.format('YYYY-MM-DD') : null,
        nextServiceDate: values.nextServiceDate ? values.nextServiceDate.format('YYYY-MM-DD') : null,
      };

      if (editingVehicle) {
        await vehicleService.update(editingVehicle.id, payload);
        message.success('Vehicle updated successfully');
      } else {
        await vehicleService.create(payload);
        message.success('Vehicle registered to fleet successfully');
      }

      setIsModalOpen(false);
      fetchVehicles();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save vehicle.';
      message.error(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      await vehicleService.delete(id);
      message.success('Vehicle removed from system');
      fetchVehicles();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const s = search.toLowerCase();
    const matchSearch =
      !search ||
      v.vehicleNumber.toLowerCase().includes(s) ||
      (v.brand && v.brand.toLowerCase().includes(s)) ||
      (v.model && v.model.toLowerCase().includes(s)) ||
      (v.currentLocation && v.currentLocation.toLowerCase().includes(s));
    const matchType = !typeFilter || v.vehicleType === typeFilter;
    const matchStatus = !statusFilter || v.status === statusFilter;
    const matchFuel = !fuelFilter || v.fuelType === fuelFilter;

    return matchSearch && matchType && matchStatus && matchFuel;
  });

  // Calculate stats
  const totalVehicles = vehicles.length;
  const availableCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const assignedCount = vehicles.filter((v) => v.status === 'ASSIGNED' || v.status === 'IN_TRANSIT').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'MAINTENANCE').length;

  const columns = [
    {
      title: 'Vehicle #',
      dataIndex: 'vehicleNumber',
      key: 'vehicleNumber',
      render: (text, record) => (
        <div>
          <span style={{ fontWeight: 700, color: '#1677ff' }}>{text}</span>
          {record.alertMessage && (
            <div style={{ marginTop: '2px' }}>
              <Tag color={record.isExpired ? 'red' : 'orange'} style={{ fontSize: '10px', padding: '0 4px' }}>
                {record.alertMessage}
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      render: (type) => <Tag color="blue">{type?.replace(/_/g, ' ')}</Tag>,
    },
    {
      title: 'Make & Model',
      key: 'model',
      render: (_, record) => (
        <span>
          {record.brand} {record.model} ({record.manufacturingYear || '—'})
        </span>
      ),
    },
    {
      title: 'Payload Capacity',
      dataIndex: 'capacityKg',
      key: 'capacityKg',
      render: (capacity) => <strong>{capacity} kg</strong>,
    },
    {
      title: 'Fuel Type',
      dataIndex: 'fuelType',
      key: 'fuelType',
      render: (fuel) => <Tag color={fuel === 'ELECTRIC' ? 'green' : 'default'}>{fuel}</Tag>,
    },
    {
      title: 'Location',
      dataIndex: 'currentLocation',
      key: 'currentLocation',
      render: (loc) => loc || 'Central Hub',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Next Service',
      dataIndex: 'nextServiceDate',
      key: 'nextServiceDate',
      render: (date, record) => {
        if (!date) return '—';
        return (
          <span style={{ color: record.serviceDueSoon ? '#fa8c16' : record.isExpired ? '#ff4d4f' : '#595959' }}>
            {new Date(date).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedVehicle(record);
              setIsDetailsOpen(true);
            }}
          />
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Delete Vehicle"
            description="Are you sure you want to permanently remove this vehicle from fleet?"
            onConfirm={() => handleDeleteVehicle(record.id)}
            okText="Yes, Delete"
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
        title="Fleet & Vehicle Management"
        subtitle="Track commercial vehicles, capacities, fuel configurations, service schedules, and deployment statuses."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
            Register New Vehicle
          </Button>
        }
      />

      {/* Top Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <StatCard
            title="Total Fleet Units"
            value={totalVehicles}
            icon={<CarOutlined />}
            color="#1677ff"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Available Vehicles"
            value={availableCount}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Assigned / In Transit"
            value={assignedCount}
            icon={<SyncOutlined spin />}
            color="#13c2c2"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="In Maintenance"
            value={maintenanceCount}
            icon={<ToolOutlined />}
            color="#faad14"
          />
        </Col>
      </Row>

      {/* Filter Bar */}
      <Card style={{ borderRadius: '14px', marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Search by license #, brand, model, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Vehicle Type"
              value={typeFilter}
              onChange={setTypeFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="BIKE">Bike</Option>
              <Option value="VAN">Van</Option>
              <Option value="MINI_TRUCK">Mini Truck</Option>
              <Option value="TRUCK">Truck</Option>
              <Option value="HEAVY_TRUCK">Heavy Truck</Option>
            </Select>
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="AVAILABLE">Available</Option>
              <Option value="ASSIGNED">Assigned</Option>
              <Option value="IN_TRANSIT">In Transit</Option>
              <Option value="MAINTENANCE">Maintenance</Option>
              <Option value="INACTIVE">Inactive</Option>
            </Select>
          </Col>
          <Col xs={12} md={6}>
            <Select
              placeholder="Fuel Type"
              value={fuelFilter}
              onChange={setFuelFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="DIESEL">Diesel</Option>
              <Option value="PETROL">Petrol</Option>
              <Option value="ELECTRIC">Electric</Option>
              <Option value="CNG">CNG</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Vehicles Table */}
      <Card style={{ borderRadius: '14px' }} styles={{ body: { padding: '0 0 12px 0' } }}>
        {loading ? (
          <LoadingSpinner tip="Loading fleet registry..." />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredVehicles}
            rowKey="id"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>

      {/* Add / Edit Vehicle Modal */}
      <Modal
        title={<span style={{ fontWeight: 700 }}>{editingVehicle ? 'Edit Fleet Vehicle' : 'Register New Fleet Vehicle'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={720}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSaveVehicle} style={{ marginTop: '16px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="vehicleNumber"
                label="Vehicle Registration Number"
                rules={[{ required: true, message: 'Vehicle number is required' }]}
              >
                <Input placeholder="e.g. TN38AB4556" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="vehicleType"
                label="Vehicle Type"
                rules={[{ required: true, message: 'Vehicle type is required' }]}
              >
                <Select placeholder="Select Type">
                  <Option value="BIKE">Bike (up to 100 kg)</Option>
                  <Option value="VAN">Van (up to 1,500 kg)</Option>
                  <Option value="MINI_TRUCK">Mini Truck (up to 1,000 kg)</Option>
                  <Option value="TRUCK">Truck (up to 7,500 kg)</Option>
                  <Option value="HEAVY_TRUCK">Heavy Truck (up to 25,000 kg)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="brand" label="Brand / Manufacturer">
                <Input placeholder="e.g. Tata Motors" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="model" label="Model">
                <Input placeholder="e.g. Ace Gold" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="manufacturingYear" label="Manufacturing Year">
                <InputNumber style={{ width: '100%' }} min={2000} max={2030} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="capacityKg"
                label="Payload Capacity (Kg)"
                rules={[{ required: true, message: 'Capacity is required' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} placeholder="e.g. 750" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="fuelType"
                label="Fuel Type"
                rules={[{ required: true, message: 'Fuel type is required' }]}
              >
                <Select>
                  <Option value="DIESEL">Diesel</Option>
                  <Option value="PETROL">Petrol</Option>
                  <Option value="ELECTRIC">Electric</Option>
                  <Option value="CNG">CNG</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="status" label="Initial Status">
                <Select>
                  <Option value="AVAILABLE">Available</Option>
                  <Option value="ASSIGNED">Assigned</Option>
                  <Option value="IN_TRANSIT">In Transit</Option>
                  <Option value="MAINTENANCE">Maintenance</Option>
                  <Option value="INACTIVE">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="currentLocation" label="Current Depot / Base City">
                <Input placeholder="e.g. Chennai Central Hub" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="odometerKm" label="Current Odometer (km)">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 25000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="lastServiceDate" label="Last Service Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="nextServiceDate" label="Next Service Due Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="insuranceExpiryDate" label="Insurance Expiry Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="registrationExpiryDate" label="Registration Expiry Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={modalLoading}>
              {editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Vehicle Quick Details Modal */}
      {selectedVehicle && (
        <Modal
          title={<span style={{ fontWeight: 700 }}>Vehicle Specs: {selectedVehicle.vehicleNumber}</span>}
          open={isDetailsOpen}
          onOk={() => setIsDetailsOpen(false)}
          onCancel={() => setIsDetailsOpen(false)}
          footer={[
            <Button key="close" type="primary" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>,
          ]}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px 0' }}>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <span style={{ color: '#8c8c8c' }}>Type:</span> <strong>{selectedVehicle.vehicleType}</strong>
              </Col>
              <Col span={12}>
                <span style={{ color: '#8c8c8c' }}>Status:</span> <StatusTag status={selectedVehicle.status} />
              </Col>
              <Col span={12}>
                <span style={{ color: '#8c8c8c' }}>Capacity:</span> <strong>{selectedVehicle.capacityKg} kg</strong>
              </Col>
              <Col span={12}>
                <span style={{ color: '#8c8c8c' }}>Fuel:</span> <strong>{selectedVehicle.fuelType}</strong>
              </Col>
              <Col span={12}>
                <span style={{ color: '#8c8c8c' }}>Make:</span> {selectedVehicle.brand} {selectedVehicle.model}
              </Col>
              <Col span={12}>
                <span style={{ color: '#8c8c8c' }}>Odometer:</span> {selectedVehicle.odometerKm || 0} km
              </Col>
              <Col span={12}>
                <span style={{ color: '#8c8c8c' }}>Next Service:</span> {selectedVehicle.nextServiceDate || 'N/A'}
              </Col>
              <Col span={12}>
                <span style={{ color: '#8c8c8c' }}>Insurance Expiry:</span> {selectedVehicle.insuranceExpiryDate || 'N/A'}
              </Col>
            </Row>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VehicleList;
