import {
  Button,
  Col,
  Descriptions,
  Flex,
  Form,
  InputNumber,
  message,
  Row,
  Select,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { TbCreditCardPay, TbCreditCardRefund } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { createReceipt, fetchReceipt, fetchSale, getAccounts } from '../apis';
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
  const [saleData, setSaleData] = useState(null);
  const [shops, setShops] = useState([]);
  const [banks, setBanks] = useState([]);

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
          createCreditsData(receiptRes);
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
        credits: creditSale.filter(
          (item) => item.amount > 0 && item?.disabled !== true
        ),
        returnedCredits: creditReceived.filter(
          (item) => item.amount > 0 && item?.disabled !== true
        ),
      };

      response = await createReceipt(payload);
      if (response?.success) {
        message.success(response?.message);
        navigate('/receipts');
      } else {
        message.error(response?.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setSumbitLoading(false);
    }
  };

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
              <div className="w-100">
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
                  totalAmount={creditSale.reduce(
                    (total, credit) => total + credit.amount,
                    0
                  )}
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
                  totalAmount={creditReceived.reduce(
                    (total, credit) => total + credit.amount,
                    0
                  )}
                />
              </div>
            </Row>
          )}
        </Col>

        {saleData && (
          <Col span={12}>
            <Row>
              <Card
                title="Sale Details"
                className="mt-3"
                style={{
                  maxWidth: 600,
                  flex: 1,
                  padding: '20px',
                  maxHeight: '530px',
                }}
              >
                <Descriptions bordered column={1} className="mb-4">
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
                  <Descriptions.Item label="Amount to be Received">
                    <Text strong>
                      PKR&nbsp;
                      {saleData.netAmount -
                        creditSale.reduce((a, b) => a + b.amount, 0) +
                        creditReceived.reduce((a, b) => a + b.amount, 0)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Row>
            <Row style={{ marginTop: '15px', width: '20%' }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginLeft: '535px' }}
                loading={submitLoading}
                onClick={handleSave}
                block
              >
                Save
              </Button>
            </Row>
          </Col>
        )}
      </Flex>
    </>
  );
};

export default ReceiptForm;
