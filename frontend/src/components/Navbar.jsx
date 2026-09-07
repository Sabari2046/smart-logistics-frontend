import React, { useState, useEffect } from 'react';
import {
  Layout,
  Button,
  Avatar,
  Dropdown,
  Space,
  Badge,
  Popover,
  List,
  Typography,
  Tag,
  App,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  RocketOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  SwapOutlined,
  SafetyCertificateFilled,
  CarFilled,
  ShoppingFilled,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess, logout } from '../store/authSlice';
import { authService } from '../services/authService';
import api from '../services/api';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = ({ collapsed, setCollapsed, isMobile, mobileDrawerOpen, setMobileDrawerOpen }) => {
  const { message } = App.useApp();
  const { user, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  useEffect(() => {
    if (role === 'ROLE_ADMIN') {
      fetchAlerts();
    }
  }, [role]);

  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const [delayedRes, vehicleAlertsRes] = await Promise.allSettled([
        api.get('/api/admin/delayed-shipments'),
        api.get('/api/vehicles/alerts'),
      ]);

      const list = [];
      if (delayedRes.status === 'fulfilled' && delayedRes.value.data) {
        delayedRes.value.data.forEach((s) => {
          list.push({
            id: `delayed-${s.id}`,
            type: 'delay',
            title: `Shipment Delayed: ${s.trackingNumber}`,
            description: `Destined for ${s.deliveryCity}. Expected delivery was ${s.expectedDeliveryDate ? new Date(s.expectedDeliveryDate).toLocaleDateString() : 'N/A'}`,
            path: `/shipments/${s.id}`,
          });
        });
      }

      if (vehicleAlertsRes.status === 'fulfilled' && vehicleAlertsRes.value.data) {
        vehicleAlertsRes.value.data.forEach((v) => {
          list.push({
            id: `vehicle-${v.id}`,
            type: 'vehicle',
            title: `Maintenance Alert: ${v.vehicleNumber}`,
            description: v.alertMessage || 'Service or Insurance renewal due soon.',
            path: `/vehicles/${v.id}`,
          });
        });
      }

      setAlerts(list);
    } catch (e) {
      // ignore
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    message.info('Logged out successfully');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: <Link to="/profile">My Profile</Link>,
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Sign Out',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const roleLabel = role === 'ROLE_ADMIN' ? 'ADMIN' : role === 'ROLE_DRIVER' ? 'DRIVER' : 'CUSTOMER';
  const roleColor = role === 'ROLE_ADMIN' ? 'purple' : role === 'ROLE_DRIVER' ? 'blue' : 'green';

  const notificationContent = (
    <div style={{ width: '320px', maxHeight: '360px', overflowY: 'auto' }}>
      <div style={{ fontWeight: 700, padding: '8px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
        <span>System Alerts & Notifications</span>
        <Tag color="error">{alerts.length} Active</Tag>
      </div>
      <List
        size="small"
        dataSource={alerts}
        locale={{ emptyText: 'No critical alerts at this time' }}
        renderItem={(item) => (
          <List.Item
            style={{ cursor: 'pointer', padding: '10px 12px' }}
            onClick={() => {
              if (item.type === 'DELAY') navigate('/admin/delayed-shipments');
              if (item.type === 'MAINTENANCE') navigate('/admin/maintenance');
            }}
          >
            <List.Item.Meta
              avatar={
                item.type === 'DELAY' ? (
                  <Badge dot color="red">
                    <ClockCircleOutlined style={{ fontSize: '18px', color: '#ff4d4f' }} />
                  </Badge>
                ) : (
                  <Badge dot color="orange">
                    <ToolOutlined style={{ fontSize: '18px', color: '#faad14' }} />
                  </Badge>
                )
              }
              title={<span style={{ fontSize: '12px', fontWeight: 600 }}>{item.title}</span>}
              description={<span style={{ fontSize: '11px', color: '#8c8c8c' }}>{item.desc}</span>}
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Header
      style={{
        background: '#ffffff',
        padding: isMobile ? '0 12px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        height: '64px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px', lineHeight: 'normal' }}>
        <Button
          type="text"
          icon={
            isMobile ? (
              <MenuUnfoldOutlined style={{ fontSize: '18px' }} />
            ) : collapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: '18px' }} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: '18px' }} />
            )
          }
          onClick={() => {
            if (isMobile) {
              setMobileDrawerOpen(!mobileDrawerOpen);
            } else {
              setCollapsed(!collapsed);
            }
          }}
          style={{
            fontSize: '16px',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 'normal' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '16px',
              flexShrink: 0,
            }}
          >
            <RocketOutlined />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 800, color: '#1f1f1f', lineHeight: '1.2' }}>
              TransBayX
            </span>
            {!isMobile && (
              <span style={{ fontSize: '11px', color: '#8c8c8c', fontWeight: 500, lineHeight: '1.2' }}>
                Fleet & Delivery Orchestration
              </span>
            )}
          </div>
        </div>
      </div>

      <Space size={isMobile ? 'small' : 'middle'} align="center" style={{ lineHeight: 'normal' }}>
        {role === 'ROLE_ADMIN' && (
          <Popover content={notificationContent} trigger="click" placement="bottomRight">
            <Badge count={alerts.length} offset={[-2, 2]}>
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined style={{ fontSize: '18px', color: '#595959' }} />}
              />
            </Badge>
          </Popover>
        )}

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '6px' : '10px',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: '8px',
              transition: 'background 0.2s',
              lineHeight: 'normal',
            }}
          >
            <Avatar
              style={{ backgroundColor: '#1677ff', verticalAlign: 'middle', flexShrink: 0 }}
              icon={<UserOutlined />}
              size={isMobile ? 'small' : 'default'}
            >
              {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </Avatar>
            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#262626', lineHeight: '1.2' }}>
                  {user?.fullName || 'User'}
                </span>
                <Tag color={roleColor} style={{ margin: 0, fontSize: '10px', lineHeight: '14px', padding: '0 4px', borderRadius: '4px', marginTop: '2px' }}>
                  {roleLabel}
                </Tag>
              </div>
            )}
          </div>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default Navbar;
