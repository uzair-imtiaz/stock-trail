import {
  Button,
  Col,
  Descriptions,
  Flex,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { SwapOutlined, WalletOutlined } from '@ant-design/icons';
import { TbCreditCardPay, TbCreditCardRefund } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import {
  createReceipt,
  fetchReceipt,
  fetchSale,
  getAccounts,
  getOtherAccounts,
} from '../apis';
import DynamicListSection from '../components/DynamicList';
import { Card } from '../components/common';

const { Title, Text } = Typography;

const ReceiptForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSumbitLoading] = useState(false);
  const [creditSale, setCreditSale] = useState([]);
  const [creditReceived, setCreditReceived] = useState([]);
  const [otherCredits, setOtherCredits] = useState([]);
  const [otherDebits, setOtherDebits] = useState([]);
  const [saleData, setSaleData] = useState(null);
  const [shops, setShops] = useState([]);
  const [banks, setBanks] = useState([]);
  const [otherAccounts, setOtherAccounts] = useState([]);
  const [otherAccountsLoading, setOtherAccountsLoading] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setLoading(true);
        const response = await getAccounts();
        if (response?.success) {
          setBanks(response?.data);
        } else {
          message.error(response?.message || 'Failed to fetch accounts');
        }
      } catch(error) {
        message.error(error?.message || 'Failed to fetch accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, []);

  useEffect(() => {
    const fetchOtherAccounts = async () => {
      try {
        setOtherAccountsLoading(true);
        const response = await getOtherAccounts({ limit: 200 });
        if (response?.success) {
          setOtherAccounts(response?.data || []);
        } else {
          message.error(
            response?.message || 'Failed to fetch other accounts list'
          );
        }
      } catch (error) {
        message.error(error?.message || 'Failed to fetch other accounts list');
      } finally {
        setOtherAccountsLoading(false);
      }
    };

    fetchOtherAccounts();
  }, []);

  const otherAccountOptions = useMemo(
    () =>
      otherAccounts.map((account) => ({
        value: account._id,
        label: `${account.name} (${account.category})`,
      })),
    [otherAccounts]
  );

  const createCreditsData = (response) => {
    const { data = [] } = response;
    const creditSummary = {};
    const returnSummary = {};

    data.credits.forEach((credit) => {
      const { shopId, creditAmount, returnedAmount } = credit;

      if (!creditSummary[shopId?._id]) {
        creditSummary[shopId?._id] = {
          description: shopId?.name,
          amount: 0,
          disabled: true,
        };
      }
      creditSummary[shopId?._id].amount += creditAmount;

      if (!returnSummary[shopId?._id]) {
        returnSummary[shopId?._id] = {
          description: shopId?.name,
          amount: 0,
          disabled: true,
        };
      }
      returnSummary[shopId?._id].amount += returnedAmount;
    });

    const creditSaleArray = Object.values(creditSummary).filter(
      (item) => item.amount
    );
    const creditReceivedArray = Object.values(returnSummary).filter(
      (item) => item.amount
    );

    setCreditSale(creditSaleArray);
    setCreditReceived(creditReceivedArray);
  };

  const hydrateReceiptData = (receiptResponse) => {
    if (!receiptResponse?.success || !receiptResponse?.data) {
      setCreditSale([]);
      setCreditReceived([]);
      setOtherCredits([]);
      setOtherDebits([]);
      return;
    }

    createCreditsData(receiptResponse);

    const receipt = receiptResponse.data;
    const mappedOtherCredits = (receipt.otherCredits || []).map((entry) => ({
      otherAccount:
        entry?.otherAccount?._id?.toString() || entry?.otherAccount?.toString(),
      amount: Number(entry?.amount) || 0,
    }));

    const mappedOtherDebits = (receipt.otherDebits || []).map((entry) => ({
      otherAccount:
        entry?.otherAccount?._id?.toString() || entry?.otherAccount?.toString(),
      amount: Number(entry?.amount) || 0,
    }));

    setOtherCredits(mappedOtherCredits);
    setOtherDebits(mappedOtherDebits);
  };

  const handleShowData = async () => {
    try {
      setLoading(true);
      const saleId = form.getFieldValue('saleId');

      const [saleRes, receiptRes] = await Promise.all([
        fetchSale(saleId),
        fetchReceipt(saleId),
      ]);
      if (saleRes?.success) {
        setShops(
          saleRes?.data?.routeId?.shops?.map((shop) => ({
            value: shop._id,
            label: shop.name,
          }))
        );
        if (receiptRes?.success) {
          hydrateReceiptData(receiptRes);
        }
        if (!receiptRes?.success) {
          setCreditSale([]);
          setCreditReceived([]);
          setOtherCredits([]);
          setOtherDebits([]);
        }
        const sale = saleRes.data;
        setSaleData({
          id: saleId,
          routeName: sale?.routeId?.name,
          amount: sale?.totalAmount,
          date: dayjs(sale?.date).format('DD-MMMM-YYYY'),
          expenses: sale?.expenses.reduce(
            (total, expense) => total + expense.amount,
            0
          ),
          netAmount: sale?.profit,
        });
      } else {
        message.error(
          saleRes?.message || receiptRes?.message
        );
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    let response;
    try {
      const bank = form.getFieldValue('bank');
      setSumbitLoading(true);
      const payload = {
        account: bank,
        saleId: saleData?.id,
        credits: creditSale
          .filter((item) => item.amount > 0 && item?.disabled !== true)
          .map((item) => ({
            description: item.description,
            amount: Number(item.amount) || 0,
          })),
        returnedCredits: creditReceived
          .filter((item) => item.amount > 0 && item?.disabled !== true)
          .map((item) => ({
            description: item.description,
            amount: Number(item.amount) || 0,
          })),
        otherCredits: otherCredits
          .filter((item) => item.otherAccount && item.amount > 0)
          .map((item) => ({
            otherAccount: item.otherAccount,
            amount: Number(item.amount) || 0,
          })),
        otherDebits: otherDebits
          .filter((item) => item.otherAccount && item.amount > 0)
          .map((item) => ({
            otherAccount: item.otherAccount,
            amount: Number(item.amount) || 0,
          })),
      };

      response = await createReceipt(payload);
      if (response?.success) {
        message.success(response?.message);
        navigate('/sales/receipts');
      } else {
        message.error(response?.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setSumbitLoading(false);
    }
  };

  const creditSaleTotal = useMemo(
    () =>
      creditSale.reduce(
        (total, credit) => total + (Number(credit.amount) || 0),
        0
      ),
    [creditSale]
  );

  const creditReceivedTotal = useMemo(
    () =>
      creditReceived.reduce(
        (total, credit) => total + (Number(credit.amount) || 0),
        0
      ),
    [creditReceived]
  );

  const otherCreditsTotal = useMemo(
    () =>
      otherCredits.reduce(
        (total, entry) => total + (Number(entry.amount) || 0),
        0
      ),
    [otherCredits]
  );

  const otherDebitsTotal = useMemo(
    () =>
      otherDebits.reduce(
        (total, entry) => total + (Number(entry.amount) || 0),
        0
      ),
    [otherDebits]
  );

  const amountToBeReceived = useMemo(() => {
    const base = Number(saleData?.netAmount) || 0;
    return (
      base - creditSaleTotal + creditReceivedTotal - otherCreditsTotal + otherDebitsTotal
    );
  }, [
    saleData?.netAmount,
    creditSaleTotal,
    creditReceivedTotal,
    otherCreditsTotal,
    otherDebitsTotal,
  ]);

  return (
    <>
      <Title level={3}>Add Receipt</Title>
      <Flex justify="center" gap={20} wrap="wrap">
        <Col>
          <Row>
            <Card
              className="mt-3"
              style={{
                maxWidth: 500,
                flex: 1,
                padding: '15px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Form layout="vertical" form={form} onFinish={handleShowData}>
                <Flex gap={10} wrap="wrap">
                  <Form.Item
                    label="Select a Bank"
                    name="bank"
                    style={{ flex: 1, minWidth: 200 }}
                    rules={[
                      { required: true, message: 'Please select a bank' },
                    ]}
                  >
                    <Select
                      placeholder="Select a bank"
                      options={banks.map((b) => ({
                        value: b._id,
                        label: b.name,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Sale ID"
                    name="saleId"
                    style={{ flex: 1, minWidth: 200 }}
                    rules={[
                      { required: true, message: 'Enter a valid Sale ID' },
                    ]}
                  >
                    <InputNumber
                      placeholder="Enter Sale ID"
                      min={1}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                    >
                      Show Data
                    </Button>
                  </Form.Item>
                </Flex>
              </Form>
            </Card>
          </Row>

          {saleData && (
            <Row>
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <DynamicListSection
                  title="Credit Sale"
                  icon={<TbCreditCardPay size={'1.3em'} />}
                  items={creditSale}
                  setItems={setCreditSale}
                  selectOptions={shops}
                  selectPlaceholder="Select Shop"
                  numberPlaceholder="Credit Amount"
                  width={'100%'}
                  totalText="Total Credit"
                  totalAmount={creditSaleTotal}
                />

                <DynamicListSection
                  title="Credit Return"
                  icon={<TbCreditCardRefund size={'1.3em'} />}
                  items={creditReceived}
                  setItems={setCreditReceived}
                  selectOptions={shops}
                  selectPlaceholder="Select Shop"
                  numberPlaceholder="Amount"
                  width={'100%'}
                  totalText="Total Return"
                  totalAmount={creditReceivedTotal}
                />

                <DynamicListSection
                  title="Other Amount Credit"
                  icon={<WalletOutlined />}
                  items={otherCredits}
                  setItems={setOtherCredits}
                  selectOptions={otherAccountOptions}
                  selectPlaceholder="Select Other Account"
                  numberPlaceholder="Amount"
                  width={'100%'}
                  totalText="Total Other Credits"
                  valueKey="otherAccount"
                  totalAmount={otherCreditsTotal}
                  loading={otherAccountsLoading}
                />

                <DynamicListSection
                  title="Other Account Debit"
                  icon={<SwapOutlined />}
                  items={otherDebits}
                  setItems={setOtherDebits}
                  selectOptions={otherAccountOptions}
                  selectPlaceholder="Select Other Account"
                  numberPlaceholder="Amount"
                  width={'100%'}
                  totalText="Total Other Debits"
                  valueKey="otherAccount"
                  totalAmount={otherDebitsTotal}
                  loading={otherAccountsLoading}
                />
              </Space>
            </Row>
          )}
        </Col>

        {saleData && (
          <Col span={12}>
            <Row>
              <Card title="Sale Details" className="mt-3" style={{ maxWidth: 600 }}>
                <Descriptions
                  bordered
                  column={1}
                  labelStyle={{ width: 180, fontWeight: 500 }}
                  contentStyle={{ fontWeight: 600 }}
                  className="mb-4"
                >
                  <Descriptions.Item label="Sale ID">
                    {saleData.id}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date">
                    {saleData?.date}
                  </Descriptions.Item>
                  <Descriptions.Item label="Route Name">
                    {saleData?.routeName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Amount">
                    PKR {saleData.amount}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Expenses">
                    PKR {saleData.expenses}
                  </Descriptions.Item>
                  <Descriptions.Item label="Net Amount">
                    PKR {saleData.netAmount}
                  </Descriptions.Item>
                  <Descriptions.Item label="Other Credits">
                    PKR {otherCreditsTotal.toFixed(2)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Other Debits">
                    PKR {otherDebitsTotal.toFixed(2)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Amount to be Received">
                    <Text strong>
                      PKR&nbsp;
                      {amountToBeReceived.toFixed(2)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Row>
            <Flex justify="end" style={{ marginTop: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitLoading}
                onClick={handleSave}
                style={{ minWidth: 160 }}
              >
                Save Receipt
              </Button>
            </Flex>
          </Col>
        )}
      </Flex>
    </>
  );
};

export default ReceiptForm;
