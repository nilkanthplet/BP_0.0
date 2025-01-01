import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from "../../components/header/Navbar";
import { Trash2, Edit, X } from 'lucide-react';

const EditReceiptRow = ({ receipt, onSave, onCancel }) => {
  const [editedReceipt, setEditedReceipt] = useState({
    ...receipt,
    date: receipt.date.split('T')[0],
    sizes: receipt.sizes.map(size => ({
      ...size,
      pisces: size.pisces || 0,
      total: size.total || 0
    }))
  });

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...editedReceipt.sizes];
    const numValue = parseInt(value) || 0;
    newSizes[index] = { ...newSizes[index], [field]: numValue };
    
    if (field === 'pisces') {
      newSizes[index].total = newSizes[index].pisces || 0;
    }
    
    const newTotal = newSizes.reduce((sum, size) => sum + (size.total || 0), 0);
    
    setEditedReceipt(prev => ({
      ...prev,
      sizes: newSizes,
      total: newTotal
    }));
  };

  // Mobile view layout
  const MobileView = () => (
    <td colSpan="100%" className="p-4 bg-blue-50">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Receipt: {editedReceipt.receiptNumber}</span>
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-blue-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={editedReceipt.date}
            onChange={(e) => setEditedReceipt(prev => ({ ...prev, date: e.target.value }))}
            className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-4">
          {editedReceipt.sizes.map((size, index) => (
            <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
              <label className="block text-sm font-medium mb-2">Size {size.size}</label>
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                min="0"
                value={size.pisces}
                onChange={(e) => handleSizeChange(index, 'pisces', e.target.value)}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Pieces"
              />
              <div className="text-sm text-gray-500 mt-1">Total: {size.total}</div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <input
            type="text"
            value={editedReceipt.notes || ''}
            onChange={(e) => setEditedReceipt(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Add notes"
          />
        </div>

        <div className="pt-4">
          <button
            onClick={() => onSave(editedReceipt)}
            className="w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </td>
  );

  // Desktop view layout
  const DesktopView = () => (
    <>
      <td className="p-2 md:p-4 align-middle">{editedReceipt.receiptNumber}</td>
      <td className="p-2 md:p-4 align-middle">
        <input
          type="date"
          value={editedReceipt.date}
          onChange={(e) => setEditedReceipt(prev => ({ ...prev, date: e.target.value }))}
          className="w-full md:w-auto rounded-md border bg-white px-2 md:px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </td>
      <td className="p-2 md:p-4 align-middle">{editedReceipt.total}</td>
      {editedReceipt.sizes.map((size, index) => (
        <td key={index} className="hidden md:table-cell p-2 md:p-4 align-middle">
          <div className="flex flex-col gap-2">
            <input
              type="number"
              min="0"
              value={size.pisces}
              onChange={(e) => handleSizeChange(index, 'pisces', e.target.value)}
              className="w-full rounded-md border bg-white px-2 md:px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Pieces"
            />
            <div className="text-sm text-gray-500">Total: {size.total}</div>
          </div>
        </td>
      ))}
      <td className="p-2 md:p-4 align-middle">
        <input
          type="text"
          value={editedReceipt.notes || ''}
          onChange={(e) => setEditedReceipt(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full rounded-md border bg-white px-2 md:px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Notes"
        />
      </td>
      <td className="p-2 md:p-4 align-middle">
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => onSave(editedReceipt)}
            className="px-2 md:px-4 py-1 md:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-2 md:px-4 py-1 md:py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </td>
    </>
  );

  return (
    <>
      <tr className="md:hidden">
        <MobileView />
      </tr>
      <tr className="hidden md:table-row">
        <DesktopView />
      </tr>
    </>
  );
};

const ClientData = () => {
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteReceiptConfirm, setShowDeleteReceiptConfirm] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState(null);
  const [expandedMobileView, setExpandedMobileView] = useState(null);

  const API_BASE_URL = 'http://54.161.153.204:5000';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users`);
      const sortedUsers = response.data.sort((a, b) => 
        a.name.localeCompare(b.name, 'gu-IN')
      );
      setUserData(sortedUsers);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please check your connection.");
      setIsLoading(false);
    }
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

  const handleDeleteReceipt = async (receiptNumber) => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/return-items/${receiptNumber}`);
      setReturnItems(prevItems => 
        prevItems.filter(item => item.receiptNumber !== receiptNumber)
      );
      setShowDeleteReceiptConfirm(false);
      setReceiptToDelete(null);
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting receipt:", error);
      setError("Failed to delete receipt. Please try again.");
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/users/${userData.userId}`,
        userData
      );
      setUserData(prevUsers =>
        prevUsers.map(user =>
          user.userId === userData.userId ? response.data : user
        )
      );
      if (selectedUser?.userId === userData.userId) {
        setSelectedUser(response.data);
      }
      setEditingUser(null);
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/users/${user.userId}`);
      setUserData(prevUsers => 
        prevUsers.filter(u => u.userId !== user.userId)
      );
      if (selectedUser?.userId === user.userId) {
        setSelectedUser(null);
        setReturnItems([]);
      }
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
      setIsLoading(false);
    }
  };

  const handleUpdateReceipt = async (receiptData) => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/return-items/${receiptData.receiptNumber}`,
        receiptData
      );
      setReturnItems(prevItems =>
        prevItems.map(item =>
          item.receiptNumber === receiptData.receiptNumber ? response.data : item
        )
      );
      setEditingReceipt(null);
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating receipt:", error);
      setError("Failed to update receipt. Please try again.");
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getRowBackgroundColor = (receiptNumber) => {
    if (!receiptNumber || receiptNumber.length < 2) return '';
    const secondChar = receiptNumber[1];
    switch(secondChar) {
      case 'J':
        return 'bg-blue-50 hover:bg-blue-100';
      case 'U':
        return 'bg-blue-50 hover:bg-blue-100';
      default:
        return 'hover:bg-gray-50';
    }
  };

  const handleRowClick = async (user) => {
    if (selectedUser && selectedUser.userId === user.userId) {
      setSelectedUser(null);
      setReturnItems([]);
      return;
    }
  
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/return-items?userId=${user.userId}`);
      const sortedItems = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setSelectedUser(user);
      setReturnItems(sortedItems);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user return items:", error);
      setError("Failed to fetch return items. Please try again.");
      setIsLoading(false);
    }
  };

  const getRowBackgroundColor1 = (receiptNumber) => {
    const type = receiptNumber[1];
    if (type === 'J') return 'bg-green-50';
    if (type === 'U') return 'bg-red-50';
    return '';
  };

  return (
    <Navbar>
      <div className="container bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen py-4 px-2 pt-20">
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-400 p-4 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold tracking-tight text-white">ખાતાવહી</h2>
          </div>
          
          {isLoading && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="text-base mt-4 text-center">Loading...</p>
    </div>
  </div>
)}

