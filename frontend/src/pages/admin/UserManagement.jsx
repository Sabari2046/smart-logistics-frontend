import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Switch,
  Typography,
  Space,
  Input,
  Select,
  Avatar,
  Row,
  Col,
  App,
} from 'antd';
import { UserOutlined, SearchOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Text } = Typography;

const UserManagement = () => {
  const { message } = App.useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      // Handled by global axios
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/api/admin/users/${userId}/status?status=${newStatus}`);
      message.success(`User status updated to ${newStatus}`);
      fetchUsers();
    } catch (error) {
      message.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: record.role === 'ROLE_ADMIN' ? '#722ed1' : record.role === 'ROLE_DRIVER' ? '#1677ff' : '#52c41a' }}>
            {record.fullName ? record.fullName[0].toUpperCase() : 'U'}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{record.fullName}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '—',
    },
    {
      title: 'System Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const color = role === 'ROLE_ADMIN' ? 'purple' : role === 'ROLE_DRIVER' ? 'blue' : 'green';
        const label = role.replace('ROLE_', '');
        return <Tag color={color} style={{ fontWeight: 600 }}>{label}</Tag>;
      },
    },
    {
      title: 'Registered On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (date ? new Date(date).toLocaleDateString() : '—'),
    },
    {
      title: 'Account Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space>
          <Switch
            checked={status === 'ACTIVE'}
            onChange={() => handleStatusToggle(record.id, status)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            disabled={record.email === 'admintransbayx@gmail.com' || record.role === 'ROLE_ADMIN'}
          />
          <Tag color={status === 'ACTIVE' ? 'success' : 'default'}>
            {status}
          </Tag>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="User & Access Control"
        subtitle="Manage authentication credentials, user roles, and account active statuses across system tenants."
      />

      <Card style={{ borderRadius: '14px', marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Search user by full name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              size="middle"
            />
          </Col>
          <Col xs={24} md={10}>
            <Select
              placeholder="Filter by Role"
              value={roleFilter}
              onChange={setRoleFilter}
              allowClear
              style={{ width: '100%' }}
              options={[
                { label: 'All System Roles', value: null },
                { label: 'Admins (ROLE_ADMIN)', value: 'ROLE_ADMIN' },
                { label: 'Drivers (ROLE_DRIVER)', value: 'ROLE_DRIVER' },
                { label: 'Customers (ROLE_CUSTOMER)', value: 'ROLE_CUSTOMER' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: '14px' }} styles={{ body: { padding: '0 0 12px 0' } }}>
        {loading ? (
          <LoadingSpinner tip="Loading system users..." />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>
    </div>
  );
};

export default UserManagement;
