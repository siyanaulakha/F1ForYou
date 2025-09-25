import React, { useState } from "react";

function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
    ) {
      errors.email = "Invalid email address";
    }
    if (!form.message.trim()) errors.message = "Message is required";
    return errors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    // Log the form in the exact order requested
    console.log(`${form.name}, ${form.email}, ${form.message}`);
    setSubmitted(true);
    // Add API call here if needed
  };

  return (
    <div className="container py-4" style={{ maxWidth: 500 }}>
      <h2 className="mb-3">Contact Us</h2>
      {submitted ? (
        <div className="alert alert-success">Thank you for reaching out!</div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className={`form-control${errors.name ? " is-invalid" : ""}`}
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name}</div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className={`form-control${errors.email ? " is-invalid" : ""}`}
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="message" className="form-label">
              Message
            </label>
            <textarea
              className={`form-control${errors.message ? " is-invalid" : ""}`}
              id="message"
              name="message"
              rows="5"
              value={form.message}
              onChange={handleChange}
            />
            {errors.message && (
              <div className="invalid-feedback">{errors.message}</div>
            )}
          </div>
          <button type="submit" className="btn btn-f1">
            Submit
          </button>
        </form>
      )}
    </div>
  );
}

export default ContactUs;