{error && (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
    <div className="flex items-center space-x-2">
      <span className="font-medium">Error!</span>
      <span>{error}</span>
      <button onClick={() => setError(null)} className="ml-auto">
        <X className="h-4 w-4" />
      </button>
    </div>
  </div>
)}

<div className="bg-white rounded-lg shadow-lg overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="hidden md:table-header-group">
        <tr className="bg-blue-500 text-white">
          <th className="h-12 px-4 text-left align-middle font-medium text-white">ID</th>
          <th className="h-12 px-4 text-left align-middle font-medium text-white">નામ</th>
          <th className="h-12 px-4 text-left align-middle font-medium text-white">સાઇડ</th>
          <th className="h-12 px-4 text-left align-middle font-medium text-white">મોબાઇલ</th>
          <th className="h-12 px-4 text-left align-middle font-medium text-white">Actions</th>
        </tr>
      </thead>
      <tbody>
        {userData.map((user) => (
          <React.Fragment key={user.userId}>
            <tr 
              onClick={() => handleRowClick(user)}
              className="block md:table-row border-b transition-colors hover:bg-blue-50 cursor-pointer"
            >
              <td className="flex md:table-cell items-center justify-between p-4">
                <div className="flex flex-col md:hidden">
                  <span className="font-medium text-blue-600">{user.name}</span>
                  <span className="text-sm text-gray-500">{user.phone || 'N/A'}</span>
                </div>
                <div className="hidden md:block">{user.userId}</div>
                <div className="flex md:hidden items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingUser(user);
                    }}
                    className="p-2 rounded-full hover:bg-blue-100 text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserToDelete(user);
                      setShowDeleteConfirm(true);
                    }}
                    className="p-2 rounded-full hover:bg-red-100 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
              <td className="hidden md:table-cell p-4">{user.name}</td>
              <td className="hidden md:table-cell p-4">{user.site || 'N/A'}</td>
              <td className="hidden md:table-cell p-4">{user.phone || 'N/A'}</td>
              <td className="hidden md:table-cell p-4">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete(user);
                      setShowDeleteConfirm(true);
                    }}
                    className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            {selectedUser?.userId === user.userId && (
              <tr>
                <td colSpan="5" className="p-0">
                  <div className="rounded-lg border-2 border-blue-200 bg-white m-2 shadow-lg">
                    <div className="p-4">
                      {/* User Info Section */}
                      <div className="flex flex-col gap-2 mb-4">
                        <h3 className="text-xl font-semibold text-blue-700">
                          {selectedUser.name}
                        </h3>
                        <span className="text-sm text-gray-600">
                          Mobile: {selectedUser.phone || 'N/A'}
                        </span>
                      </div>

                      {/* Stock Status Table */}
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse border border-blue-200">
                          <thead>
                            <tr className="bg-blue-50">
                              <th className="border border-blue-200 p-2 text-center" colSpan={returnItems[0]?.sizes?.length + 4}>
                                Size-wise Stock Status
                              </th>
                            </tr>
                            <tr className="bg-blue-50">
                              <th className="border border-blue-200 p-2">Type</th>
                              <th className="border border-blue-200 p-2">Udhar</th>
                              <th className="border border-blue-200 p-2">Jama</th>
                              <th className="border border-blue-200 p-2">Balance</th>
                              {returnItems[0]?.sizes?.map((size) => (
                                <th key={size.size} className="border border-blue-200 p-2">{size.size}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const stockBySize = calculateCurrentStockBySizes(returnItems);
                              const udharTotal = returnItems.reduce((sum, item) => 
                                item.receiptNumber[1] === 'U' ? sum + (item.total || 0) : sum, 0
                              );
                              const jamaTotal = returnItems.reduce((sum, item) => 
                                item.receiptNumber[1] === 'J' ? sum + (item.total || 0) : sum, 0
                              );
                              const balance = udharTotal - jamaTotal;
                              return (
                                <tr>
                                  <td className="border border-blue-200 p-2 font-medium">Current Stock</td>
                                  <td className="border border-blue-200 p-2 text-center text-red-600 font-medium">
                                    {udharTotal}
                                  </td>
                                  <td className="border border-blue-200 p-2 text-center text-green-600 font-medium">
                                    {jamaTotal}
                                  </td>
                                  <td className={`border border-blue-200 p-2 text-center font-medium ${
                                    balance > 0 ? 'text-red-600' : balance < 0 ? 'text-green-600' : ''
                                  }`}>
                                    {balance}
                                  </td>
                                  {returnItems[0]?.sizes?.map((size) => (
                                    <td key={size.size} className={`border border-blue-200 p-2 text-center ${
                                      stockBySize[size.size] > 0 ? 'text-blue-600' : 
                                      stockBySize[size.size] < 0 ? 'text-blue-600' : ''
                                    }`}>
                                      {stockBySize[size.size] || 0}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>

                      {/* Receipts Table */}
                      <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-full table-auto">
                          <thead>
                            <tr className="bg-blue-50">
                              <th className="h-10 px-2 md:px-4 text-left align-middle font-medium text-sm">Receipt</th>
                              <th className="h-10 px-2 md:px-4 text-left align-middle font-medium text-sm">Date</th>
                              <th className="h-10 px-2 md:px-4 text-left align-middle font-medium text-sm">Total</th>
                              {returnItems[0]?.sizes?.map((size) => (
                                <th key={size.size} className="h-10 px-2 md:px-4 text-left align-middle font-medium text-sm">
                                  {size.size}
                                </th>
                              ))}
                              <th className="h-10 px-2 md:px-4 text-left align-middle font-medium text-sm">Notes</th>
                              <th className="h-10 px-2 md:px-4 text-left align-middle font-medium text-sm">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {returnItems.map((item) => (
                              <tr key={item.receiptNumber} 
                                  className={`border-b ${getRowBackgroundColor1(item.receiptNumber)}`}>
                                {editingReceipt?.receiptNumber === item.receiptNumber ? (
                                  <EditReceiptRow
                                    receipt={item}
                                    onSave={handleUpdateReceipt}
                                    onCancel={() => setEditingReceipt(null)}
                                  />
                                ) : (
                                  <>
                                    <td className="p-2 md:p-4 font-medium text-blue-600 text-sm">{item.receiptNumber}</td>
                                    <td className="p-2 md:p-4 text-sm">{formatDate(item.date)}</td>
                                    <td className="p-2 md:p-4 text-sm">{item.total}</td>
                                    {item.sizes?.map((size) => (
                                      <td key={size.size} className="p-2 md:p-4 text-center text-sm">
                                        {size.total || '0'}
                                      </td>
                                    ))}
                                    <td className="p-2 md:p-4 text-sm">{item.notes || 'N/A'}</td>
                                    <td className="p-2 md:p-4">
                                      <div className="flex items-center space-x-1 md:space-x-2">
                                        <button
                                          onClick={() => setEditingReceipt(item)}
                                          className="p-1 md:p-2 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            setReceiptToDelete(item);
                                            setShowDeleteReceiptConfirm(true);
                                          }}
                                          className="p-1 md:p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
</div>

{/* Delete User Confirmation Modal */}
{showDeleteConfirm && (
  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
    <div className="rounded-lg bg-white p-6 shadow-xl max-w-md w-full">
      <h3 className="text-lg font-semibold mb-4 text-blue-700">Confirm Delete</h3>
      <p className="mb-2">Are you sure you want to delete user {userToDelete?.name}?</p>
      <p className="text-red-600 text-sm mb-4">
        This will also delete all associated receipts.
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => {
            setShowDeleteConfirm(false);
            setUserToDelete(null);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          onClick={() => handleDeleteUser(userToDelete)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

{/* Delete Receipt Confirmation Modal */}
          {showDeleteReceiptConfirm && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="rounded-lg bg-white p-6 shadow-xl max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4 text-blue-700">Confirm Delete</h3>
                <p className="mb-2">Are you sure you want to delete receipt #{receiptToDelete?.receiptNumber}?</p>
                <p className="text-red-600 text-sm mb-4">
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowDeleteReceiptConfirm(false);
                      setReceiptToDelete(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteReceipt(receiptToDelete.receiptNumber)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {editingUser && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="rounded-lg bg-white p-6 shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-blue-700">Edit User Details</h3>
                  <button 
                    onClick={() => setEditingUser(null)} 
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">User ID</label>
                    <input
                      type="text"
                      value={editingUser.userId}
                      disabled
                      className="w-full p-2 border rounded-md bg-gray-50 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Name *</label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2 border rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Site</label>
                    <input
                      type="text"
                      value={editingUser.site || ''}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, site: e.target.value }))}
                      className="w-full p-2 border rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={editingUser.phone || ''}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-2 border rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateUser(editingUser)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Navbar>
  );
};

export default ClientData;