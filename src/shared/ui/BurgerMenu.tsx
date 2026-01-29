"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

export const BurgerMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="burger">
      <button
        className={clsx("burger-button", open && "open")}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Открыть меню"
      >
        <span className="flower">
          {Array.from({ length: 6 }).map((_, index) => (
            <span key={index} className={`petal petal-${index + 1}`} />
          ))}
          <span className="core" />
        </span>
      </button>
      <div className={clsx("menu-panel", open && "open")}>
        <nav className="menu-links">
          <Link href="/services" onClick={() => setOpen(false)}>
            Услуги
          </Link>
          <Link href="/booking" onClick={() => setOpen(false)}>
            Бронирование
          </Link>
          <Link href="/profile" onClick={() => setOpen(false)}>
            Профиль
          </Link>
          <Link href="/specialists" onClick={() => setOpen(false)}>
            Специалисты
          </Link>
        </nav>
      </div>
    </div>
  );
};
