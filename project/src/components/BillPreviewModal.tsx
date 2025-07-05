
import { X, Printer, Check } from 'lucide-react';
import { InventoryItem } from '../lib/supabase';

interface BillItem {
  id: string;
  item: InventoryItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface BillPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  billItems: BillItem[];
  customerName: string;
  customerPhone?: string;
  subtotal: number;
  discountAmount: number;
  gstAmount: number;
  cgstAmount: number;
  total: number;
  paymentMethod: string;
  loading: boolean;
}

export function BillPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  billItems,
  customerName,
  customerPhone,
  subtotal,
  discountAmount,
  gstAmount,
  cgstAmount,
  total,
  paymentMethod,
  loading
}: BillPreviewModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bill Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6" id="bill-content">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Mobile Store</h1>
            <p className="text-gray-600">Sales Invoice</p>
            <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
            <p className="text-gray-700">{customerName}</p>
            {customerPhone && <p className="text-gray-700">{customerPhone}</p>}
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {billItems.map((billItem) => {
                  const isPhoneItem =  
                                    billItem.item.category === 'featured_phones' || 
                                    billItem.item.category === 'smart_phones';
                  
                  return (
                    <tr key={billItem.id}>
                      <td className="border border-gray-300 px-4 py-2">
                        <div>
                          <div className="font-medium">{billItem.item.name}</div>
                          <div className="text-sm text-gray-500">{billItem.item.brand}</div>
                           
                          
                          {/* Only show phone-specific details for phone items */}
                          {isPhoneItem && billItem.item.specifications && (
                            <div className="text-sm text-gray-500 mt-1">
                              {billItem.item.specifications.storage && (
                                <div>Storage: {billItem.item.specifications.storage}</div>
                              )}
                              {billItem.item.specifications.color && (
                                <div>Color: {billItem.item.specifications.color}</div>
                              )}
                              {billItem.item.specifications.imei && (
                                <div>IMEI: {billItem.item.specifications.imei}</div>
                              )}
                            </div>
                          )}
                          
                          {billItem.item.has_warranty && (
                            <div className="text-sm text-green-600">
                              Warranty: {billItem.item.warranty_duration} {billItem.item.warranty_unit}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {billItem.quantity}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        ₹{billItem.unitPrice.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        ₹{billItem.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="flex justify-between py-1">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between py-1 text-green-600">
                  <span>Discount:</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              {gstAmount > 0 && (
                <div className="flex justify-between py-1">
                  <span>GST:</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
              )}
              
              {cgstAmount > 0 && (
                <div className="flex justify-between py-1">
                  <span>CGST:</span>
                  <span>₹{cgstAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-t border-gray-300 font-semibold text-lg">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <p className="text-gray-700">
              <span className="font-medium">Payment Method:</span> {paymentMethod.replace('_', ' ').toUpperCase()}
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
            <p>Thank you for your business!</p>
            <p>For any queries, please contact us.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm Sale
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}