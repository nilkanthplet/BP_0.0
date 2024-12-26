import React, { useState, useEffect } from "react";
import { LuCalendarDays } from "react-icons/lu";
import axios from "axios";
import Navbar from "../../components/header/Navbar";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './bills.css';
import rightImage1 from "../../assets/BillTemplate.jpg";
import html2pdf from 'html2pdf.js';

const BillingSystem = () => {
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRates, setUserRates] = useState({});
  const [serviceChargeRates, setServiceChargeRates] = useState({});
  const [userReturnItems, setUserReturnItems] = useState({});
  const [totalInventory, setTotalInventory] = useState({});
  const [userPayments, setUserPayments] = useState({});
  const [lastDates, setLastDates] = useState({});
  const [paymentMethods, setPaymentMethods] = useState({});
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [bills, setBills] = useState([]);
  const [showBillHistory, setShowBillHistory] = useState(false);
  const [userBillTotals, setUserBillTotals] = useState({});
  const [netAmountDue, setNetAmountDue] = useState({});

  const API_BASE_URL = "http://54.161.153.204:5000";

  useEffect(() => {
    fetchData();
  }, []);

  const calculateNetAmountDue = (userId, items) => {
    const endDate = lastDates[userId] ? new Date(lastDates[userId]) : new Date();
    const periods = calculateDetailedBillingPeriods(items, userId, endDate);
    const totalCharge = periods.reduce((sum, period) => sum + period.charge, 0);
    const previousPayments = userBillTotals[userId]?.completedPayment || 0;
    return totalCharge - previousPayments;
  };

  
  const generatePDF = (userId) => {
    // Get user data
    const user = userData.find(u => u.userId === userId);
    const items = userReturnItems[userId] || [];
    const endDate = lastDates[userId] ? new Date(lastDates[userId]) : new Date();
    const periods = calculateDetailedBillingPeriods(items, userId, endDate);
    const totalCharge = periods.reduce((sum, period) => sum + period.charge, 0);
    const previousPayments = userBillTotals[userId]?.completedPayment || 0;
    const remainingToPay = totalCharge - previousPayments;

    // Create HTML content
    const createHtmlContent = () => {
        // Create table rows
        const tableRows = periods.map(period => {
            if (period.isServiceCharge) {
                return `
                    <tr>
                        <td>સર્વિસ ચાર્જ</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>${period.totalUdhar} × ${period.serviceChargeRate}</td>
                        <td>${period.charge.toFixed(2)}</td>
                    </tr>
                `;
            }
            return `
                <tr>
                    <td>${formatDate(period.displayDate)}</td>
                    <td>${period.stockChange}</td>
                    <td>${period.runningStock}</td>
                    <td>${period.days}</td>
                    <td>${period.dailyRate}</td>
                    <td>${period.charge.toFixed(2)}</td>
                </tr>
            `;
        }).join('');

        return `
            <html>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;700&display=swap');
                    
                    body {
                        font-family: 'Noto Sans Gujarati', sans-serif;
                        padding: 20px;
                        line-height: 1.6;
                    }
                    
                    .header {
                        margin-bottom: 30px;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    
                    th {
                        background-color: #f5f5f5;
                    }
                    
                    .totals {
                        margin-top: 20px;
                        text-align: right;
                    }
                    
                    .watermark {
                        position: fixed;
                        top: 0;
                        left: 50;
                        width: 210mm;    /* A4 width */
                        height: 297mm;
                        opacity: 1;
                        z-index: -1;
                    }
                </style>
            </head>
            <body>
                <div class="watermark">
                    <img src="${rightImage1}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                
                <div class="header" style = " margin-top: 186.5px; font-weight: semi-bold; font-size: 1.3rem;">
                    <p style = " margin-left: 635px;">C${user.userId}</p>
                </div>

                <div class="header" style = " font-weight: semi-bold; font-size: 1.3rem;">
                    <p style = "position: absolute; top: 240px; left: 130px;">${user.name}</p>
                    <p style = "position: absolute; top: 240px; left: 620px;">${user.userId}</p>
                    <p style = "position: absolute; top: 274px; left: 625px; font-weight: semi-bold; font-size: 1.2rem;">${formatDate(new Date().toISOString())}</p>
                    <p style = "position: absolute; top: 274px; left: 135px; ">${user.site}</p>
                </div>
                
                <table>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                
                <div class="totals" class="header" style = " font-weight: semi-bold; font-size: 1.3rem;">
                    <p style = "position: absolute; top: 780px; left: 130px;">કુલ: ${totalCharge.toFixed(2)}</p>
                    <p>અગાઉની ચુકવણી: ${previousPayments.toFixed(2)}</p>
                    <p>બાકી રકમ: ${remainingToPay.toFixed(2)}</p>
                </div>
            </body>
            </html>
        `;
    };

    // Generate PDF from HTML
    const element = document.createElement('div');
    element.innerHTML = createHtmlContent();
    document.body.appendChild(element);

    html2pdf()
        .set({
            margin: 0,
            filename: `bill_${user.name}_${formatDate(new Date().toISOString())}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                letterRendering: true
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        })
        .from(element)
        .save()
        .then(() => {
            document.body.removeChild(element);
        });
};


  const fetchAllUserBillTotals = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bills`);
      const bills = response.data;
      
      const userTotals = bills.reduce((acc, bill) => {
        const userId = bill.userId;
        if (!acc[userId]) {
          acc[userId] = {
            completedPayment: 0,
            duePayment: 0
          };
        }
        acc[userId].completedPayment += bill.completedPayment;
        acc[userId].duePayment += bill.duePayment;
        return acc;
      }, {});

      setUserBillTotals(userTotals);
    } catch (error) {
      console.error("Error fetching bill totals:", error);
    }
  };

  const fetchBills = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bills?userId=${userId}`);
      setBills(response.data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };

  const submitPayment = async (userId) => {
    try {
      const endDate = lastDates[userId] ? new Date(lastDates[userId]) : new Date();
      const totalCharge = calculateTotalCharge(userId);
      const paymentAmount = paymentAmounts[userId]?.paid || 0;
      
      const billData = {
        userId,
        userName: selectedUser.name,
        totalAmount: totalCharge,
        completedPayment: paymentAmount,
        duePayment: totalCharge - paymentAmount,
        payments: [{
          amount: paymentAmount,
          paymentMethod: paymentMethods[userId],
          paymentDate: new Date().toISOString()
        }],
        startDate: returnItems[0]?.date,
        endDate: endDate,
      };

      const response = await axios.post(`${API_BASE_URL}/bills`, billData);
      
      setUserPayments(prev => ({
        ...prev,
        [userId]: {
          completed: paymentAmount,
          due: totalCharge - paymentAmount
        }
      }));

      setPaymentAmounts(prev => ({ ...prev, [userId]: { paid: 0, remaining: 0 } }));
      setPaymentMethods(prev => ({ ...prev, [userId]: null }));
      
      await fetchBills(userId);
      await fetchAllUserBillTotals();
      
      alert(`Bill ${response.data.billNumber} created successfully`);
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Error creating bill. Please try again.");
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, inventoryResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/users`),
        axios.get(`${API_BASE_URL}/inventory`),
      ]);

      await fetchAllUserBillTotals();

      const sortedUsers = usersResponse.data.sort((a, b) =>
        a.name.localeCompare(b.name, "gu-IN")
      );

      const initialRates = {};
      const initialServiceCharges = {};
      const initialPayments = {};
      sortedUsers.forEach((user) => {
        initialRates[user.userId] = 1;
        initialServiceCharges[user.userId] = 5;
        initialPayments[user.userId] = {
          completed: 0,
          due: 0
        };
      });

      setUserRates(initialRates);
      setServiceChargeRates(initialServiceCharges);
      setUserPayments(initialPayments);

      const returnItemsPromises = sortedUsers.map((user) =>
        axios.get(`${API_BASE_URL}/return-items?userId=${user.userId}`)
      );

      const returnItemsResponses = await Promise.all(returnItemsPromises);

      const returnItemsMap = {};
      const newNetAmountDue = {};

      returnItemsResponses.forEach((response, index) => {
        const userId = sortedUsers[index].userId;
        const items = response.data.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        returnItemsMap[userId] = items;
        newNetAmountDue[userId] = calculateNetAmountDue(userId, items);
      });

      const processedUsers = sortedUsers.map((user) => {
        const items = returnItemsMap[user.userId] || [];
        const { totalJ, totalU } = calculateTotals(items);
        return {
          ...user,
          jamaTotal: totalJ,
          udharTotal: totalU,
          currentBalance: totalU - totalJ,
        };
      });

      setUserData(processedUsers);
      setUserReturnItems(returnItemsMap);
      setTotalInventory(inventoryResponse.data);
      setNetAmountDue(newNetAmountDue);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please check your connection.");
      setIsLoading(false);
    }
  };

  const calculateTotals = (returnItems) => {
    const totalJ = returnItems
      .filter((item) => item.receiptNumber?.[1] === "J")
      .reduce(
        (sum, item) =>
          sum + (item.sizes?.reduce((s, size) => s + (size.total || 0), 0) || 0),
        0
      );

    const totalU = returnItems
      .filter((item) => item.receiptNumber?.[1] === "U")
      .reduce(
        (sum, item) =>
          sum + (item.sizes?.reduce((s, size) => s + (size.total || 0), 0) || 0),
        0
      );

    return { totalJ, totalU };
  };

  const handleUserSelect = (user) => {
    if (selectedUser?.userId === user.userId) {
      setSelectedUser(null);
      setReturnItems([]);
      return;
    }

    const items = userReturnItems[user.userId] || [];
    setSelectedUser(user);
    setReturnItems(items);
    fetchBills(user.userId);
  };

  const handleRateChange = (userId, newRate) => {
    setUserRates((prevRates) => ({
      ...prevRates,
      [userId]: Math.max(0, Number(newRate)),
    }));
  };

  const handleServiceChargeChange = (userId, newRate) => {
    setServiceChargeRates((prevRates) => ({
      ...prevRates,
      [userId]: Math.max(0, Number(newRate)),
    }));
  };

  const handleLastDateChange = (userId, dateString) => {
    setLastDates(prev => ({
      ...prev,
      [userId]: dateString
    }));
  };

  const handlePaymentMethodChange = (userId, method) => {
    setPaymentMethods(prev => ({
      ...prev,
      [userId]: method
    }));
  };

  const handlePaymentAmountChange = (userId, amount) => {
    const numAmount = parseFloat(amount) || 0;
    const totalCharge = calculateTotalCharge(userId);
    const previousPayments = userBillTotals[userId]?.completedPayment || 0;
    const remainingToPay = totalCharge - previousPayments;
    
    setPaymentAmounts(prev => ({
      ...prev,
      [userId]: {
        paid: numAmount,
        remaining: remainingToPay - numAmount
      }
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const calculateDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diffTime = end - start;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const calculateDetailedBillingPeriods = (items, userId, endDate = new Date()) => {
    if (!items.length) return [];
  
    const periods = [];
    const sortedItems = [...items].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    let runningStock = 0;
    let totalUdhar = 0;
    const dailyRate = userRates[userId] || 1;
  
    const adjustedEndDate = lastDates[userId] 
      ? new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1))
      : endDate;
  
    for (let i = 0; i < sortedItems.length; i++) {
      const currentItem = sortedItems[i];
      const nextItem = sortedItems[i + 1];
      const isUdhar = currentItem.receiptNumber?.[1] === "U";
      const stockChange =
        currentItem.sizes?.reduce((sum, size) => sum + (size.total || 0), 0) || 0;
  
      if (isUdhar) {
        runningStock += stockChange;
        totalUdhar += stockChange;
      } else {
        runningStock -= stockChange;
      }
  
      let displayDate;
      if (isUdhar) {
        displayDate = currentItem.date;
      } else {
        const nextDay = new Date(currentItem.date);
        nextDay.setDate(nextDay.getDate() + 1);
        displayDate = nextDay.toISOString().split("T")[0];
      }
  
      const nextDisplayDate = nextItem
        ? nextItem.receiptNumber?.[1] === "U"
          ? nextItem.date
          : new Date(new Date(nextItem.date).setDate(new Date(nextItem.date).getDate() + 1))
              .toISOString()
              .split("T")[0]
        : adjustedEndDate.toISOString().split("T")[0];
  
      const days = calculateDaysBetween(displayDate, nextDisplayDate);
  
      periods.push({
        date: currentItem.date,
        displayDate,
        stockChange: isUdhar ? +stockChange : -stockChange,
        runningStock,
        receiptNumber: currentItem.receiptNumber,
        days,
        charge: Math.abs(runningStock) * days * dailyRate,
        dailyRate,
        isUdhar,
      });
    }
  
    if (periods.length > 0) {
      const serviceChargeRate = serviceChargeRates[userId] || 5;
      periods.push({
        isServiceCharge: true,
        charge: totalUdhar * serviceChargeRate,
        totalUdhar,
        serviceChargeRate,
      });
    }
  
    return periods;
  };

  const calculateTotalCharge = (userId) => {
    const items = userReturnItems[userId] || [];
    const endDate = lastDates[userId] ? new Date(lastDates[userId]) : new Date();
    const periods = calculateDetailedBillingPeriods(items, userId, endDate);
    return periods.reduce((sum, period) => sum + period.charge, 0);
  };

  const BillHistory = ({ userId, onClose }) => {
    return (
      <div className="bill-history">
        <div className="bill-history-header">
          <h3>Bill History</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div className="bill-list">
          {bills.map(bill => (
            <div key={bill.billNumber} className="bill-item">
              <div className="bill-header">
                <span className="bill-number">{bill.billNumber}</span>
                <span className={`bill-status status-${bill.status}`}>
                  {bill.status.replace('_', ' ')}
                </span>
              </div>
              <div className="bill-details">
                <p>Date: {formatDate(bill.metadata?.createdAt)}</p>
                <p>Total Amount: ₹{bill.totalAmount.toFixed(2)}</p>
                <p>Paid Amount: ₹{bill.completedPayment.toFixed(2)}</p>
                <p>Due Amount: ₹{bill.duePayment.toFixed(2)}</p>
              </div>
              <div className="payment-history">
                <h4>Payment History</h4>
                {bill.payments.map((payment, index) => (
                  <div key={index} className="payment-item">
                    <span>{formatDate(payment.paymentDate)}</span>
                    <span>₹{payment.amount.toFixed(2)}</span>
                    <span className="payment-method">{payment.paymentMethod}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const renderBillingDetails = (user) => {
    if (!returnItems.length) return null;

    const endDate = lastDates[user.userId] 
      ? new Date(lastDates[user.userId])
      : new Date();
    
    const periods = calculateDetailedBillingPeriods(
      returnItems,
      user.userId,
      endDate
    );
    
    const totalCharge = periods.reduce((sum, period) => sum + period.charge, 0);
    const previousPayments = userBillTotals[user.userId]?.completedPayment || 0;
    const remainingToPay = totalCharge - previousPayments;
    const totalDays = periods.reduce((sum, period) => sum + (period.days || 0), 0);

    return (
      <tr>
        <td colSpan="8">
          <div className="billing-details">
            <div className="billing-header">
              <div className="rate-settings">
                <div className="rate-field">
                  <label>Daily Rate (₹):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={userRates[user.userId] || 1}
                    onChange={(e) => handleRateChange(user.userId, e.target.value)}
                    className="rate-input"
                  />
                </div>
                <div className="rate-field">
                  <label>Service Rate (₹):</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={serviceChargeRates[user.userId] || 5}
                    onChange={(e) => handleServiceChargeChange(user.userId, e.target.value)}
                    className="rate-input"
                  />
                </div>
                <div className="rate-field">
                  <label>Last Date:</label>
                  <input
                    type="date"
                    value={lastDates[user.userId] || ''}
                    onChange={(e) => handleLastDateChange(user.userId, e.target.value)}
                    className="date-input"
                  />
                </div>
                <button 
                  onClick={() => generatePDF(user.userId)}
                  className="pdf-button"
                >
                  Download PDF
                </button>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Stock Change</th>
                    <th>Running Stock</th>
                    <th>Days</th>
                    <th>Rate (₹)</th>
                    <th>Charge (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period, index) => {
                    if (period.isServiceCharge) {
                      return (
                        <tr key="service-charge" className="service-charge-row">
                          <td colSpan={4} className="text-right">
                            Service Charge (Total Udhar × Rate):
                          </td>
                          <td className="text-center">
                            {period.totalUdhar} × {period.serviceChargeRate}
                          </td>
                          <td className="text-right">{period.charge.toFixed(2)}</td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={index}
                        className={period.isUdhar ? "udhar-row" : "jama-row"}
                      >
                        <td>{formatDate(period.displayDate)}</td>
                        <td className="text-center">
                          <span className={period.isUdhar ? "text-red" : "text-green"}>
                            {period.stockChange}
                          </span>
                        </td>
                        <td className="text-center">{period.runningStock}</td>
                        <td className="text-center">
                          <div className="days-container">
                            <LuCalendarDays className="calendar-icon" />
                            {period.days}
                          </div>
                        </td>
                        <td className="text-center">{period.dailyRate}</td>
                        <td className="text-right">{period.charge.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                  <tr className="total-row">
                    <td colSpan={4} className="text-right">
                      Grand Total (Total Days: {totalDays}):
                    </td>
                    <td colSpan={2} className="text-right">
                      ₹{totalCharge.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="total-row net-total">
                    <td colSpan={4} className="text-right">
                      Previous Payments:
                    </td>
                    <td colSpan={2} className="text-right">
                      ₹{previousPayments.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="total-row net-total">
                    <td colSpan={4} className="text-right">
                      Net Amount Due:
                    </td>
                    <td colSpan={2} className="text-right">
                      ₹{remainingToPay.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="payment-section">
              <div className="payment-header">
                <h3>Payment Details</h3>
              </div>
              <div className="payment-inputs">
                <div className="payment-methods">
                  <label>
                    <input
                      type="radio"
                      name={`paymentMethod-${user.userId}`}
                      value="cash"
                      checked={paymentMethods[user.userId] === 'cash'}
                      onChange={() => handlePaymentMethodChange(user.userId, 'cash')}
                    /> Cash
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`paymentMethod-${user.userId}`}
                      value="online"
                      checked={paymentMethods[user.userId] === 'online'}
                      onChange={() => handlePaymentMethodChange(user.userId, 'online')}
                    /> Online
                  </label>
                </div>
                <div className="input-group">
                  <label>Payment Amount (₹):</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={paymentAmounts[user.userId]?.paid || 0}
                    onChange={(e) => handlePaymentAmountChange(user.userId, e.target.value)}
                    className="amount-input"
                  />
                </div>
                <div className="payment-summary">
                  <p>Total Bill Amount: ₹{totalCharge.toFixed(2)}</p>
                  <p>Previous Payments: ₹{previousPayments.toFixed(2)}</p>
                  <p>Current Payment: ₹{(paymentAmounts[user.userId]?.paid || 0).toFixed(2)}</p>
                  <p>Remaining Amount: ₹{(remainingToPay - (paymentAmounts[user.userId]?.paid || 0)).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => submitPayment(user.userId)}
                  className="submit-payment-btn"
                  disabled={!paymentMethods[user.userId] || !(paymentAmounts[user.userId]?.paid > 0)}
                >
                  Submit Payment
                </button>
              </div>
              <div className="payment-actions">
                <button
                  onClick={() => {
                    setShowBillHistory(true);
                    fetchBills(user.userId);
                  }}
                  className="view-history-btn"
                >
                  View Bill History
                </button>
              </div>

              {showBillHistory && (
                <BillHistory
                  userId={user.userId}
                  onClose={() => setShowBillHistory(false)}
                />
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const renderUserRow = (user) => {
    const billTotals = userBillTotals[user.userId] || { completedPayment: 0, duePayment: 0 };
    const netDue = netAmountDue[user.userId] || 0;
    
    return (
      <React.Fragment key={user.userId}>
        <tr
          onClick={() => handleUserSelect(user)}
          className={selectedUser?.userId === user.userId ? "selected" : ""}
        >
          <td>{user.userId}</td>
          <td>{user.name}</td>
          <td>{user.phone}</td>
          <td className="text-red">{user.udharTotal}</td>
          <td className="text-green">{user.jamaTotal}</td>
          <td className={user.currentBalance >= 0 ? "text-red" : "text-green"}>
            {user.currentBalance}
          </td>
          <td className="text-green">₹{billTotals.completedPayment.toFixed(2)}</td>
          <td className="text-red">₹{(netDue - billTotals.completedPayment).toFixed(2)}</td>
        </tr>
        {selectedUser?.userId === user.userId && renderBillingDetails(user)}
      </React.Fragment>
    );
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <Navbar>
        <div className="error-container">
          <div className="error-message">
            <strong>Error: </strong>
            <span>{error}</span>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="billing-system">
        <div className="container">
          <h1>બિલ</h1>

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>નામ</th>
                  <th>Phone</th>
                  <th>ઉધાર (U)</th>
                  <th>જમા (J)</th>
                  <th>બેલેન્સ</th>
                  <th>Completed Payment (₹)</th>
                  <th>Net Amount Due (₹)</th>
                </tr>
              </thead>
              <tbody>
                {userData.map(renderUserRow)}
              </tbody>
            </table>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            .billing-system {
              padding: 1rem;
            }

            .rate-settings {
              flex-direction: column;
              gap: 1rem;
            }

            .payment-methods {
              flex-direction: column;
              gap: 1rem;
            }

            .table-container {
              overflow-x: auto;
            }
        `}</style>
      </div>
    </Navbar>
  );
};

export default BillingSystem;