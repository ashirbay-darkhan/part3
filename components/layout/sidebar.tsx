'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  Users, 
  ChevronDown, 
  LineChart, 
  Banknote, 
  ShoppingBag, 
  Calendar,
  BadgeDollarSign,
  Package,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { users } from '@/lib/dummy-data';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  hasSubMenu?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({
  href,
  icon,
  label,
  isActive,
  hasSubMenu = false,
  isOpen = false,
  onClick,
}: SidebarItemProps) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-pawly-light-blue dark:bg-pawly-teal text-pawly-dark-blue dark:text-white'
          : 'hover:bg-gray-100 dark:hover:bg-pawly-teal/20 text-pawly-dark-blue dark:text-white'
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {hasSubMenu && (
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      )}
    </Link>
  );
};

export function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    staff: false,
    clients: false,
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // Извлекаем текущий месяц и год для календаря
  const currentDate = new Date();
  const month = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800 flex flex-col h-screen overflow-hidden">
      {/* User Info */}
      <div className="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-pawly-teal flex items-center justify-center text-white">
          {users[0].avatar ? (
            <img
              src={users[0].avatar}
              alt={users[0].name}
              className="w-full h-full rounded-full"
            />
          ) : (
            <span>{users[0].name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-pawly-dark-blue dark:text-white">{users[0].name}</h3>
        </div>
        <ChevronDown className="h-5 w-5 text-pawly-dark-blue dark:text-white" />
      </div>

      {/* Calendar */}
      <div className="px-3 py-4 border-b border-slate-200 dark:border-pawly-dark-blue/80">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-pawly-dark-blue dark:text-white">{month} {year}</span>
          <div className="flex gap-1">
            <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-pawly-teal/20 text-pawly-dark-blue dark:text-white">
              <ChevronDown className="h-4 w-4 rotate-90" />
            </button>
            <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-pawly-teal/20 text-pawly-dark-blue dark:text-white">
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 text-center text-xs mb-2 text-pawly-dark-blue dark:text-gray-300">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>
        
        {/* Calendar days - this is just a placeholder */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: 35 }).map((_, i) => {
            const day = i - 3; // Начинаем с -3, чтобы первый день месяца начинался с правильного дня недели
            return (
              <div 
                key={i} 
                className={cn(
                  "h-6 w-6 flex items-center justify-center rounded-full",
                  day === currentDate.getDate() - 1 
                    ? "bg-pawly-light-blue dark:bg-pawly-teal text-pawly-dark-blue dark:text-white" 
                    : day > 0 && day <= 28 
                      ? "hover:bg-slate-100 dark:hover:bg-pawly-teal/20 cursor-pointer text-pawly-dark-blue dark:text-white" 
                      : "text-gray-300 dark:text-gray-600"
                )}
              >
                {day > 0 && day <= 31 ? day : ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <SidebarItem
          href="/dashboard"
          icon={<LineChart className="h-5 w-5 text-pawly-dark-blue dark:text-white" />}
          label="Dashboard"
          isActive={pathname === '/dashboard'}
        />

        <SidebarItem
          href="/staff"
          icon={<Users className="h-5 w-5 text-pawly-dark-blue dark:text-white" />}
          label="Staff"
          isActive={pathname.includes('/staff')}
          hasSubMenu={true}
          isOpen={openMenus.staff}
          onClick={() => toggleMenu('staff')}
        />

        <SidebarItem
          href="/clients"
          icon={<Users className="h-5 w-5 text-pawly-dark-blue dark:text-white" />}
          label="Clients"
          isActive={pathname.includes('/clients')}
          hasSubMenu={true}
          isOpen={openMenus.clients}
          onClick={() => toggleMenu('clients')}
        />

        <SidebarItem
          href="/overview"
          icon={<LineChart className="h-5 w-5 text-pawly-dark-blue dark:text-white" />}
          label="Overview"
          isActive={pathname.includes('/overview')}
        />

        <SidebarItem
          href="/analytics"
          icon={<LineChart className="h-5 w-5 text-pawly-dark-blue dark:text-white" />}
          label="Analytics"
          isActive={pathname.includes('/analytics')}
        />

        <SidebarItem
          href="/finance"
          icon={<Banknote className="h-5 w-5 text-pawly-dark-blue dark:text-white" />}
          label="Finance"
          isActive={pathname.includes('/finance')}
        />

        <SidebarItem
          href="/payroll"
          icon={<BadgeDollarSign className="h-5 w-5 text-pawly-dark-blue dark:text-white" />}
          label="Payroll"
          isActive={pathname.includes('/payroll')}
        />

        <SidebarItem
          href="/inventory"
          icon={<Package className="h-5 w-5 text-pawly-dark-blue dark:text-white" />}
          label="Inventory"
          isActive={pathname.includes('/inventory')}
        />

        <SidebarItem
          href="/online-booking"
          icon={<Calendar className="h-5 w-5 text-pawly-dark-blue dark:text-white" />}
          label="Online booking"
          isActive={pathname.includes('/online-booking')}
          hasSubMenu={false}
        />
        
        <SidebarItem
          href="/loyalty"
          icon={<Heart className="h-5 w-5 text-pawly-dark-blue dark:text-white" />}
          label="Loyalty"
          isActive={pathname.includes('/loyalty')}
        />
      </div>

      {/* User Info (bottom) */}
      <div className="p-3 border-t border-slate-200 dark:border-pawly-dark-blue/80 flex items-center justify-between text-sm">
        <div className="text-pawly-dark-blue dark:text-white">dmitry popov</div>
        <div className="text-gray-500 dark:text-gray-300">d****1@gmail.com</div>
      </div>
    </div>
  );
}