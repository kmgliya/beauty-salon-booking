"use client";

import Link from "next/link";
import { ServiceSelector } from "@/widgets/service-selector/ui/ServiceSelector";
import { useBookingFlowStore } from "@/shared/store/bookingFlow";
import { Card } from "@/shared/ui";

export const ServicesPage = () => {
  const { serviceId } = useBookingFlowStore();

  return (
    <div className="stack">
      <Card className="glow">
        <div className="stack">
          <div className="chip">Шаг 1</div>
          <h2>Выберите услугу салона</h2>
          <p className="muted">
            После выбора вы сможете подобрать специалиста и свободный слот.
          </p>
        </div>
      </Card>
      <ServiceSelector />
      {serviceId && (
        <Card>
          <Link className="button" href="/booking">
            Перейти к бронированию
          </Link>
        </Card>
      )}
    </div>
  );
};
