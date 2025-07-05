import { useState } from 'react';
import { X, Calendar, User, Phone, CreditCard, Package, Shield, Printer } from 'lucide-react';
import { format, parseISO, addDays, addMonths, addYears } from 'date-fns';

import { BillPreviewModal } from './BillPreviewModal';

interface SaleItem {
  id: string;
  item_name: string;
  item_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  inventory_item?: {
    has_warranty: boolean;
    warranty_duration: number;
    warranty_unit: string;
    specifications?: {
      storage?: string;
      color?: string;
    };
  };
}

interface Sale {
  id: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  discount_amount: number;
  gst_amount?: number;
  cgst_amount?: number;
  final_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  sale_items?: SaleItem[];
}

interface SaleDetailsModalProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
}

export function SaleDetailsModal({ sale, isOpen, onClose }: SaleDetailsModalProps) {
  const [showPrintModal, setShowPrintModal] = useState(false);

  if (!isOpen) return null;

  const getWarrantyInfo = (saleDate: string, hasWarranty: boolean, duration: number, unit: string) => {
    if (!hasWarranty) return { status: 'No Warranty', expiryDate: null, remainingDays: 0 };
    
    const sale = parseISO(saleDate);
    const now = new Date();
    
    let expiryDate: Date;
    
    switch (unit) {
      case 'days':
        expiryDate = addDays(sale, duration);
        break;
      case 'months':
        expiryDate = addMonths(sale, duration);
        break;
      case 'years':
        expiryDate = addYears(sale, duration);
        break;
      default:
        expiryDate = addDays(sale, duration);
    }
    
    const diffTime = expiryDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (remainingDays > 0) {
      return {
        status: `${remainingDays} days remaining`,
        expiryDate: format(expiryDate, 'MMM dd, yyyy'),
        remainingDays
      };
    } else {
      return {
        status: 'Warranty Expired',
        expiryDate: format(expiryDate, 'MMM dd, yyyy'),
        remainingDays: 0
      };
    }
  };

  const handlePrintBill = () => {
    setShowPrintModal(true);
  };

  // Convert sale items to bill items format for printing
  const billItems = sale.sale_items?.map(item => ({
    id: item.id,
    item: item.inventory_item as any, // Pass the full inventory_item object to match InventoryItem type
    quantity: item.quantity,
    unitPrice: item.unit_price,
    totalPrice: item.total_price,
    selectedIMEI: item.item_sku.length > 10 ? item.item_sku : undefined // Assume IMEI if SKU is long
  })) || [];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Sale Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintBill}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Bill
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Sale Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Sale Date</p>
                    <p className="font-medium">{format(parseISO(sale.created_at), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{sale.customer_name}</p>
                  </div>
                </div>

                {sale.customer_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{sale.customer_phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium capitalize">{sale.payment_method}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                    sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {sale.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Sale ID</p>
                  <p className="font-medium text-xs">#{sale.id}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Items</h3>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU/IMEI</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warranty</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sale.sale_items?.map((item) => {
                      const warrantyInfo = item.inventory_item ? 
                        getWarrantyInfo(
                          sale.created_at,
                          item.inventory_item.has_warranty,
                          item.inventory_item.warranty_duration,
                          item.inventory_item.warranty_unit
                        ) : { status: 'No Warranty', expiryDate: null, remainingDays: 0 };

                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.item_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 font-mono">{item.item_sku}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">₹{item.unit_price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{item.total_price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Shield className="w-4 h-4 text-gray-400" />
                              <div>
                                <span className={`text-xs font-medium ${
                                  warrantyInfo.status === 'No Warranty' ? 'text-gray-500' :
                                  warrantyInfo.status === 'Warranty Expired' ? 'text-red-600' :
                                  'text-green-600'
                                }`}>
                                  {warrantyInfo.status}
                                </span>
                                {warrantyInfo.expiryDate && (
                                  <p className="text-xs text-gray-400">
                                    Expires: {warrantyInfo.expiryDate}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{sale.total_amount.toFixed(2)}</span>
                </div>
                {sale.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₹{sale.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                {sale.gst_amount && sale.gst_amount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>GST:</span>
                    <span>+₹{sale.gst_amount.toFixed(2)}</span>
                  </div>
                )}
                {sale.cgst_amount && sale.cgst_amount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>CGST:</span>
                    <span>+₹{sale.cgst_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>₹{sale.final_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <BillPreviewModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          onConfirm={() => setShowPrintModal(false)}
          billItems={billItems}
          customerName={sale.customer_name}
          customerPhone={sale.customer_phone || ''}
          subtotal={sale.total_amount}
          discountAmount={sale.discount_amount}
          gstAmount={sale.gst_amount ?? 0}
          cgstAmount={sale.cgst_amount ?? 0}
          total={sale.final_amount}
          paymentMethod={sale.payment_method}
          loading={false}
        />
      )}
    </>
  );
}