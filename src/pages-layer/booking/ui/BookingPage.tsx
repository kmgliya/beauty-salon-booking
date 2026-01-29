"use client";

import Link from "next/link";
import { useBookingFlowStore } from "@/shared/store/bookingFlow";
import { Card } from "@/shared/ui";
import { SpecialistSchedule } from "@/widgets/specialist-schedule/ui/SpecialistSchedule";
import { BookingSummary } from "@/widgets/booking-summary/ui/BookingSummary";

export const BookingPage = () => {
  const { step, serviceId } = useBookingFlowStore();

  return (
    <div className="booking-layout">
      <div className="stack">
        <Card className="soft">
          <div className="stack">
            <div className="chip">Instant booking</div>
            <div className="between">
              <h2>Select Staff, Date & Time</h2>
              {!serviceId && (
                <Link className="button ghost" href="/services">
                  Choose services
                </Link>
              )}
            </div>
            <p className="muted">
              Слот блокируется на 3–5 минут, пока вы подтверждаете бронирование.
            </p>
            <span className="tiny muted">Step {step} of 4</span>
          </div>
        </Card>
        <SpecialistSchedule />
      </div>
      <div className="stack">
        <BookingSummary />
      </div>
    </div>
  );
};
