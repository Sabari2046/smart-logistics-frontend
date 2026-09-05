import React from 'react';
import { Tag } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CarOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ToolOutlined,
  UserOutlined,
  SendOutlined,
} from '@ant-design/icons';

const statusConfig = {
  // Shipment statuses
  PENDING: { color: 'gold', text: 'Pending', icon: <ClockCircleOutlined /> },
  APPROVED: { color: 'blue', text: 'Approved', icon: <CheckCircleOutlined /> },
  ASSIGNED: { color: 'cyan', text: 'Assigned', icon: <CarOutlined /> },
  PICKUP_SCHEDULED: { color: 'orange', text: 'Pickup Scheduled', icon: <ClockCircleOutlined /> },
  PICKED_UP: { color: 'purple', text: 'Picked Up', icon: <CarOutlined /> },
  IN_TRANSIT: { color: 'geekblue', text: 'In Transit', icon: <SyncOutlined spin /> },
  OUT_FOR_DELIVERY: { color: 'magenta', text: 'Out for Delivery', icon: <SendOutlined /> },
  DELIVERED: { color: 'green', text: 'Delivered', icon: <CheckCircleOutlined /> },
  DELAYED: { color: 'red', text: 'Delayed', icon: <ExclamationCircleOutlined /> },
  CANCELLED: { color: 'default', text: 'Cancelled', icon: <CloseCircleOutlined /> },

  // Vehicle statuses
  AVAILABLE: { color: 'success', text: 'Available', icon: <CheckCircleOutlined /> },
  MAINTENANCE: { color: 'warning', text: 'In Maintenance', icon: <ToolOutlined /> },
  INACTIVE: { color: 'default', text: 'Inactive', icon: <CloseCircleOutlined /> },

  // Driver statuses
  ON_DELIVERY: { color: 'processing', text: 'On Delivery', icon: <SyncOutlined spin /> },
  OFF_DUTY: { color: 'default', text: 'Off Duty', icon: <UserOutlined /> },

  // Priority
  NORMAL: { color: 'default', text: 'Normal' },
  EXPRESS: { color: 'blue', text: 'Express' },
  URGENT: { color: 'volcano', text: 'Urgent' },

  // Maintenance Status
  SCHEDULED: { color: 'blue', text: 'Scheduled', icon: <ClockCircleOutlined /> },
  IN_PROGRESS: { color: 'processing', text: 'In Progress', icon: <SyncOutlined spin /> },
  COMPLETED: { color: 'success', text: 'Completed', icon: <CheckCircleOutlined /> },
};

const StatusTag = ({ status, className = '' }) => {
  if (!status) return <Tag className={className}>N/A</Tag>;

  const config = statusConfig[status] || {
    color: 'default',
    text: status.replace(/_/g, ' '),
    icon: null,
  };

  return (
    <Tag
      color={config.color}
      icon={config.icon}
      className={`status-tag ${className}`}
      style={{
        borderRadius: '6px',
        padding: '2px 8px',
        fontWeight: 500,
        textTransform: 'capitalize',
      }}
    >
      {config.text}
    </Tag>
  );
};

export default StatusTag;
