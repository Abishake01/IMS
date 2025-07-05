import React, { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { InventoryItem, convertImageToBase64 } from '../lib/supabase';
import { useCategories } from '../hooks/useCategories';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  item?: InventoryItem | null;
  title: string;
}

const statuses = ['active', 'discontinued', 'out_of_stock'];

export function InventoryModal({ isOpen, onClose, onSave, item, title }: InventoryModalProps) {
  const { categories, createCategory } = useCategories();
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'accessories',
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
  
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter out phone categories for regular products
  const productCategories = categories.filter(cat => 
    cat.name !== 'phones' && 
    cat.name !== 'featured_phones' 
  );

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
    } else {
      resetForm();
    }
  }, [item]);

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: 'accessories',
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
    setNewCategory('');
    setShowNewCategory(false);
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
      // Handle category creation
      if (showNewCategory && newCategory.trim()) {
        try {
          const result = await createCategory(newCategory.trim(), newCategory.trim());
          if (result && result.success) {
            setFormData(prev => ({ ...prev, category: result.data.name }));
          }
        } catch (error) {
          console.error('Error creating category:', error);
        }
      }
      
      const itemData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        min_stock_level: parseInt(formData.min_stock_level) || 0,
        warranty_duration: parseInt(formData.warranty_duration) || 0,
      };
      
      const result = await onSave(itemData);
      
      if (result && result.success) {
        onClose();
      } else {
        throw new Error(result?.error || 'Failed to save item');
      }
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Failed to save item. Please try again.');
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

  const handleNumberInput = (field: string, value: string) => {
    const cleanValue = value.replace(/^0+/, '') || '';
    setFormData(prev => ({
      ...prev,
      [field]: cleanValue
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'new') {
      setShowNewCategory(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setShowNewCategory(false);
      setFormData(prev => ({ ...prev, category: e.target.value }));
    }
  };

  const handleNewCategorySubmit = async () => {
    if (!newCategory.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      const result = await createCategory(newCategory.trim(), newCategory.trim());
      if (result && result.success) {
        setFormData(prev => ({ ...prev, category: result.data.name }));
        setShowNewCategory(false);
        setNewCategory('');
      } else {
        alert('Failed to create category. Please try again.');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category. Please try again.');
    }
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
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Product Name"
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
                placeholder="Brand Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="space-y-2">
                <select
                  value={showNewCategory ? 'new' : formData.category}
                  onChange={handleCategoryChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {productCategories.length === 0 && (
                    <option value="">No categories available</option>
                  )}
                  {productCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.display_name}
                    </option>
                  ))}
                  <option value="new">+ Add New Category</option>
                </select>
                
                {showNewCategory && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleNewCategorySubmit}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategory('');
                        setFormData(prev => ({ ...prev, category: productCategories[0]?.name || 'accessories' }));
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
            
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
                placeholder="Product SKU"
              />
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
          </div>

          {/* Image Upload Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Image</h3>
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
                  alt="Product preview"
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
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}