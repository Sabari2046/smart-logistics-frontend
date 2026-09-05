import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Card,
  Button,
  Space,
  Select,
  Tag,
  Modal,
  Form,
  Input,
  App,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  RightCircleOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { deliveryService } from '../../services/deliveryService';
import { shipmentService } from '../../services/shipmentService';
import { generateDeliveryOtp, validateDeliveryOtp } from '../../utils/otpUtil';
import PageHeader from '../../components/PageHeader';
import StatusTag from '../../components/StatusTag';

const { Text } = Typography;
const { Option } = Select;

const AssignedDeliveries = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [deliverModalVisible, setDeliverModalVisible] = useState(false);
  const [activeShipmentId, setActiveShipmentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentOtp, setCurrentOtp] = useState('');

  const [deliveryForm] = Form.useForm();

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getMyDeliveries();
      if (data?.length > 0) {
        await Promise.all(
          data.map(async (d) => {
            if (d.shipmentId && !d.shipmentStatus) {
              try {
                const sh = await shipmentService.getById(d.shipmentId);
                d.shipmentStatus = sh.shipmentStatus;
              } catch (e) {}
            }
          })
        );
      }
      setDeliveries(data || []);
    } catch (error) {
      message.error(error.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleAction = async (actionType, shipmentId) => {
    try {
      setSubmitting(true);
      if (actionType === 'PICKUP' || actionType === 'PICKED_UP') {
        await deliveryService.markPickedUp(shipmentId);
        message.success('Shipment marked as PICKED UP from sender');
      } else if (actionType === 'START_TRANSIT' || actionType === 'IN_TRANSIT') {
        await deliveryService.startDelivery(shipmentId);
        message.success('Shipment is now IN TRANSIT');
      } else if (actionType === 'OUT_FOR_DELIVERY') {
        await deliveryService.markOutForDelivery(shipmentId);
        message.success('Shipment marked OUT FOR DELIVERY - Recipient notified');
      }
      fetchDeliveries();
    } catch (error) {
      message.error(error.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCompleteModal = (shipmentId) => {
    setActiveShipmentId(shipmentId);
    const existing = deliveries.find((d) => d.shipmentId === shipmentId || d.id === shipmentId);
    const otp = generateDeliveryOtp(existing || shipmentId);
    setCurrentOtp(otp);
    deliveryForm.resetFields();
    deliveryForm.setFieldsValue({
      recipientName: existing?.recipientName || '',
      deliveryOtp: '',
      podMethod: 'OTP Verified & Recipient Signature Received',
      deliveryNotes: '',
    });
    setDeliverModalVisible(true);
  };

  const handleCompleteDeliverySubmit = async (values) => {
    const enteredOtp = (values.deliveryOtp || '').trim();
    const existing = deliveries.find((d) => d.shipmentId === activeShipmentId || d.id === activeShipmentId);

    if (!validateDeliveryOtp(enteredOtp, existing || activeShipmentId)) {
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
        deliveryNotes: values.deliveryNotes || 'Delivered directly to recipient in good condition',
      };

      await deliveryService.markDelivered(activeShipmentId, payload);
      message.success('Delivery marked as COMPLETED successfully with verified POD OTP!');
      setDeliverModalVisible(false);
      fetchDeliveries();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Failed to complete delivery');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = deliveries.filter((item) => {
    if (!statusFilter) return true;
    return item.deliveryStatus === statusFilter;
  });

  const columns = [
    {
      title: 'Tracking # & Cargo',
      key: 'tracking',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong style={{ color: '#1677ff', fontSize: 14 }}>
            {record.trackingNumber}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.packageDescription || 'Parcel'} ({record.weightKg} kg)
          </Text>
        </Space>
      ),
    },
    {
      title: 'Origin / Hub',
      dataIndex: 'pickupAddress',
      key: 'pickupAddress',
      render: (addr) => (
        <Text style={{ fontSize: 13 }}>
          <EnvironmentOutlined style={{ color: '#1677ff', marginRight: 4 }} />
          {addr}
        </Text>
      ),
    },
    {
      title: 'Destination',
      key: 'destination',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text style={{ fontSize: 13 }}>
            <EnvironmentOutlined style={{ color: '#52c41a', marginRight: 4 }} />
            {record.deliveryAddress}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Receiver: {record.recipientName || 'Customer'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicleNumber',
      key: 'vehicleNumber',
      render: (num) => <Tag color="blue">{num || 'Assigned'}</Tag>,
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
      render: (_, record) => {
        const currentStatus = record.shipmentStatus || record.deliveryStatus;
        return (
          <Space>
            {['NOT_STARTED', 'ASSIGNED', 'PENDING', 'PICKUP_SCHEDULED'].includes(currentStatus) && (
              <Button
                type="primary"
                size="small"
                icon={<RightCircleOutlined />}
                onClick={() => handleAction('PICKUP', record.shipmentId)}
              >
                Pickup
              </Button>
            )}
            {currentStatus === 'PICKED_UP' && (
              <Button
                type="primary"
                size="small"
                style={{ background: '#722ed1', borderColor: '#722ed1' }}
                icon={<RightCircleOutlined />}
                onClick={() => handleAction('START_TRANSIT', record.shipmentId)}
              >
                Transit
              </Button>
            )}
            {['IN_PROGRESS', 'IN_TRANSIT'].includes(currentStatus) && (
              <Button
                type="primary"
                size="small"
                style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
                icon={<RightCircleOutlined />}
                onClick={() => handleAction('OUT_FOR_DELIVERY', record.shipmentId)}
              >
                Out for Delivery
              </Button>
            )}
            {currentStatus === 'OUT_FOR_DELIVERY' && (
              <Button
                type="primary"
                size="small"
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                icon={<SafetyCertificateOutlined />}
                onClick={() => handleOpenCompleteModal(record.shipmentId)}
              >
                Complete
              </Button>
            )}
            <Button
              size="small"
              icon={<CompassOutlined />}
              onClick={() => navigate(`/track/${record.trackingNumber}`)}
            >
              Track
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Assigned Consignments & Dispatches"
        subtitle="View all dispatches allocated to your fleet vehicle, update status transitions, and submit proof of delivery"
        breadcrumbs={[
          { title: 'Dashboard', href: '/driver/dashboard' },
          { title: 'Assigned Deliveries' },
        ]}
      />

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={10} md={6}>
            <Select
              placeholder="Filter by Status"
              value={statusFilter || undefined}
              onChange={(val) => setStatusFilter(val || '')}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="NOT_STARTED">NOT_STARTED</Option>
              <Option value="PICKED_UP">PICKED_UP</Option>
              <Option value="IN_PROGRESS">IN_PROGRESS (IN TRANSIT)</Option>
              <Option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</Option>
              <Option value="COMPLETED">COMPLETED</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
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
            <Input.TextArea rows={2} placeholder="e.g. Package delivered directly to recipient in good condition" />
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

export default AssignedDeliveries;
