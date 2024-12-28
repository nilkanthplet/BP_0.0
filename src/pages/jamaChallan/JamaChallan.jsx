import React, { useState, useEffect } from "react";
import Navbar from "../../components/header/Navbar";
import axios from "axios";
import html2pdf from 'html2pdf.js';
import SingleSelectionChecklist from "../../components/singleSelectionCheckList/SingleSelectionCheckList";
import rightImage1 from "../../assets/JamaReceiptTemplate.jpg";

const JamaChallan = () => {
  // Generate current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).split('/').join('-');
  };

  const [userData, setUserData] = useState([]);
  const [returnItems, setReturnItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    receiptNumber: "RJ-",
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

  const [newUser, setNewUser] = useState({
    userId: "",
    name: "",
    site: "",
    phone: "",
  });

  const generatePDF = async () => {
    try {
      // Create the HTML content for the receipt
      const content = `
        <html>
          <head>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;700&display=swap');
              body {
                font-family: 'Noto Sans Gujarati', sans-serif;
                margin: 0;
                padding: 0;
              }
              .container {
                position: relative;
                width: 210mm; /* A4 width */
                height: 297mm; /* A4 height */
                overflow: hidden; /* Ensure content doesn't overflow */
                box-sizing: border-box;
                padding: 10mm; /* Add some padding for aesthetics */
              }
              .receipt-header {
                text-align: center;
                margin-bottom: 20px;
              }
              .user-details {
                margin-bottom: 20px;
              }
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              .items-table th, .items-table td {
                padding: 8px;
                text-align: center;
              }
              .watermark {
                position: absolute;
                top: 30px;
                right : 0px;
                width: 100%;
                height: 95%;
                z-index: -1;
              }
              .watermark img {
                width: 100%;
                height: 100%;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="watermark">
                <img src="${rightImage1}" alt="Watermark">
              </div>
              <div>
                <p style="position: absolute; top: 260px; left: 165px; font-weight: bold; font-size: 1rem;" >${formData.receiptNumber}</p>
                <p style="position: absolute; top: 260px; left: 570px; font-weight: bold; font-size: 1rem;" >${formatDate(formData.date)}</p>
              </div>
              <div class="user-details">
                <p style="position: absolute; top: 312px; left: 615px; font-weight: bold; font-size: 1.2rem;" >${formData.userId}</p>
                <p style="position: absolute; top: 312px; left: 145px; font-weight: bold; font-size: 1.2rem;" >${formData.name}</p>
                <p style="position: absolute; top: 342px; left: 145px; font-weight: bold; font-size: 1.2rem;" >${formData.site}</p>
                <p style="position: absolute; top: 400px; left: 145px; font-weight: bold; font-size: 1.2rem;" >${formData.phone}</p>
              </div>
                <p style="position: absolute; top: 490px; left: 240px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[0]?.total || "&nbsp;"}</p>
                <p style="position: absolute; top: 530px; left: 240px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[1]?.total || "&nbsp;"}</p>
                <p style="position: absolute; top: 570px; left: 240px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[2]?.total || "&nbsp;"}</p>
                <p style="position: absolute; top: 610px; left: 240px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[3]?.total || "&nbsp;"}</p>
                <p style="position: absolute; top: 650px; left: 240px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[4]?.total || "&nbsp;"}</p>
                <p style="position: absolute; top: 610px; left: 240px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[3]?.total || "&nbsp;"}</p>
                <p style="position: absolute; top: 610px; left: 240px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[3]?.total || "&nbsp;"}</p>
                <p style="position: absolute; top: 690px; left: 240px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[5]?.total || "&nbsp;"}</p>
                <p style="position: absolute; top: 730px; left: 240px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[6]?.total || "&nbsp;"}</p>
                <p style="position: absolute; top: 770px; left: 240px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[7]?.total || "&nbsp;"}</p>
                <p style="position: absolute; top: 810px; left: 240px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[8]?.total || "&nbsp;"}</p>
                <p style="position: absolute; top: 490px; left: 400px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[0]?.mark || "&nbsp;"}</p>
                <p style="position: absolute; top: 530px; left: 400px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[1]?.mark || "&nbsp;"}</p>
                <p style="position: absolute; top: 570px; left: 400px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[2]?.mark || "&nbsp;"}</p>
                <p style="position: absolute; top: 610px; left: 400px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[3]?.mark || "&nbsp;"}</p>
                <p style="position: absolute; top: 650px; left: 400px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[4]?.mark || "&nbsp;"}</p>
                <p style="position: absolute; top: 610px; left: 400px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[3]?.mark || "&nbsp;"}</p>
                <p style="position: absolute; top: 610px; left: 400px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[3]?.mark || "&nbsp;"}</p>
                <p style="position: absolute; top: 690px; left: 400px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[5]?.mark || "&nbsp;"}</p>
                <p style="position: absolute; top: 730px; left: 400px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[6]?.mark || "&nbsp;"}</p>
                <p style="position: absolute; top: 770px; left: 400px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[7]?.mark || "&nbsp;"}</p>
                <p style="position: absolute; top: 810px; left: 400px; font-weight: bold; font-size: 1.2rem; color: black;">${formData.sizes[8]?.mark || "&nbsp;"}</p>
                <p style="position: absolute; top: 443px; left: 390px; font-weight: bold; font-size: 1.4rem; color: white;">${formData.selectedMarkOption}</p>
                <p style="position: absolute; top: 845px; left: 240px; font-weight: bold; font-size: 1.2rem;">${formData.grandTotal}</p>
                <p style="position: absolute; top: 982px; left: 445px; font-weight: bold; font-size: 1.2rem;">${formData.grandTotal}</p>
          </body>
        </html>
      `;
  
      // Create a temporary container
      const container = document.createElement('div');
      container.innerHTML = content;
      document.body.appendChild(container);
  
      // Configure PDF options
      const options = {
        margin: [0, 0, 0, 0],
        filename: `${formData.receiptNumber}_${formatDate(formData.date)}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2.5, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
  
      // Generate PDF
      await html2pdf().set(options).from(container).save();
  
      // Clean up
      document.body.removeChild(container);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Error generating PDF. Please try again.');
    }
  };

  const apiCall = async (method, url, data = null) => {
    try {
      const response = await axios({
        method,
        url: `http://54.161.153.204:5000${url}`,
        data,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`API Error (${url}):`, error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [users, items] = await Promise.all([
          apiCall('get', '/users'),
          apiCall('get', '/return-items')
        ]);
        setUserData(users);
        setReturnItems(items);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchInitialData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "receiptNumber") {
      const prefix = "RJ-";
      const newValue = value.startsWith(prefix)
        ? value
        : prefix + value.replace(prefix, "");

      setFormData(prev => ({
        ...prev,
        [name]: newValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name === "userId") {
      const filteredSuggestions = userData
        .filter(user => 
          user.userId.toLowerCase().includes(value.toLowerCase()) ||
          user.name.toLowerCase().includes(value.toLowerCase())
        )
        .map(user => ({
          ...user,
          displayText: `${user.userId} - ${user.name}`,
        }))
        .slice(0, 5);

      setSuggestions(filteredSuggestions);
    }
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
      setNewUser(prev => ({
        ...prev,
        [name]: sanitizedValue,
      }));
    } else {
      setNewUser(prev => ({
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
      const response = await apiCall('post', '/users', newUser);
      setUserData(prev => [...prev, response]);
      setShowNewUserModal(false);
      setNewUser({
        userId: "",
        name: "",
        site: "",
        phone: "",
      });
      alert("User Added Successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSuggestionSelect = (user) => {
    setFormData(prev => ({
      ...prev,
      userId: user.userId,
      name: user.name,
      site: user.site || "",
      phone: user.phone || "",
    }));
    setSuggestions([]);
  };

  const handleSizeInputChange = (index, e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');

    setFormData(prev => {
      const updatedSizes = [...prev.sizes];
      updatedSizes[index] = {
        ...updatedSizes[index],
        [name]: numericValue,
      };

      const total = (parseInt(updatedSizes[index].pisces) || 0) +
                   (parseInt(updatedSizes[index].mark) || 0);
      updatedSizes[index].total = total.toString();

      const grandTotal = updatedSizes.reduce((acc, curr) =>
        acc + (parseInt(curr.pisces) || 0) + (parseInt(curr.mark) || 0), 0
      );

      return {
        ...prev,
        sizes: updatedSizes,
        grandTotal: grandTotal.toString(),
        total: grandTotal.toString(),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.name) {
      alert("User ID and Name are required!");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submissionData = {
        receiptNumber: formData.receiptNumber,
        date: new Date(formData.date).toISOString(),
        userId: formData.userId,
        name: formData.name,
        site: formData.site || "",
        phone: formData.phone || "",
        sizes: formData.sizes.map(size => ({
          size: size.size,
          pisces: parseInt(size.pisces) || 0,
          mark: parseInt(size.mark) || 0,
          total: parseInt(size.total) || 0,
        })),
        total: parseInt(formData.total) || 0,
        grandTotal: parseInt(formData.grandTotal) || 0,
        notes: formData.notes || "",
        selectedMarkOption: formData.selectedMarkOption,
        metadata: {
          createdAt: new Date().toISOString(),
        },
      };

      // First submit the data
      const response = await apiCall('post', '/return-items', submissionData);
      
      // Then generate the PDF
      await generatePDF();
      
      alert("Return Item Submitted Successfully!");

      // Reset form after successful submission
      setFormData(prev => ({
        ...prev,
        receiptNumber: `RJ-${Date.now()}`,
        userId: "",
        name: "",
        site: "",
        phone: "",
        sizes: prev.sizes.map(size => ({
          ...size,
          pisces: "",
          mark: "",
          total: ""
        })),
        total: "",
        grandTotal: "",
        notes: "",
        selectedMarkOption: "",
      }));

      setReturnItems(prev => [response, ...prev]);
    } catch (error) {
      setError(error.message);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Navbar>
      <div className="bg-purple-100 w-full min-h-screen p-4 md:p-6 pt-20">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mx-auto max-w-[800px]">
            {error}
          </div>
        )}
  
        <form
          onSubmit={handleSubmit}
          className="bg-yellow-100 border-2 border-red-600 w-full max-w-[800px] p-4 md:p-6 rounded-lg relative mx-auto"
        >
          {/* Header */}
          <div className="border-b-2 border-red-600 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-red-600 text-xl md:text-2xl font-bold">જમા ચલણ</h1>
            <button
              type="button"
              onClick={() => setShowNewUserModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full md:w-auto"
            >
              Add New User
            </button>
          </div>
  
          {/* Details Section */}
          <div className="mt-4 border-b-2 border-red-600 pb-4 space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                <label className="text-red-600 font-bold">ચલણ નંબર:</label>
                <input
                  type="text"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={handleInputChange}
                  className="bg-yellow-100 text-red-600 border-b-2 border-red-600 w-full md:w-auto"
                  placeholder="RJ-"
                />
              </div>
  
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                <label className="text-red-600 font-bold">તારીખ:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="bg-yellow-100 text-red-600 w-full md:w-auto"
                />
              </div>
            </div>
  
            {/* User Details Fields */}
            <div className="space-y-4">
              <div className="relative">
                <label className="text-red-600 font-bold block mb-1">ID:</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
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
  
              {/* Other input fields */}
              {['name', 'site', 'phone'].map((field) => (
                <div key={field}>
                  <label className="text-red-600 font-bold block mb-1">
                    {field === 'name' ? 'નામ:' : field === 'site' ? 'સાઇડ:' : 'મોબાઇલ:'}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="border-b-2 border-red-600 outline-none bg-yellow-100 w-full text-red-600"
                    placeholder={`Enter ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                    required={field === 'name'}
                  />
                </div>
              ))}
            </div>
          </div>
  
          {/* Table Section */}
          <div className="overflow-x-auto mt-4">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full border-collapse border-2 border-red-600">
                <thead>
                  <tr>
                    <th className="border border-red-600 bg-red-600 text-white p-2 text-sm md:text-base">
                      સાઈઝ
                    </th>
                    <th className="border border-red-600 bg-red-600 text-white p-2 text-sm md:text-base">
                      કુલ
                    </th>
                    <th className="border border-red-600 bg-red-600 text-white p-2 text-sm md:text-base text-center">
                      પ્લેટનંગ
                    </th>
                    <th className="border border-red-600 bg-red-600 text-white p-2 text-sm md:text-base text-center">
                      <SingleSelectionChecklist
                        formData={formData}
                        setFormData={setFormData}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.sizes.map((sizeItem, index) => (
                    <tr key={index}>
                      <td className="border border-red-600 p-2 text-red-600 text-center text-sm md:text-base">
                        {sizeItem.size}
                      </td>
                      <td className="border border-red-600 p-2 text-red-600 font-bold text-center text-sm md:text-base">
                        {(parseInt(sizeItem.pisces) || 0) + (parseInt(sizeItem.mark) || 0)}
                      </td>
                      <td className="border border-red-600 p-2">
                        <input
                          type="text"
                          name="pisces"
                          value={sizeItem.pisces}
                          onChange={(e) => handleSizeInputChange(index, e)}
                          className="w-full bg-yellow-100 outline-none text-red-600 text-center text-sm md:text-base"
                          placeholder="Qty"
                        />
                      </td>
                      <td className="border border-red-600 p-2">
                        <input
                          type="text"
                          name="mark"
                          value={sizeItem.mark}
                          onChange={(e) => handleSizeInputChange(index, e)}
                          className="w-full bg-yellow-100 outline-none text-red-600 text-center text-sm md:text-base"
                          placeholder="Marks"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border border-red-600 p-2 text-red-600 font-bold text-center text-sm md:text-base">
                      કુલ નંગ
                    </td>
                    <td className="border border-red-600 p-2 font-bold text-red-600 text-center text-sm md:text-base">
                      {formData.grandTotal}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
  
          {/* Notes Section */}
          <div className="mt-4">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="4"
              placeholder="Additional Notes"
              className="w-full border border-red-600 bg-yellow-100 text-red-600 outline-none p-2 text-sm md:text-base"
            />
          </div>
  
          {/* Submit Button */}
          <div className="mt-4 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:bg-red-300 w-full md:w-auto"
            >
              {isSubmitting ? "Submitting..." : "જમા નંગ"}
            </button>
          </div>
        </form>
      </div>
    </Navbar>
  );
  };

export default JamaChallan;