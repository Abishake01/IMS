
import { AlertTriangle, Package } from 'lucide-react';

interface LowStockItem {
  id: string;
  name: string;
  stock_quantity: number;
  min_stock_level: number;
}

interface LowStockAlertProps {
  items: LowStockItem[];
}

export function LowStockAlert({ items }: LowStockAlertProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-amber-600" />
        <h3 className="text-lg font-semibold text-amber-800">Low Stock Alert</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-600">
                  Stock: {item.stock_quantity} / Min: {item.min_stock_level}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}