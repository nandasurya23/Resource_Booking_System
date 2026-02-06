export type BookingStatus = "pending" | "approved" | "cancelled";

export interface Booking {
  id: number;
  resource_id: number;
  start_time: string;
  end_time: string;
  status: BookingStatus;
}

export interface CreateBookingPayload {
  resource_id: number;
  start_time: string;
  end_time: string;
}

export interface CreateBookingResponse {
  message: string;
  booking_id: number;
  status: BookingStatus;
}
