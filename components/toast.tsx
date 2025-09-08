"use client"

import { Check } from "lucide-react"
import { useState, useEffect } from "react"

interface Toast {
  id: number
  message: string
  visible: boolean
  showIcon: boolean
}

interface ToastProps {
  toast: Toast | null
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-all duration-500 ease-out transform-gpu z-50 ${
        toast.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
      }`}
      style={{
        animation: toast.visible
          ? "slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
          : "slideOutDown 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all duration-300 ease-out ${
            toast.showIcon ? "scale-100 rotate-0" : "scale-0 rotate-180"
          }`}
        >
          <Check
            className={`w-4 h-4 text-white transition-all duration-200 delay-100 ${
              toast.showIcon ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          />
        </div>
        <span
          className={`text-white font-medium text-sm transition-all duration-300 delay-75 ${
            toast.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          }`}
        >
          {toast.message}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 rounded-b-2xl overflow-hidden">
        <div
          className={`h-full bg-white/30 transition-all duration-2500 ease-linear ${toast.visible ? "w-0" : "w-full"}`}
          style={{
            animation: toast.visible ? "progressBar 2.5s linear" : "none",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          0% {
            opacity: 0;
            transform: translateY(2rem) scale(0.9);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-0.2rem) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideOutDown {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(1rem) scale(0.95);
          }
        }
        
        @keyframes progressBar {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (message: string) => {
    const newToast = {
      id: Date.now(),
      message,
      visible: true,
      showIcon: false,
    }
    setToast(newToast)

    setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, showIcon: true } : null))
    }, 200)
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, visible: false, showIcon: false } : null))
        setTimeout(() => setToast(null), 500)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  return { toast, showToast }
}
