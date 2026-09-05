import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Steps,
  App,
  Divider,
} from 'antd';
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  RightCircleOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { driverService } from '../../services/driverService';
import { deliveryService } from '../../services/deliveryService';
import { shipmentService } from '../../services/shipmentService';
import { generateDeliveryOtp, validateDeliveryOtp } from '../../utils/otpUtil';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusTag from '../../components/StatusTag';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Text, Title } = Typography;
const { Option } = Select;

const DriverDashboard = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [deliverModalVisible, setDeliverModalVisible] = useState(false);
  const [activeShipmentId, setActiveShipmentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deliveryForm] = Form.useForm();

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const data = await driverService.getDashboard();
      if (data?.activeDelivery?.shipmentId) {
        try {
          const sh = await shipmentService.getById(data.activeDelivery.shipmentId);
          data.activeDelivery.shipmentStatus = sh.shipmentStatus;
        } catch (e) {
          // fallback
        }
      }
      if (data?.assignedDeliveries?.length > 0) {
        await Promise.all(
          data.assignedDeliveries.map(async (d) => {
            if (d.shipmentId && !d.shipmentStatus) {
              try {
                const sh = await shipmentService.getById(d.shipmentId);
                d.shipmentStatus = sh.shipmentStatus;
              } catch (e) {}
            }
          })
        );
      }
      setStats(data);
    } catch (error) {
      message.error(error.message || 'Failed to load driver dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  const handleAction = async (actionType, shipmentId) => {
    try {
      setSubmitting(true);
      if (actionType === 'PICKUP') {
        await deliveryService.markPickedUp(shipmentId);
        message.success('Consignment marked as PICKED UP from warehouse');
      } else if (actionType === 'START_TRANSIT') {
        await deliveryService.startDelivery(shipmentId);
        message.success('Trip started - Consignment IN TRANSIT');
      } else if (actionType === 'OUT_FOR_DELIVERY') {
        await deliveryService.markOutForDelivery(shipmentId);
        message.success('Shipment marked OUT FOR DELIVERY - Recipient notified');
      }
      fetchDriverData();
    } catch (error) {
      message.error(error.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const [currentOtp, setCurrentOtp] = useState('');

  const handleOpenCompleteModal = (shipmentId) => {
    setActiveShipmentId(shipmentId);
    const shipmentObj = stats?.activeDeliveries?.find((d) => d.shipmentId === shipmentId || d.id === shipmentId) || activeDelivery;
    const otp = generateDeliveryOtp(shipmentObj || shipmentId);
    setCurrentOtp(otp);
    deliveryForm.resetFields();
    deliveryForm.setFieldsValue({
      recipientName: shipmentObj?.recipientName || activeDelivery?.recipientName || '',
      deliveryOtp: '',
      podMethod: 'OTP Verified & Recipient Signature Received',
      deliveryNotes: '',
    });
    setDeliverModalVisible(true);
  };

  const handleCompleteDeliverySubmit = async (values) => {
    const enteredOtp = (values.deliveryOtp || '').trim();
    const shipmentObj = stats?.activeDeliveries?.find((d) => d.shipmentId === activeShipmentId || d.id === activeShipmentId) || activeDelivery;
    const expectedOtp = generateDeliveryOtp(shipmentObj || activeShipmentId);

    if (!validateDeliveryOtp(enteredOtp, shipmentObj || activeShipmentId)) {
      message.error(`Invalid Handover OTP! The entered code "${enteredOtp}" is incorrect. Please enter the valid 6-digit OTP displayed on the customer's tracking screen.`);
      return;
    }

    try {
      setSubmitting(true);
      const podText = `OTP Verified (#${enteredOtp}) - ${values.podMethod || 'Handover Completed'}`;

      const payload = {
        recipientName: values.recipientName,
        deliveryOtp: enteredOtp,
        proofOfDelivery: podText,
        deliveryNotes: values.deliveryNotes || 'Consignment verified with OTP and handed over directly to recipient.',
      };

      await deliveryService.markDelivered(activeShipmentId, payload);
      message.success('Delivery completed & Proof of Delivery (POD) verified successfully!');
      setDeliverModalVisible(false);
      fetchDriverData();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Failed to complete delivery');
    } finally {
      setSubmitting(false);
    }
  };

  const getStepCurrent = (status) => {
    switch (status) {
      case 'NOT_STARTED':
      case 'PENDING':
      case 'ASSIGNED':
      case 'PICKUP_SCHEDULED':
        return 0;
      case 'PICKED_UP':
        return 1;
      case 'IN_PROGRESS':
      case 'IN_TRANSIT':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'COMPLETED':
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const activeDelivery = stats?.activeDelivery;

  const columns = [
    {
      title: 'Tracking #',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (trackingNumber, record) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ color: '#1677ff' }}>{trackingNumber}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.packageDescription || 'Package'} ({record.weightKg} kg)
          </Text>
        </Space>
      ),
    },
    {
      title: 'Destination',
      key: 'deliveryAddress',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.deliveryAddress}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Recipient: {record.recipientName || 'Customer'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicleNumber',
      key: 'vehicleNumber',
      render: (num) => (
        <Tag color="blue">{num || 'Assigned Truck'}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
      render: (status, record) => <StatusTag status={record.shipmentStatus || status} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          ghost
          onClick={() => navigate('/driver/deliveries')}
        >
          Manage Trip
        </Button>
      ),
    },
  ];

  if (loading && !stats) {
    return <LoadingSpinner tip="Loading driver portal and assigned trips..." />;
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Driver Command Center"
        subtitle="Manage your active consignment runs, confirm pickups, and report milestone deliveries"
      />

      {/* KPI Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <StatCard
            title="Completed Deliveries"
            value={stats?.completedDeliveriesCount || 0}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
            bgColor="#f6ffed"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Today's Assigned Trips"
            value={stats?.todayDeliveriesCount || 0}
            icon={<CarOutlined />}
            color="#1677ff"
            bgColor="#e6f4ff"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Pending Deliveries"
            value={stats?.pendingShipments || 0}
            icon={<ClockCircleOutlined />}
            color="#faad14"
            bgColor="#fff7e6"
          />
        </Col>
      </Row>

      {/* Hero Active Delivery Card */}
      {activeDelivery ? (
        <Card
          title={
            <Space>
              <CarOutlined style={{ color: '#1677ff', fontSize: 18 }} />
              <span style={{ fontWeight: 700 }}>
                Active Consignment in Progress: Waybill #{activeDelivery.trackingNumber}
              </span>
              <StatusTag status={activeDelivery.shipmentStatus || activeDelivery.deliveryStatus} />
            </Space>
          }
          style={{
            marginBottom: 24,
            borderColor: '#91caff',
            boxShadow: '0 4px 12px rgba(22, 119, 255, 0.08)',
          }}
        >
          <Steps
            current={getStepCurrent(activeDelivery.shipmentStatus || activeDelivery.deliveryStatus)}
            style={{ marginBottom: 28, marginTop: 12 }}
            items={[
              { title: 'Assigned', description: 'Allocated' },
              { title: 'Picked Up', description: 'Loaded at Warehouse' },
              { title: 'In Transit', description: 'On Corridor' },
              { title: 'Out for Delivery', description: 'Final Mile' },
              { title: 'Delivered', description: 'Completed & POD' },
            ]}
          />

          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card type="inner" title="Pickup Origin" size="small">
                <p style={{ margin: 0 }}>
                  <EnvironmentOutlined style={{ color: '#1677ff', marginRight: 6 }} />
                  {activeDelivery.pickupAddress}
                </p>
                {activeDelivery.pickupTime && (
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                    Pickup Time: {new Date(activeDelivery.pickupTime).toLocaleString()}
                  </Text>
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card type="inner" title="Delivery Destination" size="small">
                <p style={{ margin: 0 }}>
                  <EnvironmentOutlined style={{ color: '#52c41a', marginRight: 6 }} />
                  {activeDelivery.deliveryAddress}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: 13 }}>
                  <UserOutlined style={{ marginRight: 6 }} />
                  Recipient: <strong>{activeDelivery.recipientName || 'Customer'}</strong>
                </p>
              </Card>
            </Col>
          </Row>

          <Divider />

          {/* Action Step Triggers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <Text strong>Cargo Details: </Text>
              <Text type="secondary">
                {activeDelivery.packageDescription} | Weight: {activeDelivery.weightKg} kg | Vehicle: {activeDelivery.vehicleNumber || 'Assigned'}
              </Text>
            </div>

            <Space wrap>
              {['NOT_STARTED', 'ASSIGNED', 'PENDING', 'PICKUP_SCHEDULED'].includes(activeDelivery.shipmentStatus || activeDelivery.deliveryStatus) && (
                <Button
                  type="primary"
                  size="large"
                  icon={<RightCircleOutlined />}
                  loading={submitting}
                  onClick={() => handleAction('PICKUP', activeDelivery.shipmentId)}
                >
                  Confirm Pickup at Hub
                </Button>
              )}

              {(activeDelivery.shipmentStatus === 'PICKED_UP' || activeDelivery.deliveryStatus === 'PICKED_UP') && (
                <Button
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  style={{ background: '#722ed1', borderColor: '#722ed1' }}
                  loading={submitting}
                  onClick={() => handleAction('START_TRANSIT', activeDelivery.shipmentId)}
                >
                  Start Highway Transit
                </Button>
              )}

              {['IN_PROGRESS', 'IN_TRANSIT'].includes(activeDelivery.shipmentStatus || activeDelivery.deliveryStatus) && (
                <Button
                  type="primary"
                  size="large"
                  icon={<RightCircleOutlined />}
                  style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
                  loading={submitting}
                  onClick={() => handleAction('OUT_FOR_DELIVERY', activeDelivery.shipmentId)}
                >
                  Mark Out for Delivery
                </Button>
              )}

              {(activeDelivery.shipmentStatus === 'OUT_FOR_DELIVERY' || activeDelivery.deliveryStatus === 'OUT_FOR_DELIVERY') && (
                <Button
                  type="primary"
                  size="large"
                  icon={<SafetyCertificateOutlined />}
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => handleOpenCompleteModal(activeDelivery.shipmentId)}
                >
                  Complete Delivery & POD
                </Button>
              )}
            </Space>
          </div>
        </Card>
      ) : (
        <Card style={{ marginBottom: 24, textAlign: 'center', padding: '24px 0' }}>
          <CheckCircleOutlined style={{ fontSize: 42, color: '#52c41a', marginBottom: 12 }} />
          <Title level={4} style={{ margin: 0 }}>All Caught Up!</Title>
          <Text type="secondary">
            You have no active consignments currently in transit. Check your assigned deliveries below.
          </Text>
        </Card>
      )}

      {/* Assigned Deliveries List */}
      <Card
        title="Assigned Deliveries Queue"
        extra={
          <Button type="link" onClick={() => navigate('/driver/deliveries')}>
            View Full List &rarr;
          </Button>
        }
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={stats?.assignedDeliveries || []}
          rowKey="id"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Complete Delivery Modal */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
            <span style={{ fontWeight: 700 }}>Proof of Delivery (POD) & Recipient OTP Verification</span>
          </Space>
        }
        open={deliverModalVisible}
        onCancel={() => setDeliverModalVisible(false)}
        footer={null}
        destroyOnHidden
        width={560}
      >
        {/* OTP Information Banner */}
        <div style={{ background: '#f0f7ff', border: '1px solid #91caff', borderRadius: '8px', padding: '12px 16px', marginTop: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#0958d9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SafetyCertificateOutlined /> OTP Verification Required
              </div>
              <div style={{ fontSize: '12px', color: '#595959', marginTop: '2px' }}>
                Ask the recipient for their 6-digit Delivery OTP shown on their tracking page.
              </div>
            </div>
            <Button
              size="small"
              type="dashed"
              onClick={() => deliveryForm.setFieldsValue({ deliveryOtp: currentOtp })}
              style={{ fontSize: '11px', color: '#1677ff' }}
            >
              Fill Demo OTP
            </Button>
          </div>
        </div>

        <Form
          form={deliveryForm}
          layout="vertical"
          onFinish={handleCompleteDeliverySubmit}
        >
          <Form.Item
            name="recipientName"
            label="Recipient Full Name / Receiver"
            rules={[{ required: true, message: 'Please enter receiver name' }]}
          >
            <Input placeholder="e.g. Rahul Menon / Security Guard" prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="deliveryOtp"
                label="Recipient 6-Digit Delivery OTP"
                rules={[
                  { required: true, message: 'Please enter 6-digit OTP' },
                  { len: 6, message: 'OTP must be exactly 6 digits' },
                ]}
                tooltip="Ask customer for the code displayed in their tracking dashboard"
              >
                <Input
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  style={{ fontWeight: 700, letterSpacing: '3px', textAlign: 'center', fontSize: '17px' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="podMethod"
                label="Verification Method"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="OTP Verified & Recipient Signature Received">OTP + Customer Handover</Option>
                  <Option value="OTP Verified & Gate Pass Issued">OTP + Security Gate Pass</Option>
                  <Option value="Digital Signature On Device">Digital Signature On Glass</Option>
                  <Option value="Contactless Secure Drop">Contactless Doorstep Drop</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="deliveryNotes" label="Delivery Remarks / Handover Notes">
            <Input.TextArea rows={2} placeholder="e.g. Package handed over to recipient in good condition" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 20 }}>
            <Space>
              <Button onClick={() => setDeliverModalVisible(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<CheckCircleOutlined />}
                style={{ background: '#52c41a', borderColor: '#52c41a', fontWeight: 600, padding: '0 20px' }}
              >
                Verify OTP & Confirm Delivery
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DriverDashboard;
