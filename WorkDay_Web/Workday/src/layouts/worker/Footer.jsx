import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import logo from '../../assets/logo/kaammaa_logo.png'; // Use your actual logo path

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left Section - Logo and Info */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="Workday Logo" className="w-8 h-5 rounded-full" />
            <h1 className="text-xl font-bold">
              <span className="text-white">Work</span><span className="text-blue-600">day</span>
            </h1>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Connecting skilled workers with opportunities. Build your career, manage your work, and grow your professional network with Workday.
          </p>

          <div className="flex gap-3 mt-4">
            <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition">
              <FaFacebookF />
            </a>
            <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition">
              <FaLinkedinIn />
            </a>
            <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition">
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* Middle Section - Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li><a href="#">Find Jobs</a></li>
            <li><a href="#">My Profile</a></li>
            <li><a href="#">Earnings</a></li>
            <li><a href="#">Support</a></li>
          </ul>
        </div>

        {/* Right Section - Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>support@workday.com</li>
            <li>+1 (555) 123-4567</li>
            <li>Available 24/7</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-10 pt-4 text-center text-sm text-gray-400">
        © 2025 Workday. All rights reserved. Built with <span className="text-red-500">❤️</span> for workers everywhere.
      </div>
    </footer>
  );
}
