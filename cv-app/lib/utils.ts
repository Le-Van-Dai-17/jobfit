import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function translateJobInfo(value: string): string {
  const map: Record<string, string> = {
    "full-time": "Toàn thời gian",
    "part-time": "Bán thời gian",
    "contract": "Hợp đồng",
    "internship": "Thực tập",
    "freelance": "Tự do",
    "remote": "Từ xa",
    "hybrid": "Kết hợp",
    "onsite": "Tại văn phòng",
  };
  return map[value.toLowerCase().trim()] || value;
}
