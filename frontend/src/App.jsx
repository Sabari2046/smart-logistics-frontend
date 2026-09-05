import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ConfigProvider, App as AntdApp } from 'antd';
import { AntdStaticBridge } from './utils/antdApp';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TrackShipment from './pages/shipments/TrackShipment';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import VehicleList from './pages/vehicles/VehicleList';
import DriverList from './pages/drivers/DriverList';
import ShipmentList from './pages/shipments/ShipmentList';
import CreateShipment from './pages/shipments/CreateShipment';
import ShipmentDetails from './pages/shipments/ShipmentDetails';
import AssignShipment from './pages/shipments/AssignShipment';
import WarehouseList from './pages/warehouses/WarehouseList';
import RouteList from './pages/routes/RouteList';
import MaintenanceList from './pages/maintenance/MaintenanceList';
import CustomerList from './pages/customers/CustomerList';
import Reports from './pages/reports/Reports';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import AssignedDeliveries from './pages/driver/AssignedDeliveries';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyShipments from './pages/customer/MyShipments';

// Shared Pages
import Profile from './pages/profile/Profile';

import './App.css';

const SmartShipmentRouter = () => {
  const { role } = useSelector((state) => state.auth);
  if (role === 'ROLE_ADMIN') return <ShipmentList />;
  if (role === 'ROLE_DRIVER') return <AssignedDeliveries />;
  return <MyShipments />;
};

const SmartDashboardRouter = () => {
  const { role } = useSelector((state) => state.auth);
  if (role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'ROLE_DRIVER') return <Navigate to="/driver/dashboard" replace />;
  if (role === 'ROLE_CUSTOMER') return <Navigate to="/customer/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorBgLayout: '#f8fafc',
        },
      }}
    >
      <AntdApp>
        <AntdStaticBridge />
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<LandingPage />} />
          
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Public Waybill Tracking (also available inside main layout if logged in) */}
          <Route path="/track" element={<MainLayout><TrackShipment /></MainLayout>} />
          <Route path="/track/:trackingNumber" element={<MainLayout><TrackShipment /></MainLayout>} />

          {/* Dynamic / Generic Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_DRIVER', 'ROLE_CUSTOMER']} />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<SmartDashboardRouter />} />
              <Route path="/shipments" element={<SmartShipmentRouter />} />
              <Route path="/shipments/create" element={<CreateShipment />} />
              <Route path="/shipments/new" element={<CreateShipment />} />
              <Route path="/shipments/:id" element={<ShipmentDetails />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin" element={<MainLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
            
            <Route element={<MainLayout />}>
              <Route path="/vehicles" element={<VehicleList />} />
              <Route path="/drivers" element={<DriverList />} />
              <Route path="/shipments/:id/assign" element={<AssignShipment />} />
              <Route path="/warehouses" element={<WarehouseList />} />
              <Route path="/routes" element={<RouteList />} />
              <Route path="/maintenance" element={<MaintenanceList />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Protected Driver Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_DRIVER']} />}>
            <Route path="/driver" element={<MainLayout />}>
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="deliveries" element={<AssignedDeliveries />} />
            </Route>
          </Route>

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_CUSTOMER']} />}>
            <Route path="/customer" element={<MainLayout />}>
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="shipments" element={<MyShipments />} />
              <Route path="create-shipment" element={<CreateShipment />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
