import React from 'react';
import { Layout, Menu, Drawer } from 'antd';
import {
  DashboardOutlined,
  InboxOutlined,
  CarOutlined,
  TeamOutlined,
  HomeOutlined,
  CompassOutlined,
  ToolOutlined,
  BarChartOutlined,
  UserOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  UsergroupAddOutlined,
  SendOutlined,
  SafetyCertificateOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const { Sider } = Layout;

const Sidebar = ({ collapsed, isMobile, drawerOpen, onClose }) => {
  const { role } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (path) => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const getAdminMenuItems = () => [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard" onClick={() => handleItemClick('/admin/dashboard')}>Dashboard</Link>,
    },
    {
      key: '/shipments',
      icon: <InboxOutlined />,
      label: <Link to="/shipments" onClick={() => handleItemClick('/shipments')}>Shipments</Link>,
    },
    {
      key: '/vehicles',
      icon: <CarOutlined />,
      label: <Link to="/vehicles" onClick={() => handleItemClick('/vehicles')}>Vehicles</Link>,
    },
    {
      key: '/drivers',
      icon: <TeamOutlined />,
      label: <Link to="/drivers" onClick={() => handleItemClick('/drivers')}>Drivers</Link>,
    },
    {
      key: '/warehouses',
      icon: <HomeOutlined />,
      label: <Link to="/warehouses" onClick={() => handleItemClick('/warehouses')}>Warehouses</Link>,
    },
    {
      key: '/routes',
      icon: <CompassOutlined />,
      label: <Link to="/routes" onClick={() => handleItemClick('/routes')}>Routes</Link>,
    },
    {
      key: '/maintenance',
      icon: <ToolOutlined />,
      label: <Link to="/maintenance" onClick={() => handleItemClick('/maintenance')}>Maintenance</Link>,
    },
    {
      key: '/customers',
      icon: <UsergroupAddOutlined />,
      label: <Link to="/customers" onClick={() => handleItemClick('/customers')}>Customers</Link>,
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: <Link to="/reports" onClick={() => handleItemClick('/reports')}>Reports</Link>,
    },
    {
      key: '/admin/users',
      icon: <SafetyCertificateOutlined />,
      label: <Link to="/admin/users" onClick={() => handleItemClick('/admin/users')}>User Control</Link>,
    },
    {
      key: '/track',
      icon: <SearchOutlined />,
      label: <Link to="/track" onClick={() => handleItemClick('/track')}>Track Shipment</Link>,
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile" onClick={() => handleItemClick('/profile')}>Profile</Link>,
    },
  ];

  const getDriverMenuItems = () => [
    {
      key: '/driver/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/driver/dashboard" onClick={() => handleItemClick('/driver/dashboard')}>Driver Dashboard</Link>,
    },
    {
      key: '/driver/deliveries',
      icon: <SendOutlined />,
      label: <Link to="/driver/deliveries" onClick={() => handleItemClick('/driver/deliveries')}>My Deliveries</Link>,
    },
    {
      key: '/track',
      icon: <SearchOutlined />,
      label: <Link to="/track" onClick={() => handleItemClick('/track')}>Track Shipment</Link>,
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile" onClick={() => handleItemClick('/profile')}>Profile</Link>,
    },
  ];

  const getCustomerMenuItems = () => [
    {
      key: '/customer/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/customer/dashboard" onClick={() => handleItemClick('/customer/dashboard')}>Dashboard</Link>,
    },
    {
      key: '/customer/create-shipment',
      icon: <PlusCircleOutlined />,
      label: <Link to="/customer/create-shipment" onClick={() => handleItemClick('/customer/create-shipment')}>Book Shipment</Link>,
    },
    {
      key: '/customer/shipments',
      icon: <InboxOutlined />,
      label: <Link to="/customer/shipments" onClick={() => handleItemClick('/customer/shipments')}>My Shipments</Link>,
    },
    {
      key: '/track',
      icon: <SearchOutlined />,
      label: <Link to="/track" onClick={() => handleItemClick('/track')}>Track Parcel</Link>,
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile" onClick={() => handleItemClick('/profile')}>Profile</Link>,
    },
  ];

  const menuItems =
    role === 'ROLE_ADMIN'
      ? getAdminMenuItems()
      : role === 'ROLE_DRIVER'
      ? getDriverMenuItems()
      : getCustomerMenuItems();

  const currentPath = location.pathname;
  const selectedKey = menuItems.find((item) =>
    item.key !== '/' ? currentPath.startsWith(item.key) : currentPath === '/'
  )?.key || currentPath;

  const sidebarLogo = (
    <div
      style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: !isMobile && collapsed ? 'center' : 'space-between',
        padding: !isMobile && collapsed ? '0' : '0 20px',
        borderBottom: '1px solid #f0f0f0',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '16px',
            flexShrink: 0,
          }}
        >
          TBX
        </div>
        {(isMobile || !collapsed) && (
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#141414', letterSpacing: '-0.2px' }}>
            TransBayX
          </span>
        )}
      </div>

      {isMobile && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: '#8c8c8c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}
        >
          <CloseOutlined />
        </button>
      )}
    </div>
  );

  const menuContent = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={menuItems}
      style={{
        borderRight: 0,
        padding: '12px 8px',
        fontWeight: 500,
      }}
    />
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        closable={false}
        onClose={onClose}
        open={drawerOpen}
        styles={{ body: { padding: 0 } }}
        width={270}
        zIndex={1001}
      >
        {sidebarLogo}
        {menuContent}
      </Drawer>
    );
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={240}
      theme="light"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        borderRight: '1px solid #f0f0f0',
        boxShadow: '1px 0 6px rgba(0, 0, 0, 0.02)',
      }}
    >
      {sidebarLogo}
      {menuContent}
    </Sider>
  );
};

export default Sidebar;
