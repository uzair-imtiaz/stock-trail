import { Card as AntdCard } from 'antd';

const Card = (props) => {
  return (
    <AntdCard
      {...props}
      style={{
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        ...props.style,
      }}
    />
  );
};

export default Card;
