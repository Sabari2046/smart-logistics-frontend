import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Timeline,
  Steps,
  Alert,
  Tag,
  Divider,
  App,
} from 'antd';
import {
  SearchOutlined,
  EnvironmentOutlined,
  CarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  ArrowRightOutlined,
  SendOutlined,
  SyncOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { generateDeliveryOtp } from '../../utils/otpUtil';
import StatusTag from '../../components/StatusTag';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Title, Paragraph, Text } = Typography;

const TrackShipment = () => {
  const { message } = App.useApp();
  const { trackingNumber: paramTracking } = useParams();
  const navigate = useNavigate();

  const [inputNumber, setInputNumber] = useState(paramTracking || '');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (paramTracking) {
      handleSearch(paramTracking);
    }
  }, [paramTracking]);

  const handleSearch = async (codeToTrack) => {
    const code = (codeToTrack || inputNumber).trim();
    if (!code) {
      message.warning('Please enter a valid tracking number');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await shipmentService.getByTrackingNumber(code);
      setShipment(data);
    } catch (error) {
      setShipment(null);
      setErrorMsg('No shipment record found for this tracking number. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepCurrent = (status) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'APPROVED':
      case 'ASSIGNED':
      case 'PICKUP_SCHEDULED':
        return 1;
      case 'PICKED_UP':
        return 2;
      case 'IN_TRANSIT':
        return 3;
      case 'OUT_FOR_DELIVERY':
        return 4;
      case 'DELIVERED':
        return 5;
      default:
        return 0;
    }
  };

  const generateOtpForShipment = (id) => {
    if (!id) return '583920';
    const num = (Number(id) * 739391 + 123456) % 900000 + 100000;
    return String(num);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 0' }}>
      {/* Header Search Box */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f0f0f0',
          marginBottom: '24px',
          background: '#ffffff',
        }}
        styles={{ body: { padding: '32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ fontWeight: 800, color: '#1f1f1f', marginBottom: '8px' }}>
            Live Consignment & Parcel Tracking
          </Title>
          <Paragraph type="secondary" style={{ margin: 0, fontSize: '14px' }}>
            Enter your TransBayX (TBX) waybill code to view live milestone updates, vehicle telemetry, and estimated delivery dates.
          </Paragraph>
        </div>

        <Space.Compact style={{ width: '100%', maxWidth: '640px', margin: '0 auto', display: 'flex' }}>
          <Input
            size="large"
            placeholder="Enter Tracking ID (e.g. TBX202610001)"
            value={inputNumber}
            onChange={(e) => setInputNumber(e.target.value)}
            onPressEnter={() => handleSearch(inputNumber)}
            style={{ borderRadius: '8px 0 0 8px', fontSize: '15px' }}
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            loading={loading}
            onClick={() => handleSearch(inputNumber)}
            style={{ borderRadius: '0 8px 8px 0', padding: '0 28px', fontWeight: 600 }}
          >
            Track
          </Button>
        </Space.Compact>

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#8c8c8c' }}>
          Enter your unique TBX consignment number provided at booking.
        </div>
      </Card>

      {errorMsg && (
        <Alert
          message={errorMsg}
          type="error"
          showIcon
          style={{ marginBottom: '24px', borderRadius: '10px' }}
        />
      )}

      {loading && <LoadingSpinner tip="Fetching live milestone tracking data..." />}

      {/* Shipment Live Result */}
      {shipment && !loading && (
        <div>
          {/* Main Status & Origin-Destination Card */}
          <Card
            style={{
              borderRadius: '16px',
              border: '1px solid #bae0ff',
              boxShadow: '0 8px 24px rgba(22, 119, 255, 0.06)',
              marginBottom: '24px',
              background: '#ffffff',
            }}
            styles={{ body: { padding: '28px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Waybill Tracking Code
                </span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1677ff' }}>
                  {shipment.trackingNumber}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <StatusTag status={shipment.shipmentStatus} />
                <div style={{ marginTop: '6px', fontSize: '13px', color: '#595959' }}>
                  Expected Delivery:{' '}
                  <strong>
                    {shipment.expectedDeliveryDate ? new Date(shipment.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Stepper Visualization */}
            <div style={{ margin: '32px 0 24px' }}>
              <Steps
                current={getStepCurrent(shipment.shipmentStatus)}
                items={[
                  { title: 'Order Created', icon: <InboxOutlined /> },
                  { title: 'Dispatched', icon: <CarOutlined /> },
                  { title: 'Picked Up', icon: <EnvironmentOutlined /> },
                  { title: 'In Transit', icon: <SyncOutlined spin={shipment.shipmentStatus === 'IN_TRANSIT'} /> },
                  { title: 'Out For Delivery', icon: <SendOutlined /> },
                  { title: 'Delivered', icon: <CheckCircleOutlined /> },
                ]}
              />
            </div>

            <Divider style={{ margin: '24px 0' }} />

            {/* Origin & Destination Cards */}
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12}>
                <div style={{ background: '#f0f7ff', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#1677ff', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Origin Pickup Facility
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1f1f1f' }}>
                    {shipment.pickupCity}, {shipment.pickupState}
                  </div>
                  <div style={{ fontSize: '13px', color: '#595959', marginTop: '4px' }}>
                    {shipment.pickupAddress} (PIN: {shipment.pickupPostalCode})
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <div style={{ background: '#f6ffed', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#52c41a', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Destination Recipient Address
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1f1f1f' }}>
                    {shipment.deliveryCity}, {shipment.deliveryState}
                  </div>
                  <div style={{ fontSize: '13px', color: '#595959', marginTop: '4px' }}>
                    {shipment.deliveryAddress} (PIN: {shipment.deliveryPostalCode})
                  </div>
                </div>
              </Col>
            </Row>

            {/* Fleet and Driver summary */}
            {(shipment.vehicleNumber || shipment.driverName) && (
              <div style={{ marginTop: '20px', padding: '14px 18px', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '13px' }}>
                {shipment.vehicleNumber && (
                  <span>
                    <CarOutlined style={{ color: '#1677ff', marginRight: '6px' }} /> Assigned Vehicle: <strong>{shipment.vehicleNumber}</strong> ({shipment.vehicleType})
                  </span>
                )}
                {shipment.driverName && (
                  <span>
                    <TeamOutlined style={{ color: '#52c41a', marginRight: '6px' }} /> Certified Driver: <strong>{shipment.driverName}</strong> (★ {shipment.driverRating || '5.0'})
                  </span>
                )}
                <span>
                  Cargo Weight: <strong>{shipment.weightKg} kg</strong> ({shipment.priority} Priority)
                </span>
              </div>
            )}

            {/* Secure Handover OTP Banner for Recipient */}
            {shipment.shipmentStatus !== 'DELIVERED' && shipment.shipmentStatus !== 'CANCELLED' && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)',
                  borderRadius: '12px',
                  border: '1px solid #b7eb8f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#52c41a', color: '#fff', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                    <SafetyCertificateOutlined />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#237804' }}>
                      Secure Delivery Proof of Delivery (POD) OTP
                    </div>
                    <div style={{ fontSize: '13px', color: '#595959' }}>
                      Share this 6-digit one-time password with your delivery driver at the time of doorstep handover.
                    </div>
                  </div>
                </div>
                <div style={{ background: '#fff', padding: '8px 18px', borderRadius: '8px', border: '2px dashed #52c41a', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#8c8c8c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery OTP</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#1677ff', letterSpacing: '4px' }}>
                    {generateDeliveryOtp(shipment)}
                  </div>
                </div>
              </div>
            )}

            {/* Delivered POD confirmation */}
            {shipment.shipmentStatus === 'DELIVERED' && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '14px 18px',
                  background: '#f6ffed',
                  borderRadius: '10px',
                  border: '1px solid #b7eb8f',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '13px',
                }}
              >
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '22px' }} />
                <div>
                  <span style={{ fontWeight: 700, color: '#237804', fontSize: '14px' }}>Delivered Successfully</span>
                  {shipment.proofOfDelivery && (
                    <div style={{ color: '#595959', marginTop: '2px' }}>
                      Proof of Delivery: <strong>{shipment.proofOfDelivery}</strong>
                    </div>
                  )}
                  {shipment.recipientName && (
                    <div style={{ color: '#595959', marginTop: '2px' }}>
                      Received by: <strong>{shipment.recipientName}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Chronological Milestone Timeline */}
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#1677ff' }} />
                <span style={{ fontWeight: 700 }}>Full Tracking Event Timeline</span>
              </Space>
            }
            style={{ borderRadius: '16px' }}
          >
            {shipment.trackingHistories?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#8c8c8c' }}>
                No tracking milestone events recorded yet.
              </div>
            ) : (
              <Timeline
                style={{ marginTop: '16px' }}
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
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <StatusTag status={h.status} />
                        <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '6px', color: '#1f1f1f' }}>
                        <EnvironmentOutlined style={{ marginRight: '4px', color: '#1677ff' }} />
                        {h.location}
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
        </div>
      )}
    </div>
  );
};

export default TrackShipment;
