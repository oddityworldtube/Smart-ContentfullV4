import React from 'react';
import { ContentSession } from '../types';
import { Trash2, Clock, ChevronRight, FileText } from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sessions: ContentSession[];
  onLoadSession: (session: ContentSession) => void;
  onClearHistory: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, setIsOpen, sessions, onLoadSession, onClearHistory }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-card border-l border-gray-700 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-dark/30">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              سجل العمليات
            </h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <p>لا يوجد سجل بعد</p>
                <p className="text-sm mt-2">ابدأ بإنشاء محتوى ليظهر هنا</p>
              </div>
            ) : (
              sessions.map(session => (
                <div 
                  key={session.id}
                  onClick={() => {
                    onLoadSession(session);
                    setIsOpen(false);
                  }}
                  className="bg-dark/50 border border-gray-700 rounded-lg p-3 hover:border-primary cursor-pointer transition group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm text-gray-200 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {session.title || session.inputs.inputValue.substring(0, 30)}
                    </h4>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                      {session.inputs.format}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(session.timestamp).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-700 bg-dark/30">
            <button 
              onClick={onClearHistory}
              className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition text-sm"
              disabled={sessions.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              مسح السجل بالكامل
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;