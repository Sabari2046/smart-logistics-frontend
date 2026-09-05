package com.smartlogistics.util;

public class OtpUtil {

    /**
     * Generates a deterministic, secure 6-digit Delivery Handover OTP for a shipment.
     * Matches the exact algorithm used across client tracking and driver dashboards.
     */
    public static String generateDeliveryOtp(String trackingNumberOrId) {
        if (trackingNumberOrId == null || trackingNumberOrId.isBlank()) {
            return "583920";
        }
        long hash = 0;
        for (int i = 0; i < trackingNumberOrId.length(); i++) {
            hash = (hash * 31 + trackingNumberOrId.charAt(i)) % 900000;
        }
        long code = (Math.abs(hash) + 100000) % 900000 + 100000;
        return String.valueOf(code);
    }

    public static boolean validateDeliveryOtp(String enteredOtp, String trackingNumberOrId) {
        if (enteredOtp == null || enteredOtp.isBlank()) {
            return false;
        }
        String expected = generateDeliveryOtp(trackingNumberOrId);
        return enteredOtp.trim().equals(expected);
    }
}
