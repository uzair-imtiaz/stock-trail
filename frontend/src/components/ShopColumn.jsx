import { DownOutlined, ShopOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Tooltip } from 'antd';
import { useState } from 'react';

const ShopCell = ({ shops }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!shops || shops.length === 0) {
    return <span>-</span>;
  }

  const visibleShops = isExpanded ? shops : shops.slice(0, 10);
  const hasMore = shops.length > 10;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Space wrap style={{ display: 'flex', gap: '4px', lineHeight: 'normal' }}>
        {visibleShops.map((shop, i) => (
          <Tooltip title={shop.name} key={shop._id}>
            <Tag
              color={getTagColor(i)}
              icon={<ShopOutlined />}
              style={{
                padding: '2px 6px',
                borderRadius: '8px',
                fontSize: '12px',
                lineHeight: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                border: '1px solid #e6f4ff',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow =
                  '0 1px 4px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {truncateText(shop.name, 18)}
            </Tag>
          </Tooltip>
        ))}
      </Space>
      {hasMore && (
        <Button
          type="link"
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
          style={{ padding: 0, fontSize: '12px', color: '#1890ff' }}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      )}
    </div>
  );
};

const getTagColor = (index) => {
  const colors = [
    '#4A90E2', // Soft Blue (calming, professional)
    '#50C878', // Muted Green (fresh, approachable)
    '#FF6F61', // Coral (warm, not too bright)
    '#A569BD', // Light Purple (modern, subtle)
    '#F7B731', // Golden Yellow (optimistic, readable)
    '#6BCBCA', // Teal (clean, refreshing)
  ];
  return colors[index % colors.length];
};

const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength - 3) + '...';
  }
  return text;
};

export default ShopCell;
