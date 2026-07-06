import { useState, useRef, useEffect } from "react";

export default function SearchableSelect({ value, onChange, options, placeholder, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = (options || []).filter(opt => 
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = (options || []).find(opt => opt.code === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={dropdownRef}>
      <div 
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold cursor-pointer flex justify-between items-center transition-all hover:bg-slate-100 hover:border-slate-300 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-slate-900" : "text-slate-400"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <span className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden animate-fadeIn">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input 
                type="text" 
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:font-normal placeholder:text-slate-400"
                placeholder="Tìm kiếm nhanh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div 
                  key={opt.code}
                  className={`px-4 py-3 cursor-pointer rounded-xl text-sm font-semibold transition-all ${
                    value === opt.code 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                  onClick={() => {
                    onChange(opt.code);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {opt.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-center text-sm font-semibold text-slate-400 bg-slate-50/50 rounded-xl">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
