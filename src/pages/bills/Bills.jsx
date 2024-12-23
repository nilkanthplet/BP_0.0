import React, { useState, useEffect } from "react";
import { LuCalendarDays } from "react-icons/lu";
import axios from "axios";
import Navbar from "../../components/header/Navbar"

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

  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, inventoryResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/users`),
        axios.get(`${API_BASE_URL}/inventory`),
      ]);

      const sortedUsers = usersResponse.data.sort((a, b) =>
        a.name.localeCompare(b.name, "gu-IN")
      );

      const initialRates = {};
      const initialServiceCharges = {};
      sortedUsers.forEach((user) => {
        initialRates[user.userId] = 1;
        initialServiceCharges[user.userId] = 5;
      });
      setUserRates(initialRates);
      setServiceChargeRates(initialServiceCharges);

      const returnItemsPromises = sortedUsers.map((user) =>
        axios.get(`${API_BASE_URL}/return-items?userId=${user.userId}`)
      );

      const returnItemsResponses = await Promise.all(returnItemsPromises);

      const returnItemsMap = {};
      returnItemsResponses.forEach((response, index) => {
        const userId = sortedUsers[index].userId;
        returnItemsMap[userId] = response.data.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
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
          sum +
          (item.sizes?.reduce((s, size) => s + (size.total || 0), 0) || 0),
        0
      );

    const totalU = returnItems
      .filter((item) => item.receiptNumber?.[1] === "U")
      .reduce(
        (sum, item) =>
          sum +
          (item.sizes?.reduce((s, size) => s + (size.total || 0), 0) || 0),
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

  const calculateDetailedBillingPeriods = (items, userId) => {
    if (!items.length) return [];

    const periods = [];
    const sortedItems = [...items].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    let runningStock = 0;
    let totalUdhar = 0;
    const dailyRate = userRates[userId] || 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedItems.length; i++) {
      const currentItem = sortedItems[i];
      const nextItem = sortedItems[i + 1];
      const isUdhar = currentItem.receiptNumber?.[1] === "U";
      const stockChange =
        currentItem.sizes?.reduce((sum, size) => sum + (size.total || 0), 0) ||
        0;

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
          : new Date(
              new Date(nextItem.date).setDate(
                new Date(nextItem.date).getDate() + 1
              )
            )
              .toISOString()
              .split("T")[0]
        : today.toISOString().split("T")[0];

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

  const renderBillingTable = () => {
    if (!selectedUser || !returnItems.length) return null;

    const periods = calculateDetailedBillingPeriods(
      returnItems,
      selectedUser.userId
    );
    const totalCharge = periods.reduce((sum, period) => sum + period.charge, 0);
    const totalDays = periods.reduce(
      (sum, period) => sum + (period.days || 0),
      0
    );

    return (
      <div className="billing-details">
        <div className="billing-header">
          <h2>Billing Details - {selectedUser.name}</h2>
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
                      <span
                        className={period.isUdhar ? "text-red" : "text-green"}
                      >
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
            </tbody>
          </table>
        </div>
      </div>
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
          <h1>Billing Management</h1>

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>નામ</th>
                  <th>ઉધાર (U)</th>
                  <th>જમા (J)</th>
                  <th>બેલેન્સ</th>
                  <th>Daily Rate (₹)</th>
                  <th>Service Rate (₹)</th>
                </tr>
              </thead>
              <tbody>
                {userData.map((user) => (
                  <tr
                    key={user.userId}
                    onClick={() => handleUserSelect(user)}
                    className={
                      selectedUser?.userId === user.userId ? "selected" : ""
                    }
                  >
                    <td>{user.userId}</td>
                    <td>{user.name}</td>
                    <td className="text-red">{user.udharTotal}</td>
                    <td className="text-green">{user.jamaTotal}</td>
                    <td
                      className={
                        user.currentBalance >= 0 ? "text-red" : "text-green"
                      }
                    >
                      {user.currentBalance}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={userRates[user.userId] || 1}
                        onChange={(e) =>
                          handleRateChange(user.userId, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="rate-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={serviceChargeRates[user.userId] || 5}
                        onChange={(e) =>
                          handleServiceChargeChange(user.userId, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="rate-input"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderBillingTable()}
        </div>

        <style jsx>{`
          .billing-system {
            min-height: 100vh;
            background-color: #f3f4f6;
            padding: 2rem;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
          }

          h1 {
            font-size: 2rem;
            font-weight: bold;
            color: #111827;
            margin-bottom: 2rem;
          }

          .users-table,
          .billing-details {
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
            padding: 1.5rem;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }

          th {
            font-weight: 600;
            color: #374151;
          }

          tr:hover {
            background-color: #f9fafb;
          }

          tr.selected {
            background-color: #e5edff;
          }

          .text-red {
            color: #dc2626;
          }

          .text-green {
            color: #059669;
          }

          .rate-input {
            width: 80px;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            outline: none;
          }

          .rate-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
          }

          .billing-header {
            margin-bottom: 1.5rem;
          }

          .billing-header h2 {
            font-size: 1.5rem;
            font-weight: bold;
            color: #111827;
          }

          .table-container {
            overflow-x: auto;
          }

          .udhar-row {
            background-color: #fef2f2;
          }

          .jama-row {
            background-color: #f0fdf4;
          }

          .service-charge-row {
            background-color: #fefce8;
            font-weight: 500;
          }

          .total-row {
            background-color: #f3f4f6;
            font-weight: bold;
          }

          .days-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .calendar-icon {
            width: 1rem;
            height: 1rem;
            color: #6b7280;
          }

          .text-center {
            text-align: center;
          }

          .text-right {
            text-align: right;
          }

          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-size: 1.25rem;
            color: #6b7280;
          }

          .error-container {
            padding: 2rem;
          }

          .error-message {
            background-color: #fee2e2;
            border: 1px solid #ef4444;
            color: #b91c1c;
            padding: 1rem;
            border-radius: 0.5rem;
          }

          @media (max-width: 768px) {
            .billing-system {
              padding: 1rem;
            }

            .users-table,
            .billing-details {
              padding: 1rem;
            }

            .rate-input {
              width: 60px;
            }

            th,
            td {
              padding: 0.5rem;
              font-size: 0.875rem;
            }

            .billing-header h2 {
              font-size: 1.25rem;
            }
          }
        `}</style>
      </div>
    </Navbar>
  );
};

export default BillingSystem;
