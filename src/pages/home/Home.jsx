import React from "react";
import Navbar from "../../components/header/Navbar";

function Home() {
  return (
    <Navbar>
      <div id="Navbar"></div>
      <div className="">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to Rental Management
        </h1>
        <p className="text-lg text-gray-600">
          Select an option from the navigation bar to get started.
        </p>
      </div>
    </Navbar>
  );
}

export default Home;
