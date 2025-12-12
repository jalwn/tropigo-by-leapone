import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  maxWidth?: string
}

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = '500px' }: ModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[20px] w-full max-h-[90vh] overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.2)]"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || subtitle) && (
          <div className="flex justify-between items-center px-6 pt-6 mb-6">
            <div>
              {title && (
                <h2 className="text-2xl font-semibold text-[#1a3a2e] m-0">{title}</h2>
              )}
              {subtitle && (
                <p className="text-sm text-[#666] mt-1 mb-0">{subtitle}</p>
              )}
            </div>
            <button 
              className="bg-transparent border-none cursor-pointer text-[#666] p-1 flex items-center justify-center rounded-full transition-all hover:bg-[#f0f0f0] hover:text-[#1a3a2e]"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

