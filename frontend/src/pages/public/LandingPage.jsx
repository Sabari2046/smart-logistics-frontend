import React, { useState } from 'react';
import {
  Row,
  Col,
  Button,
  Card,
  Input,
  Space,
  Tag,
  Typography,
  Steps,
  Divider,
  Avatar,
  App,
} from 'antd';
import {
  RocketOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  HomeOutlined,
  SyncOutlined,
  UserOutlined,
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { shipmentService } from '../../services/shipmentService';
import { authService } from '../../services/authService';
import { loginSuccess } from '../../store/authSlice';
import StatusTag from '../../components/StatusTag';

const { Title, Paragraph, Text } = Typography;

const LandingPage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, role, user } = useSelector((state) => state.auth);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      message.warning('Please enter a tracking number (e.g. TBX202610001)');
      return;
    }

    try {
      setTrackingLoading(true);
      const data = await shipmentService.getByTrackingNumber(trackingNumber.trim());
      setTrackingData(data);
    } catch (error) {
      setTrackingData(null);
      message.error('No shipment found with this tracking number. Please check and try again.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const getDashboardPath = () => {
    if (role === 'ROLE_ADMIN') return '/admin/dashboard';
    if (role === 'ROLE_DRIVER') return '/driver/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Top Sticky Header */}
      <header
        style={{
          borderBottom: '1px solid #f0f0f0',
          padding: 'clamp(12px, 2.5vw, 16px) clamp(16px, 4vw, 32px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '22px',
              boxShadow: '0 4px 10px rgba(22, 119, 255, 0.3)',
              flexShrink: 0,
            }}
          >
            <RocketOutlined />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1f1f1f', lineHeight: 1.2 }}>
              TransBayX
            </div>
            <div style={{ fontSize: '11px', color: '#8c8c8c', fontWeight: 600 }}>
              Fleet & Delivery SaaS
            </div>
          </div>
        </div>

        {/* Navigation Links & Action Buttons */}
        <Space size="middle" wrap style={{ alignItems: 'center' }}>
          <span className="desktop-only-nav" style={{ display: 'inline-flex', gap: '16px', marginRight: '8px' }}>
            <a href="#features" style={{ color: '#595959', fontWeight: 600 }}>
              Features
            </a>
            <a href="#how-it-works" style={{ color: '#595959', fontWeight: 600 }}>
              Workflow
            </a>
            <a href="#stats" style={{ color: '#595959', fontWeight: 600 }}>
              Metrics
            </a>
          </span>

          {/* Always visible Sign In Button */}
          <Button
            type="default"
            size="middle"
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
            style={{ fontWeight: 600, borderRadius: '8px' }}
          >
            Sign In
          </Button>

          {!isLoggedIn && (
            <Button
              type="primary"
              size="middle"
              icon={<UserAddOutlined />}
              onClick={() => navigate('/register')}
              style={{ fontWeight: 600, borderRadius: '8px' }}
            >
              Register
            </Button>
          )}

          {isLoggedIn && (
            <Button
              type="primary"
              size="middle"
              onClick={() => navigate(getDashboardPath())}
              style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                borderColor: '#52c41a',
                fontWeight: 700,
                borderRadius: '8px',
              }}
            >
              Open Dashboard <ArrowRightOutlined />
            </Button>
          )}
        </Space>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: 'clamp(30px, 6vw, 60px) clamp(16px, 4vw, 32px)',
          background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={13}>
              <Tag
                color="blue"
                style={{
                  fontSize: '13px',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  marginBottom: '16px',
                  fontWeight: 600,
                }}
              >
                🚀 Enterprise Logistics & Dispatch Control Platform
              </Tag>

              <Title
                style={{
                  fontSize: 'clamp(28px, 5vw, 46px)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-1px',
                  color: '#1f1f1f',
                  marginBottom: '16px',
                }}
              >
                Smarter Fleet Orchestration. <br />
                <span style={{ color: '#1677ff' }}>Faster Freight Deliveries.</span>
              </Title>

              <Paragraph
                style={{
                  fontSize: '16px',
                  color: '#595959',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                }}
              >
                Manage consignments, fleet capacities, certified drivers, route corridors, storage hubs, and real-time live milestone tracking in one unified SaaS solution.
              </Paragraph>

              {/* Main Action Buttons */}
              <Space size="middle" wrap style={{ marginBottom: '24px' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<LoginOutlined />}
                  onClick={() => navigate('/login')}
                  style={{
                    height: '48px',
                    padding: '0 28px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    fontSize: '15px',
                    boxShadow: '0 4px 14px rgba(22, 119, 255, 0.3)',
                  }}
                >
                  Sign In to Console
                </Button>

                <Button
                  size="large"
                  icon={<UserAddOutlined />}
                  onClick={() => navigate('/register')}
                  style={{
                    height: '48px',
                    padding: '0 24px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    fontSize: '15px',
                  }}
                >
                  Customer Register
                </Button>

                <Button
                  size="large"
                  icon={<SearchOutlined />}
                  onClick={() => navigate('/track')}
                  style={{
                    height: '48px',
                    padding: '0 20px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    fontSize: '15px',
                  }}
                >
                  Waybill Radar
                </Button>
              </Space>

              {/* Quick Tracking Search Card */}
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(22, 119, 255, 0.08)',
                  border: '1px solid #e6f4ff',
                  background: '#ffffff',
                  marginBottom: '16px',
                }}
                styles={{ body: { padding: '20px' } }}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f1f1f', marginBottom: '10px' }}>
                  <SearchOutlined style={{ color: '#1677ff', marginRight: '6px' }} /> Quick Live Shipment Tracking
                </div>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    size="large"
                    placeholder="Enter Tracking ID (e.g. TBX202610001)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    onPressEnter={handleTrack}
                    style={{ borderRadius: '8px 0 0 8px' }}
                  />
                  <Button
                    type="primary"
                    size="large"
                    loading={trackingLoading}
                    onClick={handleTrack}
                    style={{ borderRadius: '0 8px 8px 0', padding: '0 24px', fontWeight: 600 }}
                  >
                    Track
                  </Button>
                </Space.Compact>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                  Enter your TBX consignment waybill number for real-time telemetry updates.
                </div>
              </Card>

              {/* Live Tracking Result Preview */}
              {trackingData && (
                <Card
                  style={{
                    borderRadius: '14px',
                    border: '1px solid #91caff',
                    background: '#f6ffed',
                    marginBottom: '16px',
                  }}
                  styles={{ body: { padding: '16px 20px' } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <Text strong style={{ fontSize: '15px' }}>{trackingData.trackingNumber}</Text>
                      <span style={{ marginLeft: '10px' }}>
                        <StatusTag status={trackingData.shipmentStatus} />
                      </span>
                    </div>
                    <Button type="link" onClick={() => navigate(`/track/${trackingData.trackingNumber}`)}>
                      Full Timeline Details →
                    </Button>
                  </div>
                  <Row gutter={[16, 8]} style={{ fontSize: '13px' }}>
                    <Col span={12}>
                      <span style={{ color: '#8c8c8c' }}>Origin:</span> <strong>{trackingData.pickupCity}</strong>
                    </Col>
                    <Col span={12}>
                      <span style={{ color: '#8c8c8c' }}>Destination:</span> <strong>{trackingData.deliveryCity}</strong>
                    </Col>
                    <Col span={12}>
                      <span style={{ color: '#8c8c8c' }}>Vehicle:</span> {trackingData.vehicleNumber || 'Unassigned'}
                    </Col>
                    <Col span={12}>
                      <span style={{ color: '#8c8c8c' }}>Driver:</span> {trackingData.driverName || 'Unassigned'}
                    </Col>
                  </Row>
                </Card>
              )}
            </Col>

            {/* Hero Mockup Cards */}
            <Col xs={24} lg={11}>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e8e8e8',
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#8c8c8c', fontWeight: 700, textTransform: 'uppercase' }}>
                      Operational Live Feed
                    </span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1f1f1f' }}>
                      Active Dispatch Terminal
                    </div>
                  </div>
                  <Tag color="success" icon={<SyncOutlined spin />} style={{ fontWeight: 600 }}>
                    SYSTEM OPTIMAL
                  </Tag>
                </div>

                {/* Interactive Stepper Mockup */}
                <Card size="small" style={{ borderRadius: '12px', background: '#f8fafc', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#1677ff' }}>
                    Shipment #TBX202610002 — In Highway Transit
                  </div>
                  <Steps
                    size="small"
                    current={2}
                    items={[
                      { title: 'Chennai Hub', description: 'Loaded' },
                      { title: 'Vellore Toll', description: 'In Transit' },
                      { title: 'Bengaluru', description: 'Expected Today' },
                    ]}
                  />
                </Card>

                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: '#e6f4ff' }}>
                      <CarOutlined style={{ color: '#1677ff', fontSize: '20px' }} />
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#1f1f1f', marginTop: '4px' }}>Enterprise Fleet</div>
                      <div style={{ fontSize: '11px', color: '#595959' }}>Real-time Capacity Matching</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: '#f6ffed' }}>
                      <TeamOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#1f1f1f', marginTop: '4px' }}>Certified Drivers</div>
                      <div style={{ fontSize: '11px', color: '#595959' }}>Smart Route Automation</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: 'clamp(30px, 6vw, 60px) clamp(16px, 4vw, 32px)', background: '#ffffff' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Tag color="blue" style={{ fontWeight: 600, padding: '4px 12px', borderRadius: '12px' }}>
              POWERFUL CAPABILITIES
            </Tag>
            <Title level={2} style={{ marginTop: '12px', fontWeight: 800 }}>
              Engineered for Scalable Logistics Operations
            </Title>
            <Paragraph style={{ color: '#595959', fontSize: '16px' }}>
              Everything your distribution network needs from consignment booking to doorstep proof of delivery.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ height: '100%', borderRadius: '14px' }}>
                <ThunderboltOutlined style={{ fontSize: '32px', color: '#1677ff', marginBottom: '16px' }} />
                <Title level={4} style={{ fontWeight: 700 }}>Smart Vehicle Allocation</Title>
                <Paragraph type="secondary">
                  Automated capacity recommendation matching cargo weight with vehicle payload buffers and vehicle classes.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ height: '100%', borderRadius: '14px' }}>
                <ClockCircleOutlined style={{ fontSize: '32px', color: '#fa8c16', marginBottom: '16px' }} />
                <Title level={4} style={{ fontWeight: 700 }}>Delay Detection & Telematics</Title>
                <Paragraph type="secondary">
                  Real-time detection of consignments past their delivery window with automatic alerts to dispatch coordinators.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ height: '100%', borderRadius: '14px' }}>
                <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '16px' }} />
                <Title level={4} style={{ fontWeight: 700 }}>Role-Based Access Control</Title>
                <Paragraph type="secondary">
                  Dedicated secure portals for Administrators, Commercial Drivers, and Enterprise Consignment Customers.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" style={{ padding: 'clamp(30px, 5vw, 50px) clamp(16px, 4vw, 32px)', background: 'linear-gradient(135deg, #0958d9 0%, #1677ff 100%)', color: '#ffffff' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <Row gutter={[32, 32]} justify="center" align="middle" style={{ textAlign: 'center' }}>
            <Col xs={12} md={6}>
              <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#ffffff' }}>1000+</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', fontWeight: 500 }}>Shipments Delivered</div>
            </Col>
            <Col xs={12} md={6}>
              <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#ffffff' }}>100%</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', fontWeight: 500 }}>Live Tracking Precision</div>
            </Col>
            <Col xs={12} md={6}>
              <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#ffffff' }}>50+</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', fontWeight: 500 }}>Distribution Corridors</div>
            </Col>
            <Col xs={12} md={6}>
              <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#ffffff' }}>99.4%</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', fontWeight: 500 }}>On-Time Success Rate</div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#001529', color: '#ffffff', padding: 'clamp(30px, 5vw, 48px) clamp(16px, 4vw, 32px) 24px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <Row gutter={[48, 32]}>
            <Col xs={24} md={10}>
              <Space align="center" style={{ marginBottom: '16px' }}>
                <RocketOutlined style={{ fontSize: '24px', color: '#4096ff' }} />
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>TransBayX</span>
              </Space>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '14px', lineHeight: 1.6 }}>
                Next-generation enterprise logistics & fleet orchestration SaaS built with Spring Boot 3.4, Java 21, MySQL, and React 19.
              </Paragraph>
            </Col>

            <Col xs={12} md={7}>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', color: '#ffffff' }}>Quick Portals</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/login" style={{ color: '#4096ff', fontWeight: 600 }}>👉 Sign In to Account</Link>
                <Link to="/register" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Register Customer</Link>
                <Link to="/track" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Waybill Tracking Radar</Link>
              </div>
            </Col>

            <Col xs={12} md={7}>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', color: '#ffffff' }}>Enterprise Platform</div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.8 }}>
                <div>Enterprise End-to-End Fleet Telematics</div>
                <div>Status: <strong>Active Cloud Production</strong></div>
              </div>
            </Col>
          </Row>

          <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.15)', margin: '32px 0 20px' }} />

          <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
            TransBayX © {new Date().getFullYear()} — Intelligent Fleet Management System.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
