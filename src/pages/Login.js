import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { Eye, EyeOff, Shield, Users, BarChart, Clock } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };



  const navigate = useNavigate(); // make sure this is inside your component
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);


  try {
    await login(formData.email, formData.password);
    // Redirect to home page after successful login
    navigate("/");
  } catch (error) {
    console.error(error);
    // Optionally show error to user
  } finally {
    setIsLoading(false);
  }
};


  const features = [
    {
      icon: Users,
      title: 'Visitor Management',
      description: 'Streamlined check-in/check-out process with digital badges'
    },
    {
      icon: BarChart,
      title: 'Real-time Analytics',
      description: 'Comprehensive insights into visitor traffic patterns'
    },
    {
      icon: Shield,
      title: 'Security Features',
      description: 'Advanced security with photo capture and ID verification'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Live notifications and instant status updates'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex min-h-screen">
        {/* Left side - Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-8 xl:p-12 text-white">
          <div className="max-w-md">
            <div className="mb-6 xl:mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 xl:w-6 xl:h-6" />
                </div>
                <h1 className="text-2xl xl:text-3xl font-bold">VMS Pro</h1>
              </div>
              <p className="text-blue-100 text-base xl:text-lg">
                Advanced Visitor Management System for Modern Facilities
              </p>
            </div>

            <div className="space-y-4 xl:space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 xl:space-x-4">
                    <div className="w-8 h-8 xl:w-10 xl:h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 xl:w-5 xl:h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base xl:text-lg mb-1">{feature.title}</h3>
                      <p className="text-blue-100 text-sm xl:text-base">{feature.description}</p>  
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 xl:mt-12 p-4 xl:p-6 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
              <h3 className="font-semibold text-base xl:text-lg mb-2">Demo Credentials</h3>
              <p className="text-blue-100 text-sm mb-2">Email: admin@vms.com</p>
              <p className="text-blue-100 text-sm">Password: 123</p>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="max-w-md w-full">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">VMS Pro</h1>
              </div>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Sign in to your VMS dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed py-3 sm:py-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                  Contact Administrator
                </a>
              </p>
            </div>

            {/* Demo credentials for mobile */}
            <div className="lg:hidden mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Demo Credentials</h3>
              <p className="text-xs text-gray-600 mb-1">Email: admin@vms.com</p>
              <p className="text-xs text-gray-600">Password: 123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
