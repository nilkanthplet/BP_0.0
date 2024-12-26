import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from "../../components/header/Navbar";
import { Trash2, Edit, X } from 'lucide-react';

// EditReceiptRow Component
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
    
    // Recalculate total for this size
    if (field === 'pisces') {
      newSizes[index].total = (newSizes[index].pisces || 0) ;
    }
    
    // Calculate new total across all sizes
    const newTotal = newSizes.reduce((sum, size) => sum + (size.total || 0), 0);
    
    setEditedReceipt(prev => ({
      ...prev,
      sizes: newSizes,
      total: newTotal
    }));
  };

  const handleSave = () => {
    const updatedReceipt = {
      ...editedReceipt,
      userId: receipt.userId,
      name: receipt.name,
      site: receipt.site || '',
      phone: receipt.phone || '',
      sizes: editedReceipt.sizes.map(size => ({
        size: size.size,
        pisces: parseInt(size.pisces) || 0,
        total: parseInt(size.total) || 0
      })),
      total: parseInt(editedReceipt.total) || 0
    };
    onSave(updatedReceipt);
  };

  return (
    <>
      <td className="p-4 align-middle">{editedReceipt.receiptNumber}</td>
      <td className="p-4 align-middle">
        <input
          type="date"
          value={editedReceipt.date}
          onChange={(e) => setEditedReceipt(prev => ({ ...prev, date: e.target.value }))}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </td>
      <td className="p-4 align-middle">{editedReceipt.total}</td>
      {editedReceipt.sizes.map((size, index) => (
        <td key={index} className="p-4 align-middle">
          <div className="flex flex-col gap-2">
            <input
              type="number"
              min="0"
              value={size.pisces}
              onChange={(e) => handleSizeChange(index, 'pisces', e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Pieces"
            />
            <div className="text-sm text-gray-500">Total: {size.total}</div>
          </div>
        </td>
      ))}
      <td className="p-4 align-middle">
        <input
          type="text"
          value={editedReceipt.notes || ''}
          onChange={(e) => setEditedReceipt(prev => ({ ...prev, notes: e.target.value }))}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Notes"
        />
      </td>
      <td className="p-4 align-middle">
        <div className="flex justify-center space-x-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 bg-green-600 hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </td>
    </>
  );
};

// EditUserModal Component
const EditUserModal = ({ user, onSave, onCancel }) => {
  const [editedUser, setEditedUser] = useState({
    userId: user.userId,
    name: user.name || '',
    site: user.site || '',
    phone: user.phone || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!editedUser.name.trim()) {
      newErrors.name = 'Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(editedUser);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Edit User Details</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <input
              type="text"
              value={editedUser.userId}
              disabled
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={editedUser.name}
              onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Site</label>
            <input
              type="text"
              value={editedUser.site}
              onChange={(e) => setEditedUser(prev => ({ ...prev, site: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={editedUser.phone}
              onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Main ClientData Component
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

  const handleDeleteReceipt = async (receiptNumber) => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/return-items/${receiptNumber}`);
      
      setReturnItems(prevItems => 
        prevItems.filter(item => item.receiptNumber !== receiptNumber)
      );
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting receipt:", error);
      setError("Failed to delete receipt. Please try again.");
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
        return 'bg-green-100 hover:bg-green-200';
      case 'U':
        return 'bg-red-100 hover:bg-red-200';
      default:
        return 'hover:bg-yellow-50';
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
      // Changed the sort order to show newest dates first (descending order)
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

  const renderReturnItemsTable = () => {
    if (!returnItems || returnItems.length === 0) {
      return (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No return items found for this user.</p>
        </div>
      );
    }

    const currentStock = calculateCurrentStock(returnItems);
    const currentStockBySizes = calculateCurrentStockBySizes(returnItems);
    const totalURows = returnItems
      .filter(item => item.receiptNumber?.[1] === 'U')
      .reduce((sum, item) => sum + item.total, 0);
    const totalJRows = returnItems
      .filter(item => item.receiptNumber?.[1] === 'J')
      .reduce((sum, item) => sum + item.total, 0);

    return (
      <div className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg bg-white">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit User Details</h3>
          <button onClick={onCancel} className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">User ID</label>
            <input
              type="text"
              value={editedUser.userId}
              disabled
              className="flex h-9 w-full rounded-md border border-input bg-gray-100 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Name *</label>
            <input
              type="text"
              value={editedUser.name}
              onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
              className={`flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.name ? 'border-red-500' : 'border-input'}`}
            />
            {errors.name && <p className="text-sm font-medium text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Site</label>
            <input
              type="text"
              value={editedUser.site}
              onChange={(e) => setEditedUser(prev => ({ ...prev, site: e.target.value }))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Phone</label>
            <input
              type="tel"
              value={editedUser.phone}
              onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
    );
  };

  return (
    <Navbar>
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">ખાતાવહી</h2>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <p className="text-lg">Loading...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="rounded-lg bg-white p-6 shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="mb-2">Are you sure you want to delete user {userToDelete?.name}?</p>
              <p className="text-red-600 text-sm mb-6">
                This will also delete all associated receipts.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(userToDelete)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white shadow hover:bg-red-700 h-9 px-4 py-2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
{/* Edit User Modal */}
{editingUser && (
            <EditUserModal
              user={editingUser}
              onSave={handleUpdateUser}
              onCancel={() => setEditingUser(null)}
            />
          )}

          {/* User List Table */}
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium">ID</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">નામ</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">સાઇડ</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">મોબાઇલ</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userData.map((user) => (
                  <React.Fragment key={user.userId}>
                    <tr 
                      onClick={() => handleRowClick(user)}
                      className={`border-b transition-colors hover:bg-muted/50 cursor-pointer
                        ${selectedUser?.userId === user.userId ? 'bg-muted' : ''}`}
                    >
                      <td className="p-4 align-middle">{user.userId}</td>
                      <td className="p-4 align-middle font-medium">{user.name}</td>
                      <td className="p-4 align-middle">{user.site || 'N/A'}</td>
                      <td className="p-4 align-middle">{user.phone || 'N/A'}</td>
                      <td className="p-4 align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-muted"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteConfirm(true);
                            }}
                            className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-muted"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {selectedUser?.userId === user.userId && (
                      <tr>
                        <td colSpan="5" className="p-0">
                          <div className="rounded-lg border bg-card m-4">
                            <div className="p-6">
                              <div className="flex items-center gap-6 mb-6">
                                <h3 className="text-2xl font-semibold text-blue-700">{selectedUser.name}</h3>
                                <span className="text-muted-foreground">
                                  Mobile: {selectedUser.phone}
                                </span>
                              </div>
                              
                              <div className="rounded-lg border">
                                <table className="w-full">
                                  <thead>
                                    <tr>
                                      <td className="border-b p-4">
                                        <div className="text-center font-semibold">Current Stock Status</div>
                                      </td>
                                      <td className="border-b p-4">
                                        <div className="space-y-2">
                                          <div className="font-medium">
                                            Udhar (U): 
                                            <span className="text-red-600 ml-2">
                                              {returnItems
                                                .filter(item => item.receiptNumber?.[1] === 'U')
                                                .reduce((sum, item) => sum + item.total, 0)}
                                            </span>
                                          </div>
                                          <div className="font-medium">
                                            Jama (J): 
                                            <span className="text-green-600 ml-2">
                                              {returnItems
                                                .filter(item => item.receiptNumber?.[1] === 'J')
                                                .reduce((sum, item) => sum + item.total, 0)}
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="border-b p-4">
                                        <div className="text-center font-medium">
                                          Total: 
                                          <span className={`ml-2 ${calculateCurrentStock(returnItems) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {calculateCurrentStock(returnItems)}
                                          </span>
                                        </div>
                                      </td>
                                      {returnItems[0]?.sizes?.map((size) => (
                                        <td key={size.size} className="border-b p-4">
                                          <div className="text-center font-medium">
                                            <span className={calculateCurrentStockBySizes(returnItems)[size.size] >= 0 ? 'text-green-600' : 'text-red-600'}>
                                              {calculateCurrentStockBySizes(returnItems)[size.size] || 0}
                                            </span>
                                          </div>
                                        </td>
                                      ))}
                                    </tr>
                                    <tr className="border-b bg-muted/50">
                                      <th className="h-10 px-4 text-left align-middle font-medium">Receipt Number</th>
                                      <th className="h-10 px-4 text-left align-middle font-medium">Date</th>
                                      <th className="h-10 px-4 text-left align-middle font-medium">Total</th>
                                      {returnItems[0]?.sizes?.map((size, index) => (
                                        <th key={index} className="h-10 px-4 text-left align-middle font-medium">{size.size}</th>
                                      ))}
                                      <th className="h-10 px-4 text-left align-middle font-medium">Notes</th>
                                      <th className="h-10 px-4 text-left align-middle font-medium">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {returnItems.map((item) => (
                                      <tr key={item.receiptNumber} 
                                          className={`border-b ${getRowBackgroundColor(item.receiptNumber)}`}>
                                        {editingReceipt?.receiptNumber === item.receiptNumber ? (
                                          <EditReceiptRow
                                            receipt={item}
                                            onSave={handleUpdateReceipt}
                                            onCancel={() => setEditingReceipt(null)}
                                          />
                                        ) : (
                                          <>
                                            <td className="p-4 align-middle">{item.receiptNumber}</td>
                                            <td className="p-4 align-middle">{formatDate(item.date)}</td>
                                            <td className="p-4 align-middle">{item.total}</td>
                                            {item.sizes?.map((size, index) => (
                                              <td key={index} className="p-4 align-middle text-center">
                                                {size.total || '0'}
                                              </td>
                                            ))}
                                            <td className="p-4 align-middle">{item.notes || 'N/A'}</td>
                                            <td className="p-4 align-middle">
                                              <div className="flex items-center justify-center space-x-2">
                                                <button
                                                  onClick={() => setEditingReceipt(item)}
                                                  className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-muted"
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteReceipt(item.receiptNumber)}
                                                  className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-muted"
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
      </div>
    </Navbar>
  );
};

export default ClientData;