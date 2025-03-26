import {
  Button,
  Card,
  Flex,
  InputNumber,
  message,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd';
import Title from 'antd/es/typography/Title';
import { useEffect, useState } from 'react';
import {
  createPurchase,
  getAccounts,
  getDeductions,
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
  const [deductions, setDeductions] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateTotalAmount(inventory);
  }, [deductions]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [AccountsRes, inventoryRes, vendorsRes] = await Promise.all([
        getAccounts(),
        getGroupedInventory(),
        getVendors(),
      ]);
      if (inventoryRes.success && AccountsRes.success && vendorsRes.success) {
        const processedData = processRowSpan(inventoryRes.data).map((item) => ({
          ...item,
          unitDeductions: deductions.map((d) => ({
            ...d,
            amount: 0,
            isPercentage: false,
          })),
        }));
        setInventory(processedData);
        setBanks(AccountsRes.data);
        setVendors(vendorsRes.data);
      }
      const response = await getDeductions();
      if (response?.success) {
        setDeductions(response?.data);
      }
    } catch (error) {
      message.error(error.message || 'Failed to fetch data');
      console.error(error);
    }
    setLoading(false);
  };

  const calculateUnitTotal = (item) => {
    let unitTotal = (item.buyingQuantity || 0) * (item.unitPrice || 0);

    if (Array.isArray(item.unitDeductions) && item.unitDeductions.length > 0) {
      item.unitDeductions.forEach((deduction) => {
        const amount = deduction.amount || 0;
        const isPercentage = deduction.isPercentage || false;

        let deductionValue = isPercentage ? (unitTotal * amount) / 100 : amount;

        unitTotal +=
          deduction.type === 'Charge' ? deductionValue : -deductionValue;
      });
    }

    return unitTotal;
  };

  const handleValueChange = (value, key, field) => {
    const updatedData = inventory.map((item) => {
      if (item._id === key) {
        const updatedItem = { ...item, [field]: value };
        return { ...updatedItem, amount: calculateUnitTotal(updatedItem) };
      }
      return item;
    });

    setInventory(updatedData);
    calculateTotalAmount(updatedData);
  };

  // Function to calculate the grand total considering totalDeductions
  const calculateTotalAmount = (inventoryData) => {
    let grandTotal = inventoryData.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
    // Apply totalDeductions (global level)
    if (deductions.length > 0) {
      deductions.forEach((deduction) => {
        let deductionValue = deduction.isPercentage
          ? (grandTotal * deduction.amount) / 100
          : deduction.amount;

        grandTotal +=
          deduction.type === 'Charge' ? deductionValue : -deductionValue;
      });
    }
    setTotalAmount(grandTotal);
  };

  const handleDeductionChange = (value, record, deductionId, field) => {
    const updatedInventory = inventory.map((item) => {
      if (item._id === record._id) {
        let updatedDeductions = [...item.unitDeductions];
        const deductionIndex = updatedDeductions.findIndex(
          (d) => d._id === deductionId
        );

        if (deductionIndex !== -1) {
          updatedDeductions[deductionIndex] = {
            ...updatedDeductions[deductionIndex],
            [field]: field === 'amount' ? value || 0 : value,
          };
        } else {
          updatedDeductions.push({
            ...deductions.find((d) => d._id === deductionId),
            [field]: field === 'amount' ? value || 0 : value,
          });
        }
        const updatedItem = {
          ...item,
          unitDeductions: updatedDeductions,
        };
        updatedItem.amount = calculateUnitTotal(updatedItem); // ✅ Now calculate the correct amount
        return updatedItem;
      }
      return item;
    });

    setInventory(updatedInventory);
    calculateTotalAmount(updatedInventory);
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
    ...deductions.map((deduction) => ({
      title: deduction.name,
      key: deduction._id,
      render: (_, record) => {
        const deductionForItem = record.unitDeductions.find(
          (d) => d._id === deduction._id
        ) || {
          amount: 0,
          isPercentage: false,
        };
        return (
          <Space>
            <InputNumber
              value={deductionForItem.amount}
              placeholder={deduction.name}
              onChange={(value) =>
                handleDeductionChange(value, record, deduction._id, 'amount')
              }
              parser={(value) =>
                value.replace(deductionForItem.isPercentage ? '%' : 'PKR ', '')
              }
            />
            <Switch
              size="small"
              checkedChildren="%"
              unCheckedChildren="PKR"
              checked={deductionForItem.isPercentage}
              onChange={(checked) =>
                handleDeductionChange(
                  checked,
                  record,
                  deduction._id,
                  'isPercentage'
                )
              }
            />
          </Space>
        );
      },
    })),
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
        unitDeductions: item.unitDeductions.filter((d) => d?.amount > 0),
      }));

    const payload = {
      bank: selectedBank,
      vendor: selectedVendor._id,
      items: inventoryItems,
      totalDeductions: deductions,
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
            value={selectedVendor?.name}
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
          scroll={{ x: 'max-content' }}
          footer={() => (
            <div
              style={{
                textAlign: 'right',
                fontWeight: 'bold',
                paddingRight: '16px',
              }}
            >
              Total Amount: {totalAmount.toFixed(2)}
            </div>
          )}
        />
      </div>
      {deductions?.length > 0 && (
        <Flex vertical gap={12} align="end">
          <Card title="Deductions" style={{ width: 500 }} loading={loading}>
            {deductions.map((deduction) => (
              <Space
                key={deduction._id}
                style={{ display: 'flex', marginBottom: 8 }}
              >
                <InputNumber
                  addonBefore={deduction?.name}
                  placeholder={deduction?.name}
                  value={deduction?.amount}
                  onChange={(value) =>
                    setDeductions((prev) =>
                      prev.map((d) =>
                        d._id === deduction._id ? { ...d, amount: value } : d
                      )
                    )
                  }
                  formatter={(value) =>
                    deduction.isPercentage ? `${value}%` : `PKR ${value}`
                  }
                  parser={(value) =>
                    value.replace(deduction.isPercentage ? '%' : 'PKR', '')
                  }
                />
                <Switch
                  checkedChildren="%"
                  unCheckedChildren="PKR"
                  checked={deduction.isPercentage}
                  onChange={(checked) =>
                    setDeductions((prev) =>
                      prev.map((d) =>
                        d._id === deduction._id
                          ? { ...d, isPercentage: checked }
                          : d
                      )
                    )
                  }
                />
              </Space>
            ))}
          </Card>
        </Flex>
      )}
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
