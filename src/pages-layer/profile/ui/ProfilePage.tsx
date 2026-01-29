"use client";

import { Card } from "@/shared/ui";
import { CURRENT_USER_ID } from "@/shared/config/constants";
import { useUserBookingsQuery, useUserQuery } from "@/shared/api/hooks";
import { UserBookings } from "@/widgets/user-bookings/ui/UserBookings";
import dayjs from "dayjs";

export const ProfilePage = () => {
  const { data: user } = useUserQuery(CURRENT_USER_ID);
  const { data: bookings } = useUserBookingsQuery(CURRENT_USER_ID);

  const activeCount =
    bookings?.filter(
      (booking) =>
        booking.status === "active" && dayjs(booking.endTime).isAfter(dayjs())
    ).length ?? 0;
  const historyCount = bookings?.length ?? 0;

  return (
    <div className="stack">
      <div className="profile-grid">
        <Card className="profile-hero">
          <div className="stack">
            <div className="chip">Личный кабинет</div>
            <h2>Добро пожаловать</h2>
            {user && (
              <span className="muted">
                {user.name} · {user.phone}
              </span>
            )}
            <div className="row">
              <span className="badge">Активные: {activeCount}</span>
              <span className="badge">Всего: {historyCount}</span>
            </div>
          </div>
        </Card>
        <Card className="profile-card">
          <div className="stack">
            <strong>Мои данные</strong>
            <span className="muted">Имя: {user?.name}</span>
            <span className="muted">Телефон: {user?.phone}</span>
            <span className="muted">Город: Абу-Даби</span>
          </div>
        </Card>
        <Card className="profile-card">
          <div className="stack">
            <strong>Программа лояльности</strong>
            <span className="muted">Ваши бонусы</span>
            <div className="loyalty-points">250</div>
            <span className="muted tiny">Баллы можно списать при следующей записи</span>
          </div>
        </Card>
      </div>
      <UserBookings />
    </div>
  );
};
