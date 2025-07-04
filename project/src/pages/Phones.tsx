import { useState } from 'react';
import { Plus, Search, Edit, Trash2, AlertTriangle, Smartphone } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { PhoneModal } from '../components/PhoneModal';
import { InventoryItem } from '../lib/supabase';

export function Phones() {
  const { items, loading, addItem, updateItem, deleteItem } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter only phones
  const phones = items.filter(item => 
    item.category === 'phones' || 
    item.category === 'featured_phones' || 
    item.category === 'button_phones'
  );

  const filteredPhones = phones.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddPhone = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditPhone = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeletePhone = async (item: InventoryItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      const result = await deleteItem(item.id);
      if (!result.success) {
        alert(result.error || 'Failed to delete phone');
      }
    }
  };

  const handleSavePhone = async (phoneData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingItem) {
      return await updateItem(editingItem.id, phoneData);
    } else {
      return await addItem(phoneData);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock_quantity === 0) return 'out-of-stock';
    if (item.stock_quantity <= item.min_stock_level) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Phone Inventory</h1>
        </div>
        <button
          onClick={handleAddPhone}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Phone
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search phones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="discontinued">Discontinued</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specifications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPhones.map((phone) => {
                const stockStatus = getStockStatus(phone);
                return (
                  <tr key={phone.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {phone.image_base64 || phone.image_url ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={phone.image_base64 || phone.image_url}
                              alt={phone.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Smartphone className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{phone.name}</div>
                          <div className="text-sm text-gray-500">{phone.brand}</div>
                          <div className="text-xs text-gray-400">{phone.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {phone.category === 'featured_phones' ? 'Featured Phone' : 
                         phone.category === 'button_phones' ? 'Button Phone' : 'Phone'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {phone.specifications?.storage && (
                          <div>Storage: {phone.specifications.storage}</div>
                        )}
                        {phone.specifications?.color && (
                          <div>Color: {phone.specifications.color}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{phone.price.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Cost: ₹{phone.cost_price.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{phone.stock_quantity}</span>
                        {stockStatus === 'low-stock' && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 ml-1" />
                        )}
                        {stockStatus === 'out-of-stock' && (
                          <AlertTriangle className="w-4 h-4 text-red-500 ml-1" />
                        )}
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(stockStatus)}`}>
                        {stockStatus === 'out-of-stock' ? 'Out of Stock' :
                         stockStatus === 'low-stock' ? 'Low Stock' : 'In Stock'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        phone.status === 'active' ? 'bg-green-100 text-green-800' :
                        phone.status === 'discontinued' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {phone.status.charAt(0).toUpperCase() + phone.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPhone(phone)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePhone(phone)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPhones.length === 0 && (
          <div className="text-center py-12">
            <Smartphone className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No phones found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first phone to inventory.'
              }
            </p>
          </div>
        )}
      </div>

      <PhoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePhone}
        item={editingItem}
        title={editingItem ? 'Edit Phone' : 'Add New Phone'}
      />
    </div>
  );
}