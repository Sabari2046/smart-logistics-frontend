import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Radio,
  Tag,
  Space,
  Select,
  Divider,
  Alert,
  Rate,
  App,
} from 'antd';
import {
  CarOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  InboxOutlined,
  ArrowLeftOutlined,
  CompassOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { routeService } from '../../services/routeService';
import { warehouseService } from '../../services/warehouseService';
import PageHeader from '../../components/PageHeader';
import StatusTag from '../../components/StatusTag';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const AssignShipment = () => {
  const { message } = App.useApp();
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAssignmentData();
  }, [id]);

  const loadAssignmentData = async () => {
    try {
      setLoading(true);
      const [shipmentData, recommendedVehicles, recommendedDrivers, routesList, warehousesList] =
        await Promise.all([
          shipmentService.getById(id),
          shipmentService.getRecommendedVehicles(id),
          shipmentService.getRecommendedDrivers(id),
          routeService.getAll(),
          warehouseService.getAll(),
        ]);

      setShipment(shipmentData);
      setVehicles(recommendedVehicles);
      setDrivers(recommendedDrivers);
      setRoutes(routesList);
      setWarehouses(warehousesList);

      // Auto-select best match if available
      if (recommendedVehicles.length > 0) {
        setSelectedVehicleId(recommendedVehicles[0].id);
      }
      if (recommendedDrivers.length > 0) {
        setSelectedDriverId(recommendedDrivers[0].id);
      }
      if (routesList.length > 0) {
        setSelectedRouteId(routesList[0].id);
      }
      if (warehousesList.length > 0) {
        setSelectedWarehouseId(warehousesList[0].id);
      }
    } catch (error) {
      message.error('Failed to load assignment recommendation data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!selectedVehicleId || !selectedDriverId) {
      message.warning('Please select both a suitable vehicle and certified driver.');
      return;
    }

    try {
      setSaving(true);
      await shipmentService.assignBoth(id, {
        vehicleId: selectedVehicleId,
        driverId: selectedDriverId,
        routeId: selectedRouteId,
        warehouseId: selectedWarehouseId,
      });

      message.success('Vehicle and Driver successfully assigned! Shipment approved for dispatch.');
      navigate(`/shipments/${id}`);
    } catch (error) {
      message.error(error.response?.data?.message || 'Assignment failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner tip="Calculating smart vehicle capacity & driver matching algorithms..." />;
  }

  if (!shipment) {
    return <Alert message="Shipment not found" type="error" />;
  }

  return (
    <div>
      <PageHeader
        title={`Smart Dispatch Assignment: ${shipment.trackingNumber}`}
        subtitle="AI-assisted recommendation matching optimal capacity vehicles and top-rated available drivers."
        breadcrumbs={[
          { title: 'Shipments', path: '/shipments' },
          { title: shipment.trackingNumber, path: `/shipments/${id}` },
          { title: 'Smart Assign' },
        ]}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Cancel & Return
          </Button>
        }
      />

      {/* Top Consignment Overview Banner */}
      <Card style={{ borderRadius: '14px', marginBottom: '24px', background: '#f0f7ff', border: '1px solid #bae0ff' }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={6}>
            <div style={{ fontSize: '12px', color: '#595959' }}>Tracking Number</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1677ff' }}>{shipment.trackingNumber}</div>
            <StatusTag status={shipment.shipmentStatus} />
          </Col>
          <Col xs={12} sm={4}>
            <div style={{ fontSize: '12px', color: '#595959' }}>Cargo Weight</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{shipment.weightKg} kg</div>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{shipment.packageType}</div>
          </Col>
          <Col xs={12} sm={7}>
            <div style={{ fontSize: '12px', color: '#595959' }}>Origin & Sender</div>
            <div style={{ fontWeight: 600 }}>{shipment.pickupAddress}, {shipment.pickupCity}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Customer: {shipment.customerName}</div>
          </Col>
          <Col xs={24} sm={7}>
            <div style={{ fontSize: '12px', color: '#595959' }}>Destination Delivery</div>
            <div style={{ fontWeight: 600 }}>{shipment.deliveryAddress}, {shipment.deliveryCity}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Priority: <strong>{shipment.priority}</strong></div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Section 1: Recommended Vehicles */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <CarOutlined style={{ color: '#1677ff', fontSize: '18px' }} />
                  <span style={{ fontWeight: 700 }}>1. Recommended Vehicles ({vehicles.length} Available)</span>
                </Space>
                <Tag color="blue">Capacity ≥ {shipment.weightKg} kg</Tag>
              </div>
            }
            style={{ borderRadius: '14px', height: '100%' }}
          >
            {vehicles.length === 0 ? (
              <Alert
                message="No Available Vehicles"
                description={`No fleet vehicles with capacity >= ${shipment.weightKg} kg are currently in AVAILABLE status.`}
                type="warning"
                showIcon
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {vehicles.map((v) => {
                  const isSelected = selectedVehicleId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #1677ff' : '1px solid #f0f0f0',
                        background: isSelected ? '#f0f7ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Space align="center">
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#1f1f1f' }}>
                              {v.vehicleNumber}
                            </span>
                            <Tag color="geekblue">{v.vehicleType?.replace(/_/g, ' ')}</Tag>
                            {v.isBestMatch && (
                              <Tag color="success" icon={<ThunderboltOutlined />} style={{ fontWeight: 600 }}>
                                Best Match
                              </Tag>
                            )}
                          </Space>
                          <div style={{ fontSize: '13px', color: '#595959', marginTop: '4px' }}>
                            {v.brand} {v.model} • {v.fuelType}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1677ff' }}>
                            {v.capacityKg} kg
                          </div>
                          <div style={{ fontSize: '11px', color: '#52c41a', fontWeight: 600 }}>
                            +{v.capacityDifference?.toFixed(1)} kg buffer
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '10px', fontSize: '12px', color: '#8c8c8c', display: 'flex', justifyContent: 'space-between' }}>
                        <span><EnvironmentOutlined /> Location: {v.currentLocation}</span>
                        <span>{v.matchReason}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* Section 2: Recommended Drivers */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <TeamOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                  <span style={{ fontWeight: 700 }}>2. Recommended Drivers ({drivers.length} Ready)</span>
                </Space>
                <Tag color="green">Status: Available</Tag>
              </div>
            }
            style={{ borderRadius: '14px', height: '100%' }}
          >
            {drivers.length === 0 ? (
              <Alert
                message="No Available Drivers"
                description="All commercial drivers are currently on active trips or off duty."
                type="warning"
                showIcon
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {drivers.map((d) => {
                  const isSelected = selectedDriverId === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDriverId(d.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #52c41a' : '1px solid #f0f0f0',
                        background: isSelected ? '#f6ffed' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Space align="center">
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#1f1f1f' }}>
                              {d.fullName}
                            </span>
                            {d.isBestMatch && (
                              <Tag color="success" icon={<CheckCircleFilled />} style={{ fontWeight: 600 }}>
                                Top Pick
                              </Tag>
                            )}
                          </Space>
                          <div style={{ fontSize: '12px', color: '#595959', marginTop: '4px' }}>
                            License: <strong>{d.licenseNumber}</strong> ({d.licenseType})
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <Rate disabled allowHalf defaultValue={d.rating || 5} style={{ fontSize: '12px' }} />
                          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                            <strong>{d.totalDeliveries || 0}</strong> trips completed
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '10px', fontSize: '12px', color: '#8c8c8c', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Experience: {d.experienceYears} Years</span>
                        <span style={{ color: '#52c41a', fontWeight: 500 }}>{d.matchReason}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* Section 3: Route & Warehouse Selection */}
        <Col span={24}>
          <Card
            title={<span style={{ fontWeight: 700 }}>3. Freight Route & Origin Warehouse Dispatch</span>}
            style={{ borderRadius: '14px' }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
                  <CompassOutlined style={{ color: '#1677ff', marginRight: '6px' }} /> Suggested Transit Route
                </div>
                <Select
                  value={selectedRouteId}
                  onChange={setSelectedRouteId}
                  style={{ width: '100%' }}
                  placeholder="Select Transit Route"
                >
                  {routes.map((r) => (
                    <Option key={r.id} value={r.id}>
                      {r.routeName} ({r.distanceKm} km • ~{r.estimatedDurationMinutes} mins)
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
                  <HomeOutlined style={{ color: '#722ed1', marginRight: '6px' }} /> Dispatch Logistics Hub / Warehouse
                </div>
                <Select
                  value={selectedWarehouseId}
                  onChange={setSelectedWarehouseId}
                  style={{ width: '100%' }}
                  placeholder="Select Origin Hub"
                >
                  {warehouses.map((w) => (
                    <Option key={w.id} value={w.id}>
                      {w.name} ({w.code} - {w.city})
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>

            <Divider style={{ margin: '24px 0 16px' }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button size="large" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                loading={saving}
                disabled={!selectedVehicleId || !selectedDriverId}
                onClick={handleSaveAssignment}
                style={{ height: '48px', padding: '0 24px', fontWeight: 700 }}
              >
                Approve & Save Dispatch Assignment
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AssignShipment;
