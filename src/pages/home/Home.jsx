import React from "react";
import { ArrowRight, Building2, Home as HomeIcon, Users } from "lucide-react";
import Navbar from "../../components/header/Navbar";

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div 
    className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center m-2 w-full md:w-64 cursor-pointer transition-transform duration-200 hover:scale-105"
  >
    <Icon className="w-12 h-12 text-blue-500 mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const HomePage = () => {
  return (
    <Navbar>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        {/* Hero Section */}
        <div 
          className="flex flex-col justify-center items-center px-4 py-16 md:py-24 text-center animate-fade-in"
        >
          <h1 
            className="text-3xl md:text-5xl font-bold text-gray-800 mb-4 animate-scale-in"
          >
            Welcome to Rental Management
          </h1>
          <h2 
            className="text-2xl md:text-4xl font-bold text-blue-600 mb-6 animate-slide-in"
          >
            NO WERE TECH
          </h2>
          <p 
            className="text-base md:text-lg text-gray-600 max-w-2xl mb-8 animate-fade-in-delayed"
          >
            Streamline your property management with our comprehensive suite of tools. 
            Manage properties, tenants, and maintenance all in one place.
          </p>
          
          <button
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors hover:scale-105 transform duration-200"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Features Section */}
        <div className="px-4 py-12 md:py-24">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">
            Everything you need to manage your properties
          </h2>
          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
            <FeatureCard 
              icon={Building2}
              title="Property Management"
              description="Easily manage all your properties in one central dashboard"
            />
            <FeatureCard 
              icon={Users}
              title="Tenant Portal"
              description="Provide a seamless experience for your tenants"
            />
            <FeatureCard 
              icon={HomeIcon}
              title="Maintenance Tracking"
              description="Track and manage maintenance requests efficiently"
            />
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default HomePage;

/* Add these animations to your global CSS file */
