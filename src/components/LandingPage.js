import React from 'react';

const LandingPage = () => {
  return (
    <div className="bg-white text-gray-800">
      <header className="bg-blue-500 text-white py-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Maralit Dental Clinic</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#services" className="hover:underline">Services</a></li>
              <li><a href="#about" className="hover:underline">About Us</a></li>
              <li><a href="#contact" className="hover:underline">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-12">
        <section id="hero" className="text-center py-12">
          <h2 className="text-4xl font-bold mb-4">Your Smile, Our Priority</h2>
          <p className="text-lg mb-6">Providing world-class dental care for you and your family.</p>
          <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">Book an Appointment</button>
        </section>

        <section id="services" className="py-12">
          <h3 className="text-3xl font-bold mb-6 text-center">Our Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border rounded shadow">
              <h4 className="text-xl font-bold mb-2">Teeth Cleaning</h4>
              <p>Professional cleaning to keep your teeth healthy and bright.</p>
            </div>
            <div className="p-6 border rounded shadow">
              <h4 className="text-xl font-bold mb-2">Dental Implants</h4>
              <p>High-quality implants to restore your smile.</p>
            </div>
            <div className="p-6 border rounded shadow">
              <h4 className="text-xl font-bold mb-2">Orthodontics</h4>
              <p>Braces and aligners to straighten your teeth.</p>
            </div>
          </div>
        </section>

        <section id="about" className="py-12 bg-gray-100">
          <h3 className="text-3xl font-bold mb-6 text-center">About Us</h3>
          <p className="text-center max-w-2xl mx-auto">Maralit Dental Clinic has been serving the community with exceptional dental care for over 20 years. Our team of experienced professionals is dedicated to ensuring your comfort and satisfaction.</p>
        </section>

        <section id="contact" className="py-12">
          <h3 className="text-3xl font-bold mb-6 text-center">Contact Us</h3>
          <form className="max-w-lg mx-auto">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
              <input type="text" id="name" className="w-full border rounded px-3 py-2" placeholder="Your Name" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
              <input type="email" id="email" className="w-full border rounded px-3 py-2" placeholder="Your Email" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="message">Message</label>
              <textarea id="message" className="w-full border rounded px-3 py-2" placeholder="Your Message" rows="4"></textarea>
            </div>
            <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">Send Message</button>
          </form>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 Maralit Dental Clinic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
