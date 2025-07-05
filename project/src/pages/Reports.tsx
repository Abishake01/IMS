import { useState } from 'react';
import { Calendar, TrendingUp, Download, Menu, Package, Wrench } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { useAdminServices } from '../hooks/useAdminServices';
import { SalesChart } from '../components/SalesChart';
import { TopProductsChart } from '../components/TopProductsChart';
import { ReportCard } from '../components/ReportCard';
import { format, subDays } from 'date-fns';

interface ReportsProps {
  onMenuClick: () => void;
}

export function Reports({ onMenuClick }: ReportsProps) {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'user-services' | 'admin-services'>('overview');
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    return {
      start: format(subDays(today, 7), 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd')
    };
  });

  const { reports, salesData, topProducts, productDetails, serviceDetails, loading } = useReports(reportType, dateRange);
  const { adminServices } = useAdminServices();

  const handleReportTypeChange = (type: 'daily' | 'weekly' | 'monthly') => {
    setReportType(type);
    const today = new Date();
    
    switch (type) {
      case 'daily':
        setDateRange({
          start: format(subDays(today, 7), 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        });
        break;
      case 'weekly':
        setDateRange({
          start: format(subDays(today, 28), 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        });
        break;
      case 'monthly':
        setDateRange({
          start: format(subDays(today, 90), 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        });
        break;
    }
  };

  const exportOverviewReport = () => {
    const csvContent = [
      ['Period', 'Sales', 'Transactions', 'Items Sold', 'Avg Order Value'],
      ...salesData.map(item => [
        item.name,
        `₹${item.sales?.toFixed(2) || '0.00'}`,
        item.transactions || 0,
        item.items || 0,
        `₹${item.avgOrderValue?.toFixed(2) || '0.00'}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-overview-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportProductReport = () => {
    const csvContent = [
      ['Item Name', 'Date', 'Quantity', 'Unit Price', 'Total Price'],
      ...productDetails.map(item => [
        item.item_name,
        format(new Date(item.date), 'yyyy-MM-dd'),
        item.quantity,
        `₹${item.unit_price.toFixed(2)}`,
        `₹${item.total_price.toFixed(2)}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-details-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportUserServiceReport = () => {
    const csvContent = [
      ['S.No', 'Mobile Model', 'Problem', 'Customer Name', 'Phone Number', 'Service Date', 'Amount', 'Material Cost', 'Comments'],
      ...serviceDetails.map((item, index) => [
        index + 1,
        item.model_name,
        item.problem,
        item.customer_name,
        item.phone_number,
        format(new Date(item.service_date || item.created_at), 'yyyy-MM-dd'),
        `₹${item.amount.toFixed(2)}`,
        `₹${(item.material_cost || 0).toFixed(2)}`,
        item.comments
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-service-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportAdminServiceReport = () => {
    const csvContent = [
      ['S.No', 'Mobile Model', 'Problem', 'Customer Name', 'Phone Number', 'Service Date', 'Amount', 'Material Cost', 'Status', 'Comments'],
      ...adminServices.map((item, index) => [
        index + 1,
        item.model_name,
        item.problem,
        item.customer_name,
        item.phone_number,
        format(new Date(item.service_date || item.created_at), 'yyyy-MM-dd'),
        `₹${item.amount.toFixed(2)}`,
        `₹${item.material_cost.toFixed(2)}`,
        item.status,
        item.comments
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-service-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getExportFunction = () => {
    switch (activeTab) {
      case 'overview':
        return exportOverviewReport;
      case 'products':
        return exportProductReport;
      case 'user-services':
        return exportUserServiceReport;
      case 'admin-services':
        return exportAdminServiceReport;
      default:
        return exportOverviewReport;
    }
  };

  const getExportLabel = () => {
    switch (activeTab) {
      case 'overview':
        return 'Overview';
      case 'products':
        return 'Products';
      case 'user-services':
        return 'User Services';
      case 'admin-services':
        return 'Admin Services';
      default:
        return 'Overview';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Analyze your sales performance and service records</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <Menu className="w-6 h-6" />
          </button>
          <button 
            onClick={getExportFunction()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export {getExportLabel()}
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleReportTypeChange(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  reportType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab('user-services')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'user-services'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Services
            </button>
            <button
              onClick={() => setActiveTab('admin-services')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'admin-services'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Admin Services
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Report Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ReportCard
              title="Total Sales"
              value={`₹${reports.totalSales.toLocaleString()}`}
              change={reports.salesChange}
              icon={TrendingUp}
            />
            <ReportCard
              title="Total Transactions"
              value={reports.totalTransactions.toString()}
              change={reports.transactionChange}
              icon={Calendar}
            />
            <ReportCard
              title="Average Order Value"
              value={`₹${reports.averageOrderValue.toFixed(2)}`}
              change={reports.aovChange}
              icon={TrendingUp}
            />
            <ReportCard
              title="Items Sold"
              value={reports.totalItemsSold.toString()}
              change={reports.itemsChange}
              icon={TrendingUp}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SalesChart data={salesData} title={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Sales Trend`} />
            <TopProductsChart data={topProducts} />
          </div>

          {/* Detailed Report Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Detailed {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Order Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.sales?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.transactions || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.items || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.avgOrderValue?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeTab === 'products' ? (
        /* Product Details Tab */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Product Sales Details</h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productDetails.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.item_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(item.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{item.unit_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{item.total_price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {productDetails.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No product sales found</h3>
              <p className="text-gray-500">
                No products were sold in the selected date range.
              </p>
            </div>
          )}
        </div>
      ) : activeTab === 'user-services' ? (
        /* User Services Tab */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">User Service Reports</h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceDetails.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.model_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {item.problem}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(item.service_date || item.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{item.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{(item.material_cost || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {item.comments || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {serviceDetails.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No user service records found</h3>
              <p className="text-gray-500">
                No user service requests were created in the selected date range.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Admin Services Tab */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Admin Service Reports</h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adminServices.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.model_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {item.problem}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(item.service_date || item.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{item.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{item.material_cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {item.comments || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {adminServices.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No admin service records found</h3>
              <p className="text-gray-500">
                No admin service records were created in the selected date range.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}