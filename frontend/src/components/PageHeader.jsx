import React from 'react';
import { Breadcrumb, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  extra,
  className = '',
}) => {
  return (
    <div
      className={`page-header ${className}`}
      style={{
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {breadcrumbs.length > 0 && (
        <Breadcrumb
          style={{ marginBottom: '4px', fontSize: '13px' }}
          items={breadcrumbs.map((b) => ({
            title: b.path || b.href ? <Link to={b.path || b.href}>{b.title}</Link> : b.title,
          }))}
        />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <Title
            level={3}
            style={{
              margin: 0,
              fontWeight: 700,
              color: '#1f1f1f',
              letterSpacing: '-0.3px',
            }}
          >
            {title}
          </Title>
          {subtitle && (
            <Paragraph
              type="secondary"
              style={{ margin: '4px 0 0', fontSize: '14px', color: '#595959' }}
            >
              {subtitle}
            </Paragraph>
          )}
        </div>

        {extra && (
          <Space wrap size="middle">
            {extra}
          </Space>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
