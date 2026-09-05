import React from 'react';
import { Empty, Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const EmptyState = ({
  description = 'No records found',
  actionText,
  onAction,
  minHeight = 220,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: `${minHeight}px`,
        padding: '32px 16px',
        background: '#fafafa',
        borderRadius: '10px',
        border: '1px dashed #d9d9d9',
        margin: '12px 0',
      }}
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span style={{ color: '#8c8c8c', fontSize: '14px' }}>
            {description}
          </span>
        }
      >
        {actionText && onAction && (
          <Button type="primary" onClick={onAction} style={{ marginTop: '8px' }}>
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
