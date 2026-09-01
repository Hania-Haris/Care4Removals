import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Free Quote",
  description:
    "Tell us about your move and request a free, no-obligation removal quote from Care4Removals.",
};

export default function GetAQuotePageStatic() {
  return (
    <>


<main>

        <section className="quote-page">

            <div className="container">

                <div className="quote-intro">

                    <div className="eyebrow">

                        <span className="eyebrow-dot"></span>

                        Get started

                    </div>

                    <h1>
                        Tell us about
                        <span>your move.</span>
                    </h1>

                    <p>
                        Give us a few details about your move and
                        our team can get back to you with a quote.
                    </p>

                </div>


                <div className="quote-form-wrapper">

                    <div id="formMessage" className="form-message"></div>


                    <form id="quoteForm">


                        {/* =================
                             YOUR DETAILS
                             ================= */}

                        <div className="form-section">

                            <h2>Your details</h2>

                            <p className="form-section-description">
                                How can we contact you?
                            </p>

                            <div className="form-grid">

                                <div className="form-group">

                                    <label htmlFor="customerName">
                                        Full name
                                        <span className="required">*</span>
                                    </label>

                                    <input type="text" id="customerName" name="customerName" required autoComplete="name" />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="phone">
                                        Phone number
                                        <span className="required">*</span>
                                    </label>

                                    <input type="tel" id="phone" name="phone" required autoComplete="tel" />

                                </div>


                                <div className="form-group full">

                                    <label htmlFor="email">
                                        Email address
                                        <span className="required">*</span>
                                    </label>

                                    <input type="email" id="email" name="email" required autoComplete="email" />

                                </div>

                            </div>

                        </div>


                        {/* =================
                             CURRENT PROPERTY
                             ================= */}

                        <div className="form-section">

                            <h2>Current property</h2>

                            <p className="form-section-description">
                                Tell us where you&apos;re moving from.
                            </p>

                            <div className="form-grid">

                                <div className="form-group full">

                                    <label htmlFor="pickupAddress">
                                        Pickup address
                                        <span className="required">*</span>
                                    </label>

                                    <input type="text" id="pickupAddress" name="pickupAddress" required autoComplete="street-address" />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="pickupPropertyType">
                                        Property type
                                        <span className="required">*</span>
                                    </label>

                                    <select id="pickupPropertyType" name="pickupPropertyType" required>

                                        <option value="">
                                            Select property type
                                        </option>

                                        <option value="House">
                                            House
                                        </option>

                                        <option value="Flat / Apartment">
                                            Flat / Apartment
                                        </option>

                                        <option value="Bungalow">
                                            Bungalow
                                        </option>

                                        <option value="Office / Commercial">
                                            Office / Commercial
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                <div className="form-group">

                                    <label htmlFor="pickupGroundFloor">
                                        Is the property ground floor?
                                    </label>

                                    <select id="pickupGroundFloor" name="pickupGroundFloor">

                                        <option value="">
                                            Select
                                        </option>

                                        <option value="Yes">
                                            Yes
                                        </option>

                                        <option value="No">
                                            No
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>


                        {/* =================
                             DESTINATION
                             ================= */}

                        <div className="form-section">

                            <h2>New property</h2>

                            <p className="form-section-description">
                                Tell us where you&apos;re moving to.
                            </p>

                            <div className="form-grid">

                                <div className="form-group full">

                                    <label htmlFor="deliveryAddress">
                                        Delivery address
                                        <span className="required">*</span>
                                    </label>

                                    <input type="text" id="deliveryAddress" name="deliveryAddress" required />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="deliveryPropertyType">
                                        Property type
                                        <span className="required">*</span>
                                    </label>

                                    <select id="deliveryPropertyType" name="deliveryPropertyType" required>

                                        <option value="">
                                            Select property type
                                        </option>

                                        <option value="House">
                                            House
                                        </option>

                                        <option value="Flat / Apartment">
                                            Flat / Apartment
                                        </option>

                                        <option value="Bungalow">
                                            Bungalow
                                        </option>

                                        <option value="Office / Commercial">
                                            Office / Commercial
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                <div className="form-group">

                                    <label htmlFor="deliveryGroundFloor">
                                        Is the property ground floor?
                                    </label>

                                    <select id="deliveryGroundFloor" name="deliveryGroundFloor">

                                        <option value="">
                                            Select
                                        </option>

                                        <option value="Yes">
                                            Yes
                                        </option>

                                        <option value="No">
                                            No
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>


                        {/* =================
                             MOVE DETAILS
                             ================= */}

                        <div className="form-section">

                            <h2>Move details</h2>

                            <p className="form-section-description">
                                Give us a little more information.
                            </p>

                            <div className="form-grid">

                                <div className="form-group">

                                    <label htmlFor="movingDate">
                                        Preferred moving date
                                    </label>

                                    <input type="date" id="movingDate" name="movingDate" />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="serviceType">
                                        Service required
                                    </label>

                                    {/* Options aligned to the confirmed services listed on /services —
                                        "Office Move" and "Storage" were removed here: they were offered
                                        in the legacy form but are not sellable services on the site
                                        (Phase 2 QA finding, DECISIONS_REQUIRED.md #4). Add them back only
                                        once confirmed and published as real services. */}
                                    <select id="serviceType" name="serviceType">

                                        <option value="">
                                            Select service
                                        </option>

                                        <option value="House Removal">
                                            House Removal
                                        </option>

                                        <option value="Packing">
                                            Packing
                                        </option>

                                        <option value="Transport">
                                            Reliable Transport
                                        </option>

                                        <option value="Multiple Services">
                                            Multiple Services
                                        </option>

                                    </select>

                                </div>


                                <div className="form-group full">

                                    <label htmlFor="specialInstructions">
                                        Special instructions
                                    </label>

                                    <textarea id="specialInstructions" name="specialInstructions" placeholder="Anything else we should know about your move?"></textarea>

                                </div>

                            </div>

                        </div>


                        {/* =================
                             SUBMIT
                             ================= */}

                        <div className="form-submit-area">

                            <button type="submit" className="btn btn-primary" id="submitQuote">
                                Request My Quote
                                <span>→</span>
                            </button>

                            <p className="form-note">
                                We&apos;ll use the information you provide
                                to respond to your removal enquiry.
                            </p>

                        </div>

                    </form>

                </div>

            </div>

        </section>

    </main>

    </>
  );
}
