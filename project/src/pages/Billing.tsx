import { useState} from 'react';
import { Plus, Search, Trash2, Calculator, User, Phone, Menu, Eye, Filter } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useBilling } from '../hooks/useBilling';
import { InventoryItem } from '../lib/supabase';
import { BillPreviewModal } from '../components/BillPreviewModal';

interface BillItem {
  id: string;
  item: InventoryItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface BillingProps {
  onMenuClick: () => void;
}

const categories = ['all', 'phones', 'accessories', 'cases', 'chargers', 'tablets', 'smart_watches'];

export function Billing({ onMenuClick }: BillingProps) {
  const { items } = useInventory();
  const { createSale, loading } = useBilling();
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showBillPreview, setShowBillPreview] = useState(false);

  const filteredItems = items.filter(item => 
    item.status === 'active' && 
    item.stock_quantity > 0 &&
    (selectedCategory === 'all' || item.category === selectedCategory) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToBill = (item: InventoryItem) => {
    const existingItem = billItems.find(billItem => billItem.id === item.id);
    
    if (existingItem) {
      if (existingItem.quantity < item.stock_quantity) {
        setBillItems(prev => prev.map(billItem =>
          billItem.id === item.id
            ? { ...billItem, quantity: billItem.quantity + 1, totalPrice: (billItem.quantity + 1) * billItem.unitPrice }
            : billItem
        ));
      }
    } else {
      setBillItems(prev => [...prev, {
        id: item.id,
        item,
        quantity: 1,
        unitPrice: item.price,
        totalPrice: item.price
      }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setBillItems(prev => prev.filter(item => item.id !== id));
      return;
    }

    setBillItems(prev => prev.map(billItem =>
      billItem.id === id
        ? { ...billItem, quantity, totalPrice: quantity * billItem.unitPrice }
        : billItem
    ));
  };

  const removeFromBill = (id: string) => {
    setBillItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = billItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handleShowBillPreview = () => {
    if (billItems.length === 0) {
      alert('Please add items to the bill');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    setShowBillPreview(true);
  };

  const handleConfirmSale = async () => {
    const saleData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      total_amount: subtotal,
      discount_amount: discountAmount,
      final_amount: total,
      payment_method: paymentMethod,
      items: billItems.map(billItem => ({
        inventory_item_id: billItem.item.id,
        item_name: billItem.item.name,
        item_sku: billItem.item.sku,
        quantity: billItem.quantity,
        unit_price: billItem.unitPrice,
        total_price: billItem.totalPrice
      }))
    };

    const result = await createSale(saleData);
    if (result.success) {
      // Reset form
      setBillItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
      setPaymentMethod('cash');
      setShowBillPreview(false);
      alert('Sale completed successfully!');
    } else {
      alert('Failed to create sale. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing System</h1>
          <p className="text-gray-600">Create new sales and manage billing</p>
        </div>
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Selection */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Products</h2>
            
            {/* Search and Category Filter */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : 
                       category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Calculator className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No products found</p>
                <p className="text-sm">Try adjusting your search or category filter</p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => addToBill(item)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.brand} • {item.sku}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-500">Stock: {item.stock_quantity}</p>
                        {item.has_warranty && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {item.warranty_duration} {item.warranty_unit} warranty
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{item.price}</p>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Bill Summary</h2>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Customer Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Bill Items */}
          <div className="max-h-64 overflow-y-auto">
            {billItems.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Calculator className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No items added to bill</p>
              </div>
            ) : (
              billItems.map(billItem => (
                <div key={billItem.id} className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{billItem.item.name}</h4>
                      <p className="text-sm text-gray-500">₹{billItem.unitPrice} each</p>
                      {billItem.item.has_warranty && (
                        <p className="text-xs text-green-600">
                          {billItem.item.warranty_duration} {billItem.item.warranty_unit} warranty
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={billItem.item.stock_quantity}
                        value={billItem.quantity}
                        onChange={(e) => updateQuantity(billItem.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                      <span className="font-semibold text-gray-900 w-20 text-right">
                        ₹{billItem.totalPrice.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromBill(billItem.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Totals */}
          {billItems.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Discount (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                  />
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount Amount:</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <button
                  onClick={handleShowBillPreview}
                  disabled={billItems.length === 0 || !customerName.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" />
                  Print Bill Preview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bill Preview Modal */}
      <BillPreviewModal
        isOpen={showBillPreview}
        onClose={() => setShowBillPreview(false)}
        onConfirm={handleConfirmSale}
        billItems={billItems}
        customerName={customerName}
        customerPhone={customerPhone}
        subtotal={subtotal}
        discountAmount={discountAmount}
        total={total}
        paymentMethod={paymentMethod}
        loading={loading}
      />
    </div>
  );
}