import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  DatePicker,
  Button,
  Table,
  Typography,
  Space,
  Tag,
  Progress,
  Rate,
  App,
} from 'antd';
import {
  ReloadOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RocketOutlined,
  CarOutlined,
  UserOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import dayjs from 'dayjs';
import { reportService } from '../../services/reportService';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96'];

const Reports = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dates, setDates] = useState([dayjs().subtract(30, 'day'), dayjs()]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const fromDate = dates && dates[0] ? dates[0].format('YYYY-MM-DD') : null;
      const toDate = dates && dates[1] ? dates[1].format('YYYY-MM-DD') : null;
      const data = await reportService.getReport(fromDate, toDate);
      setReportData(data);
    } catch (error) {
      message.error(error.message || 'Failed to generate logistics analytics report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleDateChange = (values) => {
    setDates(values);
  };

  // Format charts data
  const monthlyData = reportData?.deliveriesByMonth
    ? Object.keys(reportData.deliveriesByMonth).map((key) => ({
        month: key,
        deliveries: reportData.deliveriesByMonth[key],
      }))
    : [];

  const statusData = reportData?.statusDistribution
    ? Object.keys(reportData.statusDistribution).map((key) => ({
        name: key.replace('_', ' '),
        value: reportData.statusDistribution[key],
      }))
    : [];

  const priorityData = reportData?.priorityDistribution
    ? Object.keys(reportData.priorityDistribution).map((key) => ({
        name: key,
        value: reportData.priorityDistribution[key],
      }))
    : [];

  const driverColumns = [
    {
      title: 'Rank',
      key: 'rank',
      width: 70,
      render: (_, __, index) => (
        <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'default'}>
          #{index + 1}
        </Tag>
      ),
    },
    {
      title: 'Driver Name',
      key: 'name',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong>
            <UserOutlined style={{ marginRight: 6, color: '#1677ff' }} />
            {record.user?.fullName || record.fullName || 'Driver'}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            License: {record.licenseNumber}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Completed Trips',
      dataIndex: 'totalTrips',
      key: 'totalTrips',
      render: (trips) => <Text strong>{trips || 0}</Text>,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space size={6}>
          <Rate disabled allowHalf defaultValue={rating || 5.0} style={{ fontSize: 13 }} />
          <Text strong style={{ fontSize: 13 }}>{Number(rating || 5.0).toFixed(1)}</Text>
        </Space>
      ),
    },
    {
      title: 'Availability',
      dataIndex: 'availability',
      key: 'availability',
      render: (val) => (
        <Tag color={val === 'AVAILABLE' ? 'green' : val === 'ON_TRIP' ? 'orange' : 'default'}>
          {val}
        </Tag>
      ),
    },
  ];

  if (loading && !reportData) {
    return <LoadingSpinner tip="Generating Logistics Executive Report..." />;
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Executive Logistics & Operational Analytics"
        subtitle="Comprehensive delivery KPI performance, operational throughput, revenue metrics, and fleet efficiency"
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Analytics & Reports' },
        ]}
        extra={
          <Space>
            <RangePicker value={dates} onChange={handleDateChange} />
            <Button type="primary" icon={<ReloadOutlined />} onClick={fetchReport} loading={loading}>
              Run Report
            </Button>
          </Space>
        }
      />

      {/* Top Level Metric KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Deliveries Processed"
            value={reportData?.totalDeliveries || 0}
            icon={<RocketOutlined />}
            color="#1677ff"
            bgColor="#e6f4ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Delivery Success Rate"
            value={`${Number(reportData?.successRatePercent || 100).toFixed(1)}%`}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
            bgColor="#f6ffed"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Freight Revenue"
            value={`₹${Number(reportData?.totalRevenue || 0).toLocaleString()}`}
            icon={<DollarOutlined />}
            color="#722ed1"
            bgColor="#f9f0ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Avg Delivery Lead Time"
            value={`${Number(reportData?.averageDeliveryTimeHours || 0).toFixed(1)} hrs`}
            icon={<ClockCircleOutlined />}
            color="#fa8c16"
            bgColor="#fff7e6"
          />
        </Col>
      </Row>

      {/* Secondary Operational Financials */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card styles={{ body: { padding: 16 } }}>
            <Text type="secondary">Successful Shipments</Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#52c41a', marginTop: 4 }}>
              {reportData?.successfulDeliveries || 0}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card styles={{ body: { padding: 16 } }}>
            <Text type="secondary">Delayed Deliveries</Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#f5222d', marginTop: 4 }}>
              {reportData?.delayedDeliveries || 0}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card styles={{ body: { padding: 16 } }}>
            <Text type="secondary">Maintenance Expenditures</Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1677ff', marginTop: 4 }}>
              ₹{Number(reportData?.totalMaintenanceCost || 0).toLocaleString()}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Visual Charts */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card
            title="Monthly Delivery Throughput"
            bordered={false}
            style={{ height: '100%' }}
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="deliveries" fill="#1677ff" name="Shipments Processed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title="Consignment Status Breakdown"
            bordered={false}
            style={{ height: '100%' }}
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Driver Performance Leaderboard */}
      <Card
        title={
          <Space>
            <UserOutlined style={{ color: '#1677ff' }} />
            <span>Top Performing Driver Personnel</span>
          </Space>
        }
        bordered={false}
        style={{ marginBottom: 24 }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={driverColumns}
          dataSource={reportData?.topDrivers || []}
          rowKey="id"
          pagination={false}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
};

export default Reports;
