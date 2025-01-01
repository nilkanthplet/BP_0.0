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
    <div className="p-3 bg-white rounded-xl shadow-lg border border-purple-100">
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {allSizes.map(size => (
            <div key={size} className="bg-purple-50 p-3 rounded-lg">
              <label className="text-sm font-medium text-purple-800 block mb-1">Size {size}</label>
              <input
                type="number"
                value={editedInventory.sizeQuantities[size]}
                onChange={(e) => handleSizeChange(size, e)}
                className="w-full border border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-purple-100 space-y-3 sm:space-y-0">
          <div className="font-semibold text-purple-800">
            Total Inventory: {calculateTotal(editedInventory.sizeQuantities).toLocaleString()}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TableContainer = ({ children }) => (
  <div className="overflow-x-auto -mx-2 sm:mx-0">
    <div className="inline-block min-w-full align-middle px-2 sm:px-0">
      {children}
    </div>
  </div>
);

const StockCard = ({ title, value, textColor = "text-purple-800" }) => (
  <div className="bg-white p-3 rounded-xl shadow-md border border-purple-100">
    <h3 className="text-sm text-purple-600 mb-1">{title}</h3>
    <p className={`text-lg font-semibold ${textColor}`}>{value}</p>
  </div>
);

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
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
          <div className="w-full max-w-4xl">
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-purple-200 rounded-lg w-1/3"></div>
              <div className="h-64 bg-purple-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </Navbar>
    );
  }

  if (error) {
    return (
      <Navbar>
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
          <div className="w-full max-w-4xl">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
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
      <div className="container bg-gradient-to-br from-purple-50 to-purple-100 mx-auto py-4 px-2 pt-20 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-purple-400 p-4 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold tracking-tight text-white">રોજમેલ(સ્ટોક)</h2>
          </div>
          {isLoading && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-base mt-4 text-center">Loading...</p>
              </div>
            </div>
          )}
            {/* <h2 className="text-2xl font-bold text-purple-900"></h2> */}
            <button
              onClick={() => setIsEditingInventory(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center space-x-2 hover:bg-purple-700 transition-colors duration-200 text-sm"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Inventory</span>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <StockCard 
              title="Total Inventory"
              value={calculatedTotal.toLocaleString()}
            />
            <StockCard 
              title="Out Stock"
              value={summaries.totalBalance}
              textColor="text-red-600"
            />
            <StockCard 
              title="Remaining Stock"
              value={calculatedTotal - summaries.totalBalance}
              textColor="text-green-600"
            />
            <StockCard 
              title="Total Customers"
              value={userData.length}
            />
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
            <div className="p-4">
              {isEditingInventory ? (
                <InventoryEditor
                  inventory={totalInventory}
                  allSizes={allSizes}
                  onSave={handleEditInventory}
                  onCancel={() => setIsEditingInventory(false)}
                />
              ) : (
                <TableContainer>
                  <table className="min-w-full divide-y divide-purple-200">
                    <thead>
                      <tr className="bg-purple-50">
                        <th className="px-3 py-3 text-left text-xs font-semibold text-purple-800">વિગત</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-purple-800">કુલ સ્ટોક</th>
                        {allSizes.map(size => (
                          <th key={size} className="px-3 py-3 text-left text-xs font-semibold text-purple-800">{size}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100">
                      <tr>
                        <td className="px-3 py-3 text-sm text-purple-800">કુલ ઈન્વેન્ટરી</td>
                        <td className="px-3 py-3 font-semibold text-sm text-purple-900">
                          {calculatedTotal.toLocaleString()}
                        </td>
                        {allSizes.map(size => (
                          <td key={size} className="px-3 py-3 font-semibold text-sm text-purple-900">
                            {(totalInventory.sizes?.[size] || 1000).toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-3 py-3 text-sm text-purple-800">બહાર ગયેલ સ્ટોક</td>
                        <td className="px-3 py-3 font-semibold text-sm text-red-600">
                          {summaries.totalBalance}
                        </td>
                        {allSizes.map(size => (
                          <td key={size} className="px-3 py-3 font-semibold text-sm text-red-600">
                            {summaries.sizeTotals[size] || 0}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-purple-50">
                        <td className="px-3 py-3 font-bold text-sm text-purple-900">બાકી સ્ટોક</td>
                        <td className="px-3 py-3 font-bold text-sm text-purple-900">
                          {calculatedTotal - summaries.totalBalance}
                        </td>
                        {allSizes.map(size => (
                          <td key={size} className="px-3 py-3 font-bold text-sm text-purple-900">
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

          {/* Customer Data Table */}
          <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
            <div className="p-4">
              <TableContainer>
                <table className="min-w-full divide-y divide-purple-200">
                  <thead>
                    <tr className="bg-purple-50">
                      <td colSpan="2" className="px-3 py-3 text-center text-xs">
                        <span className="font-semibold text-purple-800">કુલ ગ્રાહકો: {userData.length}</span>
                      </td>
                      <td className="px-3 py-3 text-center text-xs">
                        <span className="text-red-600 font-semibold">{summaries.totalUdhar}</span>
                      </td>
                      <td className="px-3 py-3 text-center text-xs">
                        <span className="text-green-600 font-semibold">{summaries.totalJama}</span>
                      </td>
                      <td className="px-3 py-3 text-center text-xs">
                        <span className={`font-semibold ${summaries.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {summaries.totalBalance}
                        </span>
                      </td>
                      {allSizes.map(size => (
                        <td key={size} className="px-3 py-3 text-center text-xs">
                          <span className={`font-semibold ${summaries.sizeTotals[size] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {summaries.sizeTotals[size] || 0}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-purple-50">
                      <th className="px-3 py-3 text-left text-xs font-semibold text-purple-800">ID</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-purple-800">નામ</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-purple-800">ઉધાર (U)</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-purple-800">જમા (J)</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-purple-800">બેલેન્સ</th>
                      {allSizes.map(size => (
  <th key={size} className="px-3 py-3 text-left text-xs font-semibold text-purple-800">{size}</th>
))}
</tr>
</thead>
<tbody className="divide-y divide-purple-100">
{userData.map((user) => {
const returnItems = userReturnItems[user.userId] || [];
const currentStock = calculateCurrentStock(returnItems);
const currentStockBySizes = calculateCurrentStockBySizes(returnItems);
const { totalU, totalJ } = calculateTotals(returnItems);

return (
  <tr key={user.userId} className="hover:bg-purple-50 transition-colors duration-150">
    <td className="px-3 py-3 text-center text-xs whitespace-nowrap text-purple-800">
      {user.userId}
    </td>
    <td className="px-3 py-3 text-xs text-purple-800">
      {user.name}
    </td>
    <td className="px-3 py-3 text-center text-xs whitespace-nowrap text-red-600 font-medium">
      {totalU}
    </td>
    <td className="px-3 py-3 text-center text-xs whitespace-nowrap text-green-600 font-medium">
      {totalJ}
    </td>
    <td className="px-3 py-3 text-center text-xs whitespace-nowrap font-medium">
      <span className={currentStock >= 0 ? 'text-green-600' : 'text-red-600'}>
        {currentStock}
      </span>
    </td>
    {allSizes.map(size => (
      <td key={size} className="px-3 py-3 text-center text-xs whitespace-nowrap font-medium">
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
</div>
</Navbar>
);
};

export default Rojmel;