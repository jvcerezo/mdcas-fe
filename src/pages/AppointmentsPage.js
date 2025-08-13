import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import toast, { Toaster } from 'react-hot-toast';
import { get, post, put, del, checkTokenStatus } from '../utils/api';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    service: '',
    serviceName: '',
    description: '',
    doctor: '',
    location: ''
  });
  const [editData, setEditData] = useState({
    date: '',
    time: '',
    service: '',
    serviceName: '',
    description: '',
    doctor: '',
    location: ''
  });

  const services = [
    { id: 'cleaning', name: 'Dental Cleaning', duration: '1 hour', price: '₱2,500' },
    { id: 'checkup', name: 'General Checkup', duration: '30 minutes', price: '₱1,500' },
    { id: 'filling', name: 'Dental Filling', duration: '1.5 hours', price: '₱3,500' },
    { id: 'whitening', name: 'Teeth Whitening', duration: '2 hours', price: '₱8,000' },
    { id: 'extraction', name: 'Tooth Extraction', duration: '1 hour', price: '₱4,000' },
    { id: 'root-canal', name: 'Root Canal Treatment', duration: '2 hours', price: '₱12,000' },
    { id: 'braces', name: 'Orthodontic Consultation', duration: '45 minutes', price: '₱2,000' },
    { id: 'implant', name: 'Dental Implant Consultation', duration: '1 hour', price: '₱3,000' }
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    checkTokenStatus(); // Debug token status
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching appointments...');
      
      // Check token status before making request
      const { token } = checkTokenStatus();
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }
      
      const response = await get('/appointments');
      console.log('Appointments response:', response);
      console.log('Response type:', typeof response);
      console.log('Response.data:', response?.data);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Handle different response structures
      let appointmentsData;
      if (response?.data?.appointments) {
        appointmentsData = response.data.appointments;
      } else if (response?.data && Array.isArray(response.data)) {
        appointmentsData = response.data;
      } else if (Array.isArray(response)) {
        appointmentsData = response;
      } else if (response?.appointments) {
        appointmentsData = response.appointments;
      } else {
        appointmentsData = response?.data || response || [];
      }
      
      const appointmentsArray = Array.isArray(appointmentsData) ? appointmentsData : [];
      
      console.log('Final appointments data:', appointmentsData);
      console.log('Final appointments array:', appointmentsArray);
      console.log('Setting appointments:', appointmentsArray);
      setAppointments(appointmentsArray);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Please check your permissions.');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to load appointments. Please try again.';
        toast.error(errorMessage);
      }
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    
    if (!bookingData.date || !bookingData.time || !bookingData.service || !bookingData.doctor || !bookingData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const selectedService = services.find(s => s.id === bookingData.service);
      const appointmentData = {
        date: bookingData.date,
        time: bookingData.time,
        serviceName: selectedService.name,
        description: bookingData.description,
        doctor: bookingData.doctor,
        location: bookingData.location,
        status: 'pending'
      };

      const response = await post('/appointments', appointmentData);
      
      // Add the new appointment to the local state
      const newAppointment = response.data || response;
      setAppointments(prev => [...prev, newAppointment]);
      
      toast.success('Appointment booked successfully!');
      setBookingData({ date: '', time: '', service: '', serviceName: '', description: '', doctor: '', location: '' });
      setShowBookingForm(false);
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to book appointment. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      // Use either _id (MongoDB) or id depending on what the backend returns
      const id = appointmentId._id || appointmentId;
      await del(`/appointments/${id}`);
      setAppointments(prev => prev.filter(apt => (apt.id || apt._id) !== id));
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel appointment. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setEditData({
      date: appointment.date.split('T')[0], // Convert ISO date to YYYY-MM-DD format
      time: appointment.time,
      service: appointment.service || '',
      serviceName: appointment.serviceName,
      description: appointment.description || '',
      doctor: appointment.doctor,
      location: appointment.location
    });
    setShowEditForm(true);
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    
    if (!editData.date || !editData.time || !editData.serviceName || !editData.doctor || !editData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updateData = {
        date: editData.date,
        time: editData.time,
        serviceName: editData.serviceName,
        description: editData.description,
        doctor: editData.doctor,
        location: editData.location
      };

      const response = await put(`/appointments/${editingAppointment.id || editingAppointment._id}`, updateData);
      
      // Update the appointment in local state
      const updatedAppointment = response.data || response;
      setAppointments(prev => prev.map(apt => 
        (apt.id || apt._id) === (editingAppointment.id || editingAppointment._id) ? { ...apt, ...updatedAppointment } : apt
      ));
      
      toast.success('Appointment updated successfully!');
      setShowEditForm(false);
      setEditingAppointment(null);
      setEditData({ date: '', time: '', service: '', serviceName: '', description: '', doctor: '', location: '' });
      
    } catch (error) {
      console.error('Error updating appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update appointment. Please try again.';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
              <p className="text-gray-600">Manage your dental appointments and book new ones</p>
            </div>
            <button
              onClick={() => setShowBookingForm(true)}
              className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Book New Appointment</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.isArray(appointments) ? appointments.length : 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.isArray(appointments) ? appointments.filter(a => a.status === 'confirmed').length : 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.isArray(appointments) ? appointments.filter(a => a.status === 'pending').length : 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(appointments) ? appointments.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).length : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Appointments</h2>
            </div>
            {console.log('Rendering appointments check:', { 
              appointments, 
              isArray: Array.isArray(appointments), 
              length: Array.isArray(appointments) ? appointments.length : 'not array',
              condition: !Array.isArray(appointments) || appointments.length === 0 
            })}
            
            {!Array.isArray(appointments) || appointments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {console.log('About to render appointments:', appointments)}
                {Array.isArray(appointments) && appointments.map((appointment) => {
                  console.log('Rendering appointment:', appointment);
                  // Safety check for appointment object
                  if (!appointment || typeof appointment !== 'object') {
                    console.log('Skipping invalid appointment:', appointment);
                    return null;
                  }
                  
                  return (
                    <div key={appointment.id || appointment._id || Math.random()} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{appointment.serviceName || appointment.title || 'Appointment'}</h3>
                              <p className="text-gray-600">{formatDate(appointment.date)} at {appointment.time || 'N/A'}</p>
                              {appointment.doctor && (
                                <p className="text-sm text-gray-500">with Dr. {appointment.doctor}</p>
                              )}
                              {appointment.location && (
                                <p className="text-sm text-gray-500">at {appointment.location}</p>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Unknown'}
                            </span>
                          </div>
                          {appointment.description && (
                            <p className="text-gray-600 text-sm mb-3">{appointment.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2 mt-4 md:mt-0">
                          {appointment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleEditAppointment(appointment)}
                                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(appointment.id || appointment._id)}
                                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedAppointment(appointment)}
                            className="px-4 py-2 text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Book New Appointment</h2>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleBookAppointment} className="space-y-6">
                  {/* Service Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bookingData.service}
                      onChange={(e) => {
                        const selectedService = services.find(s => s.id === e.target.value);
                        setBookingData(prev => ({ 
                          ...prev, 
                          service: e.target.value,
                          serviceName: selectedService ? selectedService.name : ''
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a service</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - {service.duration} - {service.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Doctor Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Doctor <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bookingData.doctor}
                      onChange={(e) => setBookingData(prev => ({ ...prev, doctor: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a doctor</option>
                      <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                      <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                      <option value="Dr. Emily Rodriguez">Dr. Emily Rodriguez</option>
                      <option value="Dr. David Martinez">Dr. David Martinez</option>
                    </select>
                  </div>

                  {/* Location Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bookingData.location}
                      onChange={(e) => setBookingData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a location</option>
                      <option value="Main Clinic - Downtown">Main Clinic - Downtown</option>
                      <option value="Branch Clinic - Uptown">Branch Clinic - Uptown</option>
                      <option value="Medical Center - Mall">Medical Center - Mall</option>
                    </select>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                      min={getMinDate()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bookingData.time}
                      onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={bookingData.description}
                      onChange={(e) => setBookingData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any special requests or information for your appointment..."
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Appointment Form Modal */}
        {showEditForm && editingAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Appointment</h2>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingAppointment(null);
                      setEditData({ date: '', time: '', service: '', serviceName: '', description: '', doctor: '', location: '' });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleUpdateAppointment} className="space-y-6">
                  {/* Service Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editData.serviceName}
                      onChange={(e) => setEditData(prev => ({ ...prev, serviceName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Service name"
                      required
                    />
                  </div>

                  {/* Doctor Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editData.doctor}
                      onChange={(e) => setEditData(prev => ({ ...prev, doctor: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a doctor</option>
                      <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                      <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                      <option value="Dr. Emily Rodriguez">Dr. Emily Rodriguez</option>
                      <option value="Dr. David Martinez">Dr. David Martinez</option>
                    </select>
                  </div>

                  {/* Location Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editData.location}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a location</option>
                      <option value="Main Clinic - Downtown">Main Clinic - Downtown</option>
                      <option value="Branch Clinic - Uptown">Branch Clinic - Uptown</option>
                      <option value="Medical Center - Mall">Medical Center - Mall</option>
                    </select>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editData.date}
                      onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                      min={getMinDate()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editData.time}
                      onChange={(e) => setEditData(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any special requests or information for your appointment..."
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingAppointment(null);
                        setEditData({ date: '', time: '', service: '', serviceName: '', description: '', doctor: '', location: '' });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Update Appointment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service</label>
                    <p className="text-gray-900">{selectedAppointment.serviceName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                    <p className="text-gray-900">{formatDate(selectedAppointment.date)} at {selectedAppointment.time}</p>
                  </div>
                  {selectedAppointment.doctor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Doctor</label>
                      <p className="text-gray-900">{selectedAppointment.doctor}</p>
                    </div>
                  )}
                  {selectedAppointment.location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-900">{selectedAppointment.location}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status ? selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1) : 'Unknown'}
                    </span>
                  </div>
                  {selectedAppointment.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="text-gray-900">{selectedAppointment.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  {selectedAppointment.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleCancelAppointment(selectedAppointment.id || selectedAppointment._id);
                        setSelectedAppointment(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AppointmentsPage;
