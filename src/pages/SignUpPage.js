import React, { useState } from 'react';
import { post } from '../utils/api';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await post('/auth/signup', { name, email, password });
      console.log('Sign up successful:', response);
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  return (
    <div className="bg-blue-50 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">Sign Up</h2>
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-300"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-300"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-300"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 w-full">Sign Up</button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
