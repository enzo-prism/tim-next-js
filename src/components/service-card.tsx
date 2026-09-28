import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/types";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, ServiceLink } from "@/components/tracking/tracked-links";
import { getServiceHref } from "@/lib/routes";

interface ServiceCardProps {
  service: Service;
  featured?: boolean;
}

export default function ServiceCard({ service, featured = false }: ServiceCardProps) {
  return (
    <div className={`overflow-hidden rounded-xl border bg-card transition-colors duration-200 ${
      featured 
        ? "border-primary" 
        : "border-gray-100 hover:border-primary/30"
    }`}>
      {featured && (
        <div className="border-b border-border bg-primary p-4 text-center text-primary-foreground">
          <span className="inline-flex items-center justify-center text-sm font-bold tracking-wide">
            CONSULTATION AVAILABLE
          </span>
        </div>
      )}
      <div className="p-6 sm:p-8">
        <div className="mb-6">
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
                  <MinimalGlyph name="check" className="text-primary mr-3 h-5 w-5 mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors duration-200" />
                  <span className="leading-relaxed">{detail}</span>
                </div>
              ))}
              {service.details.length > 3 && (
                <p className="text-gray-500 text-sm italic ml-8">+ {service.details.length - 3} more features</p>
              )}
            </div>
            
            {service.subServices && service.subServices.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Includes:</h3>
                <div className="grid gap-3">
                  {service.subServices.map((subService) => (
                    <div key={subService.id} className="rounded-xl border border-border bg-muted/40 p-3">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <ServiceLink
                            href={getServiceHref(subService.id)}
                            serviceId={subService.id}
                            location="service_card_subservice"
                          >
                            <h4 className="font-semibold text-gray-800 text-sm hover:text-primary transition-colors cursor-pointer">{subService.title}</h4>
                            <p className="text-xs text-gray-600">{subService.description}</p>
                          </ServiceLink>
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
              className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 motion-reduce:transition-none"
            >
              <ServiceLink
                href={getServiceHref(service.id)}
                serviceId={service.id}
                location="service_card"
              >
                Learn More About {service.title}
              </ServiceLink>
            </Button>
            
            {featured && (
              <Button
                asChild
                variant="outline"
                className="w-full rounded-xl border-2 border-primary py-3 font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-primary-foreground"
              >
                <AppointmentLink
                  href={buildAppointmentUrl({ serviceId: service.id, source: "service_card" })}
                  source="service_card"
                  ctaType="consultation"
                  serviceId={service.id}
                >
                  Request a Consultation
                </AppointmentLink>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
