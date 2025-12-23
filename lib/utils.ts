import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const jurusanLabels: Record<string, string> = {
  umum: "Umum",
  tif: "Teknik Informatika",
  si: "Sistem Informasi",
  te: "Teknik Elektro",
  ti: "Teknik Industri",
  mt: "Matematika",
}
