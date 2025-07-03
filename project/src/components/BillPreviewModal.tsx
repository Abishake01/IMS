
import { X, Printer, Save, Building, Phone, Mail, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface BillItem {
  id: string;
  item: {
    name: string;
    sku: string;
  };
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
  customerPhone: string;
  subtotal: number;
  discountAmount: number;
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
  total,
  paymentMethod,
  loading
}: BillPreviewModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const billNumber = `BILL-${Date.now().toString().slice(-6)}`;
  const currentDate = new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 print:hidden">
          <h2 className="text-xl font-semibold text-gray-900">Bill Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Bill Content */}
        <div className="p-8 print:p-4" id="bill-content">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mobile Shop</h1>
                <p className="text-gray-600">Inventory & Billing System</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 9876543210</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@mobileshop.com</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>123 Tech Street, City</span>
              </div>
            </div>
          </div>

          {/* Bill Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{customerName}</p>
                {customerPhone && (
                  <p className="text-gray-600">{customerPhone}</p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">Bill Number: </span>
                  <span className="font-semibold">{billNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date: </span>
                  <span className="font-semibold">{format(currentDate, 'MMM dd, yyyy')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Time: </span>
                  <span className="font-semibold">{format(currentDate, 'HH:mm')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Payment: </span>
                  <span className="font-semibold capitalize">{paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Item</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Qty</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Price</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {billItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">{item.item.name}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">₹{item.unitPrice.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-semibold">₹{item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-sm">
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200 text-green-600">
                    <span>Discount:</span>
                    <span className="font-semibold">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t-2 border-gray-300 text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 border-t border-gray-300 pt-6">
            <p className="mb-2">Thank you for your business!</p>
            <p>For any queries, please contact us at +91 9876543210</p>
            <p className="mt-4 font-semibold">Mobile Shop - Your Trusted Technology Partner</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 p-6 border-t border-gray-200 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Saving...' : 'Confirm & Save Sale'}
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #bill-content, #bill-content * {
            visibility: visible;
          }
          #bill-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-4 {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}