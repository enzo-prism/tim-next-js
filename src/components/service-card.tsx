import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "wouter";
import type { Service } from "@/lib/types";
import BrandIcon, { type BrandIconName } from "@/components/brand/BrandIcon";
import { APPOINTMENT_FORM_URL, triggerGoogleAdsConversion } from "@/lib/analytics";
import { getServiceHref } from "@/lib/routes";

interface ServiceCardProps {
  service: Service;
  featured?: boolean;
}

export default function ServiceCard({ service, featured = false }: ServiceCardProps) {
  const handleAppointmentClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    triggerGoogleAdsConversion(APPOINTMENT_FORM_URL, "_blank");
  };

  const normalizeIconName = (iconName: string): BrandIconName => {
    if (
      iconName === "tooth" ||
      iconName === "child" ||
      iconName === "sparkles" ||
      iconName === "smile" ||
      iconName === "activity"
    ) {
      return iconName;
    }
    return "tooth";
  };

  const getIconColor = (iconName: string) => {
    const colorMap: { [key: string]: string } = {
      tooth: "bg-primary",
      child: "bg-secondary", 
      sparkles: "bg-accent",
      smile: "bg-primary",
      activity: "bg-secondary",
    };
    
    return colorMap[iconName] || "bg-primary";
  };

  return (
    <div className={`bg-white rounded-3xl shadow-xl overflow-hidden border transition-[box-shadow,border-color] duration-300 hover:shadow-2xl ${
      featured 
        ? "border-2 border-primary shadow-primary/10" 
        : "border-gray-100 hover:border-primary/30"
    }`}>
      {featured && (
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 text-center">
          <span className="font-bold text-sm tracking-wide">⭐ FREE CONSULTATION AVAILABLE ⭐</span>
        </div>
      )}
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className={`${getIconColor(service.icon)} text-white w-16 h-16 rounded-2xl flex items-center justify-center sm:mr-6 shadow-lg flex-shrink-0 mx-auto sm:mx-0`}>
            <BrandIcon name={normalizeIconName(service.icon)} className="h-10 w-10" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{service.title}</h2>
            <p className="text-gray-600 leading-relaxed">{service.description}</p>
          </div>
        </div>
        
        <div className="service-content">
          <div className="mb-4">
            <div className="space-y-3 mb-6">
              {service.details.slice(0, 3).map((detail, index) => (
                <div key={index} className="flex items-start text-gray-600 group">
                  <Check className="text-secondary mr-3 h-5 w-5 mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors duration-200" />
                  <span className="leading-relaxed">{detail}</span>
                </div>
              ))}
              {service.details.length > 3 && (
                <p className="text-gray-500 text-sm italic ml-8">+ {service.details.length - 3} more features</p>
              )}
            </div>
            
            {service.subServices && service.subServices.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h4 className="font-bold text-gray-800 mb-4 text-lg">Includes:</h4>
                <div className="grid gap-3">
                  {service.subServices.map((subService) => (
                    <div key={subService.id} className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center">
                        <div className={`${getIconColor(subService.icon)} text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 shadow-sm`}>
                          <BrandIcon name={normalizeIconName(subService.icon)} className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <Link href={getServiceHref(subService.id)}>
                            <h5 className="font-semibold text-gray-800 text-sm hover:text-primary transition-colors cursor-pointer">{subService.title}</h5>
                            <p className="text-xs text-gray-600">{subService.description}</p>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3 mt-6">
            <Button
              asChild
              className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3 font-semibold text-white shadow-lg transition duration-200 hover:from-blue-600 hover:to-primary hover:shadow-xl hover:scale-[1.02] motion-reduce:hover:scale-100 motion-reduce:transition-none"
            >
              <Link href={getServiceHref(service.id)}>Learn More About {service.title}</Link>
            </Button>
            
            {(featured || (service.subServices && service.subServices.some(sub => sub.featured))) && (
              <Button
                asChild
                variant="outline"
                className="w-full rounded-xl border-2 border-primary py-3 font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-primary-foreground"
              >
                <a
                  href={APPOINTMENT_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleAppointmentClick}
                >
                  Schedule Free Consultation
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
