import dayjs from "dayjs";

export const formatDate = (date: string) => dayjs(date).format("DD MMM");

export const formatDateFull = (date: string) =>
  dayjs(date).format("DD MMM YYYY");

export const formatTime = (date: string) => dayjs(date).format("HH:mm");

export const todayISO = () => dayjs().format("YYYY-MM-DD");

export const addDaysISO = (date: string, days: number) =>
  dayjs(date).add(days, "day").format("YYYY-MM-DD");

export const setTime = (dateISO: string, time: string) => {
  const [h, m] = time.split(":").map(Number);
  return dayjs(dateISO).hour(h).minute(m).second(0).millisecond(0);
};

export const toISO = (value: dayjs.Dayjs) => value.toISOString();

export const dayLabel = (dateISO: string) =>
  dayjs(dateISO).format("dddd, DD MMM");
