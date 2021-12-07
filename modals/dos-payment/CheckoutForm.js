import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "../../utils/Thunk";
import { showCanvas, hideCanvas } from "../../redux/actions";

export default function CheckoutForm({ proposalId, amount, onResult }) {
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = {
      amount,
    };

    dispatch(
      createPaymentIntent(
        proposalId,
        params,
        () => {
          dispatch(showCanvas());
        },
        (res) => {
          dispatch(hideCanvas());
          setClientSecret(res.secret);
        }
      )
    );
  }, []);

  const handleChange = async (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setProcessing(true);

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (payload.error) {
      setError(`Payment failed ${payload.error.message}`);
      setProcessing(false);
      onResult(false);
    } else {
      setError(null);
      setProcessing(false);
      setSucceeded(true);
      onResult(true);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div className="mt-4 mb-5">
        <CardElement id="card-element" onChange={handleChange} />
      </div>
      <div className="text-center">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={processing || disabled || succeeded}
        >
          Pay Now
        </button>
      </div>
      {/* Show any error that happens when processing the payment */}
      {error && <p className="font-size-14 text-danger mt-4">{error}</p>}
    </form>
  );
}
