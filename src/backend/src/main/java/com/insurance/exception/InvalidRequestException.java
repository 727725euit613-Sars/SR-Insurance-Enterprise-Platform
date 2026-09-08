package com.insurance.exception;

/**
 * Exception thrown when a request payload is invalid.
 */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}
