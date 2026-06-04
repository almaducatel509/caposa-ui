//app\components\ui\Modal.tsx
import { X } from "lucide-react";

interface ModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  size?:     "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  children:  React.ReactNode;
  title?:    React.ReactNode;  // ← optionnel
}
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = "lg",
  title,  // ← optionnel
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg",
    xl: "max-w-xl", "2xl": "max-w-2xl", "3xl": "max-w-3xl", "4xl": "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl`}>

        {/* Header — s'affiche SEULEMENT si title est fourni */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            {title}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};