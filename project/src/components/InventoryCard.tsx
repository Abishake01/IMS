import { Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '../lib/supabase';

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export function InventoryCard({ item, onEdit, onDelete }: InventoryCardProps) {
  const isLowStock = item.stock_quantity <= item.min_stock_level;
  const isOutOfStock = item.stock_quantity === 0;

  const getStockColor = () => {
    if (isOutOfStock) return 'text-red-600 bg-red-50';
    if (isLowStock) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const getStockIcon = () => {
    if (isOutOfStock || isLowStock) return <AlertTriangle className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="aspect-w-16 aspect-h-9 bg-gray-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 truncate">{item.name}</h3>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {item.category}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xl font-bold text-gray-900">₹{item.price}</p>
            <p className="text-sm text-gray-500">SKU: {item.sku}</p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getStockColor()}`}>
            {getStockIcon()}
            <span>{item.stock_quantity} in stock</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}