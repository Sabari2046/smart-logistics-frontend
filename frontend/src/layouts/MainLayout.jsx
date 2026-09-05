import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const { Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 992 : false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar
        collapsed={collapsed}
        isMobile={isMobile}
        drawerOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />
      <Layout style={{ minWidth: 0, overflowX: 'hidden' }}>
        <Navbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          mobileDrawerOpen={mobileDrawerOpen}
          setMobileDrawerOpen={setMobileDrawerOpen}
        />
        <Content
          style={{
            margin: isMobile ? '12px 12px 0' : '24px 24px 0',
            padding: 0,
            minHeight: 280,
            minWidth: 0,
          }}
        >
          <div className="main-content-container">
            {children || <Outlet />}
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            color: '#8c8c8c',
            fontSize: isMobile ? '11px' : '13px',
            padding: isMobile ? '16px 12px' : '24px 50px',
            background: 'transparent',
          }}
        >
          SmartLogistics © {new Date().getFullYear()} — Intelligent Fleet & Logistics Management.
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
