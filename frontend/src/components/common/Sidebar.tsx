import React from 'react';
import { SidebarItem } from '../types/types';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  items: SidebarItem[];
  userType: 'patient' | 'doctor';
}

const Sidebar: React.FC<SidebarProps> = ({ items, userType }) => {
  const auth = useAuth();
  
  return (
    <div className="w-64 bg-white h-screen shadow-lg fixed">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">Mediconnect</h1>
        <p className="text-gray-500 text-sm mt-1">Portal</p>
      </div>
      
      <div className="mt-8">
        <h3 className="px-6 text-gray-500 uppercase text-xs font-semibold">Overview</h3>
        <ul className="mt-4">
          {items.map(({ name, icon: Icon, path }, index) => (
            <li key={index} className="px-6 py-3 hover:bg-blue-50 cursor-pointer flex items-center">
              <Icon className="w-5 h-5 mr-3" />
              <span>{name}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="absolute bottom-0 w-full p-6 border-t">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600">{userType === 'doctor' ? 'Dr.' : 'P'}</span>
          </div>
          <div className="ml-3">
            <p className="font-medium">
              {auth.user?.name}
            </p>
            <p className="text-gray-500 text-sm">Profile</p>
          </div>
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-gray-500 cursor-pointer">Settings</span>
          <span 
            className="text-red-500 cursor-pointer"
            onClick={() => auth.logout()}
          >
            Log out
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;