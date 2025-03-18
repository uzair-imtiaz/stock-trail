import { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  DatePicker,
  Row,
  Col,
} from 'antd';
import { createInventory, updateInventory } from '../apis';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { Card } from './common';

const { Option } = Select;

const InventoryForm = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { item } = location.state || {};
  useEffect(() => {
    form.setFieldsValue({
      product: 'Lays',
      location: 'Main',
      vendor: { name: 'Pepsico' },
      ...item,
      openingDate: item?.openingDate ? dayjs(item.openingDate) : null,
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="product"
                label="Product"
                rules={[{ required: true }]}
              >
                <Input defaultValue="Lays" />
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
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Category is required' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="Main">Main</Option>
                  <Option value="Wastage">Wastage</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="salePrice"
                label="Sale Price (PKR)"
                rules={[
                  {
                    required: true,
                    type: 'number',
                    message: 'Enter valid price',
                  },
                ]}
              >
                <InputNumber min={1} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name={['vendor', 'name']}
                label="Vendor Name"
                rules={[{ required: true, message: 'Vendor name is required' }]}
              >
                <Input defaultValue="Pepsico" />
              </Form.Item>

              <Form.Item
                name="stockType"
                label="Stock Type"
                rules={[{ required: true, message: 'Stock type is required' }]}
              >
                <Select>
                  <Option value="Cartons">Cartons</Option>
                  <Option value="Pieces">Pieces</Option>
                </Select>
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
                name="piecesPerCarton"
                label="Pieces per Carton"
                dependencies={['stockType']}
                rules={[
                  { required: true, message: 'Pieces per carton is required' },
                ]}
              >
                <InputNumber min={1} />
              </Form.Item>

              <Form.Item
                name="unitPrice"
                label="Unit Price (PKR)"
                rules={[
                  {
                    required: true,
                    type: 'number',
                    message: 'Enter valid price',
                  },
                ]}
              >
                <InputNumber min={1} />
              </Form.Item>

              <Form.Item
                name="openingDate"
                label="Opening Date"
                rules={[{ required: true, message: 'Select opening date' }]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  disabledDate={(current) =>
                    current && current > dayjs().endOf('day')
                  }
                />
              </Form.Item>
            </Col>
          </Row>

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
