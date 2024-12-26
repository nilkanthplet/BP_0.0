import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from "../../components/header/Navbar";
import { Edit2 } from 'lucide-react';

const InventoryEditor = ({ inventory, allSizes, onSave, onCancel }) => {
  const [editedInventory, setEditedInventory] = useState({
    sizeQuantities: allSizes.reduce((acc, size) => ({
      ...acc,
      [size]: inventory.sizes?.[size] || 1000
    }), {})
  });

  const calculateTotal = (quantities) => {
    return Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  };

  const handleSizeChange = (size, e) => {
    const value = parseInt(e.target.value) || 0;
    setEditedInventory(prev => ({
      ...prev,
      sizeQuantities: {
        ...prev.sizeQuantities,
        [size]: value
      }
    }));
  };

  const handleSubmit = () => {
    onSave({
      total: calculateTotal(editedInventory.sizeQuantities),
      sizes: editedInventory.sizeQuantities
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allSizes.map(size => (
            <div key={size} className="flex items-center space-x-2">
              <label>Size {size}:</label>
              <input
                type="number"
                value={editedInventory.sizeQuantities[size]}
                onChange={(e) => handleSizeChange(size, e)}
                className="border rounded px-2 py-1 w-24"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="font-semibold">
            Total Inventory: {calculateTotal(editedInventory.sizeQuantities).toLocaleString()}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center space-x-1"
            >
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center space-x-1"
            >
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Rojmel = () => {
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userReturnItems, setUserReturnItems] = useState({});
  const [totalInventory, setTotalInventory] = useState({});
  const [isEditingInventory, setIsEditingInventory] = useState(false);

  const API_BASE_URL = 'http://54.161.153.204:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersResponse, inventoryResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/users`),
          axios.get(`${API_BASE_URL}/inventory`)
        ]);
        
        const sortedUsers = usersResponse.data.sort((a, b) => 
          a.name.localeCompare(b.name, 'gu-IN')
        );

        const returnItemsPromises = sortedUsers.map(user => 
          axios.get(`${API_BASE_URL}/return-items?userId=${user.userId}`)
        );
        
        const returnItemsResponses = await Promise.all(returnItemsPromises);
        
        const returnItemsMap = {};
        returnItemsResponses.forEach((response, index) => {
          const userId = sortedUsers[index].userId;
          returnItemsMap[userId] = response.data.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
        });

        setUserData(sortedUsers);
        setUserReturnItems(returnItemsMap);
        setTotalInventory(inventoryResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please check your connection.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditInventory = async (updatedInventory) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/inventory`, updatedInventory);
      setTotalInventory(response.data);
      setIsEditingInventory(false);
    } catch (error) {
      console.error("Error updating inventory:", error);
      setError("Failed to update inventory. Please try again.");
    }
  };

  const calculateCurrentStock = (returnItems) => {
    let currentStock = 0;
    
    returnItems.forEach(item => {
      const secondChar = item.receiptNumber?.[1];
      const itemTotal = item.sizes?.reduce((sum, size) => sum + (size.total || 0), 0) || 0;
      
      if (secondChar === 'J') {
        currentStock -= itemTotal;
      } else if (secondChar === 'U') {
        currentStock += itemTotal;
      }
    });
    
    return currentStock;
  };

  const calculateCurrentStockBySizes = (returnItems) => {
    const sizeStock = {};
    
    returnItems.forEach(item => {
      const secondChar = item.receiptNumber?.[1];
      
      item.sizes?.forEach(size => {
        if (!sizeStock[size.size]) {
          sizeStock[size.size] = 0;
        }
        
        const itemTotal = size.total || 0;
        if (secondChar === 'J') {
          sizeStock[size.size] -= itemTotal;
        } else if (secondChar === 'U') {
          sizeStock[size.size] += itemTotal;
        }
      });
    });
    
    return sizeStock;
  };

  const calculateTotals = (returnItems) => {
    const totalU = returnItems
      .filter(item => item.receiptNumber?.[1] === 'U')
      .reduce((sum, item) => {
        const itemTotal = item.sizes?.reduce((sizeSum, size) => sizeSum + (size.total || 0), 0) || 0;
        return sum + itemTotal;
      }, 0);

    const totalJ = returnItems
      .filter(item => item.receiptNumber?.[1] === 'J')
      .reduce((sum, item) => {
        const itemTotal = item.sizes?.reduce((sizeSum, size) => sizeSum + (size.total || 0), 0) || 0;
        return sum + itemTotal;
      }, 0);

    return { totalU, totalJ };
  };

  const calculateColumnSummaries = () => {
    let totalJama = 0;
    let totalUdhar = 0;
    let totalBalance = 0;
    const sizeTotals = {};

    userData.forEach(user => {
      const returnItems = userReturnItems[user.userId] || [];
      const { totalU, totalJ } = calculateTotals(returnItems);
      const currentStock = calculateCurrentStock(returnItems);
      const sizeStocks = calculateCurrentStockBySizes(returnItems);

      totalJama += totalJ;
      totalUdhar += totalU;
      totalBalance += currentStock;

      Object.entries(sizeStocks).forEach(([size, stock]) => {
        sizeTotals[size] = (sizeTotals[size] || 0) + stock;
      });
    });

    return {
      totalJama,
      totalUdhar,
      totalBalance,
      sizeTotals
    };
  };

  if (isLoading) {
    return (
      <Navbar>
        <div className="flex justify-center items-center h-screen">
          <div className="bg-white rounded-lg shadow-md w-full max-w-4xl">
            <div className="p-6">
              <div className="space-y-4">
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
                <div className="h-64 w-full bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Navbar>
    );
  }

  if (error) {
    return (
      <Navbar>
        <div className="flex justify-center items-center h-screen">
          <div className="bg-white rounded-lg shadow-md w-full max-w-4xl">
            <div className="p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            </div>
          </div>
        </div>
      </Navbar>
    );
  }

  const allSizes = [...new Set(
    Object.values(userReturnItems)
      .flat()
      .flatMap(item => item.sizes?.map(size => size.size) || [])
  )].sort((a, b) => a - b);

  const summaries = calculateColumnSummaries();
  const calculatedTotal = Object.values(totalInventory.sizes || {}).reduce((sum, qty) => sum + qty, 0);

  return (
    <Navbar>
      <div className="container mx-auto p-8 space-y-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">રોજમેલ(સ્ટોક)</h2>
              <button
                onClick={() => setIsEditingInventory(true)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center space-x-1"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Inventory</span>
              </button>
            </div>

            {isEditingInventory ? (
              <InventoryEditor
                inventory={totalInventory}
                allSizes={allSizes}
                onSave={handleEditInventory}
                onCancel={() => setIsEditingInventory(false)}
              />
            ) : (
              <div className="rounded-lg overflow-hidden border">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left font-semibold">વિગત</th>
                      <th className="px-6 py-3 text-left font-semibold">કુલ સ્ટોક</th>
                      {allSizes.map(size => (
                        <th key={size} className="px-6 py-3 text-left font-semibold">{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-6 py-4">કુલ ઈન્વેન્ટરી</td>
                      <td className="px-6 py-4 font-semibold">
                        {calculatedTotal.toLocaleString()}
                      </td>
                      {allSizes.map(size => (
                        <td key={size} className="px-6 py-4 font-semibold">
                          {(totalInventory.sizes?.[size] || 1000).toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4">બહાર ગયેલ સ્ટોક</td>
                      <td className="px-6 py-4 font-semibold text-red-600">
                        {summaries.totalBalance}
                      </td>
                      {allSizes.map(size => (
                        <td key={size} className="px-6 py-4 font-semibold text-red-600">
                          {summaries.sizeTotals[size] || 0}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-bold">બાકી સ્ટોક</td>
                      <td className="px-6 py-4 font-bold">
                        {calculatedTotal - summaries.totalBalance}
                      </td>
                      {allSizes.map(size => (
                        <td key={size} className="px-6 py-4 font-bold">
                          {(totalInventory.sizes?.[size] || 1000) - (summaries.sizeTotals[size] || 0)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="rounded-lg overflow-hidden border">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <td colSpan="2" className="px-6 py-3 text-center">
                      <span className="font-semibold">કુલ ગ્રાહકો: {userData.length}</span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="text-red-600 font-semibold">
                        {summaries.totalUdhar}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="text-green-600 font-semibold">
                        {summaries.totalJama}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`font-semibold ${summaries.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {summaries.totalBalance}
                      </span>
                    </td>
                    {allSizes.map(size => (
                      <td key={size} className="px-6 py-3 text-center">
                        <span className={`font-semibold ${summaries.sizeTotals[size]>= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {summaries.sizeTotals[size] || 0}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">નામ</th>
                  <th className="px-6 py-3 text-left">ઉધાર (U)</th>
                  <th className="px-6 py-3 text-left">જમા (J)</th>
                  <th className="px-6 py-3 text-left">બેલેન્સ</th>
                  {allSizes.map(size => (
                    <th key={size} className="px-6 py-3 text-left">{size}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userData.map((user) => {
                  const returnItems = userReturnItems[user.userId] || [];
                  const currentStock = calculateCurrentStock(returnItems);
                  const currentStockBySizes = calculateCurrentStockBySizes(returnItems);
                  const { totalU, totalJ } = calculateTotals(returnItems);

                  return (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-center">{user.userId}</td>
                      <td className="px-6 py-4">{user.name}</td>
                      <td className="px-6 py-4 text-center text-red-600 font-semibold">{totalU}</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">{totalJ}</td>
                      <td className="px-6 py-4 text-center font-semibold">
                        <span className={currentStock >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {currentStock}
                        </span>
                      </td>
                      {allSizes.map(size => (
                        <td key={size} className="px-6 py-4 text-center font-semibold">
                          <span className={currentStockBySizes[size] >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {currentStockBySizes[size] || 0}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </Navbar>
  );
};

export default Rojmel;