import React from 'react';
import { Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Sale {
  id: string;
  customer_name: string;
  final_amount: number;
  created_at: string;
}

interface RecentSalesProps {
  sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {sales.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No recent sales</p>
          </div>
        ) : (
          sales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{sale.customer_name}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(sale.created_at), 'MMM dd, HH:mm')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">₹{sale.final_amount.toFixed(2)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}