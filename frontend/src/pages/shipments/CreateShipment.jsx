import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  InputNumber,
  DatePicker,
  Typography,
  Divider,
  Result,
  Space,
  Tag,
  App,
} from 'antd';
import {
  InboxOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  ArrowLeftOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { shipmentService } from '../../services/shipmentService';
import { customerService } from '../../services/customerService';
import PageHeader from '../../components/PageHeader';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const CreateShipment = () => {
  const { message } = App.useApp();
  const { role } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [createdShipment, setCreatedShipment] = useState(null);
  const [customers, setCustomers] = useState([]);

  // Live Cost calculation
  const [estimatedCost, setEstimatedCost] = useState(175.0);

  useEffect(() => {
    if (role === 'ROLE_ADMIN') {
      customerService.getAll()
        .then((res) => {
          setCustomers(res || []);
          if (res && res.length > 0 && !form.getFieldValue('customerId')) {
            form.setFieldsValue({ customerId: res[0].id });
          }
        })
        .catch(() => {});
    }
  }, [role]);

  const calculateCost = (weight, priority) => {
    const w = weight || 1.0;
    const base = 150.0;
    const weightRate = w * 25.0;
    const multiplier = priority === 'URGENT' ? 2.0 : priority === 'EXPRESS' ? 1.5 : 1.0;
    return Math.round((base + weightRate) * multiplier * 100) / 100;
  };

  const handleValuesChange = (_, allValues) => {
    const cost = calculateCost(allValues.weightKg, allValues.priority);
    setEstimatedCost(cost);
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        expectedDeliveryDate: values.expectedDeliveryDate ? values.expectedDeliveryDate.format('YYYY-MM-DDTHH:mm:ss') : null,
        shippingCost: estimatedCost,
      };

      const result = await shipmentService.create(payload);
      setCreatedShipment(result);
      message.success(`Shipment #${result.trackingNumber} created successfully!`);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create shipment order.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (createdShipment) {
    return (
      <Card style={{ borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
        <Result
          status="success"
          title="Shipment Created Successfully!"
          subTitle={
            <div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                Tracking Number: <Tag color="blue" style={{ fontSize: '18px', padding: '4px 12px', fontWeight: 700 }}>{createdShipment.trackingNumber}</Tag>
              </div>
              <Paragraph type="secondary">
                Your consignment is in <strong>PENDING</strong> review. Our dispatch system will assign an optimal vehicle and certified driver shortly.
              </Paragraph>
            </div>
          }
          extra={[
            <Button
              type="primary"
              key="track"
              size="large"
              icon={<RocketOutlined />}
              onClick={() => navigate(`/track/${createdShipment.trackingNumber}`)}
            >
              Track This Shipment Live
            </Button>,
            <Button
              key="details"
              size="large"
              onClick={() => navigate(`/shipments/${createdShipment.id}`)}
            >
              View Shipment Details
            </Button>,
            <Button
              key="new"
              type="dashed"
              onClick={() => {
                setCreatedShipment(null);
                form.resetFields();
              }}
            >
              Book Another Parcel
            </Button>,
          ]}
        />
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Book New Consignment"
        subtitle="Create a commercial shipment order with automated route calculation and vehicle matching."
        breadcrumbs={[
          { title: 'Shipments', path: '/shipments' },
          { title: 'Book Shipment' },
        ]}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
        initialValues={{
          priority: 'NORMAL',
          packageType: 'Standard Parcel',
          weightKg: 5.0,
          expectedDeliveryDate: dayjs().add(3, 'day'),
        }}
        size="large"
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* Section 1: Pickup Information */}
            <Card
              title={
                <Space>
                  <EnvironmentOutlined style={{ color: '#1677ff' }} />
                  <span style={{ fontWeight: 700 }}>Section 1: Pickup Location & Origin</span>
                </Space>
              }
              style={{ borderRadius: '14px', marginBottom: '20px' }}
            >
              <Row gutter={16}>
                {role === 'ROLE_ADMIN' && (
                  <Col span={24}>
                    <Form.Item
                      name="customerId"
                      label="Consignor / Client Account"
                      tooltip="Select registered corporate or individual client account"
                    >
                      <Select
                        placeholder="Select Client Account (or auto-assign default)"
                        showSearch
                        optionFilterProp="children"
                        allowClear
                        onChange={(val) => {
                          const cust = customers.find((c) => c.id === val);
                          if (cust && cust.address) {
                            form.setFieldsValue({
                              pickupAddress: cust.address,
                              pickupCity: cust.city || '',
                              pickupState: cust.state || '',
                              pickupPostalCode: cust.postalCode || '',
                            });
                          }
                        }}
                      >
                        {customers.map((c) => (
                          <Option key={c.id} value={c.id}>
                            {c.user?.fullName || c.companyName} {c.companyName ? `(${c.companyName})` : ''} - {c.user?.email}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}
                <Col span={24}>
                  <Form.Item
                    name="pickupAddress"
                    label="Pickup Street Address / Facility"
                    rules={[{ required: true, message: 'Pickup address is required' }]}
                  >
                    <Input placeholder="e.g. 45 Industrial Estate, Guindy" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="pickupCity"
                    label="Origin City"
                    rules={[{ required: true, message: 'City is required' }]}
                  >
                    <Input placeholder="e.g. Chennai" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="pickupState"
                    label="Origin State"
                    rules={[{ required: true, message: 'State is required' }]}
                  >
                    <Input placeholder="e.g. Tamil Nadu" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="pickupPostalCode"
                    label="Postal Code"
                    rules={[{ required: true, message: 'Postal code is required' }]}
                  >
                    <Input placeholder="e.g. 600032" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Section 2: Delivery Details */}
            <Card
              title={
                <Space>
                  <EnvironmentOutlined style={{ color: '#52c41a' }} />
                  <span style={{ fontWeight: 700 }}>Section 2: Destination Delivery Address</span>
                </Space>
              }
              style={{ borderRadius: '14px', marginBottom: '20px' }}
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="deliveryAddress"
                    label="Delivery Street Address / Recipient Facility"
                    rules={[{ required: true, message: 'Delivery address is required' }]}
                  >
                    <Input placeholder="e.g. 12 Electronic City Phase 1" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="deliveryCity"
                    label="Destination City"
                    rules={[{ required: true, message: 'City is required' }]}
                  >
                    <Input placeholder="e.g. Bengaluru" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="deliveryState"
                    label="Destination State"
                    rules={[{ required: true, message: 'State is required' }]}
                  >
                    <Input placeholder="e.g. Karnataka" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="deliveryPostalCode"
                    label="Postal Code"
                    rules={[{ required: true, message: 'Postal code is required' }]}
                  >
                    <Input placeholder="e.g. 560100" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Section 3: Package Specifications */}
            <Card
              title={
                <Space>
                  <InboxOutlined style={{ color: '#722ed1' }} />
                  <span style={{ fontWeight: 700 }}>Section 3: Package & Cargo Specifications</span>
                </Space>
              }
              style={{ borderRadius: '14px' }}
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="packageDescription"
                    label="Cargo Description & Manifest Items"
                    rules={[{ required: true, message: 'Description is required' }]}
                  >
                    <Input.TextArea rows={2} placeholder="e.g. Precision electronics sensors & server hardware" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="weightKg"
                    label="Total Weight (Kg)"
                    rules={[{ required: true, message: 'Weight is required' }]}
                  >
                    <InputNumber min={0.1} max={50000} step={0.5} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="packageType" label="Cargo Type">
                    <Select>
                      <Option value="Standard Parcel">Standard Parcel</Option>
                      <Option value="Fragile Industrial Goods">Fragile Industrial Goods</Option>
                      <Option value="Commercial Freight / Pallet">Commercial Freight / Pallet</Option>
                      <Option value="Heavy Machinery Spares">Heavy Machinery Spares</Option>
                      <Option value="E-Commerce Consignment">E-Commerce Consignment</Option>
                      <Option value="Temperature Sensitive">Temperature Sensitive</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="priority" label="Delivery Priority">
                    <Select>
                      <Option value="NORMAL">Normal Priority</Option>
                      <Option value="EXPRESS">Express Priority (+50% rate)</Option>
                      <Option value="URGENT">Urgent Next-Flight (+100% rate)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="expectedDeliveryDate"
                    label="Expected Target Delivery Date"
                    rules={[{ required: true, message: 'Target delivery date is required' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Right Sidebar: Cost Summary & Action */}
          <Col xs={24} lg={8}>
            <Card
              title={<span style={{ fontWeight: 700 }}>Freight Cost Estimate</span>}
              style={{
                borderRadius: '14px',
                position: 'sticky',
                top: '88px',
                border: '1px solid #d9d9d9',
              }}
            >
              <div style={{ textAlign: 'center', padding: '16px 0 24px', background: '#f6ffed', borderRadius: '10px', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: '#595959', fontWeight: 500 }}>Estimated Shipping Cost</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#52c41a', marginTop: '4px' }}>
                  ₹{estimatedCost.toLocaleString()}
                </div>
                <Tag color="green" style={{ marginTop: '8px' }}>Includes Base Freight + Priority Handling</Tag>
              </div>

              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8c8c8c' }}>Base Rate:</span>
                  <strong>₹150.00</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8c8c8c' }}>Weight Surcharge:</span>
                  <strong>₹25.00 / kg</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8c8c8c' }}>Tracking Code:</span>
                  <span style={{ color: '#1677ff', fontWeight: 600 }}>Auto-generated</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8c8c8c' }}>Insurance Cover:</span>
                  <span style={{ color: '#52c41a' }}>Complimentary Standard</span>
                </div>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  height: '48px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '16px',
                  boxShadow: '0 4px 14px rgba(22, 119, 255, 0.3)',
                }}
              >
                Confirm & Create Shipment
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateShipment;
