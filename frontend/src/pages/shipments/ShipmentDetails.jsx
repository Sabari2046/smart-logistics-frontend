import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Space,
  Timeline,
  Divider,
  Descriptions,
  Modal,
  Form,
  Select,
  Input,
  Popconfirm,
  App,
} from 'antd';
import {
  InboxOutlined,
  CarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  StopOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  DollarOutlined,
  EditOutlined,
  CompassOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { shipmentService } from '../../services/shipmentService';
import { generateDeliveryOtp } from '../../utils/otpUtil';
import PageHeader from '../../components/PageHeader';
import StatusTag from '../../components/StatusTag';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const ShipmentDetails = () => {
  const { message } = App.useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusForm] = Form.useForm();

  useEffect(() => {
    fetchShipmentDetails();
  }, [id]);

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getById(id);
      setShipment(data);
    } catch (error) {
      message.error('Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = () => {
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
      await shipmentService.updateStatus(shipment.id, values);
      message.success('Shipment status updated and logged to history');
      setStatusModalOpen(false);
      fetchShipmentDetails();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCancelShipment = async () => {
    try {
      await shipmentService.cancel(shipment.id);
      message.success('Shipment cancelled');
      fetchShipmentDetails();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to cancel shipment');
    }
  };

  if (loading) {
    return <LoadingSpinner tip="Loading shipment manifest and tracking logs..." />;
  }

  if (!shipment) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Shipment not found.</div>;
  }

  return (
    <div>
      <PageHeader
        title={`Shipment Manifest: ${shipment.trackingNumber}`}
        subtitle={`Created on ${new Date(shipment.createdAt).toLocaleString()}`}
        breadcrumbs={[
          { title: 'Shipments', path: '/shipments' },
          { title: shipment.trackingNumber },
        ]}
        extra={
          <Space wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Back
            </Button>

            <Button
              type="default"
              onClick={() => navigate(`/track/${shipment.trackingNumber}`)}
            >
              Public Tracking View
            </Button>

            {role === 'ROLE_ADMIN' && shipment.shipmentStatus === 'PENDING' && (
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={() => navigate(`/shipments/${shipment.id}/assign`)}
              >
                Smart Assign Resources
              </Button>
            )}

            {role === 'ROLE_ADMIN' && shipment.shipmentStatus !== 'DELIVERED' && shipment.shipmentStatus !== 'CANCELLED' && (
              <Button type="default" onClick={handleOpenStatusModal}>
                Update Status
              </Button>
            )}

            {(shipment.shipmentStatus === 'PENDING' || shipment.shipmentStatus === 'APPROVED') && (
              <Popconfirm
                title="Cancel Shipment"
                description="Are you sure you want to cancel this consignment?"
                onConfirm={handleCancelShipment}
                okText="Yes, Cancel"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<StopOutlined />}>
                  Cancel Shipment
                </Button>
              </Popconfirm>
            )}
          </Space>
        }
      />

      {/* Top Banner Status Overview */}
      <Card style={{ borderRadius: '14px', marginBottom: '24px' }}>
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} sm={8}>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Consignment Status</div>
            <div style={{ marginTop: '4px' }}>
              <StatusTag status={shipment.shipmentStatus} />
              {shipment.isDelayed && (
                <Tag color="red" style={{ marginLeft: '8px', fontWeight: 600 }}>DELAYED</Tag>
              )}
            </div>
          </Col>
          <Col xs={12} sm={8}>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Estimated Delivery</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f1f1f', marginTop: '4px' }}>
              <CalendarOutlined style={{ marginRight: '6px', color: '#1677ff' }} />
              {shipment.expectedDeliveryDate ? new Date(shipment.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
            </div>
          </Col>
          <Col xs={12} sm={8}>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Shipping Total Cost</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#52c41a', marginTop: '2px' }}>
              ₹{shipment.shippingCost?.toLocaleString() || '0'}
            </div>
          </Col>
        </Row>

        {/* POD OTP or POD Confirmation */}
        {shipment.shipmentStatus === 'DELIVERED' ? (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: '#f6ffed',
              borderRadius: '8px',
              border: '1px solid #b7eb8f',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
            }}
          >
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
            <div>
              <span style={{ fontWeight: 700, color: '#237804' }}>Proof of Delivery (POD) Recorded:</span>
              <span style={{ marginLeft: '6px', color: '#1f1f1f' }}>
                {shipment.proofOfDelivery || 'OTP Verified & Recipient Signature Received'}
              </span>
              {shipment.recipientName && (
                <span style={{ marginLeft: '6px', color: '#595959' }}>
                  (Receiver: <strong>{shipment.recipientName}</strong>)
                </span>
              )}
            </div>
          </div>
        ) : (
          shipment.shipmentStatus !== 'CANCELLED' && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: '#f0f7ff',
                borderRadius: '8px',
                border: '1px solid #adc6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SafetyCertificateOutlined style={{ color: '#1677ff', fontSize: '18px' }} />
                <span style={{ fontSize: '13px', color: '#1f1f1f' }}>
                  Secure Delivery Handover OTP:
                </span>
              </div>
              <Tag color="blue" style={{ fontSize: '15px', fontWeight: 800, padding: '2px 10px', letterSpacing: '2px' }}>
                {generateDeliveryOtp(shipment)}
              </Tag>
            </div>
          )
        )}
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Column: Shipment & Route Specs */}
        <Col xs={24} lg={14}>
          {/* Origin and Destination Card */}
          <Card
            title={
              <Space>
                <EnvironmentOutlined style={{ color: '#1677ff' }} />
                <span style={{ fontWeight: 700 }}>Routing & Address Manifest</span>
              </Space>
            }
            style={{ borderRadius: '14px', marginBottom: '20px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div style={{ background: '#f0f7ff', padding: '16px', borderRadius: '10px', height: '100%' }}>
                  <Tag color="blue" style={{ marginBottom: '8px' }}>ORIGIN / PICKUP</Tag>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{shipment.pickupCity}, {shipment.pickupState}</div>
                  <div style={{ color: '#595959', fontSize: '13px', marginTop: '4px' }}>{shipment.pickupAddress}</div>
                  <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '2px' }}>PIN: {shipment.pickupPostalCode}</div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ background: '#f6ffed', padding: '16px', borderRadius: '10px', height: '100%' }}>
                  <Tag color="green" style={{ marginBottom: '8px' }}>DESTINATION</Tag>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{shipment.deliveryCity}, {shipment.deliveryState}</div>
                  <div style={{ color: '#595959', fontSize: '13px', marginTop: '4px' }}>{shipment.deliveryAddress}</div>
                  <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '2px' }}>PIN: {shipment.deliveryPostalCode}</div>
                </div>
              </Col>
            </Row>

            {shipment.routeName && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', fontSize: '13px', flexWrap: 'wrap', gap: '8px' }}>
                <span><CompassOutlined style={{ color: '#1677ff' }} /> Route: <strong>{shipment.routeName}</strong></span>
                <span>Distance: <strong>{shipment.routeDistanceKm} km</strong></span>
              </div>
            )}
          </Card>

          {/* Cargo Details */}
          <Card
            title={
              <Space>
                <InboxOutlined style={{ color: '#722ed1' }} />
                <span style={{ fontWeight: 700 }}>Cargo & Customer Profile</span>
              </Space>
            }
            style={{ borderRadius: '14px', marginBottom: '20px' }}
          >
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Customer">{shipment.customerName}</Descriptions.Item>
              <Descriptions.Item label="Company">{shipment.companyName || 'Individual'}</Descriptions.Item>
              <Descriptions.Item label="Contact Email">{shipment.customerEmail}</Descriptions.Item>
              <Descriptions.Item label="Contact Phone">{shipment.customerPhone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Cargo Weight"><strong>{shipment.weightKg} kg</strong></Descriptions.Item>
              <Descriptions.Item label="Cargo Type">{shipment.packageType}</Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Tag color={shipment.priority === 'URGENT' ? 'volcano' : shipment.priority === 'EXPRESS' ? 'blue' : 'default'}>
                  {shipment.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Manifest Notes" span={2}>
                {shipment.packageDescription || 'Standard commercial cargo'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Assigned Fleet & Driver */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <Space>
                  <CarOutlined style={{ color: '#fa8c16' }} />
                  <span style={{ fontWeight: 700 }}>Assigned Dispatch Fleet & Driver</span>
                </Space>
                {role === 'ROLE_ADMIN' && (
                  <Button type="link" size="small" onClick={() => navigate(`/shipments/${shipment.id}/assign`)}>
                    Reassign Resources →
                  </Button>
                )}
              </div>
            }
            style={{ borderRadius: '14px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div style={{ padding: '16px', border: '1px solid #f0f0f0', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Assigned Vehicle</div>
                  {shipment.vehicleNumber ? (
                    <div style={{ marginTop: '6px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#1677ff' }}>{shipment.vehicleNumber}</div>
                      <div style={{ fontSize: '13px', color: '#595959' }}>{shipment.vehicleType} • {shipment.vehicleBrandModel}</div>
                    </div>
                  ) : (
                    <div style={{ color: '#8c8c8c', marginTop: '6px' }}>No vehicle assigned yet</div>
                  )}
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <div style={{ padding: '16px', border: '1px solid #f0f0f0', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Assigned Driver</div>
                  {shipment.driverName ? (
                    <div style={{ marginTop: '6px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#1f1f1f' }}>{shipment.driverName}</div>
                      <div style={{ fontSize: '13px', color: '#595959' }}>License: {shipment.driverLicense}</div>
                      {shipment.driverPhone && <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Phone: {shipment.driverPhone}</div>}
                    </div>
                  ) : (
                    <div style={{ color: '#8c8c8c', marginTop: '6px' }}>No driver assigned yet</div>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Right Column: Tracking History Chronological Timeline */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#1677ff' }} />
                <span style={{ fontWeight: 700 }}>Live Tracking Timeline</span>
              </Space>
            }
            style={{ borderRadius: '14px' }}
          >
            {shipment.trackingHistories?.length === 0 ? (
              <div style={{ color: '#8c8c8c', textAlign: 'center', padding: '24px 0' }}>
                No tracking milestone logs recorded yet.
              </div>
            ) : (
              <Timeline
                style={{ marginTop: '12px' }}
                items={shipment.trackingHistories.map((h) => ({
                  color:
                    h.status === 'DELIVERED'
                      ? 'green'
                      : h.status === 'IN_TRANSIT'
                      ? 'blue'
                      : h.status === 'CANCELLED'
                      ? 'red'
                      : 'gray',
                  children: (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <StatusTag status={h.status} />
                        <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '6px', color: '#1f1f1f' }}>
                        <EnvironmentOutlined style={{ marginRight: '4px', color: '#1677ff' }} />
                        {h.location || 'Hub Milestone'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#595959', marginTop: '2px', lineHeight: 1.5 }}>
                        {h.description}
                      </div>
                    </div>
                  ),
                }))}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Admin Status Update Modal */}
      <Modal
        title={<span style={{ fontWeight: 700 }}>Update Status: {shipment.trackingNumber}</span>}
        open={statusModalOpen}
        onCancel={() => setStatusModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={statusForm} layout="vertical" onFinish={handleUpdateStatus} style={{ marginTop: '16px' }}>
          <Form.Item name="status" label="New Status" rules={[{ required: true }]}>
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

          <Form.Item name="location" label="Milestone Location">
            <Input placeholder="e.g. Salem Junction Terminal" />
          </Form.Item>

          <Form.Item name="description" label="Milestone Description">
            <Input.TextArea rows={3} placeholder="e.g. Package cleared state inspection checkpoint." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={() => setStatusModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={statusLoading}>
              Save Milestone Update
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ShipmentDetails;
