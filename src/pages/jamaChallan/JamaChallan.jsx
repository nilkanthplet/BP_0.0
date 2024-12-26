import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/header/Navbar";
import axios from "axios";
import { usePDF } from "react-to-pdf";
import SingleSelectionChecklist from "../../components/singleSelectionCheckList/SingleSelectionCheckList";
import rightImage1 from "../../assets/JamaReceiptTemplate.jpg";

const JamaChallan = () => {
  // Generate current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [userData, setUserData] = useState([]);
  const [, setReturnItems] = useState([]);
  const [formData, setFormData] = useState({
    receiptNumber: "RJ-", // Initialize with required prefix
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
        const response = await axios.get("http://54.161.153.204:5000/users");
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users");
      }
    };

    const fetchReturnItems = async () => {
      try {
        const response = await axios.get("http://54.161.153.204:5000/return-items");
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
      // Ensure the RJ- prefix is maintained
      const prefix = "RJ-";
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
      const response = await axios.post("http://54.161.153.204:5000//users", {
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
        "http://54.161.153.204:5000/return-items",
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
            <h1 className="text-red-600 text-2xl font-bold">જમા ચલણ</h1>
            <button
              type="button"
              onClick={() => setShowNewUserModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Add New User
            </button>
          </div>

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
                  placeholder="RJ-"
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
              width: "550px",
            }}
          >
            {/* Receipt Number and Date */}
            <div className="absolute top-[1320px] ">
              <div className="ml-48 left-[200px] text-black-800">
                <strong>{formData?.receiptNumber}</strong>
              </div>
            </div>
            <div className="absolute top-[1320px] ">
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
            <div className="absolute top-[1370px] flex">
              <div className="ml-40 left-[155px] text-black-800 ">
                <strong style={{ fontSize: "20px" }}>{formData?.name}</strong>
              </div>
              <div className="absolute left-[626px] text-black-800">
                <strong style={{ fontSize: "20px" }}>{formData?.userId}</strong>
              </div>
            </div>

            <div className="absolute top-[1403px]">
              <div className="ml-40 left-[135px] text-blck-800">
                <strong style={{ fontSize: "20px" }}>{formData?.site}</strong>
              </div>
            </div>
            <div className="absolute top-[1456px]">
              <div className="ml-40 left-[135px] text-blck-800">
                <strong style={{ fontSize: "20px" }}>{formData?.phone}</strong>
              </div>
            </div>
            <div className="absolute top-[1504px]">
              <div className="absolute left-[380px] text-white">
                <strong style={{ fontSize: "20px" }}>
                  {formData?.selectedMarkOption}
                </strong>
              </div>
            </div>
          </div>

          <div className="absolute top-[1070px] left-[480px] w-[600px]">
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


// {/* <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Header Card */}
//           <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Receipt Number */}
//               <div className="space-y-1">
//                 <label className="block text-sm font-medium text-gray-700">
//                   ચલણ નંબર
//                 </label>
//                 <input
//                   type="text"
//                   name="receiptNumber"
//                   value={formData.receiptNumber}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="RJ-"
//                 />
//               </div>

//               {/* Date */}
//               <div className="space-y-1">
//                 <label className="block text-sm font-medium text-gray-700">
//                   તારીખ
//                 </label>
//                 <input
//                   type="date"
//                   name="date"
//                   value={formData.date}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             {/* User Details */}
//             <div className="space-y-4">
//               {/* ID Field with Suggestions */}
//               <div className="relative">
//                 <label className="block text-sm font-medium text-gray-700">
//                   ID
//                 </label>
//                 <input
//                   type="text"
//                   name="userId"
//                   value={formData.userId}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter User ID"
//                   required
//                 />
//                 {suggestions.length > 0 && (
//                   <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
//                     {suggestions.map((user, index) => (
//                       <div
//                         key={index}
//                         onClick={() => handleSuggestionSelect(user)}
//                         className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                       >
//                         {user.displayText}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Name Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   નામ
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter Name"
//                   required
//                 />
//               </div>

//               {/* Site Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   સાઇડ
//                 </label>
//                 <input
//                   type="text"
//                   name="site"
//                   value={formData.site}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter Site Name"
//                 />
//               </div>

//               {/* Phone Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   મોબાઇલ
//                 </label>
//                 <input
//                   type="text"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter Phone Number"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Table Card */}
//           <div className="bg-white shadow-sm rounded-lg overflow-hidden">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     સાઈઝ
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     કુલ
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     પ્લેટનંગ
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     <div className="flex space-x-4">
//                       {["1", "2", "3", "4"].map((option) => (
//                         <label key={option} className="inline-flex items-center">
//                           <input
//                             type="radio"
//                             name="markOption"
//                             value={option}
//                             checked={formData.selectedMarkOption === option}
//                             onChange={(e) =>
//                               setFormData((prev) => ({
//                                 ...prev,
//                                 selectedMarkOption: e.target.value,
//                               }))
//                             }
//                             className="form-radio h-4 w-4 text-blue-600"
//                           />
//                           <span className="ml-2">{option}</span>
//                         </label>
//                       ))}
//                     </div>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {formData.sizes.map((sizeItem, index) => (
//                   <tr key={index}>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {sizeItem.size}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap font-medium">
//                       {(parseInt(sizeItem.pisces) || 0) +
//                         (parseInt(sizeItem.mark) || 0)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <input
//                         type="text"
//                         name="pisces"
//                         value={sizeItem.pisces}
//                         onChange={(e) => handleSizeInputChange(index, e)}
//                         className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter Quantity"
//                       />
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <input
//                         type="text"
//                         name="mark"
//                         value={sizeItem.mark}
//                         onChange={(e) => handleSizeInputChange(index, e)}
//                         className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter Marks"
//                       />
//                     </td>
//                   </tr>
//                 ))}
//                 <tr className="bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap font-medium">
//                     કુલ નંગ
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap font-medium">
//                     {formData.grandTotal}
//                   </td>
//                   <td></td>
//                   <td></td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           {/* Notes Card */}
//           <div className="bg-white shadow-sm rounded-lg p-6">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Additional Notes
//             </label>
//             <textarea
//               name="notes"
//               value={formData.notes}
//               onChange={handleInputChange}
//               rows="4"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter additional notes..."
//             />
//           </div>

//           {/* Submit Button */}
//           <div className="flex justify-center">
//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               Submit Return
//             </button>
//           </div>
//         </form> */}
