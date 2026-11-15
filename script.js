const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
function closeNavigation(restoreFocus = false) {
  nav?.classList.remove("open");
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "Open navigation");
  const icon = navToggle?.querySelector("img");
  if (icon) icon.src = "assets/icons/menu.svg";
  if (restoreFocus) navToggle?.focus();
}
navToggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  navToggle.querySelector("img").src = open
    ? "assets/icons/x.svg"
    : "assets/icons/menu.svg";
});
nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeNavigation();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("open"))
    closeNavigation(true);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeNavigation();
});
matchMedia("(min-width: 851px)").addEventListener("change", () =>
  closeNavigation(),
);
document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const form = document.querySelector("#quote-form");
if (form) {
  const products = {
    soybeans: "GMO soybeans",
    corn: "GMO corn",
    both: "GMO soybeans and corn",
  };
  const selected = new URLSearchParams(location.search).get("product");
  if (Object.hasOwn(products, selected)) form.elements.product.value = selected;
  const review = document.querySelector("#quote-review");
  const summary = document.querySelector("#quote-summary");
  const status = document.querySelector("#quote-status");
  const emailLink = document.querySelector("#email-request");
  const sendButton = document.querySelector("#send-request");
  const editButton = document.querySelector("#edit-request");
  const recipients = [
    "craig@agroexpress.farm",
    "sales@agroexpress.farm",
    "steven@agroexpress.farm",
  ];
  const recipientList = recipients.join(", ");
  let submitting = false;
  let submitted = false;
  document.querySelector("#request-button-label").textContent = "Review Request";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const value = (key) => String(data.get(key) || "").trim() || "To discuss";
    const product = products[value("product")];
    const lines = [
      "Hello AgroExpress team,",
      "",
      "I would like to discuss the following supply request:",
      "",
      "Product: " + product,
      "Quantity: " +
        (data.get("quantity")
          ? value("quantity") + " metric tons"
          : "To discuss"),
      "Destination: " + value("destination"),
      "Delivery terms: " + value("terms"),
      "Packaging: " + value("packaging"),
      "Shipment timing: " + value("timing"),
      "",
      "Specifications and requirements:",
      value("message"),
      "",
      "Contact: " + value("name"),
      "Company: " + value("company"),
      "Email: " + value("email"),
      "Phone: " + value("phone"),
    ];
    const body = lines.join("\n");
    summary.textContent = body;
    emailLink.href =
      "mailto:" + recipients.join(",") + "?subject=" +
      encodeURIComponent("Quote request: " + product) +
      "&body=" +
      encodeURIComponent(body);
    status.textContent = "";
    form.hidden = true;
    review.hidden = false;
    document.querySelector("#review-title").focus({ preventScroll: true });
    review.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  });
  sendButton.addEventListener("click", async () => {
    if (submitting || submitted) return;
    submitting = true;
    sendButton.disabled = true;
    editButton.disabled = true;
    emailLink.hidden = true;
    review.setAttribute("aria-busy", "true");
    sendButton.querySelector("span").textContent = "Sending...";
    status.textContent = "";
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error("Quote submission failed");
      submitted = true;
      document.querySelector("#review-title").textContent = "Request received";
      status.textContent =
        "Thank you. Our team will follow up at the email address you provided.";
      sendButton.hidden = true;
      editButton.hidden = true;
      document.querySelector("#review-title").focus({ preventScroll: true });
    } catch {
      status.textContent =
        "We could not confirm your request. Please try again, or email it to " + recipientList + ".";
      emailLink.hidden = false;
    } finally {
      submitting = false;
      review.setAttribute("aria-busy", "false");
      sendButton.disabled = false;
      editButton.disabled = false;
      sendButton.querySelector("span").textContent = "Send Request";
    }
  });
  editButton.addEventListener("click", () => {
    if (submitting || submitted) return;
    review.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
  document
    .querySelector("#copy-request")
    .addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(summary.textContent);
        status.textContent = submitted
          ? "Request copied."
          : "Request copied. Email it to " + recipientList + ".";
      } catch {
        const range = document.createRange();
        range.selectNodeContents(summary);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = submitted
          ? "Select and copy the request above."
          : "Select and copy the request above, then email " + recipientList + ".";
      }
    });
  emailLink.addEventListener("click", () => {
    status.textContent =
      "Send the request in your email app to " + recipientList + ".";
  });
}
