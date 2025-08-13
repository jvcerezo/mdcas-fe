import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="bg-blue-50 text-gray-800 min-h-screen">
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-wide">Maralit Dental Clinic</h1>
          <nav>
            <ul className="flex space-x-6 text-lg">
              <li><Link to="/services" className="hover:underline">Services</Link></li>
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact</Link></li>
              <li><Link to="/login" className="hover:underline">Login</Link></li>
              <li><Link to="/signup" className="hover:underline">Sign Up</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-12">
        <section id="hero" className="text-center py-12">
          <h2 className="text-5xl font-bold mb-6 text-blue-800">Your Smile, Our Priority</h2>
          <p className="text-xl mb-8 text-blue-700">Providing world-class dental care for you and your family.</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full shadow-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300">Book an Appointment</button>
        </section>

        <section id="services" className="py-12">
          <h3 className="text-4xl font-bold mb-8 text-center text-blue-800">Our Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow">
              <h4 className="text-2xl font-bold mb-4">Teeth Cleaning</h4>
              <p>Professional cleaning to keep your teeth healthy and bright.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow">
              <h4 className="text-2xl font-bold mb-4">Dental Implants</h4>
              <p>High-quality implants to restore your smile.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow">
              <h4 className="text-2xl font-bold mb-4">Orthodontics</h4>
              <p>Braces and aligners to straighten your teeth.</p>
            </div>
          </div>
        </section>

        <section id="about" className="py-12 bg-blue-100">
          <h3 className="text-4xl font-bold mb-8 text-center text-blue-800">About Us</h3>
          <p className="text-center max-w-2xl mx-auto text-lg text-blue-700">Maralit Dental Clinic has been serving the community with exceptional dental care for over 20 years. Our team of experienced professionals is dedicated to ensuring your comfort and satisfaction.</p>
        </section>

        <section id="contact" className="py-12">
          <h3 className="text-4xl font-bold mb-8 text-center text-blue-800">Contact Us</h3>
          <form className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
              <input type="text" id="name" className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-300" placeholder="Your Name" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
              <input type="email" id="email" className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-300" placeholder="Your Email" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="message">Message</label>
              <textarea id="message" className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-300" placeholder="Your Message" rows="4"></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:ring-4 focus:ring-blue-300">Send Message</button>
          </form>
        </section>
      </main>

      <footer className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-6">
        <div className="container mx-auto text-center space-y-4">
          <p>&copy; 2025 Maralit Dental Clinic. All rights reserved.</p>
          <div className="flex justify-center space-x-4">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300"><FaFacebook size={24} /></a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300"><FaTwitter size={24} /></a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300"><FaInstagram size={24} /></a>
          </div>
          <form className="mt-4">
            <label htmlFor="newsletter" className="block text-sm">Subscribe to our newsletter</label>
            <div className="flex mt-2">
              <input type="email" id="newsletter" className="w-full px-4 py-2 rounded-l focus:ring-2 focus:ring-blue-300" placeholder="Your Email" />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600">Subscribe</button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
