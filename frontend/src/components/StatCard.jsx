import React from 'react';
import { Card, Statistic, Skeleton } from 'antd';

const StatCard = ({
  title,
  value,
  icon,
  prefix,
  suffix,
  loading = false,
  color = '#1677ff',
  subtitle,
  trend,
  onClick,
  className = '',
}) => {
  return (
    <Card
      className={`stat-card ${onClick ? 'stat-card-clickable' : ''} ${className}`}
      onClick={onClick}
      hoverable={!!onClick}
      style={{
        borderRadius: '12px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.25s ease',
        cursor: onClick ? 'pointer' : 'default',
        background: '#ffffff',
      }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', color: '#8c8c8c', fontWeight: 500, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title}
            </div>
            <Statistic
              value={value ?? 0}
              prefix={prefix}
              suffix={suffix}
              valueStyle={{
                fontSize: '26px',
                fontWeight: 700,
                color: '#1f1f1f',
                lineHeight: 1.2,
              }}
            />
            {(subtitle || trend) && (
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#8c8c8c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {trend && (
                  <span
                    style={{
                      color: trend > 0 ? '#52c41a' : trend < 0 ? '#ff4d4f' : '#8c8c8c',
                      fontWeight: 600,
                      marginRight: '6px',
                    }}
                  >
                    {trend > 0 ? `+${trend}%` : `${trend}%`}
                  </span>
                )}
                {subtitle}
              </div>
            )}
          </div>

          {icon && (
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${color}15`,
                color: color,
                fontSize: '20px',
                flexShrink: 0,
                marginLeft: '8px',
              }}
            >
              {icon}
            </div>
          )}
        </div>
      </Skeleton>
    </Card>
  );
};

export default StatCard;
