"use client";

import { useToast } from "@/hooks/use-toast";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg min-w-[300px] border ${
              toast.type === "success"
                ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                : toast.type === "error"
                ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
                : "bg-white border-gray-200 text-gray-800"
            }`}
          >
            {toast.type === "success" && <CheckCircle className="h-5 w-5 text-[#16A34A]" />}
            {toast.type === "error" && <AlertCircle className="h-5 w-5 text-[#DC2626]" />}
            {toast.type === "info" && <Info className="h-5 w-5 text-[#3B82F6]" />}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
