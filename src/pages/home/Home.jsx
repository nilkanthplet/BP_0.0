import React from "react";
import Navbar from "../../components/header/Navbar";

function Home() {
  return (
    <Navbar>
      <div className="h-screen bg-blue-100 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Rental Management</h1>
      <h2 className="text-3xl font-bold text-gray-500 mb-4">NO WERE TECH</h2>
      <p className="text-lg text-gray-600">Select an option from the navigation bar to get started.</p>
    </div>
    </Navbar>
  );
}

export default Home;
