import React, { useState, useEffect } from "react";
import axios from "axios";
import { LuTrash2, LuEditLuClipboardPen, LuX } from "react-icons/lu";
import Navbar from "../../components/header/Navbar";

// EditReceiptRow Component
const EditReceiptRow = ({ receipt, onSave, onCancel }) => {
  const [editedReceipt, setEditedReceipt] = useState({
    ...receipt,
    date: receipt.date.split("T")[0],
    sizes: receipt.sizes.map((size) => ({
      ...size,
      pisces: size.pisces || 0,
      total: size.total || 0,
    })),
  });

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...editedReceipt.sizes];
    const numValue = parseInt(value) || 0;
    newSizes[index] = { ...newSizes[index], [field]: numValue };

    // Recalculate total for this size
    if (field === "pisces") {
      newSizes[index].total = newSizes[index].pisces || 0;
    }

    // Calculate new total across all sizes
    const newTotal = newSizes.reduce((sum, size) => sum + (size.total || 0), 0);

    setEditedReceipt((prev) => ({
      ...prev,
      sizes: newSizes,
      total: newTotal,
    }));
  };

  const handleSave = () => {
    const updatedReceipt = {
      ...editedReceipt,
      userId: receipt.userId,
      name: receipt.name,
      site: receipt.site || "",
      phone: receipt.phone || "",
      sizes: editedReceipt.sizes.map((size) => ({
        size: size.size,
        pisces: parseInt(size.pisces) || 0,
        total: parseInt(size.total) || 0,
      })),
      total: parseInt(editedReceipt.total) || 0,
    };
    onSave(updatedReceipt);
  };

  return (
    <>
      <td className="border p-2 text-center">{editedReceipt.receiptNumber}</td>
      <td className="border p-2 text-center">
        <input
          type="date"
          value={editedReceipt.date}
          onChange={(e) =>
            setEditedReceipt((prev) => ({ ...prev, date: e.target.value }))
          }
          className="w-32 p-1 border rounded"
        />
      </td>
      <td className="border p-2 text-center">{editedReceipt.total}</td>
      {editedReceipt.sizes.map((size, index) => (
        <td key={index} className="border p-2">
          <div className="flex flex-col gap-1">
            <input
              type="number"
              min="0"
              value={size.pisces}
              onChange={(e) =>
                handleSizeChange(index, "pisces", e.target.value)
              }
              className="w-20 p-1 border rounded text-center"
              placeholder="Pieces"
            />
            <div className="text-sm text-gray-600">Total: {size.total}</div>
          </div>
        </td>
      ))}
      <td className="border p-2">
        <input
          type="text"
          value={editedReceipt.notes || ""}
          onChange={(e) =>
            setEditedReceipt((prev) => ({ ...prev, notes: e.target.value }))
          }
          className="w-full p-1 border rounded"
          placeholder="Notes"
        />
      </td>
      <td className="border p-2">
        <div className="flex justify-center space-x-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
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
    name: user.name || "",
    site: user.site || "",
    phone: user.phone || "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!editedUser.name.trim()) {
      newErrors.name = "Name is required";
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
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <LuX size={20} />
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
              onChange={(e) =>
                setEditedUser((prev) => ({ ...prev, name: e.target.value }))
              }
              className={`w-full p-2 border rounded ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Site</label>
            <input
              type="text"
              value={editedUser.site}
              onChange={(e) =>
                setEditedUser((prev) => ({ ...prev, site: e.target.value }))
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={editedUser.phone}
              onChange={(e) =>
                setEditedUser((prev) => ({ ...prev, phone: e.target.value }))
              }
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

// Main KhataWahi Component
const KhataWahi = () => {
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users`);
      const sortedUsers = response.data.sort((a, b) =>
        a.name.localeCompare(b.name, "gu-IN")
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

      setUserData((prevUsers) =>
        prevUsers.map((user) =>
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

      setUserData((prevUsers) =>
        prevUsers.filter((u) => u.userId !== user.userId)
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

      setReturnItems((prevItems) =>
        prevItems.filter((item) => item.receiptNumber !== receiptNumber)
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

      setReturnItems((prevItems) =>
        prevItems.map((item) =>
          item.receiptNumber === receiptData.receiptNumber
            ? response.data
            : item
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
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getRowBackgroundColor = (receiptNumber) => {
    if (!receiptNumber || receiptNumber.length < 2) return "";

    const secondChar = receiptNumber[1];
    switch (secondChar) {
      case "J":
        return "bg-green-100 hover:bg-green-200";
      case "U":
        return "bg-red-100 hover:bg-red-200";
      default:
        return "hover:bg-yellow-50";
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
      const response = await axios.get(
        `${API_BASE_URL}/return-items?userId=${user.userId}`
      );
      // Changed the sort order to show newest dates first (descending order)
      const sortedItems = response.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
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
    returnItems.forEach((item) => {
      const secondChar = item.receiptNumber?.[1];
      const itemTotal =
        item.sizes?.reduce((sum, size) => sum + (size.total || 0), 0) || 0;
      if (secondChar === "J") {
        currentStock -= itemTotal;
      } else if (secondChar === "U") {
        currentStock += itemTotal;
      }
    });
    return currentStock;
  };

  const calculateCurrentStockBySizes = (returnItems) => {
    const sizeStock = {};
    returnItems.forEach((item) => {
      const secondChar = item.receiptNumber?.[1];
      item.sizes?.forEach((size) => {
        if (!sizeStock[size.size]) {
          sizeStock[size.size] = 0;
        }
        const itemTotal = size.total || 0;
        if (secondChar === "J") {
          sizeStock[size.size] -= itemTotal;
        } else if (secondChar === "U") {
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
      .filter((item) => item.receiptNumber?.[1] === "U")
      .reduce((sum, item) => sum + item.total, 0);
    const totalJRows = returnItems
      .filter((item) => item.receiptNumber?.[1] === "J")
      .reduce((sum, item) => sum + item.total, 0);

    return (
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-12">
          <span className="text-blue-700">{selectedUser.name}</span>
          <span className="text-gray-600 text-base">
            Mobile: {selectedUser.phone}
          </span>
        </h3>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <td className="border p-2">
                <div className="text-center font-semibold">
                  Current Stock Status
                </div>
              </td>
              <td className="border p-2">
                <div className="flex flex-col space-y-2">
                  <div className="text-base font-semibold">
                    Jama (J):
                    <span className="text-green-600 ml-2">{totalJRows}</span>
                  </div>
                  <div className="text-base font-semibold">
                    Udhar (U):
                    <span className="text-red-600 ml-2">{totalURows}</span>
                  </div>
                </div>
              </td>
              <td className="border p-2">
                <div className="text-center font-semibold">
                  Total:
                  <span
                    className={`ml-2 ${
                      currentStock >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {currentStock}
                  </span>
                </div>
              </td>
              {returnItems[0].sizes?.map((size) => (
                <td key={size.size} className="border p-2">
                  <div className="text-center font-semibold">
                    <span
                      className={
                        currentStockBySizes[size.size] >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {currentStockBySizes[size.size] || 0}
                    </span>
                  </div>
                </td>
              ))}
            </tr>
            <tr className="bg-yellow-100">
              <th className="border p-2">Receipt Number</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Total</th>
              {returnItems[0].sizes?.map((size, index) => (
                <th key={index} className="border p-2">
                  {size.size}
                </th>
              ))}
              <th className="border p-2">Notes</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {returnItems.map((item) => (
              <tr
                key={item.receiptNumber}
                className={`${getRowBackgroundColor(
                  item.receiptNumber
                )} border-b`}
              >
                {editingReceipt?.receiptNumber === item.receiptNumber ? (
                  <EditReceiptRow
                    receipt={item}
                    onSave={handleUpdateReceipt}
                    onCancel={() => setEditingReceipt(null)}
                  />
                ) : (
                  <>
                    <td className="border p-2 text-center">
                      {item.receiptNumber}
                    </td>
                    <td className="border p-2 text-center">
                      {formatDate(item.date)}
                    </td>
                    <td className="border p-2 text-center">{item.total}</td>
                    {item.sizes?.map((size, index) => (
                      <td key={index} className="border p-2 text-center">
                        {size.total || "0"}
                      </td>
                    ))}
                    <td className="border p-2 text-center">
                      {item.notes || "N/A"}
                    </td>
                    <td className="border p-2 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => setEditingReceipt(item)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <LuCli size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteReceipt(item.receiptNumber)
                          }
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <LuTrash2 size={16} />
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
    );
  };

  return (
    <Navbar>
      <div className="container mx-auto p-8 bg-orange-100">
        <h2 className="text-2xl font-bold mb-4">ખાતાવહી</h2>

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <p className="text-lg">Loading...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <button
              className="absolute top-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
              <p>Are you sure you want to delete user {userToDelete?.name}?</p>
              <p className="text-red-600 text-sm mb-4">
                This will also delete all associated receipts.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(userToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">ID</th>
                <th className="border p-2">નામ</th>
                <th className="border p-2">સાઇડ</th>
                <th className="border p-2">મોબાઇલ</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userData.map((user) => (
                <React.Fragment key={user.userId}>
                  <tr
                    onClick={() => handleRowClick(user)}
                    className={`hover:bg-blue-100 transition-colors duration-200 cursor-pointer
                    ${
                      selectedUser?.userId === user.userId ? "bg-blue-200" : ""
                    }`}
                  >
                    <td className="border p-2 text-center">{user.userId}</td>
                    <td className="border p-2 text-center">{user.name}</td>
                    <td className="border p-2 text-center">
                      {user.site || "N/A"}
                    </td>
                    <td className="border p-2 text-center">
                      {user.phone || "N/A"}
                    </td>
                    <td
                      className="border p-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <LuEditLuClipboardPen size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <LuTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {selectedUser?.userId === user.userId && (
                    <tr>
                      <td colSpan="5" className="border p-0">
                        {renderReturnItemsTable()}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Navbar>
  );
};

export default KhataWahi;
