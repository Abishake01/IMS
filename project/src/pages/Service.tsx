import React, { useState } from 'react';
import { Save, Wrench, Menu, Smartphone, User, Phone, DollarSign, MessageSquare, AlertCircle, Calendar } from 'lucide-react';
import { useServices } from '../hooks/useServices';

interface ServiceProps {
  onMenuClick: () => void;
}

export function Service({ onMenuClick }: ServiceProps) {
  const { createService, loading } = useServices();
  const [formData, setFormData] = useState({
    model_name: '',
    problem: '',
    customer_name: '',
    phone_number: '',
    amount: '',
    material_cost: '',
    comments: '',
    service_date: new Date().toISOString().split('T')[0] // Default to today
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.model_name || !formData.problem || !formData.customer_name || !formData.phone_number || !formData.amount || !formData.service_date) {
      alert('Please fill in all required fields');
      return;
    }

    const serviceData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      material_cost: parseFloat(formData.material_cost) || 0
    };

    const result = await createService(serviceData);
    if (result.success) {
      // Reset form
      setFormData({
        model_name: '',
        problem: '',
        customer_name: '',
        phone_number: '',
        amount: '',
        material_cost: '',
        comments: '',
        service_date: new Date().toISOString().split('T')[0]
      });
      alert('Service request created successfully!');
    } else {
      alert('Failed to create service request. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Request</h1>
          <p className="text-gray-600">Create a new mobile service request</p>
        </div>
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Service Details</h2>
              <p className="text-gray-600">Fill in the service request information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Smartphone className="w-4 h-4 inline mr-2" />
                  Mobile Model *
                </label>
                <input
                  type="text"
                  name="model_name"
                  value={formData.model_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="iPhone 15 Pro, Galaxy S24, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Service Date *
                </label>
                <input
                  type="date"
                  name="service_date"
                  value={formData.service_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Service Amount (₹) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Material Cost (₹)
                </label>
                <input
                  type="number"
                  name="material_cost"
                  value={formData.material_cost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Problem Description *
              </label>
              <textarea
                name="problem"
                value={formData.problem}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Describe the issue with the mobile device..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Additional Comments
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Any additional notes or special instructions..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setFormData({
                  model_name: '',
                  problem: '',
                  customer_name: '',
                  phone_number: '',
                  amount: '',
                  material_cost: '',
                  comments: '',
                  service_date: new Date().toISOString().split('T')[0]
                })}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? 'Creating...' : 'Create Service Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}