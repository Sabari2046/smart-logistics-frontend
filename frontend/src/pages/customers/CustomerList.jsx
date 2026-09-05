import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Tag,
  Popconfirm,
  Row,
  Col,
  Typography,
  Tooltip,
  App,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { customerService } from '../../services/customerService';
import PageHeader from '../../components/PageHeader';

const { Text } = Typography;

const CustomerList = () => {
  const { message } = App.useApp();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll({ search });
      setCustomers(data);
    } catch (error) {
      message.error(error.message || 'Failed to fetch customer registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleDelete = async (id) => {
    try {
      await customerService.delete(id);
      message.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      message.error(error.message || 'Failed to delete customer');
    }
  };

  const columns = [
    {
      title: 'Customer Name',
      key: 'name',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong style={{ fontSize: 14 }}>
            <UserOutlined style={{ marginRight: 6, color: '#1677ff' }} />
            {record.user?.fullName || record.fullName || 'Customer'}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <MailOutlined style={{ marginRight: 4 }} />
            {record.user?.email || record.email || 'N/A'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Company & Phone',
      key: 'company',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Tag color="blue">{record.companyName || 'Individual'}</Tag>
          <Text style={{ fontSize: 12 }}>
            <PhoneOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            {record.user?.phone || record.phone || 'N/A'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Billing & Delivery Address',
      dataIndex: 'address',
      key: 'address',
      render: (addr) => (
        <Space size={4}>
          <HomeOutlined style={{ color: '#8c8c8c' }} />
          <Text style={{ fontSize: 13 }}>{addr || 'Registered HQ'}</Text>
        </Space>
      ),
    },
    {
      title: 'Registered On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (date ? new Date(date).toLocaleDateString() : 'Active'),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Popconfirm
          title="Delete Customer"
          description="Are you sure you want to remove this customer account?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Tooltip title="Delete">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Customer Directory"
        subtitle="Manage verified business clients, individual shippers, billing profiles, and contact details"
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Customers' },
        ]}
      />

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by name, company, email, or phone..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default CustomerList;
