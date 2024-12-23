import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/header/Navbar";
import axios from "axios";
import { usePDF } from "react-to-pdf";
import SingleSelectionChecklist from "../../components/singleSelectionCheckList/SingleSelectionCheckList";
import rightImage1 from "../../assets/UdharReceiptTemplate.jpg";

const JamaChallan = () => {
  // Generate current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [userData, setUserData] = useState([]);
  const [, setReturnItems] = useState([]);
  const [formData, setFormData] = useState({
    receiptNumber: "RU-", // Initialize with required prefix
    date: getCurrentDate(),
    userId: "",
    name: "",
    site: "",
    phone: "",
    sizes: [
      { size: "2 X 3", pisces: "", mark: "", total: "" },
      { size: "21 X 3", pisces: "", mark: "", total: "" },
      { size: "18 X 3", pisces: "", mark: "", total: "" },
      { size: "15 X 3", pisces: "", mark: "", total: "" },
      { size: "12 X 3", pisces: "", mark: "", total: "" },
      { size: "9 X 3", pisces: "", mark: "", total: "" },
      { size: "પતરા", pisces: "", mark: "", total: "" },
      { size: "2 X 2", pisces: "", mark: "", total: "" },
      { size: "2 ફુટ", pisces: "", mark: "", total: "" },
    ],
    total: "",
    grandTotal: "",
    notes: "",
    selectedMarkOption: "",
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    userId: "",
    name: "",
    site: "",
    phone: "",
  });
  const { toPDF, targetRef } = usePDF({ filename: formData?.receiptNumber });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/users");
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users");
      }
    };

    const fetchReturnItems = async () => {
      try {
        const response = await axios.get("http://localhost:5000/return-items");
        setReturnItems(response.data);
      } catch (error) {
        console.error("Error fetching return items:", error);
        alert("Failed to fetch return items");
      }
    };

    fetchUsers();
    fetchReturnItems();
  }, []);

  // Modified handleInputChange to handle manual receipt number
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "receiptNumber") {
      // Ensure the RU- prefix is maintained
      const prefix = "RU-";
      const newValue = value.startsWith(prefix)
        ? value
        : prefix + value.replace(prefix, "");

      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name === "userId") {
      const filteredSuggestions = userData
        .filter(
          (user) =>
            user.userId.toLowerCase().includes(value.toLowerCase()) ||
            user.name.toLowerCase().includes(value.toLowerCase())
        )
        .map((user) => ({
          ...user,
          displayText: `${user.userId} - ${user.name}`,
        }))
        .slice(0, 5);

      setSuggestions(filteredSuggestions);
    }
  };

  const handleSuggestionSelect = (user) => {
    setFormData((prevState) => ({
      ...prevState,
      userId: user.userId,
      name: user.name,
      site: user.site || "",
      phone: user.phone || "",
    }));
    setSuggestions([]);
  };

  // Modified handleNewUserChange to properly handle phone input
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      // Only allow digits and limit to 10 characters
      const sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
      setNewUser((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));
    } else {
      setNewUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddNewUser = async () => {
    if (!newUser.userId || !newUser.name) {
      alert("User ID and Name are required!");
      return;
    }

    try {
      // Include the phone number in the request
      const response = await axios.post("http://localhost:5000/users", {
        ...newUser,
        phone: newUser.phone || "", // Ensure phone is included even if empty
      });

      setUserData((prev) => [...prev, response.data]);
      setShowNewUserModal(false);
      setNewUser({
        userId: "",
        name: "",
        site: "",
        phone: "",
      });

      alert("User Added Successfully!");
    } catch (error) {
      console.error("Error adding user:", error);
      alert(error.response?.data?.message || "Failed to add user");
    }
  };

  const handleSizeInputChange = (index, e) => {
    const { name, value } = e.target;

    setFormData((prevState) => {
      const updatedSizes = [...prevState.sizes];
      updatedSizes[index] = {
        ...updatedSizes[index],
        [name]: value,
      };

      const handleSizeChange = (index, field, value) => {
        const newSizes = [...formData.sizes];
        newSizes[index][field] = value;

        const newTotal = calculateGrandTotal(newSizes);

        setFormData((prev) => ({
          ...prev,
          sizes: newSizes,
          grandTotal: newTotal,
        }));
      };

      const total =
        (parseInt(updatedSizes[index].pisces) || 0) +
        (parseInt(updatedSizes[index].mark) || 0);
      updatedSizes[index].total = total.toString();

      const grandTotal = updatedSizes.reduce(
        (acc, curr) =>
          acc + (parseInt(curr.pisces) || 0) + (parseInt(curr.mark) || 0),
        0
      );

      return {
        ...prevState,
        sizes: updatedSizes,
        grandTotal: grandTotal.toString(),
        total: grandTotal.toString(),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData?.userId || !formData?.name) {
      alert("User ID and Name are required!");
      return;
    }

    // Prepare comprehensive submission data
    const submissionData = {
      receiptNumber: formData?.receiptNumber,
      date: new Date(formData?.date).toISOString(), // Format date properly
      userId: formData?.userId,
      name: formData?.name,
      site: formData?.site || "",
      phone: formData?.phone || "",
      sizes: formData?.sizes.map((size) => ({
        size: size.size,
        pisces: parseInt(size.pisces) || 0,
        mark: parseInt(size.mark) || 0,
        total: parseInt(size.total) || 0,
      })),
      total: parseInt(formData?.total) || 0,
      grandTotal: parseInt(formData?.grandTotal) || 0,
      notes: formData?.notes || "",
      metadata: {
        createdAt: new Date().toISOString(),
        fullReceiptDetails: JSON.stringify({
          receiptNumber: formData?.receiptNumber,
          items: formData?.sizes,
        }),
      },
      selectedMarkOption: formData?.selectedMarkOption,
    };

    try {
      // Log the data being sent
      console.log("Submitting data:", submissionData);

      const response = await axios.post(
        "http://localhost:5000/return-items",
        submissionData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Server response:", response.data);

      // Only proceed if we get a successful response
      if (response.data) {
        alert("Return Item Submitted Successfully!");
        toPDF();

        // Reset form (using the corrected version from above)
        setFormData({
          receiptNumber: generateReceiptNumber(),
          date: formData.date,
          userId: "",
          name: "",
          site: "",
          phone: "",
          sizes: [
            { size: "2 X 3", pisces: "", mark: "", total: "" },
            { size: "21 X 3", pisces: "", mark: "", total: "" },
            { size: "18 X 3", pisces: "", mark: "", total: "" },
            { size: "15 X 3", pisces: "", mark: "", total: "" },
            { size: "12 X 3", pisces: "", mark: "", total: "" },
            { size: "9 X 3", pisces: "", mark: "", total: "" },
            { size: "પતરા", pisces: "", mark: "", total: "" },
            { size: "2 X 2", pisces: "", mark: "", total: "" },
            { size: "2 ફુટ", pisces: "", mark: "", total: "" },
          ],
          total: "",
          grandTotal: "",
          notes: "",
          selectedMarkOption: "",
        });

        setReturnItems((prev) => [response.data, ...prev]);
      }
    } catch (error) {
      console.error("Error submitting return item:", error);
      alert(error.response?.data?.message || "Failed to submit return item");
    }
  };

  return (
    <Navbar>
      <div className="bg-purple-100 w-full min-screen overflow-auto flex flex-col justify-center items-center p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-yellow-100 border-2 border-red-600 w-[800px] p-6 rounded-lg relative"
        >
          {/* Header */}
          <div className="border-b-2 border-red-600 pb-4 flex justify-between items-center">
            <h1 className="text-red-600 text-2xl font-bold">ઉધાર ચલણ</h1>
            <button
              type="button"
              onClick={() => setShowNewUserModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Add New User
            </button>
          </div>
          {/* New User Modal */}
          {showNewUserModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-yellow-100 p-6 rounded-lg w-[500px]">
                <h2 className="text-red-600 text-xl font-bold mb-4">
                  Add New User
                </h2>
                <div className="mb-4">
                  <label className="block text-red-600 font-bold mb-2">
                    User ID*
                  </label>
                  <input
                    type="text"
                    name="userId"
                    value={newUser.userId}
                    onChange={handleNewUserChange}
                    className="w-full border-b-2 border-red-600 bg-yellow-100 text-red-600 outline-none"
                    placeholder="Enter User ID"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-red-600 font-bold mb-2">
                    Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleNewUserChange}
                    className="w-full border-b-2 border-red-600 bg-yellow-100 text-red-600 outline-none"
                    placeholder="Enter Name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-red-600 font-bold mb-2">
                    Site
                  </label>
                  <input
                    type="text"
                    name="site"
                    value={newUser.site}
                    onChange={handleNewUserChange}
                    className="w-full border-b-2 border-red-600 bg-yellow-100 text-red-600 outline-none"
                    placeholder="Enter Site"
                  />
                </div>
                <div className="mb-2">
                  <label className="text-red-600 font-bold">મોબાઇલ:</label>
                  <input
                    type="text"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleNewUserChange}
                    className="w-full border-b-2 border-red-600 bg-yellow-100 text-red-600 outline-none"
                    placeholder="Enter Phone Number"
                    maxLength={10}
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowNewUserModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewUser}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Add User
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Details Section */}
          <div className="mt-4 border-b-2 border-red-600 pb-4">
            <div className="flex justify-between mb-2">
              <div className="flex">
                <label className="text-red-600 font-bold mr-2">ચલણ નંબર:</label>
                <input
                  type="text"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={handleInputChange}
                  className="bg-yellow-100 text-red-600 border-b-2 border-red-600"
                  placeholder="RU-"
                />
              </div>

              <div className="flex">
                <label className="text-red-600 font-bold mr-2">તારીખ:</label>
                <input
                  type="date"
                  name="date"
                  value={formData?.date}
                  onChange={handleInputChange}
                  className=" bg-yellow-100 text-red-600"
                />
              </div>
            </div>

            <div className="mb-2 relative">
              <label className="text-red-600 font-bold">ID:</label>
              <input
                type="text"
                name="userId"
                value={formData?.userId}
                onChange={handleInputChange}
                className="border-b-2 border-red-600 outline-none bg-yellow-100 w-full text-red-600"
                placeholder="Enter User ID"
                required
              />
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-red-600 rounded-b-lg shadow-lg">
                  {suggestions.map((user, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionSelect(user)}
                      className="p-2 hover:bg-yellow-100 cursor-pointer"
                    >
                      {user.displayText}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-2">
              <label className="text-red-600 font-bold">નામ:</label>
              <input
                type="text"
                name="name"
                value={formData?.name}
                onChange={handleInputChange}
                className="border-b-2 border-red-600 outline-none bg-yellow-100 w-full text-red-600"
                placeholder="Enter Name"
                required
              />
            </div>

            <div className="mb-2">
              <label className="text-red-600 font-bold">સાઇડ:</label>
              <input
                type="text"
                name="site"
                value={formData?.site}
                onChange={handleInputChange}
                className="border-b-2 border-red-600 outline-none bg-yellow-100 w-full text-red-600"
                placeholder="Enter Site Name"
              />
            </div>

            <div className="mb-2">
              <label className="text-red-600 font-bold">મોબાઇલ:</label>
              <input
                type="text"
                name="phone"
                value={formData?.phone}
                onChange={handleInputChange}
                className="border-b-2 border-red-600 outline-none bg-yellow-100 w-full text-red-600"
                placeholder="Enter Phone Number"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex justify-center items-center mt-4">
            <table className="table-auto w-full border-collapse border-2 border-red-600">
              <thead>
                <tr>
                  <th className="border border-red-600 bg-red-600 text-white p-2">
                    સાઈઝ
                  </th>
                  <th className="border border-red-600 bg-red-600 text-white p-2">
                    કુલ
                  </th>
                  <th className="border border-red-600 bg-red-600 text-white p-2">
                    પ્લેટનંગ
                  </th>
                  <th className="border border-red-600 bg-red-600 text-white p-2">
                    {/* Render the Checklist Component */}
                    <SingleSelectionChecklist
                      formData={formData}
                      setFormData={setFormData}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData?.sizes.map((sizeItem, index) => (
                  <tr key={index}>
                    <td className="border border-red-600 p-2 text-red-600 text-center">
                      {sizeItem.size}
                    </td>
                    <td className="border border-red-600 p-2 text-red-600 font-bold text-center">
                      {(parseInt(sizeItem.pisces) || 0) +
                        (parseInt(sizeItem.mark) || 0)}
                    </td>
                    <td className="border border-red-600 p-2 text-center">
                      <input
                        type="text"
                        name="pisces"
                        value={sizeItem.pisces}
                        onChange={(e) => handleSizeInputChange(index, e)}
                        className="w-full bg-yellow-100 outline-none text-red-600"
                        placeholder="Enter Quantity"
                      />
                    </td>
                    <td className="border border-red-600 p-2 text-center">
                      <input
                        type="text"
                        name="mark"
                        value={sizeItem.mark}
                        onChange={(e) => handleSizeInputChange(index, e)}
                        className="w-full bg-yellow-100 outline-none text-red-600"
                        placeholder="Enter Marks"
                      />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="border border-red-600 p-2 text-red-600 font-bold text-center">
                    કુલ નંગ
                  </td>
                  <td className="border border-red-600 p-2 font-bold text-red-600 text-center">
                    {formData?.grandTotal}
                  </td>
                  <td className=""></td>
                  <td className=""></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes Section */}
          <div className="mt-4">
            <textarea
              name="notes"
              value={formData?.notes}
              onChange={handleInputChange}
              rows="4"
              placeholder="Additional Notes"
              className="w-full border border-red-600 bg-yellow-100 text-red-600 outline-none p-2"
            />
          </div>

          {/* Submit Button */}
          <div className="mt-4 text-center">
            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Submit Return
            </button>
          </div>
        </form>
        <div
          ref={targetRef}
          style={{
            margin: "20px auto",
            padding: "15px",
            width: "800px",
            boxShadow: "0px 0px 8px #ccc",
          }}
        >
          {/* Background Image */}
          <img src={rightImage1} alt="Receipt Background" className="w-full" />

          {/* Input Details */}
          <div
            style={{
              margin: "10px 0",
              // display: "flex",
              // flexWrap: "wrap",
              width: "550px",
            }}
          >
            {/* Receipt Number and Date */}
            <div className="absolute top-[1378px] ">
              <div className="ml-48 left-[200px] text-black-800">
                <strong>{formData?.receiptNumber}</strong>
              </div>
            </div>
            <div className="absolute top-[1378px] ">
              <div className="ml-[580px] text-black-800">
                <strong>
                  {formData?.date
                    ? new Date(formData.date)
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                        .split("/")
                        .join("-")
                    : ""}
                </strong>
              </div>
            </div>
            {/* Name and ID */}
            <div className="absolute top-[1426px] flex">
              <div className="ml-40 left-[155px] text-black-800 ">
                <strong style={{ fontSize: "20px" }}>{formData?.name}</strong>
              </div>
              <div className="absolute left-[626px] text-black-800">
                <strong style={{ fontSize: "20px" }}>{formData?.userId}</strong>
              </div>
            </div>

            <div className="absolute top-[1458px]">
              <div className="ml-40 left-[135px] text-blck-800">
                <strong style={{ fontSize: "20px" }}>{formData?.site}</strong>
              </div>
            </div>
            <div className="absolute top-[1514px]">
              <div className="ml-40 left-[135px] text-blck-800">
                <strong style={{ fontSize: "20px" }}>{formData?.phone}</strong>
              </div>
            </div>
            <div className="absolute top-[1560px]">
              <div className="absolute left-[380px] text-white">
                <strong style={{ fontSize: "20px" }}>
                  {formData?.selectedMarkOption}
                </strong>
              </div>
            </div>
          </div>

          <div className="absolute top-[1126px] left-[455px] w-[600px]">
            {/* Table Data */}
            <div className="absolute top-[480px] left-[310px] w-[600px]">
              {formData?.sizes.map((item, index) => (
                <div key={index} className="flex mb-[9px]">
                  <div className="w-[100px] text-center text-black-800">
                    <strong style={{ fontSize: "20px" }}>
                      {(parseInt(item.pisces) || 0) +
                        (parseInt(item.mark) || 0)}
                    </strong>
                  </div>
                  <div className="w-[100px] ml-[50px] text-center text-black-800">
                    <strong style={{ fontSize: "20px" }}>{item.mark}</strong>
                  </div>
                </div>
              ))}
              <div className="absolute top-[340px] left-[34px] text-black-800 font-bold">
                <strong style={{ fontSize: "25px" }}>
                  {formData?.grandTotal}
                </strong>
              </div>
              <div className="absolute top-[473px] left-[240px] text-black-800 font-bold">
                <strong style={{ fontSize: "20px" }}>
                  {formData?.grandTotal}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default JamaChallan;
