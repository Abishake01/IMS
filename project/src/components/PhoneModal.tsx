import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Plus, Trash2 } from 'lucide-react';
import { InventoryItem, convertImageToBase64 } from '../lib/supabase';
import { usePhoneIMEI } from '../hooks/usePhoneIMEI';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  item?: InventoryItem | null;
  title: string;
}

const phoneCategories = [
  { value: 'featured_phones', label: 'Featured Phone' },
  { value: 'smart_phones', label: 'Smart Phone' }
];

const statuses = ['active', 'discontinued', 'out_of_stock'];


const storageOptions = [
  '64GB', '128GB', '256GB', '512MB',
  '4GB+64GB', '6GB+128GB', '8GB+128GB', 
  '8GB+256GB','3GB+32GB','4GB+128GB', '12GB+256GB', '12GB+512GB'
];

export function PhoneModal({ isOpen, onClose, onSave, item, title }: PhoneModalProps) {
  const { createPhoneIMEI, fetchPhoneIMEIs, phoneIMEIs, deletePhoneIMEI } = usePhoneIMEI();
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'featured_phones',
    sku: '',
    price: '',
    cost_price: '',
    stock_quantity: '',
    min_stock_level: '',
    description: '',
    specifications: {},
    image_url: '',
    image_base64: '',
    status: 'active' as const,
    has_warranty: false,
    warranty_duration: '',
    warranty_unit: 'months' as const
  });
  
  const [phoneSpecs, setPhoneSpecs] = useState({
    storage: '',
    color: ''
  });
  
  const [imeiNumbers, setImeiNumbers] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        brand: item.brand,
        category: item.category,
        sku: item.sku,
        price: item.price.toString(),
        cost_price: item.cost_price.toString(),
        stock_quantity: item.stock_quantity.toString(),
        min_stock_level: item.min_stock_level.toString(),
        description: item.description,
        specifications: item.specifications,
        image_url: item.image_url,
        image_base64: item.image_base64 || '',
        status: item.status,
        has_warranty: item.has_warranty || false,
        warranty_duration: item.warranty_duration?.toString() || '',
        warranty_unit: item.warranty_unit || 'months'
      });
      
      if (item.specifications) {
        setPhoneSpecs({
          storage: item.specifications.storage || '',
          color: item.specifications.color || ''
        });
      }
      
      fetchPhoneIMEIs(item.id);
    } else {
      resetForm();
    }
  }, [item]);

  useEffect(() => {
    // Update IMEI numbers based on stock quantity
    const quantity = parseInt(formData.stock_quantity) || 0;
    const currentIMEIs = [...imeiNumbers];
    
    if (quantity > currentIMEIs.length) {
      for (let i = currentIMEIs.length; i < quantity; i++) {
        currentIMEIs.push('');
      }
    } else if (quantity < currentIMEIs.length) {
      currentIMEIs.splice(quantity);
    }
    
    setImeiNumbers(currentIMEIs);
  }, [formData.stock_quantity]);

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: 'featured_phones',
      sku: '',
      price: '',
      cost_price: '',
      stock_quantity: '',
      min_stock_level: '',
      description: '',
      specifications: {},
      image_url: '',
      image_base64: '',
      status: 'active',
      has_warranty: false,
      warranty_duration: '',
      warranty_unit: 'months'
    });
    setPhoneSpecs({
      storage: '',
      color: ''
    });
    setImeiNumbers(['']);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertImageToBase64(file);
        setFormData(prev => ({
          ...prev,
          image_base64: base64,
          image_url: ''
        }));
      } catch (error) {
        console.error('Error converting image to base64:', error);
        alert('Error uploading image. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const specifications = {
        ...formData.specifications,
        storage: phoneSpecs.storage,
        color: phoneSpecs.color
      };
      
      
      const itemData = {
        ...formData,
        
        price: parseFloat(formData.price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        min_stock_level: parseInt(formData.min_stock_level) || 0,
        warranty_duration: parseInt(formData.warranty_duration) || 0,
        specifications
      };
      
      const result = await onSave(itemData);
      
      if (result && result.success) {
        // If this is a new phone and we have IMEI numbers, save them
        if (!item && result.data) {
          const inventoryItemId = result.data.id;
          for (const imei of imeiNumbers) {
            if (imei.trim()) {
              try {
                await createPhoneIMEI(inventoryItemId, imei.trim());
              } catch (error) {
                console.error('Error creating IMEI:', error);
              }
            }
          }
        }
        
        onClose();
      } else {
        throw new Error(result?.error || 'Failed to save phone');
      }
    } catch (error) {
      console.error('Failed to save phone:', error);
      alert('Failed to save phone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhoneSpecChange = (field: string, value: string) => {
    setPhoneSpecs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIMEIChange = (index: number, value: string) => {
    const newIMEIs = [...imeiNumbers];
    newIMEIs[index] = value;
    setImeiNumbers(newIMEIs);
  };

  const addIMEIField = () => {
    setImeiNumbers(prev => [...prev, '']);
    setFormData(prev => ({
      ...prev,
      stock_quantity: (parseInt(prev.stock_quantity) + 1).toString()
    }));
  };

  const removeIMEIField = (index: number) => {
    if (imeiNumbers.length > 1) {
      const newIMEIs = imeiNumbers.filter((_, i) => i !== index);
      setImeiNumbers(newIMEIs);
      setFormData(prev => ({
        ...prev,
        stock_quantity: Math.max(0, parseInt(prev.stock_quantity) - 1).toString()
      }));
    }
  };

  const handleNumberInput = (field: string, value: string) => {
    const cleanValue = value.replace(/^0+/, '') || '';
    setFormData(prev => ({
      ...prev,
      [field]: cleanValue
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="iPhone 15 Pro"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Apple"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {phoneCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleNumberInput('price', e.target.value)}
                required
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="999.99"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buying Price (₹) *
              </label>
              <input
                type="number"
                value={formData.cost_price}
                onChange={(e) => handleNumberInput('cost_price', e.target.value)}
                required
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="850.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => handleNumberInput('stock_quantity', e.target.value)}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="15"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Quantity *
              </label>
              <input
                type="number"
                value={formData.min_stock_level}
                onChange={(e) => handleNumberInput('min_stock_level', e.target.value)}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone Specifications */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Phone Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage *
                </label>
                <select
                  value={phoneSpecs.storage}
                  onChange={(e) => handlePhoneSpecChange('storage', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Storage</option>
                  {storageOptions.map(storage => (
                    <option key={storage} value={storage}>{storage}</option>
                  ))}
                </select>
              </div>
              
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Color *
  </label>
  <input
    type="text"
    value={phoneSpecs.color}
    onChange={(e) => handlePhoneSpecChange('color', e.target.value)}
    required
    placeholder="Enter Color"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
</div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Phone Image</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Image
                  </label>
                  {formData.image_base64 && (
                    <span className="text-sm text-green-600">Image uploaded</span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Image URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  disabled={!!formData.image_base64}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            
            {(formData.image_base64 || formData.image_url) && (
              <div className="mt-4">
                <img
                  src={formData.image_base64 || formData.image_url}
                  alt="Phone preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>

          {/* Warranty Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Warranty Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Has Warranty
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="has_warranty"
                      checked={formData.has_warranty === true}
                      onChange={() => setFormData(prev => ({ ...prev, has_warranty: true }))}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="has_warranty"
                      checked={formData.has_warranty === false}
                      onChange={() => setFormData(prev => ({ ...prev, has_warranty: false, warranty_duration: '', warranty_unit: 'months' }))}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              {formData.has_warranty && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Duration *
                    </label>
                    <input
                      type="number"
                      name="warranty_duration"
                      value={formData.warranty_duration}
                      onChange={handleChange}
                      required={formData.has_warranty}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Unit *
                    </label>
                    <select
                      name="warranty_unit"
                      value={formData.warranty_unit}
                      onChange={handleChange}
                      required={formData.has_warranty}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* IMEI Numbers Section */}
          {!item && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">IMEI Numbers</h4>
                <button
                  type="button"
                  onClick={addIMEIField}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add IMEI
                </button>
              </div>
              
              <div className="space-y-3">
                {imeiNumbers.map((imei, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={imei}
                        onChange={(e) => handleIMEIChange(index, e.target.value)}
                        placeholder={`IMEI ${index + 1}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {imeiNumbers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIMEIField(index)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show existing IMEIs for editing */}
          {item && phoneIMEIs.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Existing IMEI Numbers</h4>
              <div className="space-y-2">
                {phoneIMEIs.map((imeiData) => (
                  <div key={imeiData.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono text-sm">{imeiData.imei_number}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        imeiData.is_sold 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {imeiData.is_sold ? 'Sold' : 'Available'}
                      </span>
                      {!imeiData.is_sold && (
                        <button
                          type="button"
                          onClick={() => deletePhoneIMEI(imeiData.id)}
                          className="p-1 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone description..."
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Saving...' : 'Save Phone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}