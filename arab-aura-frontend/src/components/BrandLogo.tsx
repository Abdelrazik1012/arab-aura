import React from "react";
import { useLanguage } from "../context/LanguageContext";

interface BrandLogoProps {
  className?: string;
  onClick?: () => void;
  showText?: boolean;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "",
  onClick,
  showText = true,
}) => {
  const { lang } = useLanguage();

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
    >
      {/* أيقونة اللوجو */}
      <img
        src="/logo_app.png"
        alt="3ARB AURA"
        className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-transform duration-300 group-hover:scale-105"
      />

      {/* تثبيت LTR للنص الإنجليزي بالكامل لضمان الترتيب الصحيح (3ARB AURA) */}
      {showText && (
        <div
          dir="ltr"
          className="flex items-center font-black text-xl sm:text-2xl italic tracking-wide transform -skew-x-6 transition-all duration-300"
        >
          {lang === "ar" ? (
            <div dir="rtl" className="flex items-center">
              <span className="text-[#00A8E8] drop-shadow-[0_2px_4px_rgba(0,168,232,0.3)]">
                عرب
              </span>
              <span className="text-[#00E5FF] mr-1 drop-shadow-[0_2px_4px_rgba(0,229,255,0.3)]">
                أو
              </span>
              <span className="text-[#FF8800] drop-shadow-[0_2px_4px_rgba(255,136,0,0.4)]">
                را
              </span>
            </div>
          ) : (
            <div dir="ltr" className="flex items-center">
              <span className="text-[#00A8E8] drop-shadow-[0_2px_4px_rgba(0,168,232,0.3)]">
                3ARB
              </span>
              <span className="text-[#00E5FF] ml-1.5 drop-shadow-[0_2px_4px_rgba(0,229,255,0.3)]">
                AU
              </span>
              <span className="text-[#FF8800] drop-shadow-[0_2px_4px_rgba(255,136,0,0.4)]">
                RA
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
