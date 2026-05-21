import React from 'react';

const RefundPolicy = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
      <h1 style={{ borderBottom: '2px solid #2563eb', paddingBottom: '10px', color: '#2563eb' }}>Refund & Cancellation Policy for RentVeda</h1>
      <p><strong>Effective Date:</strong> May 21, 2026</p>

      <h2>1. Digital Services & Platform Fees</h2>
      <p>
        RentVeda is a SaaS (Software as a Service) platform. The payments made on our platform are generally for wallet recharges or platform convenience fees (e.g., 2% per transaction).
      </p>

      <h2>2. Refund Eligibility</h2>
      <ul>
        <li>
          <strong>Failed Transactions:</strong> If your money is deducted from your bank account but the recharge/payment is not updated on the RentVeda app due to a technical error, the amount will automatically be refunded to your original payment method within 3 to 5 business days by the payment gateway.
        </li>
        <li>
          <strong>Successful Transactions:</strong> Since our services are digital and instantly delivered, successful wallet recharges or convenience fees deducted for completed services are non-refundable.
        </li>
      </ul>

      <h2>3. Cancellations</h2>
      <p>
        You can stop using RentVeda at any time. However, we do not offer prorated refunds for any unused balance in your wallet.
      </p>

      <h2>4. Contact for Payment Issues</h2>
      <p>
        For any payment-related disputes or help, please reach out to our support team within 48 hours of the transaction.<br />
        <strong>Email:</strong> support@rentveda.com
      </p>
    </div>
  );
};

export default RefundPolicy;