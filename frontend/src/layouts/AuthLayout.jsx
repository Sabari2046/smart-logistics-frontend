import React from 'react';
import { Row, Col, Typography, Space } from 'antd';
import {
  RocketOutlined,
  CheckCircleFilled,
  SafetyCertificateFilled,
  ThunderboltFilled,
  CarFilled,
} from '@ant-design/icons';
import { Link, Outlet } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1080px',
          background: '#ffffff',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
          border: '1px solid #edf2f7',
        }}
      >
        <Row style={{ minHeight: '620px' }}>
          {/* Left Brand Panel */}
          <Col
            xs={0}
            md={11}
            style={{
              background: 'linear-gradient(135deg, #0958d9 0%, #1677ff 60%, #4096ff 100%)',
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background Decorative Rings */}
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-80px',
                left: '-80px',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                pointerEvents: 'none',
              }}
            />

            <div>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Space align="center" size="middle" style={{ marginBottom: '32px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1677ff',
                      fontSize: '22px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    <RocketOutlined />
                  </div>
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: 800, lineHeight: 1.2 }}>
                      SmartLogistics
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                      Fleet & Delivery Management
                    </div>
                  </div>
                </Space>
              </Link>

              <Title level={2} style={{ color: '#ffffff', fontWeight: 800, letterSpacing: '-0.5px', marginTop: 0 }}>
                Move Smarter.<br />Deliver Faster.
              </Title>

              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
                Enterprise logistics orchestration platform unifying shipment booking, AI vehicle recommendation, route planning, driver automation, and end-to-end live tracking.
              </Paragraph>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircleFilled style={{ color: '#52c41a', fontSize: '18px' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Smart Weight & Capacity Auto-Assignment</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ThunderboltFilled style={{ color: '#faad14', fontSize: '18px' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Real-time Delay Detection & Predictive Routing</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CarFilled style={{ color: '#69b1ff', fontSize: '18px' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Fleet Maintenance & Inspection Alert Triggers</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <SafetyCertificateFilled style={{ color: '#95de64', fontSize: '18px' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Role-Based Access for Admin, Driver & Customer</span>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '12px' }}>
                Trusted by 500+ commercial shippers & logistics providers across India.
              </Text>
            </div>
          </Col>

          {/* Right Form Content */}
          <Col
            xs={24}
            md={13}
            className="auth-form-column"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ padding: 'clamp(20px, 4vw, 48px) clamp(16px, 4vw, 40px)' }}>
              <Outlet />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AuthLayout;
