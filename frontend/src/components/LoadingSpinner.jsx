import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const LoadingSpinner = ({ tip = 'Loading data...', size = 36, minHeight = 260 }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size, color: '#1677ff' }} spin />;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: `${minHeight}px`,
        width: '100%',
        gap: '16px',
      }}
    >
      <Spin indicator={antIcon} />
      {tip && <div style={{ color: '#8c8c8c', fontSize: '14px', fontWeight: 500 }}>{tip}</div>}
    </div>
  );
};

export default LoadingSpinner;
