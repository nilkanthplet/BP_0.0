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
    <div className="p-2 sm:p-4 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {allSizes.map(size => (
            <div key={size} className="flex items-center space-x-2">
              <label className="text-sm sm:text-base">Size {size}:</label>
              <input
                type="number"
                value={editedInventory.sizeQuantities[size]}
                onChange={(e) => handleSizeChange(size, e)}
                className="border rounded px-2 py-1 w-20 sm:w-24 text-sm sm:text-base"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t space-y-2 sm:space-y-0">
          <div className="font-semibold text-sm sm:text-base">
            Total Inventory: {calculateTotal(editedInventory.sizeQuantities).toLocaleString()}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onCancel}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center space-x-1 text-sm sm:text-base"
            >
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center space-x-1 text-sm sm:text-base"
            >
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TableContainer = ({ children }) => (
  <div className="overflow-x-auto -mx-4 sm:mx-0">
    <div className="inline-block min-w-full align-middle px-4 sm:px-0">
      {children}
    </div>
  </div>
);

const Rojmel = () => {
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userReturnItems, setUserReturnItems] = useState({});
  const [totalInventory, setTotalInventory] = useState({});
  const [isEditingInventory, setIsEditingInventory] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

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
        <div className="flex justify-center items-center min-h-screen p-4">
          <div className="bg-white rounded-lg shadow-md w-full max-w-4xl">
            <div className="p-4 sm:p-6">
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
        <div className="flex justify-center items-center min-h-screen p-4">
          <div className="bg-white rounded-lg shadow-md w-full max-w-4xl">
            <div className="p-4 sm:p-6">
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
      <div className="container mx-auto py-4 md:py-8 px-2 md:px-4 pt-20">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold">રોજમેલ(સ્ટોક)</h2>
              <button
                onClick={() => setIsEditingInventory(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center space-x-1 text-sm sm:text-base"
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
              <TableContainer>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">વિગત</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">કુલ સ્ટોક</th>
                      {allSizes.map(size => (
                        <th key={size} className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">કુલ ઈન્વેન્ટરી</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-xs sm:text-sm">
                        {calculatedTotal.toLocaleString()}
                      </td>
                      {allSizes.map(size => (
                        <td key={size} className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-xs sm:text-sm">
                          {(totalInventory.sizes?.[size] || 1000).toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">બહાર ગયેલ સ્ટોક</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-red-600 text-xs sm:text-sm">
                        {summaries.totalBalance}
                      </td>
                      {allSizes.map(size => (
                        <td key={size} className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-red-600 text-xs sm:text-sm">
                          {summaries.sizeTotals[size] || 0}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-bold text-xs sm:text-sm">બાકી સ્ટોક</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-bold textxs sm:text-sm">
                        {calculatedTotal - summaries.totalBalance}
                      </td>
                      {allSizes.map(size => (
                        <td key={size} className="px-3 sm:px-6 py-2 sm:py-4 font-bold text-xs sm:text-sm">
                          {(totalInventory.sizes?.[size] || 1000) - (summaries.sizeTotals[size] || 0)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </TableContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 sm:p-6">
            <TableContainer>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <td colSpan="2" className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm">
                      <span className="font-semibold">કુલ ગ્રાહકો: {userData.length}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm">
                      <span className="text-red-600 font-semibold">
                        {summaries.totalUdhar}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm">
                      <span className="text-green-600 font-semibold">
                        {summaries.totalJama}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm">
                      <span className={`font-semibold ${summaries.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {summaries.totalBalance}
                      </span>
                    </td>
                    {allSizes.map(size => (
                      <td key={size} className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm">
                        <span className={`font-semibold ${summaries.sizeTotals[size] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {summaries.sizeTotals[size] || 0}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">ID</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">નામ</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">ઉધાર (U)</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">જમા (J)</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">બેલેન્સ</th>
                    {allSizes.map(size => (
                      <th key={size} className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">{size}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userData.map((user) => {
                    const returnItems = userReturnItems[user.userId] || [];
                    const currentStock = calculateCurrentStock(returnItems);
                    const currentStockBySizes = calculateCurrentStockBySizes(returnItems);
                    const { totalU, totalJ } = calculateTotals(returnItems);

                    return (
                      <tr key={user.userId} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-center text-xs sm:text-sm">{user.userId}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">{user.name}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-center text-red-600 font-semibold text-xs sm:text-sm">{totalU}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-center text-green-600 font-semibold text-xs sm:text-sm">{totalJ}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-center font-semibold text-xs sm:text-sm">
                          <span className={currentStock >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {currentStock}
                          </span>
                        </td>
                        {allSizes.map(size => (
                          <td key={size} className="px-3 sm:px-6 py-2 sm:py-4 text-center font-semibold text-xs sm:text-sm">
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
            </TableContainer>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default Rojmel;