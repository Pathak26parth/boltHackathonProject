import React from 'react';
import { Loader2, Users, AlertTriangle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'processing' | 'taking attendance' | 'no one detected';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'processing':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Processing',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          dotColor: 'bg-blue-500'
        };
      case 'taking attendance':
        return {
          icon: <Users className="w-4 h-4" />,
          text: 'Taking Attendance',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          dotColor: 'bg-green-500'
        };
      case 'no one detected':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'No One Detected',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          dotColor: 'bg-orange-500'
        };
      default:
        return {
          icon: <Loader2 className="w-4 h-4" />,
          text: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          dotColor: 'bg-gray-500'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center space-x-3 px-4 py-2 rounded-full ${config.bgColor}`}>
      <div className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}></div>
      {config.icon}
      <span className={`font-medium text-sm ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
};

export default StatusIndicator;