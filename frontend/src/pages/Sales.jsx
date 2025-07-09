import { DollarOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Flex,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Switch,
  Table,
} from 'antd';
import Title from 'antd/es/typography/Title';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createSale,
  fetchSale,
  getDeductions,
  getExpenses,
  getGroupedInventory,
  getRoutesWithoutShops,
  getUsers,
  updateSale,
} from '../apis';
import { default as DynamicListSection } from '../components/DynamicList';

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

const SalesScreen = () => {
  const [inventory, setInventory] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [salesmen, setSalesmen] = useState([]);
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expenseOptions, setExpenseOptions] = useState([]);
  const [driverName, setDriverName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingExistingSale, setFetchingExistingSale] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [deductions, setDeductions] = useState([]);
  const navigate = useNavigate();

  const { id } = useParams();
  useEffect(() => {
    const init = async () => {
      const data = await fetchData();
      if (id && data?.inventory) {
        await fetchExistingSale(id, data.inventory, data.deductions);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      let total = 0;
      inventory.forEach((item) => {
        let itemTotal = (item.dispatchQty || 0) * (item.salePrice || 0);
        (item.unitDeductions || []).forEach((deduction) => {
          if (deduction.type === 'Deduction')
            itemTotal -= deduction.isPercentage
              ? (itemTotal * (deduction.amount || 0)) / 100
              : deduction.amount || 0;
          else
            itemTotal += deduction.isPercentage
              ? (itemTotal * (deduction.amount || 0)) / 100
              : deduction.amount || 0;
        });
        total += itemTotal;
      });

      const totalDeductions = deductions.reduce((sum, deduction) => {
        let amount = deduction.isPercentage
          ? (total * (deduction.amount || 0)) / 100
          : deduction.amount || 0;
        if (deduction.type === 'Deduction') {
          amount = -amount;
        }
        return sum + amount;
      }, 0);

      total += totalDeductions;
      expenses.forEach((expense) => {
        total -= expense.amount || 0;
      });

      setTotalAmount(total);
    }, 500);

    return () => clearTimeout(timer);
  }, [inventory, expenses, deductions]);

  const getFullDeductionObject = (deductions, dedObj) => {
    const updatedDeductions = deductions.map((deduction) => {
      const matchingDeduction = dedObj.find(
        (totalDeduction) => totalDeduction._id === deduction._id
      );
      return matchingDeduction
        ? { ...deduction, ...matchingDeduction }
        : deduction;
    });
    return updatedDeductions;
  };

  const fetchExistingSale = async (saleId, inventoryData, deductions) => {
    try {
      setFetchingExistingSale(true);
      setLoading(true);
      const response = await fetchSale(saleId);
      if (response.success) {
        const saleData = response.data;

        setSelectedRoute(saleData.routeId._id);
        setSelectedSalesman(saleData.salesman);
        setDriverName(saleData.driverName);
        setLicensePlate(saleData.licenseNumber);

        const mappedExpenses = saleData.expenses.map((expense) => ({
          description: expense.description,
          amount: expense.amount,
          _id: expense._id,
        }));
        setExpenses(mappedExpenses);
        if (inventoryData.length > 0 && saleData.inventoryDropped?.length > 0) {
          const updatedInventory = [...inventoryData];

          saleData.inventoryDropped.forEach((droppedItem) => {
            const inventoryIndex = updatedInventory.findIndex(
              (item) => item._id === droppedItem.itemId
            );

            if (inventoryIndex !== -1) {
              updatedInventory[inventoryIndex] = {
                ...updatedInventory[inventoryIndex],
                dispatchQty: droppedItem.quantityDropped,
                tpr: droppedItem.tpr || 0,
                wastage: droppedItem.wastage || 0,
                unitDeductions:
                  getFullDeductionObject(
                    deductions,
                    droppedItem.unitDeductions
                  ) || [],
                returnPieces: droppedItem.returnPieces || 0,
              };
            }
          });

          setInventory(updatedInventory);
        }

        const updatedDeductions = getFullDeductionObject(
          deductions,
          saleData.totalDeductions
        );

        if (updatedDeductions.length > 0) setDeductions(updatedDeductions);

        setTotalAmount(saleData.totalAmount);
      } else {
        message.error(response.message || 'Failed to fetch sale details');
      }
    } catch (error) {
      message.error(error.message || 'Failed to fetch sale details');
      console.error(error);
    } finally {
      setFetchingExistingSale(false);
      setLoading(false);
    }
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const [routesRes, inventoryRes, salesManRes, deductionsRes, expensesRes] =
        await Promise.all([
          getRoutesWithoutShops(),
          getGroupedInventory(),
          getUsers(),
          getDeductions(),
          getExpenses(),
        ]);

      if (
        inventoryRes.success &&
        routesRes.success &&
        salesManRes.success &&
        deductionsRes.success &&
        expensesRes.success
      ) {
        const processedData = processRowSpan(inventoryRes.data).map((item) => ({
          ...item,
          unitDeductions: deductionsRes.data.map((d) => ({
            ...d,
            amount: 0,
            isPercentage: false,
          })),
        }));

        setRoutes(routesRes.data);
        setSalesmen(salesManRes.data);
        setExpenseOptions(
          expensesRes.data.map((expense) => ({
            label: expense.name,
            value: expense._id,
          }))
        );

        if (!id) {
          setInventory(processedData);
          setDeductions(deductionsRes.data);
        }

        return {
          inventory: processedData,
          deductions: deductionsRes.data,
        };
      }
    } catch (error) {
      message.error(error.message || 'Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (value, record, field) => {
    const updatedInventory = inventory.map((item) =>
      item._id === record._id ? { ...item, [field]: value || 0 } : item
    );
    setInventory(updatedInventory);
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
            _id: deductionId,
            [field]: field === 'amount' ? value || 0 : value,
          });
        }

        return { ...item, unitDeductions: updatedDeductions };
      }
      return item;
    });

    setInventory(updatedInventory);
  };

  const columns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (text, record) => {
        if (record.categoryRowSpan > 0) {
          return {
            children: <strong>{text}</strong>,
            props: {
              rowSpan: record.categoryRowSpan,
            },
          };
        }
        return { props: { rowSpan: 0 } };
      },
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      width: 200,
    },
    {
      title: 'Grammage',
      dataIndex: 'grammage',
      key: 'grammage',
      width: 110,
      render: (text) => `${text} g`,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
    },
    {
      title: 'Sale Price',
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: 100,
    },
    {
      title: 'Available Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 130,
      render: (text) => `${text?.toFixed?.(2)}`,
    },
    {
      title: 'Dispatch Qty (Cartons)',
      dataIndex: 'dispatchQty',
      key: 'dispatchQty',
      width: 180,
      render: (_, record) => (
        <InputNumber
          min={0}
          max={record.dispatchQty ? null : record.quantity}
          value={record.dispatchQty}
          placeholder="Enter Qty"
          defaultValue={0}
          onChange={(value) => handleValueChange(value, record, 'dispatchQty')}
        />
      ),
    },
    {
      title: 'TPR (Free Pieces)',
      dataIndex: 'tpr',
      key: 'tpr',
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={0}
          placeholder="Enter TPR"
          value={record.tpr}
          defaultValue={0}
          onChange={(value) => handleValueChange(value, record, 'tpr')}
        />
      ),
    },
    {
      title: 'Return Pieces',
      dataIndex: 'returnPieces',
      key: 'returnPieces',
      width: 140,
      render: (_, record) => (
        <InputNumber
          min={0}
          placeholder="Return Pieces"
          value={record.returnPieces}
          defaultValue={0}
          onChange={(value) => handleValueChange(value, record, 'returnPieces')}
        />
      ),
    },
    {
      title: 'Transfer to Wastage',
      dataIndex: 'wastage',
      key: 'wastage',
      width: 160,
      render: (_, record) => (
        <InputNumber
          min={0}
          placeholder="Enter Wastage"
          value={record.wastage}
          defaultValue={0}
          onChange={(value) => handleValueChange(value, record, 'wastage')}
        />
      ),
    },
    ...deductions.map((deduction) => ({
      title: deduction.name,
      key: deduction._id,
      width: 180,
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
  ];

  const handleSubmit = async () => {
    if (!selectedRoute || !selectedSalesman || !driverName || !licensePlate) {
      message.error('Please fill in all required fields.');
      return;
    }

    //handle edit

    const inventoryDropped = inventory
      .filter((item) => item.dispatchQty > 0)
      .map((item) => ({
        itemId: item._id,
        quantityDropped: item.dispatchQty,
        tpr: item.tpr || 0,
        wastage: item.wastage || 0,
        unitDeductions: item.unitDeductions.filter((d) => d?.amount > 0),
        returnPieces: item.returnPieces || 0,
      }));

    const payload = {
      routeId: selectedRoute,
      date: selectedDate,
      salesman: selectedSalesman,
      driverName,
      licenseNumber: licensePlate,
      inventoryDropped,
      expenses,
      totalAmount,
      profit: 0,
      creditAmount: 0,
      totalDeductions: deductions.filter((d) => d?.amount > 0),
    };

    try {
      setLoading(true);
      const response = id
        ? await updateSale(id, payload)
        : await createSale(payload);

      if (response?.success) {
        message.success(response?.message);
        navigate('/sales/invoices');
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
        <Title level={3}>Add a Sale</Title>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <Select
            placeholder="Select Route"
            style={{ width: 200 }}
            onSelect={(value) => setSelectedRoute(value)}
            value={selectedRoute}
            loading={fetchingExistingSale || loading}
          >
            {routes.map((route) => (
              <Option key={route._id} value={route._id}>
                {route.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Select Salesman"
            style={{ width: 200 }}
            onSelect={(value) => setSelectedSalesman(value)}
            value={selectedSalesman}
            loading={fetchingExistingSale || loading}
          >
            {salesmen.map((salesman) => (
              <Option key={salesman._id} value={salesman._id}>
                {salesman.name}
              </Option>
            ))}
          </Select>
          <Input
            placeholder="Driver Name"
            style={{ width: 200 }}
            onChange={(e) => setDriverName(e.target.value)}
            value={driverName}
            loading={fetchingExistingSale || loading}
          />
          <Input
            placeholder="License Plate #"
            style={{ width: 200 }}
            onChange={(e) => setLicensePlate(e.target.value)}
            value={licensePlate}
            loading={fetchingExistingSale || loading}
          />
          <DatePicker
            style={{ width: 200 }}
            onChange={(date) => setSelectedDate(date)}
            value={selectedDate}
            disabled={fetchingExistingSale || loading}
          />
        </div>

        <Table
          columns={columns}
          dataSource={inventory}
          rowKey="_id"
          loading={loading}
          pagination={false}
          bordered
          scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
          sticky
          summary={() => {
            // --- Initialize ---
            const totals = {
              totalDispatch: 0,
              totalTpr: 0,
              totalReturnPieces: 0,
              totalWastage: 0,
              quantity: 0,
              deductionTotals: new Map(deductions.map((d) => [d._id, 0])),
            };

            // --- Single pass ---
            for (const item of inventory) {
              totals.totalDispatch += item.dispatchQty || 0;
              totals.totalTpr += item.tpr || 0;
              totals.totalReturnPieces += item.returnPieces || 0;
              totals.totalWastage += item.wastage || 0;
              totals.quantity += item.quantity || 0;

              for (const unitDeduction of item.unitDeductions || []) {
                if (totals.deductionTotals.has(unitDeduction._id)) {
                  totals.deductionTotals.set(
                    unitDeduction._id,
                    totals.deductionTotals.get(unitDeduction._id) +
                      (unitDeduction.amount || 0)
                  );
                }
              }
            }

            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  {/* Fixed columns */}
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <strong>Total</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    {(totals.quantity || 0).toFixed(2)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    {totals.totalDispatch}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>{totals.totalTpr}</Table.Summary.Cell>
                  <Table.Summary.Cell>
                    {totals.totalReturnPieces}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>{totals.totalWastage}</Table.Summary.Cell>

                  {/* Dynamic Deduction columns */}
                  {deductions.map((deduction) => (
                    <Table.Summary.Cell key={deduction._id}>
                      {totals.deductionTotals.get(deduction._id) || 0}
                    </Table.Summary.Cell>
                  ))}
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </div>
      <Flex gap={12} align="start">
        <div style={{ width: '100%' }}>
          <DynamicListSection
            title="Expenses"
            icon={<DollarOutlined />}
            items={expenses}
            setItems={setExpenses}
            totalAmount={totalAmount}
            selectOptions={expenseOptions}
            selectPlaceholder="Select Expense Type"
            numberPlaceholder="Amount"
            loading={loading || fetchingExistingSale}
          />
        </div>

        {deductions?.length > 0 && (
          <Flex vertical gap={12}>
            <Card
              title="Deductions"
              style={{ width: 400 }}
              loading={loading || fetchingExistingSale}
            >
              {deductions.map((deduction) => (
                <Space
                  key={deduction._id}
                  style={{ display: 'flex', marginBottom: 8 }}
                >
                  <InputNumber
                    addonBefore={deduction.name}
                    placeholder={deduction.name}
                    value={deduction.amount}
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
      </Flex>
      <Flex>
        <Button
          type="primary"
          className="mt-2 p-1"
          onClick={handleSubmit}
          style={{ width: '10%' }}
        >
          {id ? 'Update Sale' : 'Submit Sale'}
        </Button>
      </Flex>
    </>
  );
};

export default SalesScreen;
