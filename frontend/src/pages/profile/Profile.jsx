import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Tag,
  Form,
  Input,
  Button,
  Tabs,
  Space,
  Divider,
  App,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  HomeOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { authService } from '../../services/authService';
import { updateUserProfile } from '../../store/authSlice';
import PageHeader from '../../components/PageHeader';

const { Title, Text } = Typography;

const Profile = () => {
  const { message } = App.useApp();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfileData(data);
      profileForm.setFieldsValue({
        fullName: data.fullName || user?.fullName,
        email: data.email || user?.email,
        phone: data.phone || user?.phone,
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        postalCode: data.postalCode || '',
        companyName: data.companyName || '',
      });
    } catch (error) {
      // Fallback to user from redux
      profileForm.setFieldsValue({
        fullName: user?.fullName,
        email: user?.email,
        phone: user?.phone,
      });
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      await authService.updateProfile(values);
      dispatch(updateUserProfile({ fullName: values.fullName, phone: values.phone }));
      message.success('Profile details updated successfully');
      fetchProfile();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to update profile';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (values) => {
    try {
      setPasswordLoading(true);
      if (values.newPassword !== values.confirmPassword) {
        message.error('New passwords do not match');
        return;
      }
      if (!values.currentPassword) {
        message.warning('Please enter your current password');
        return;
      }
      if (values.newPassword.length < 6) {
        message.warning('New password must be at least 6 characters');
        return;
      }

      await authService.updateProfile({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      message.success('Password updated successfully! Please use your new password next time you log in.');
      passwordForm.resetFields();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to update password. Please check your current password.';
      message.error(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleColor = user?.role === 'ROLE_ADMIN' ? 'red' : user?.role === 'ROLE_DRIVER' ? 'orange' : 'green';
  const roleDisplay = user?.role ? user.role.replace('ROLE_', '') : 'USER';

  return (
    <div className="page-container">
      <PageHeader
        title="Account & Security Settings"
        subtitle="Manage your personal information, contact credentials, and security preferences"
      />

      <Row gutter={[24, 24]}>
        {/* User Card */}
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', height: '100%' }}>
            <Avatar
              size={100}
              icon={<UserOutlined />}
              style={{
                backgroundColor: '#1677ff',
                marginBottom: 16,
                fontSize: 48,
              }}
            />
            <Title level={4} style={{ marginBottom: 4 }}>
              {user?.fullName || 'User'}
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              @{user?.username || 'username'}
            </Text>

            <Tag color={roleColor} style={{ fontSize: 13, padding: '4px 12px', borderRadius: 12 }}>
              {roleDisplay}
            </Tag>

            <Divider />

            <div style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>EMAIL ADDRESS</Text>
                <div>
                  <MailOutlined style={{ marginRight: 8, color: '#1677ff' }} />
                  <Text strong>{user?.email || 'N/A'}</Text>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>PHONE NUMBER</Text>
                <div>
                  <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  <Text strong>{user?.phone || 'Not provided'}</Text>
                </div>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>ACCOUNT STATUS</Text>
                <div>
                  <SafetyCertificateOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  <Tag color="success">ACTIVE VERIFIED</Tag>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Edit Forms Tab */}
        <Col xs={24} md={16}>
          <Card>
            <Tabs
              defaultActiveKey="general"
              items={[
                {
                  key: 'general',
                  label: 'General Information',
                  children: (
                    <Form
                      form={profileForm}
                      layout="vertical"
                      initialValues={{
                        fullName: user?.fullName,
                        email: user?.email,
                        phone: user?.phone,
                      }}
                      onFinish={handleUpdateProfile}
                    >
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="fullName"
                            label="Full Name"
                            rules={[{ required: true, message: 'Please enter your full name' }]}
                          >
                            <Input prefix={<UserOutlined />} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="email"
                            label="Email Address"
                            rules={[{ required: true, type: 'email' }]}
                          >
                            <Input prefix={<MailOutlined />} disabled />
                          </Form.Item>
                        </Col>
                      </Row>

                      {user?.role === 'ROLE_CUSTOMER' && (
                        <>
                          <Divider orientation="left" style={{ fontSize: '13px', color: '#8c8c8c' }}>
                            Business & Facility Address
                          </Divider>
                          <Row gutter={16}>
                            <Col span={24}>
                              <Form.Item name="companyName" label="Company / Entity Name">
                                <Input prefix={<BankOutlined />} placeholder="e.g. Acme Logistics India Pvt Ltd" />
                              </Form.Item>
                            </Col>
                            <Col span={24}>
                              <Form.Item name="address" label="Primary Business / Warehouse Address">
                                <Input prefix={<HomeOutlined />} placeholder="Street, Building No, Area" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                              <Form.Item name="city" label="City">
                                <Input placeholder="e.g. Chennai" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                              <Form.Item name="state" label="State">
                                <Input placeholder="e.g. Tamil Nadu" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                              <Form.Item name="postalCode" label="Postal Code">
                                <Input placeholder="e.g. 600032" />
                              </Form.Item>
                            </Col>
                          </Row>
                        </>
                      )}

                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        htmlType="submit"
                        loading={loading}
                      >
                        Save Profile Changes
                      </Button>
                    </Form>
                  ),
                },
                {
                  key: 'security',
                  label: 'Security & Password',
                  children: (
                    <Form
                      form={passwordForm}
                      layout="vertical"
                      onFinish={handleUpdatePassword}
                    >
                      <Form.Item
                        name="currentPassword"
                        label="Current Password"
                        rules={[{ required: true, message: 'Please enter your current active password' }]}
                      >
                        <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="newPassword"
                            label="New Password"
                            rules={[
                              { required: true, message: 'Please enter new password' },
                              { min: 6, message: 'Min 6 characters required' },
                            ]}
                          >
                            <Input.Password prefix={<LockOutlined />} placeholder="Enter new password (min 6 chars)" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="confirmPassword"
                            label="Confirm New Password"
                            dependencies={['newPassword']}
                            rules={[
                              { required: true, message: 'Please confirm password' },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(new Error('The two passwords do not match!'));
                                },
                              }),
                            ]}
                          >
                            <Input.Password prefix={<LockOutlined />} placeholder="Re-type new password" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Button
                        type="primary"
                        icon={<LockOutlined />}
                        htmlType="submit"
                        loading={passwordLoading}
                      >
                        Update Password
                      </Button>
                    </Form>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
