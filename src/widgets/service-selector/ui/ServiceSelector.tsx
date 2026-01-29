"use client";

import { useServicesQuery } from "@/shared/api/hooks";
import { useBookingFlowStore } from "@/shared/store/bookingFlow";
import { Card, Button } from "@/shared/ui";
import { useMemo, useState } from "react";

export const ServiceSelector = () => {
  const { data, isLoading, error } = useServicesQuery();
  const { serviceId, setService } = useBookingFlowStore();
  const [category, setCategory] = useState<
    "прически" | "маникюр" | "педикюр" | "макияж" | "окрашивание"
  >("прически");

  const filtered = useMemo(
    () => data?.filter((service) => service.category === category) ?? [],
    [data, category]
  );

  if (isLoading) {
    return <Card>Загружаем услуги...</Card>;
  }

  if (error || !data) {
    return <Card>Не удалось загрузить услуги. Попробуйте позже.</Card>;
  }

  return (
    <div className="stack">
      <div className="row">
        {(["прически", "маникюр", "педикюр", "макияж", "окрашивание"] as const).map(
          (item) => (
            <Button
              key={item}
              variant={category === item ? "primary" : "ghost"}
              onClick={() => setCategory(item)}
            >
              {item}
            </Button>
          )
        )}
      </div>
      <div className="grid cols-3">
        {filtered.map((service) => (
          <Card key={service.id} className={serviceId === service.id ? "glow" : ""}>
            <div className="stack">
              <div className="between">
                <strong>{service.name}</strong>
                <span className="badge">{service.durationMinutes} мин</span>
              </div>
              <span className="muted">{service.variant}</span>
              <span className="muted">
                Буфер: {service.bufferBeforeMinutes + service.bufferAfterMinutes} мин
              </span>
              <div className="between">
                <span>от {service.price} ₽</span>
                <Button onClick={() => setService(service.id)}>Выбрать</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
