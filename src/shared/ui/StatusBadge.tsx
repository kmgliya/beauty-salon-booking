import clsx from "clsx";

type Props = {
  status: "active" | "cancelled" | "completed" | "locked" | "booked" | "free";
};

export const StatusBadge = ({ status }: Props) => {
  const labelMap: Record<Props["status"], string> = {
    active: "Активно",
    cancelled: "Отменено",
    completed: "Завершено",
    locked: "Заблокировано",
    booked: "Занято",
    free: "Свободно",
  };

  return (
    <span className={clsx("badge")}>
      {labelMap[status]}
    </span>
  );
};
