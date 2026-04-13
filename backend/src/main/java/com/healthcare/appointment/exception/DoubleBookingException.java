package com.healthcare.appointment.exception;

public class DoubleBookingException extends RuntimeException {
    public DoubleBookingException(String message) {
        super(message);
    }

    public DoubleBookingException(String message, Throwable cause) {
        super(message, cause);
    }
}
