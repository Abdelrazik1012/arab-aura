import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import InteractivePlatformMap from "../../components/InteractivePlatformMap";

export const CollectorMapScreen: React.FC = () => {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  return (
    <div className="space-y-6">
      <InteractivePlatformMap
        role="collector"
        heightClass="h-[560px] md:h-[620px]"
        title={
          isRtl
            ? "خريطة النطاق الجغرافي والطلبات الميدانية الكاملة لمُجمّع المنطقة"
            : "Collector Full Geographic Service Map"
        }
        subtitle={
          isRtl
            ? "تغطية 6 أكتوبر والمحافظات (المنوفية / الجيزة / القاهرة) - معاينة الشحنات ونقلها للهب أو دمجها في باكدجات"
            : "Full coverage of 6th of October and Delta hubs with real OpenStreetMap GPS"
        }
        showAiOptimalRoute={true}
      />
    </div>
  );
};

export default CollectorMapScreen;