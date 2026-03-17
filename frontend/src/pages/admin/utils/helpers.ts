// ============================= ADMIN UTILS =============================

import type { ProjectStatus, ContractorStatus } from "@/types";
import { STATUS_COLORS, PRIORITY_LEVELS } from "../constants";

// Format Currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format Number with Commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

// Format Percentage
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Format Date
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  
  return new Date(date).toLocaleDateString("en-US", options || defaultOptions);
};

// Format DateTime
export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get Relative Time
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
};

// Get Status Color
export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status] || "hsl(215, 12%, 48%)";
};

// Get Priority Color
export const getPriorityColor = (priority: keyof typeof PRIORITY_LEVELS): string => {
  return PRIORITY_LEVELS[priority]?.color || PRIORITY_LEVELS.low.color;
};

// Calculate Percentage
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Get Status Label
export const getStatusLabel = (status: string): string => {
  return status
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Truncate Text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Generate Initials
export const generateInitials = (name: string): string => {
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

// Validate Email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate Phone
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
};

// Sort by Key
export const sortByKey = <T>(
  array: T[],
  key: keyof T,
  order: "asc" | "desc" = "asc"
): T[] => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return order === "asc" ? -1 : 1;
    if (aValue > bValue) return order === "asc" ? 1 : -1;
    return 0;
  });
};

// Filter by Search
export const filterBySearch = <T>(
  items: T[],
  searchTerm: string,
  searchKeys: (keyof T)[]
): T[] => {
  const lowerSearch = searchTerm.toLowerCase();
  
  return items.filter(item =>
    searchKeys.some(key => {
      const value = item[key];
      if (typeof value === "string") {
        return value.toLowerCase().includes(lowerSearch);
      }
      if (typeof value === "number") {
        return value.toString().includes(lowerSearch);
      }
      return false;
    })
  );
};

// Debounce Function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Export Data to CSV
export const exportToCSV = (data: unknown[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0] as Record<string, unknown>);
  const csvContent = [
    headers.join(","),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape values containing commas or quotes
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    ),
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Get Date Range
export const getDateRange = (days: number): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

// Calculate Growth Rate
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Group By Key
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

// Deep Clone Object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Is Empty Object
export const isEmptyObject = (obj: Record<string, unknown>): boolean => {
  return Object.keys(obj).length === 0;
};

// Capitalize First Letter
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Generate Random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
