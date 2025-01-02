import React, { useState, useEffect, useRef } from "react";

function SingleSelectionDropdown({ formData, setFormData }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = ["SS", "SK", "શિવમ", "અન્ય."];

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setFormData((prev) => ({
      ...prev,
      selectedMarkOption: option.toUpperCase()
    }));
    setIsOpen(false);
  };

  const toggleDropdown = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative mt-2 inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => toggleDropdown(e)}
        className="bg-green-500 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 "
      >
        {formData.selectedMarkOption || 'માર્કો'}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow-lg opacity-90">
          {options.map((option) => (
            <div
              key={option}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(option, e);
              }}
              className="px-4 py-2 hover:bg-red-100 cursor-pointer text-black bg-white bg-opacity-50"
            >
              {option.toUpperCase()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SingleSelectionDropdown;