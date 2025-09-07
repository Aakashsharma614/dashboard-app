import React, { useState, useReducer } from 'react';
import { X, Plus, Search, RotateCcw, MoreVertical } from 'lucide-react';

// these are our Initial dashboard state please have a look....
const initialState = {
  cspm: [
    {
      id: 'cloud-accounts',
      name: 'Cloud Accounts',
      data: { connected: 2, notConnected: 2 },
      type: 'donut',
      isActive: true
    },
    {
      id: 'risk-assessment',
      name: 'Cloud Account Risk Assessment',
      data: { failed: 1689, warning: 681, notAvailable: 36, passed: 7253 },
      type: 'donut',
      isActive: true
    }
  ],
  cwpp: [
    {
      id: 'namespace-alerts',
      name: 'Top 5 Namespace Specific Alerts',
      data: null,
      type: 'bar',
      isActive: true
    },
    {
      id: 'workload-alerts',
      name: 'Workload Alerts',
      data: null,
      type: 'line',
      isActive: true
    }
  ],
  registry: [
    {
      id: 'image-risk',
      name: 'Image Risk Assessment',
      data: { critical: 9, high: 150, medium: 600, low: 700 },
      type: 'bar',
      isActive: true
    },
    {
      id: 'image-security',
      name: 'Image Security Issues',
      data: { critical: 2, high: 6, medium: 10, low: 20 },
      type: 'bar',
      isActive: true
    }
  ]
};

// Available widgets that can be added
const availableWidgets = {
  cspm: [
    { id: 'compliance-status', name: 'Compliance Status', type: 'donut' },
    { id: 'security-score', name: 'Security Score', type: 'gauge' },
    { id: 'resource-count', name: 'Resource Count', type: 'number' }
  ],
  cwpp: [
    { id: 'threat-detection', name: 'Threat Detection', type: 'line' },
    { id: 'policy-violations', name: 'Policy Violations', type: 'bar' },
    { id: 'container-security', name: 'Container Security', type: 'donut' }
  ],
  registry: [
    { id: 'vulnerability-trends', name: 'Vulnerability Trends', type: 'line' },
    { id: 'scan-results', name: 'Scan Results', type: 'bar' },
    { id: 'repository-health', name: 'Repository Health', type: 'donut' }
  ]
};

// Widget reducer
function widgetReducer(state, action) {
  switch (action.type) {
    case 'ADD_WIDGET':
      return {
        ...state,
        [action.category]: [...state[action.category], action.widget]
      };
    case 'REMOVE_WIDGET':
      return {
        ...state,
        [action.category]: state[action.category].filter(w => w.id !== action.widgetId)
      };
    case 'TOGGLE_WIDGET':
      return {
        ...state,
        [action.category]: state[action.category].map(widget =>
          widget.id === action.widgetId
            ? { ...widget, isActive: !widget.isActive }
            : widget
        )
      };
    default:
      return state;
  }
}

