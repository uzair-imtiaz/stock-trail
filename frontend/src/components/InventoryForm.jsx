import { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  Card,
  DatePicker,
} from 'antd';
import { createInventory, updateInventory } from '../apis';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

const { Option } = Select;

const InventoryForm = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { item } = location.state;
  useEffect(() => {
    form.setFieldsValue({
      product: 'Lays',
      location: 'Main',
      ...item,
      expiryDate: item?.expiryDate ? dayjs(item.expiryDate) : null,
    });
  }, [item, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = item
        ? await updateInventory(item._id, values)
        : await createInventory(values);
      if (response.success) {
        message.success(response.message);
        navigate('/inventory');
      } else {
        message.error(response.message);
      }

      form.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to save inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title="Add Inventory" style={{ width: '70%', margin: '0 auto' }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="product"
            label="Product"
            rules={[{ required: true }]}
          >
            <Select defaultValue="Lays">
              <Option value="Lays">Lays</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="flavor"
            label="Flavor"
            rules={[{ required: true, message: 'Flavor is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="grammage"
            label="Grammage (g)"
            rules={[
              {
                required: true,
                type: 'number',
                message: 'Enter valid grammage',
              },
            ]}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Main">Main</Option>
              <Option value="Secondary">Secondary</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name={['vendor', 'name']}
            label="Vendor Name"
            rules={[{ required: true, message: 'Vendor name is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name={['vendor', 'phone']} label="Vendor Phone">
            <Input />
          </Form.Item>

          <Form.Item
            name="purchasePrice"
            label="Purchase Price (PKR)"
            rules={[
              { required: true, type: 'number', message: 'Enter valid price' },
            ]}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[
              {
                required: true,
                type: 'number',
                message: 'Enter valid quantity',
              },
            ]}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label="Expiry Date"
            rules={[{ required: true, message: 'Select expiry date' }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>

          <div className="d-flex justify-content-end">
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                {item ? 'Update Inventory' : 'Add Inventory'}
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default InventoryForm;
