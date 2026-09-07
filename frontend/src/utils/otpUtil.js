/**
 * TransBayX POD (Proof of Delivery) OTP Generator & Validator
 * 
 * Generates a deterministic 6-digit handover OTP based on tracking number / shipment ID.
 * This guarantees the exact same code is shown on:
 *  - Customer Tracking Page
 *  - Customer Dashboard & My Shipments
 *  - Driver POD Verification Modal
 *  - Shipment Manifest Details
 */

export const generateDeliveryOtp = (shipmentOrIdentifier) => {
  if (!shipmentOrIdentifier) return '583920';
  let str = '';
  if (typeof shipmentOrIdentifier === 'object') {
    str = String(shipmentOrIdentifier.trackingNumber || shipmentOrIdentifier.id || '583920');
  } else {
    str = String(shipmentOrIdentifier);
  }

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 900000;
  }
  const code = (Math.abs(hash) + 100000) % 900000 + 100000;
  return String(code);
};

export const validateDeliveryOtp = (enteredOtp, shipmentOrIdentifier) => {
  if (!enteredOtp) return false;
  const expected = generateDeliveryOtp(shipmentOrIdentifier);
  return String(enteredOtp).trim() === expected;
};
