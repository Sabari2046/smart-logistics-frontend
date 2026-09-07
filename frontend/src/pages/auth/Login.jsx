import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Divider, Alert, Space } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from '../../store/authSlice';
import { authService } from '../../services/authService';

const { Title, Paragraph, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoggedIn, user, role } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const from = location.state?.from?.pathname || null;

  const handleRedirectByRole = (userRole) => {
    const validFrom = from && from !== '/login' && from !== '/register' && from !== '/' ? from : null;
    if (validFrom) {
      navigate(validFrom, { replace: true });
    } else if (userRole === 'ROLE_ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (userRole === 'ROLE_DRIVER') {
      navigate('/driver/dashboard', { replace: true });
    } else {
      navigate('/customer/dashboard', { replace: true });
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await authService.login({
        email: values.email.trim(),
        password: values.password,
      });

      dispatch(loginSuccess(response));
      handleRedirectByRole(response.role);
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email, password) => {
    form.setFieldsValue({ email, password });
    onFinish({ email, password });
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ fontWeight: 800, marginBottom: '6px', color: '#1f1f1f' }}>
          Welcome Back
        </Title>
        <Paragraph type="secondary" style={{ fontSize: '14px', margin: 0 }}>
          Sign in to access your TransBayX logistics console.
        </Paragraph>
      </div>

      {isLoggedIn && user && (
        <Alert
          type="info"
          showIcon
          icon={<DashboardOutlined />}
          style={{ marginBottom: '20px', borderRadius: '8px' }}
          message={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>
                Signed in as <strong>{user.fullName || user.email}</strong> ({role?.replace('ROLE_', '')})
              </span>
              <Space size="small">
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleRedirectByRole(role)}
                  icon={<ArrowRightOutlined />}
                >
                  Go to Dashboard
                </Button>
                <Button size="small" onClick={() => dispatch(logout())}>
                  Sign Out
                </Button>
              </Space>
            </div>
          }
        />
      )}

      {errorMessage && (
        <Alert
          message={errorMessage}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '20px', borderRadius: '8px' }}
        />
      )}

      <Form
        form={form}
        name="login_form"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
      >
        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 600, fontSize: '13px' }}>Email Address</span>}
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="admintransbayx@gmail.com"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ fontWeight: 600, fontSize: '13px' }}>Password</span>}
          rules={[
            { required: true, message: 'Please enter your password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="••••••••"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Checkbox>Remember my session</Checkbox>
            <Link to="/track" style={{ fontSize: '13px', color: '#1677ff' }}>
              Track shipment without login?
            </Link>
          </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: '16px' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<LoginOutlined />}
            block
            style={{
              height: '46px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '15px',
              boxShadow: '0 4px 12px rgba(22, 119, 255, 0.25)',
            }}
          >
            Sign In to Account
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Text type="secondary">Don't have an account? </Text>
        <Link to="/register" style={{ fontWeight: 600, color: '#1677ff' }}>
          Register as Customer
        </Link>
      </div>

      <Divider plain style={{ color: '#8c8c8c', fontSize: '12px', margin: '20px 0' }}>
        <SafetyCertificateOutlined style={{ marginRight: '6px' }} /> Quick Administrator Fill
      </Divider>

      <Button
        size="middle"
        onClick={() => handleQuickLogin('admintransbayx@gmail.com', 'Admin@123')}
        style={{
          width: '100%',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          background: '#f9f0ff',
          borderColor: '#d3adf7',
          color: '#722ed1',
        }}
      >
        🛡️ Quick Fill Admin (admintransbayx@gmail.com)
      </Button>
    </div>
  );
};

export default Login;
