import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Row,
  Col,
  App,
} from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, BankOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/authSlice';
import { authService } from '../../services/authService';

const { Title, Paragraph, Text } = Typography;

const Register = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await authService.register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: values.phone?.trim(),
        companyName: values.companyName?.trim(),
        address: values.address?.trim(),
        city: values.city?.trim(),
        state: values.state?.trim(),
        postalCode: values.postalCode?.trim(),
      });

      dispatch(loginSuccess(response));
      message.success('Account created successfully! Welcome to TransBayX.');
      navigate('/customer/dashboard', { replace: true });
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please check your information.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Title level={3} style={{ fontWeight: 800, marginBottom: '4px', color: '#1f1f1f' }}>
          Create Customer Account
        </Title>
        <Paragraph type="secondary" style={{ fontSize: '13px', margin: 0 }}>
          Sign up to book parcels, track shipments, and manage logistics orders.
        </Paragraph>
      </div>

      {errorMessage && (
        <Alert
          message={errorMessage}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '16px', borderRadius: '8px' }}
        />
      )}

      <Form
        form={form}
        name="register_form"
        layout="vertical"
        onFinish={onFinish}
        size="large"
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="fullName"
              label={<span style={{ fontWeight: 600, fontSize: '12px' }}>Full Name</span>}
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="e.g. Rahul Sharma" style={{ borderRadius: '6px' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600, fontSize: '12px' }}>Email Address</span>}
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Enter a valid email' },
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="name@domain.com" style={{ borderRadius: '6px' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="phone"
              label={<span style={{ fontWeight: 600, fontSize: '12px' }}>Phone Number (10 digits)</span>}
              rules={[
                { required: true, message: 'Please enter your phone number' },
                { pattern: /^[0-9]{10}$/, message: 'Must be a 10-digit number' },
              ]}
            >
              <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} placeholder="9876543210" style={{ borderRadius: '6px' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="companyName"
              label={<span style={{ fontWeight: 600, fontSize: '12px' }}>Company / Organization (Optional)</span>}
            >
              <Input prefix={<BankOutlined style={{ color: '#bfbfbf' }} />} placeholder="e.g. Apex Traders" style={{ borderRadius: '6px' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="city"
              label={<span style={{ fontWeight: 600, fontSize: '12px' }}>City</span>}
              rules={[{ required: true, message: 'City is required' }]}
            >
              <Input prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />} placeholder="e.g. Chennai" style={{ borderRadius: '6px' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="postalCode"
              label={<span style={{ fontWeight: 600, fontSize: '12px' }}>Postal Code</span>}
              rules={[{ required: true, message: 'Postal code is required' }]}
            >
              <Input placeholder="600001" style={{ borderRadius: '6px' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 600, fontSize: '12px' }}>Password</span>}
              rules={[
                { required: true, message: 'Password is required' },
                { min: 6, message: 'Must be at least 6 characters' },
              ]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="••••••••" style={{ borderRadius: '6px' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="confirmPassword"
              label={<span style={{ fontWeight: 600, fontSize: '12px' }}>Confirm Password</span>}
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="••••••••" style={{ borderRadius: '6px' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: '8px', marginBottom: '16px' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: '44px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '15px',
            }}
          >
            Create Customer Account
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '13px' }}>Already have an account? </Text>
        <Link to="/login" style={{ fontWeight: 600, color: '#1677ff', fontSize: '13px' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
