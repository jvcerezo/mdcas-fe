import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaTooth, FaShieldAlt, FaUserMd, FaClock, FaStar, FaAward } from 'react-icons/fa';
import Header from './Header';

const LandingPage = () => {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Your Smile, <span className="text-blue-200">Our Priority</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Experience world-class dental care with our team of expert professionals dedicated to your oral health and beautiful smile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-blue-700 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Book an Appointment
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-700 transition-all duration-300">
                Learn More
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-200">20+</div>
                <div className="text-blue-100">Years of Experience</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-200">5000+</div>
                <div className="text-blue-100">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-200">98%</div>
                <div className="text-blue-100">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Our Services</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Comprehensive dental care tailored to meet all your oral health needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <FaTooth className="text-2xl text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">General Dentistry</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive oral health care including cleanings, fillings, and preventive treatments.
                </p>
                <Link to="/services" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Learn More →
                </Link>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <FaShieldAlt className="text-2xl text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Dental Implants</h3>
                <p className="text-gray-600 mb-4">
                  High-quality implants to restore your smile with natural-looking, permanent solutions.
                </p>
                <Link to="/services" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Learn More →
                </Link>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <FaUserMd className="text-2xl text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Orthodontics</h3>
                <p className="text-gray-600 mb-4">
                  Modern braces and clear aligners to straighten your teeth and perfect your smile.
                </p>
                <Link to="/services" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Learn More →
                </Link>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <FaStar className="text-2xl text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Cosmetic Dentistry</h3>
                <p className="text-gray-600 mb-4">
                  Enhance your smile with veneers, whitening, and other aesthetic treatments.
                </p>
                <Link to="/services" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Learn More →
                </Link>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <FaClock className="text-2xl text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Emergency Care</h3>
                <p className="text-gray-600 mb-4">
                  24/7 emergency dental services for urgent oral health needs and pain relief.
                </p>
                <Link to="/services" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Learn More →
                </Link>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <FaAward className="text-2xl text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Pediatric Care</h3>
                <p className="text-gray-600 mb-4">
                  Specialized dental care for children in a comfortable, kid-friendly environment.
                </p>
                <Link to="/services" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                  About <span className="text-blue-600">Maralit Dental</span>
                </h2>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  For over 20 years, Maralit Dental Clinic has been the trusted choice for comprehensive dental care in our community. Our team of experienced professionals combines cutting-edge technology with compassionate care to deliver exceptional results.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">State-of-the-art equipment and technology</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Experienced and certified dental professionals</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Personalized treatment plans for every patient</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Comfortable and relaxing environment</span>
                  </div>
                </div>
                <Link 
                  to="/about" 
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                >
                  Learn More About Us
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
              
              <div className="relative">
                <div className="bg-white p-8 rounded-2xl shadow-2xl">
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">Why Choose Us?</h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaAward className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Award-Winning Care</h4>
                        <p className="text-gray-600 text-sm">Recognized for excellence in dental care and patient satisfaction.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaShieldAlt className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Advanced Technology</h4>
                        <p className="text-gray-600 text-sm">Latest dental technology for precise and comfortable treatments.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaClock className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Flexible Scheduling</h4>
                        <p className="text-gray-600 text-sm">Convenient appointment times that fit your busy schedule.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Get In Touch</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Ready to start your journey to a healthier, more beautiful smile? Contact us today.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <form className="bg-gray-50 p-8 rounded-2xl shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="firstName">First Name</label>
                      <input 
                        type="text" 
                        id="firstName" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                        placeholder="Your first name" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="lastName">Last Name</label>
                      <input 
                        type="text" 
                        id="lastName" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                        placeholder="Your last name" 
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      placeholder="your.email@example.com" 
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">Phone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      placeholder="(123) 456-7890" 
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="message">Message</label>
                    <textarea 
                      id="message" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      placeholder="Tell us how we can help you..." 
                      rows="4"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Send Message
                  </button>
                </form>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">Visit Our Office</h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Address</h4>
                        <p className="text-gray-600">123 Dental Street<br />Health City, HC 12345</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Phone</h4>
                        <p className="text-gray-600">(555) 123-4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Office Hours</h4>
                        <div className="text-gray-600">
                          <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                          <p>Saturday: 9:00 AM - 4:00 PM</p>
                          <p>Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">Emergency Care</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Dental emergencies can't wait. Call us 24/7 for urgent care.
                  </p>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                    Emergency: (555) 911-HELP
                  </button>
                </div>
              </div>
            </div>
          </div>
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
