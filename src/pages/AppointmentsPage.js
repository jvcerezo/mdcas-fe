import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { get, del } from '../utils/api';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const { isAuthenticated } = useAuth();

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching appointments...');
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }
      
      const response = await get('/appointments');
      console.log('Appointments response:', response);
      
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
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const appointment = appointments.find(apt => (apt.id || apt._id) === appointmentId);
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      const id = appointmentToCancel._id || appointmentToCancel.id;
      await del(`/appointments/${id}`);
      setAppointments(prev => prev.filter(apt => (apt.id || apt._id) !== id));
      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      setAppointmentToCancel(null);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel appointment. Please try again.';
      toast.error(errorMessage);
    }
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
              onClick={() => console.log('Book appointment clicked')}
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
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(appointments) ? appointments.filter(apt => apt.status === 'pending').length : 0}
                  </p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(appointments) ? appointments.filter(apt => apt.status === 'confirmed').length : 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(appointments) ? appointments.filter(apt => apt.status === 'completed').length : 0}
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
            
            {!Array.isArray(appointments) || appointments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
                <button
                  onClick={() => console.log('Book appointment clicked')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {Array.isArray(appointments) && appointments.map((appointment) => {
                  if (!appointment || typeof appointment !== 'object') {
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
                                onClick={() => console.log('Edit appointment:', appointment)}
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
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowDetailsModal(true);
                            }}
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

        {/* Appointment Details Modal */}
        {showDetailsModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedAppointment(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedAppointment.serviceName || selectedAppointment.title}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                        {selectedAppointment.status ? selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1) : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                      <p className="text-gray-900 font-semibold">{formatDate(selectedAppointment.date)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Time</label>
                      <p className="text-gray-900 font-semibold">{selectedAppointment.time}</p>
                    </div>
                  </div>

                  {selectedAppointment.doctor && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Doctor</label>
                      <p className="text-gray-900 font-semibold">Dr. {selectedAppointment.doctor}</p>
                    </div>
                  )}

                  {selectedAppointment.location && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                      <p className="text-gray-900 font-semibold">{selectedAppointment.location}</p>
                    </div>
                  )}

                  {selectedAppointment.description && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
                      <p className="text-gray-900">{selectedAppointment.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  {selectedAppointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          console.log('Edit appointment:', selectedAppointment);
                        }}
                        className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          handleCancelAppointment(selectedAppointment.id || selectedAppointment._id);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel Appointment
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedAppointment(null);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && appointmentToCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Cancel Appointment</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">{appointmentToCancel.serviceName || appointmentToCancel.title}</h4>
                  <p className="text-sm text-gray-600">
                    {formatDate(appointmentToCancel.date)} at {appointmentToCancel.time}
                  </p>
                  {appointmentToCancel.doctor && (
                    <p className="text-sm text-gray-600">with Dr. {appointmentToCancel.doctor}</p>
                  )}
                </div>

                <p className="text-gray-700 mb-6">
                  Are you sure you want to cancel this appointment? This action cannot be undone and you may need to reschedule if you change your mind.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setAppointmentToCancel(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Keep Appointment
                  </button>
                  <button
                    onClick={confirmCancelAppointment}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yes, Cancel
                  </button>
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
