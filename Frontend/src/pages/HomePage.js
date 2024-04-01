// HomePage.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Homepage.css";
import LaunchGame from "../components/LaunchGame";
const HomePage = () => {
  return (
    <div className="homepage">
     <LaunchGame/> 
    </div>
  );
};

export default HomePage;
