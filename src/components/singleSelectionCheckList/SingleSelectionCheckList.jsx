import React, { useState } from "react";

function SingleSelectionDropdown({ formData, setFormData }) {
  const [isOpen, setIsOpen] = useState(false);

  const options = ["SS", "SK", "શિવમ", "અન્ય."];

  const handleSelect = (option, event) => {
    console.log(option)
    // Prevent any default form submission behavior
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
    // Prevent default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative mt-2 inline-block">
      <button
        type="button"  // Explicitly set type to prevent form submission
        onClick={(e) => toggleDropdown(e)}
        className="bg-red-500 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {formData.selectedMarkOption || 'માર્કો'}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow-lg">
          {options.map((option) => (
            <div
              key={option}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(option, e);
              }}
              className="px-4 py-2 hover:bg-red-100 cursor-pointer text-black"
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