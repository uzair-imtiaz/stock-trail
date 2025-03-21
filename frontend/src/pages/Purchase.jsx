import {
  Button,
  Flex,
  Input,
  InputNumber,
  message,
  Select,
  Table,
  Tag,
} from 'antd';
import Title from 'antd/es/typography/Title';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createPurchase,
  createSale,
  getAccounts,
  getGroupedInventory,
  getVendors,
} from '../apis';
import { formatBalance } from '../utils';

const { Option } = Select;

const processRowSpan = (list) => {
  const data = list.filter((item) => item?.location !== 'Wastage');
  const categoryCount = {};
  data.forEach((item) => {
    categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
  });

  let categoryRowTracker = {};
  return data.map((item) => {
    if (!categoryRowTracker[item.category]) {
      categoryRowTracker[item.category] = true;
      return { ...item, categoryRowSpan: categoryCount[item.category] };
    }
    return { ...item, categoryRowSpan: 0 };
  });
};

const Purchase = () => {
  const [inventory, setInventory] = useState([]);
  const [banks, setBanks] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [AccountsRes, inventoryRes, vendorsRes] = await Promise.all([
        getAccounts(),
        getGroupedInventory(),
        getVendors(),
      ]);
      if (inventoryRes.success && AccountsRes.success && vendorsRes.success) {
        const processedData = processRowSpan(inventoryRes.data);
        setInventory(processedData);
        setBanks(AccountsRes.data);
        setVendors(vendorsRes.data);
      }
    } catch (error) {
      message.error(error.message || 'Failed to fetch data');
      console.error(error);
    }
    setLoading(false);
  };

  const handleValueChange = (value, key, field) => {
    const updatedData = inventory.map((item) => {
      if (item._id === key) {
        const updatedItem = { ...item, [field]: value };

        updatedItem.totalGST =
          updatedItem.gstAmount ||
          (updatedItem.gstPercent / item?.piecesPerCarton) *
            (updatedItem.unitPrice * updatedItem.buyingQuantity) ||
          0;

        updatedItem.amount =
          (updatedItem.unitPrice * updatedItem.buyingQuantity || 0) +
          updatedItem.totalGST;

        return updatedItem;
      }
      return item;
    });
    setInventory(updatedData);
  };

  const columns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text, record) => {
        if (record.categoryRowSpan > 0) {
          return {
            children: <strong>{text}</strong>,
            props: {
              rowSpan: record.categoryRowSpan,
            },
          };
        }
        return {
          props: {
            rowSpan: 0,
          },
        };
      },
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => formatBalance(price),
    },
    {
      title: 'Quantity (Cartons)',
      dataIndex: 'buyingQuantity',
      key: 'buyingQuantity',
      render: (_, record) => (
        <InputNumber
          min={0}
          placeholder="Enter Qty"
          defaultValue={0}
          onChange={(value) =>
            handleValueChange(value, record._id, 'buyingQuantity')
          }
        />
      ),
    },
    {
      title: 'GST %',
      dataIndex: 'gstPercent',
      key: 'gstPercent',
      render: (_, record) => (
        <InputNumber
          min={0}
          placeholder="GST %"
          defaultValue={0}
          disabled={!!record?.gstAmount}
          onChange={(value) =>
            handleValueChange(value, record._id, 'gstPercent')
          }
        />
      ),
    },
    {
      title: 'GST Amount',
      dataIndex: 'gstAmount',
      key: 'gstAmount',
      render: (_, record) => (
        <InputNumber
          min={0}
          placeholder="GST Amount"
          disabled={!!record?.gstPercent}
          defaultValue={0}
          onChange={(value) =>
            handleValueChange(value, record._id, 'gstAmount')
          }
        />
      ),
    },
    {
      title: 'Total GST',
      dataIndex: 'totalGST',
      key: 'totalGST',
      render: (_, record) => formatBalance(record?.totalGST || 0),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (_, record) => formatBalance(record?.amount || 0),
    },
  ];

  const handleSubmit = async () => {
    if (!selectedBank || !selectedVendor) {
      message.error('Please fill in all required fields.');
      return;
    }

    const inventoryItems = inventory
      .filter((item) => item.buyingQuantity > 0)
      .map((item) => ({
        itemId: item._id,
        quantity: item.buyingQuantity,
        gst: item.totalGST || 0,
        total: item.amount || 0,
      }));

    const payload = {
      bank: selectedBank,
      vendor: selectedVendor._id,
      items: inventoryItems,
    };

    try {
      setLoading(true);
      const response = await createPurchase(payload);

      if (response?.success) {
        message.success(response?.message);
      } else {
        message.error(response?.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting sales:', error);
      message.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-2">
        <Title level={3}>Purchase</Title>
        <Flex gap={10} className="mb-4">
          <Select
            placeholder="Select Bank Account"
            style={{ width: 200 }}
            onSelect={(value) => setSelectedBank(value)}
            optionLabelProp="label"
            allowClear
            showSearch
            filterOption={(input, option) =>
              option.label?.toLowerCase()?.includes(input?.toLowerCase())
            }
          >
            {banks.map((bank) => (
              <Option key={bank._id} value={bank._id} label={bank.name}>
                <div className="flex items-center justify-between">
                  <Flex align="center">
                    <span>{bank.name}</span>
                  </Flex>
                  <Tag color="#108ee9">{formatBalance(bank.balance)}</Tag>
                </div>
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Select Vendor"
            value={selectedVendor.name}
            style={{ width: 200 }}
            allowClear
            onClear={() => setSelectedVendor(null)}
            onChange={(value) => {
              const vendorObj = vendors.find((vendor) => vendor._id === value);
              setSelectedVendor(vendorObj);
            }}
            options={vendors.map((vendor) => ({
              value: vendor._id, 
              label: vendor.name,
            }))}
          />
          {selectedVendor && (
            <Tag color="#108ee9">{formatBalance(selectedVendor?.balance)}</Tag>
          )}
        </Flex>

        <Table
          columns={columns}
          dataSource={inventory}
          rowKey="_id"
          loading={loading}
          pagination={false}
          bordered
        />
      </div>

      <Button
        type="primary"
        style={{ float: 'right', marginTop: '20px' }}
        onClick={handleSubmit}
      >
        Save Purchase
      </Button>
    </>
  );
};

export default Purchase;
