'use client';
import { usePathname } from 'next/navigation';
import { navConfig } from '@/lib/navConfig';
import { BellIcon } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarImage } from './ui/avatar';

const pathToMainKey: Record<string, string> = {
  'program-library': 'training-hub',
  'workout-library': 'training-hub',
  'exercise-library': 'training-hub',
  'video-on-demand': 'training-hub',
  'clients': 'clients-and-groups',
  'groups': 'clients-and-groups',
  // add more mappings as needed
};

function getActiveSections(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const rawKey = segments[0] || 'dashboard';
  const mainKey = pathToMainKey[rawKey] || rawKey;
  const subKey = '/' + segments.join('/');
  return { mainKey, subKey };
}

export const HeaderSection: React.FC = () => {
  const pathname = usePathname();
  const { mainKey, subKey } = getActiveSections(pathname);
  const currentNav = navConfig[mainKey as keyof typeof navConfig];

  return (
    <header className="w-full border-b border-solid">
      {/* Top nav */}
      <div className="w-full h-[76px]">
        <div className="flex justify-between items-center h-11 mx-6 my-4">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex items-center mr-8">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <img
                  className="w-[17.5px] h-3.5"
                  alt="FitPro Logo"
                  src="https://c.animaapp.com/mbqrzacsv2XpmH/img/frame-11.svg"
                />
              </div>
              <span className="ml-3 font-bold text-xl text-gray-900">FitPro</span>
            </div>

            {/* Main nav links */}
            <nav className="flex space-x-8">
              {Object.entries(navConfig).map(([key, item]) => (
                <a
                  key={key}
                  href={`/${key}`}
                  className={`font-medium text-base ${
                    key === mainKey ? 'text-green-600' : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Bell + Avatar */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <BellIcon className="h-[18px] w-[15.75px] text-gray-700" />
              <div className="absolute -top-1 left-3 w-3 h-3 bg-red-500 rounded-full" />
            </div>
            <Avatar className="w-8 h-8">
              <AvatarImage
                src="https://c.animaapp.com/mbqrzacsv2XpmH/img/img-3.png"
                alt="User avatar"
              />
            </Avatar>
          </div>
        </div>
      </div>

      {/* Subnav */}
      {currentNav?.subnav?.length > 0 && (
        <div className="w-full h-[59px] bg-green-50 border-t border-green-200">
          <div className="mx-6 h-[34px] my-[13px]">
            <nav className="flex space-x-8">
              {currentNav.subnav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`font-medium text-base ${
                    item.href === subKey
                      ? 'text-green-700 border-b-2 border-green-500 pb-2'
                      : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
