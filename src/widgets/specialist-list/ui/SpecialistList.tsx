"use client";

import { useMemo } from "react";
import { useServicesQuery, useSpecialistsQuery } from "@/shared/api/hooks";
import { Card } from "@/shared/ui";

export const SpecialistList = () => {
  const { data: specialists, isLoading } = useSpecialistsQuery();
  const { data: services } = useServicesQuery();

  const grouped = useMemo(() => {
    const top = specialists?.filter((item) => item.level === "top") ?? [];
    const regular = specialists?.filter((item) => item.level === "regular") ?? [];
    return { top, regular };
  }, [specialists]);

  if (isLoading) {
    return <Card>Загружаем специалистов...</Card>;
  }

  const renderItem = (id: string) => {
    const specialist = specialists?.find((item) => item.id === id);
    if (!specialist) return null;
    const list = services?.filter((service) =>
      specialist.serviceIds.includes(service.id)
    );
    return (
      <Card key={specialist.id} className="soft">
        <div className="stack">
          <div className="between">
            <strong>{specialist.name}</strong>
            <span className="badge">
              {specialist.level === "top" ? "TOP" : "Мастер"}
            </span>
          </div>
          <span className="muted">{specialist.specialization}</span>
          <div className="row">
            {list?.map((service) => (
              <span key={service.id} className="tag">
                {service.name} ·{" "}
                {Math.round(service.price * specialist.priceMultiplier)} ₽
              </span>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="stack">
      <Card className="glow">
        <div className="stack">
          <div className="chip">Команда салона</div>
          <h2>Топ-мастера и мастера</h2>
          <p className="muted">
            У топ-мастеров выше коэффициент, поэтому цена услуг отличается.
          </p>
        </div>
      </Card>

      <Card>
        <div className="stack">
          <strong>Топ-мастера</strong>
          {grouped.top.map((item) => renderItem(item.id))}
        </div>
      </Card>

      <Card>
        <div className="stack">
          <strong>Мастера</strong>
          {grouped.regular.map((item) => renderItem(item.id))}
        </div>
      </Card>
    </div>
  );
};
