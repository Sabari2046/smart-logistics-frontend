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

  const handleQuickSwitch = async (email, password, targetDashboard) => {
    try {
      setSwitchingRole(true);
      const response = await authService.login({ email, password });
      dispatch(loginSuccess(response));
      message.success(`Switched account to ${response.fullName} (${response.role.replace('ROLE_', '')})`);
      navigate(targetDashboard);
    } catch (err) {
      message.error('Role switch failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSwitchingRole(false);
    }
  };

  const roleMenuItems = [
    {
      key: 'switch-admin',
      icon: <SafetyCertificateFilled style={{ color: '#722ed1' }} />,
      label: 'Admin (System Administrator)',
      disabled: role === 'ROLE_ADMIN',
      onClick: () => handleQuickSwitch('admin@smartlogistics.com', 'Admin@123', '/admin/dashboard'),
    },
    {
      key: 'switch-driver',
      icon: <CarFilled style={{ color: '#1677ff' }} />,
      label: 'Driver (Arun Kumar)',
      disabled: role === 'ROLE_DRIVER',
      onClick: () => handleQuickSwitch('driver.arun@smartlogistics.com', 'Driver@123', '/driver/dashboard'),
    },
    {
      key: 'switch-customer',
      icon: <ShoppingFilled style={{ color: '#52c41a' }} />,
      label: 'Customer (Rahul Menon)',
      disabled: role === 'ROLE_CUSTOMER',
      onClick: () => handleQuickSwitch('customer.rahul@gmail.com', 'Customer@123', '/customer/dashboard'),
    },
  ];

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
      key: 'roles',
      label: 'Switch Role',
      icon: <SwapOutlined />,
      children: roleMenuItems,
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
    <div style={{ width: isMobile ? '280px' : '320px', maxHeight: '380px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
        <Text strong>System Alerts & Notifications</Text>
        <Badge count={alerts.length} style={{ backgroundColor: '#ff4d4f' }} />
      </div>

      {alerts.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: '#8c8c8c' }}>
          No urgent alerts. All fleet systems optimal.
        </div>
      ) : (
        <List
          dataSource={alerts}
          renderItem={(item) => (
            <List.Item
              style={{ padding: '10px 0', cursor: 'pointer' }}
              onClick={() => navigate(item.path)}
            >
              <List.Item.Meta
                avatar={
                  item.type === 'delay' ? (
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '18px', marginTop: '2px' }} />
                  ) : (
                    <ToolOutlined style={{ color: '#fa8c16', fontSize: '18px', marginTop: '2px' }} />
                  )
                }
                title={<span style={{ fontSize: '13px', fontWeight: 600 }}>{item.title}</span>}
                description={<span style={{ fontSize: '12px' }}>{item.description}</span>}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <Header
      style={{
        padding: isMobile ? '0 12px' : '0 20px',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        boxShadow: '0 1px 4px rgba(0, 21, 41, 0.06)',
        borderBottom: '1px solid #f0f0f0',
        height: '64px',
        lineHeight: 'normal',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '14px', lineHeight: 'normal' }}>
        <Button
          type="text"
          icon={isMobile ? <MenuOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          style={{ fontSize: '18px', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
              SmartLogistics
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
        {/* Quick Role Switcher Dropdown */}
        <Dropdown menu={{ items: roleMenuItems }} placement="bottomRight" arrow>
          <Button
            size="small"
            icon={<SwapOutlined />}
            loading={switchingRole}
            style={{
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              borderColor: '#d9d9d9',
              padding: isMobile ? '0 8px' : '0 10px',
            }}
          >
            {isMobile ? 'Role' : 'Switch Role'}
          </Button>
        </Dropdown>

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
