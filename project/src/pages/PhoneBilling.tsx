import { useState } from 'react';
import { Plus, Search, Smartphone, ShoppingCart, Eye } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useBilling } from '../hooks/useBilling';
import { usePhoneIMEI } from '../hooks/usePhoneIMEI';
import { InventoryItem } from '../lib/supabase';
import { BillPreviewModal } from '../components/BillPreviewModal';

interface CartItem extends InventoryItem {
  quantity: number;
  selectedIMEI?: string;
}

export function PhoneBilling() {
  const { items } = useInventory();
  const { createSale } = useBilling();
  const { fetchPhoneIMEIs, phoneIMEIs } = usePhoneIMEI();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPhoneForIMEI, setSelectedPhoneForIMEI] = useState<string | null>(null);

  // Filter only phones that are active and in stock
  const phones = items.filter(item => 
    (item.category === 'phones' || 
     item.category === 'featured_phones' || 
     item.category === 'button_phones') &&
    item.status === 'active' &&
    item.stock_quantity > 0
  );

  const filteredPhones = phones.filter(phone =>
    phone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    phone.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    phone.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = async (phone: InventoryItem) => {
    // Fetch available IMEIs for this phone
    await fetchPhoneIMEIs(phone.id);
    setSelectedPhoneForIMEI(phone.id);
  };

  const selectIMEIAndAddToCart = (phone: InventoryItem, imeiNumber: string) => {
    const existingItem = cart.find(item => item.id === phone.id && item.selectedIMEI === imeiNumber);
    
    if (existingItem) {
      alert('This IMEI is already in the cart');
      return;
    }

    const cartItem: CartItem = {
      ...phone,
      quantity: 1,
      selectedIMEI: imeiNumber
    };

    setCart(prev => [...prev, cartItem]);
    setSelectedPhoneForIMEI(null);
  };

  const removeFromCart = (phoneId: string, imei: string) => {
    setCart(prev => prev.filter(item => !(item.id === phoneId && item.selectedIMEI === imei)));
  };

  const updateQuantity = (phoneId: string, imei: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(phoneId, imei);
      return;
    }

    setCart(prev => prev.map(item => 
      item.id === phoneId && item.selectedIMEI === imei
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discountAmount;
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert('Please add items to cart');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    const saleData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      total_amount: calculateSubtotal(),
      discount_amount: discountAmount,
      final_amount: calculateTotal(),
      payment_method: paymentMethod,
      notes: notes,
      items: cart.map(item => ({
        inventory_item_id: item.id,
        item_name: item.name,
        item_sku: item.sku,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        selectedIMEI: item.selectedIMEI
      }))
    };

    try {
      const result = await createSale(saleData);
      if (result.success) {
        alert('Sale completed successfully!');
        // Reset form
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setDiscountAmount(0);
        setNotes('');
        setPaymentMethod('cash');
      } else {
        alert(result.error || 'Failed to complete sale');
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      alert('Failed to complete sale');
    }
  };

  const availableIMEIs = phoneIMEIs.filter(imei => !imei.is_sold);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Phone Billing</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ShoppingCart className="w-4 h-4" />
          <span>{cart.length} items in cart</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phone Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search phones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPhones.map((phone) => (
                  <div key={phone.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {phone.image_base64 || phone.image_url ? (
                          <img
                            src={phone.image_base64 || phone.image_url}
                            alt={phone.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Smartphone className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{phone.name}</h3>
                        <p className="text-sm text-gray-500">{phone.brand}</p>
                        <div className="text-xs text-gray-400 space-y-1">
                          {phone.specifications?.storage && (
                            <div>Storage: {phone.specifications.storage}</div>
                          )}
                          {phone.specifications?.color && (
                            <div>Color: {phone.specifications.color}</div>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900">₹{phone.price.toLocaleString()}</span>
                          <span className="text-sm text-gray-500">Stock: {phone.stock_quantity}</span>
                        </div>
                        <button
                          onClick={() => addToCart(phone)}
                          className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Select IMEI
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPhones.length === 0 && (
                <div className="text-center py-12">
                  <Smartphone className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No phones found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search criteria.' : 'No phones available for sale.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart and Customer Details */}
        <div className="space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cart</h3>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${item.selectedIMEI}`} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.brand}</p>
                      <p className="text-xs text-gray-400 font-mono">IMEI: {item.selectedIMEI}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-gray-900">₹{item.price.toLocaleString()}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedIMEI!, Math.max(0, item.quantity - 1))}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedIMEI!, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedIMEI!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Discount:</label>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="0"
                      min="0"
                      max={calculateSubtotal()}
                    />
                  </div>
                  
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Add any notes..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={handleCompleteSale}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Complete Sale
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IMEI Selection Modal */}
      {selectedPhoneForIMEI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Select IMEI Number</h3>
              <button
                onClick={() => setSelectedPhoneForIMEI(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {availableIMEIs.length === 0 ? (
                <p className="text-center text-gray-500">No available IMEI numbers for this phone.</p>
              ) : (
                <div className="space-y-2">
                  {availableIMEIs.map((imeiData) => (
                    <button
                      key={imeiData.id}
                      onClick={() => {
                        const phone = phones.find(p => p.id === selectedPhoneForIMEI);
                        if (phone) {
                          selectIMEIAndAddToCart(phone, imeiData.imei_number);
                        }
                      }}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-mono text-sm">{imeiData.imei_number}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bill Preview Modal */}
      {showPreview && (
        <BillPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          saleData={{
            customer_name: customerName,
            customer_phone: customerPhone,
            total_amount: calculateSubtotal(),
            discount_amount: discountAmount,
            final_amount: calculateTotal(),
            payment_method: paymentMethod,
            notes: notes,
            items: cart.map(item => ({
              inventory_item_id: item.id,
              item_name: item.name,
              item_sku: item.sku,
              quantity: item.quantity,
              unit_price: item.price,
              total_price: item.price * item.quantity,
              selectedIMEI: item.selectedIMEI
            }))
          }}
          onConfirm={handleCompleteSale}
        />
      )}
    </div>
  );
}