// Donut Chart Component
const DonutChart = ({ data, colors }) => {
  if (!data) return null;
  
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  let cumulativePercentage = 0;
  
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg width="128" height="128" className="transform -rotate-90">
        {Object.entries(data).map(([key, value], index) => {
          const percentage = (value / total) * 100;
          const strokeDasharray = `${percentage * 2.51} 251.2`;
          const strokeDashoffset = -(cumulativePercentage * 2.51);
          cumulativePercentage += percentage;
          
          return (
            <circle
              key={key}
              cx="64"
              cy="64"
              r="40"
              fill="transparent"
              stroke={colors[index]}
              strokeWidth="16"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold">{total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>
    </div>
  );
};

// Bar Chart Component
const BarChart = ({ data, colors }) => {
  if (!data) return null;
  
  const values = Object.values(data);
  const max = Math.max(...values);
  
  return (
    <div className="w-full h-32 flex items-end justify-center space-x-2">
      {Object.entries(data).map(([key, value], index) => {
        const height = (value / max) * 100;
        return (
          <div key={key} className="flex flex-col items-center">
            <div className="text-xs mb-1">{value}</div>
            <div 
              className="w-8 rounded-t"
              style={{ 
                height: `${height}px`,
                backgroundColor: colors[index],
                minHeight: '4px'
              }}
            />
            <div className="text-xs mt-1 capitalize">{key}</div>
          </div>
        );
      })}
    </div>
  );
};

// Widget Component
const Widget = ({ widget, category, onRemove }) => {
  if (!widget.isActive) return null;

  const getChart = () => {
    if (!widget.data) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-400">
          <div className="text-center">
            <div className="text-sm">No Graph data available!</div>
          </div>
        </div>
      );
    }

    switch (widget.type) {
      case 'donut':
        const donutColors = widget.id === 'cloud-accounts' 
          ? ['#3B82F6', '#EF4444'] 
          : ['#EF4444', '#F59E0B', '#6B7280', '#10B981'];
        return <DonutChart data={widget.data} colors={donutColors} />;
      case 'bar':
        const barColors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
        return <BarChart data={widget.data} colors={barColors} />;
      default:
        return <div className="h-32 bg-gray-100 rounded"></div>;
    }
  };

  const getLegend = () => {
    if (!widget.data) return null;

    const legendColors = widget.id === 'cloud-accounts' 
      ? { connected: '#3B82F6', 'not connected': '#EF4444' }
      : widget.id === 'risk-assessment'
      ? { failed: '#EF4444', warning: '#F59E0B', 'not available': '#6B7280', passed: '#10B981' }
      : { critical: '#EF4444', high: '#F59E0B', medium: '#3B82F6', low: '#10B981' };

    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(widget.data).map(([key, value]) => (
          <div key={key} className="flex items-center text-xs">
            <div 
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: legendColors[key.toLowerCase()] }}
            />
            <span className="capitalize">{key} ({value})</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 relative group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium text-sm">{widget.name}</h3>
        <button
          onClick={() => onRemove(category, widget.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={16} className="text-gray-400 hover:text-red-500" />
        </button>
      </div>
      
      {getChart()}
      {getLegend()}
    </div>
  );
};

// Add Widget Modal
const AddWidgetModal = ({ isOpen, onClose, currentWidgets, onAddWidget, onToggleWidget }) => {
  const [activeTab, setActiveTab] = useState('CSPM');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const getCurrentCategoryWidgets = () => {
    const category = activeTab.toLowerCase().replace('cwpp', 'cwpp').replace('image', 'registry');
    return currentWidgets[category] || [];
  };

  const getAvailableWidgets = () => {
    const category = activeTab.toLowerCase().replace('cwpp', 'cwpp').replace('image', 'registry');
    return availableWidgets[category] || [];
  };

  const handleAddWidget = (widgetTemplate) => {
    const category = activeTab.toLowerCase().replace('cwpp', 'cwpp').replace('image', 'registry');
    
    // Add sample data based on widget type and category
    let sampleData;
    if (widgetTemplate.type === 'donut') {
      if (category === 'cspm') {
        sampleData = { passed: 150, failed: 30, warning: 20 };
      } else if (category === 'registry') {
        sampleData = { low: 200, medium: 100, high: 50, critical: 10 };
      } else {
        sampleData = { secure: 80, vulnerable: 20 };
      }
    } else if (widgetTemplate.type === 'bar') {
      if (category === 'registry') {
        sampleData = { critical: 5, high: 25, medium: 75, low: 150 };
      } else {
        sampleData = { high: 45, medium: 85, low: 120 };
      }
    } else if (widgetTemplate.type === 'line') {
      sampleData = { jan: 10, feb: 25, mar: 40, apr: 30 };
    } else {
      sampleData = { total: 100 };
    }
    
    const newWidget = {
      ...widgetTemplate,
      id: `${widgetTemplate.id}-${Date.now()}`,
      data: sampleData,
      isActive: true
    };
    onAddWidget(category, newWidget);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[500px]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-medium">Add Widget</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Personalise your dashboard by adding the following widget
          </p>

          {/* Tabs */}
          <div className="flex border-b mb-4">
            {['CSPM', 'CWPP', 'Image'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm ${
                  activeTab === tab 
                    ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                    : 'text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Current Widgets */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Current Widgets</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {getCurrentCategoryWidgets().map(widget => (
                <div key={widget.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={widget.isActive}
                    onChange={() => onToggleWidget(activeTab.toLowerCase().replace('image', 'registry'), widget.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">{widget.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Available Widgets to Add */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Available Widgets</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {getAvailableWidgets().map(widget => (
                <div key={widget.id} className="flex items-center justify-between">
                  <span className="text-sm">{widget.name}</span>
                  <button
                    onClick={() => handleAddWidget(widget)}
                    className="text-blue-600 text-sm hover:bg-blue-50 px-2 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 p-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard
const CNAPPDashboard = () => {
  const [widgets, dispatch] = useReducer(widgetReducer, initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 2 days');

  const handleAddWidget = (category, widget) => {
    dispatch({ type: 'ADD_WIDGET', category, widget });
  };

  const handleRemoveWidget = (category, widgetId) => {
    dispatch({ type: 'REMOVE_WIDGET', category, widgetId });
  };

  const handleToggleWidget = (category, widgetId) => {
    dispatch({ type: 'TOGGLE_WIDGET', category, widgetId });
  };

  const categories = [
    { key: 'cspm', title: 'CSPM Executive Dashboard' },
    { key: 'cwpp', title: 'CWPP Dashboard' },
    { key: 'registry', title: 'Registry Scan' }
  ];

  const timeRanges = [
    'Last 2 days',
    'Last week',
    'Last month',
    'Last year'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-lg font-medium">Dashboard V2</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="pl-10 pr-4 py-2 bg-gray-100 rounded-md text-sm w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Time Range Dropdown */}
              <select
                className="px-3 py-2 border rounded text-sm"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                {timeRanges.map((range, idx) => (
                  <option key={idx} value={range}>
                    {range}
                  </option>
                ))}
              </select>

              <button className="p-2 hover:bg-gray-100 rounded">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">CNAPP Dashboard</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 flex items-center space-x-2"
          >
            <span>Add Widget</span>
            <Plus size={16} />
          </button>
        </div>

        {/* Categories */}
        {categories.map(({ key, title }) => (
          <div key={key} className="mb-8">
            <h3 className="text-lg font-medium mb-4">{title}</h3>
            <div className="grid grid-cols-3 gap-4">
              {widgets[key]
                .filter(w => w.isActive && (!searchTerm || w.name.toLowerCase().includes(searchTerm.toLowerCase())))
                .map(widget => (
                  <Widget
                    key={widget.id}
                    widget={widget}
                    category={key}
                    onRemove={handleRemoveWidget}
                  />
                ))}
              
              {/* Add Widget Button */}
              <div 
                className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 flex items-center justify-center cursor-pointer hover:border-gray-400"
                onClick={() => setIsModalOpen(true)}
              >
                <div className="text-center text-gray-500">
                  <Plus size={24} className="mx-auto mb-2" />
                  <span className="text-sm">Add Widget</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Widget Modal */}
      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentWidgets={widgets}
        onAddWidget={handleAddWidget}
        onToggleWidget={handleToggleWidget}
      />
    </div>
  );
};

export default CNAPPDashboard;
