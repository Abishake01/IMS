import React, { useState, useEffect } from 'react';
import { X, Save} from 'lucide-react';
import { InventoryItem } from '../lib/supabase';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  item?: InventoryItem | null;
  title: string;
}

const categories = ['phones', 'accessories', 'cases', 'chargers', 'tablets', 'smart_watches'];
const statuses = ['active', 'discontinued', 'out_of_stock'];

const storageOptions = [
  '64GB', '128GB', '256GB', '512GB', '1TB', '2TB',
  '4GB+64GB', '6GB+128GB', '8GB+128GB', '8GB+256GB', '12GB+256GB', '12GB+512GB'
];

export function InventoryModal({ isOpen, onClose, onSave, item, title }: InventoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'phones',
    sku: '',
    price: '',
    cost_price: '',
    stock_quantity: '',
    min_stock_level: '',
    description: '',
    specifications: {},
    image_url: '',
    status: 'active' as 'active' | 'discontinued' | 'out_of_stock'
  });
  const [phoneSpecs, setPhoneSpecs] = useState({
    storage: '',
    color: '',
    imei: ''
  });
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
        status: item.status
      });
      
      if (item.category === 'phones' && item.specifications) {
        setPhoneSpecs({
          storage: item.specifications.storage || '',
          color: item.specifications.color || '',
          imei: item.sku || ''
        });
      }
    } else {
      setFormData({
        name: '',
        brand: '',
        category: 'phones',
        sku: '',
        price: '',
        cost_price: '',
        stock_quantity: '',
        min_stock_level: '',
        description: '',
        specifications: {},
        image_url: '',
        status: 'active'
      });
      setPhoneSpecs({
        storage: '',
        color: '',
        imei: ''
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let specifications = formData.specifications;
      let sku = formData.sku;
      
      if (formData.category === 'phones') {
        specifications = {
          ...specifications,
          storage: phoneSpecs.storage,
          color: phoneSpecs.color
        };
        sku = phoneSpecs.imei;
      }
      
      const itemData = {
        ...formData,
        sku,
        price: parseFloat(formData.price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        min_stock_level: parseInt(formData.min_stock_level) || 0,
        specifications
      };
      
      await onSave(itemData);
      onClose();
    } catch (error) {
      console.error('Failed to save item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneSpecChange = (field: string, value: string) => {
    setPhoneSpecs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberInput = (field: string, value: string) => {
    // Remove leading zeros and ensure valid number format
    const cleanValue = value.replace(/^0+/, '') || '';
    setFormData(prev => ({
      ...prev,
      [field]: cleanValue
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                Product Name *
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
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            {formData.category === 'phones' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IMEI *
                </label>
                <input
                  type="text"
                  value={phoneSpecs.imei}
                  onChange={(e) => handlePhoneSpecChange('imei', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456789012345"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="APL-IP15P-128"
                />
              </div>
            )}
            
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
                Original Price (₹) *
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
                Stock Quantity *
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
                Min Stock Level *
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Phone-specific fields */}
{formData.category === 'phones' && (
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter color"
        />
      </div>
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
              placeholder="Enter product description..."
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
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}