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
      "mailto:sales@agroexpress.farm?subject=" +
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
  document.querySelector("#edit-request").addEventListener("click", () => {
    review.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
  document
    .querySelector("#copy-request")
    .addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(summary.textContent);
        status.textContent =
          "Request copied. Email it to sales@agroexpress.farm.";
      } catch {
        const range = document.createRange();
        range.selectNodeContents(summary);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent =
          "Select and copy the request above, then email sales@agroexpress.farm.";
      }
    });
  emailLink.addEventListener("click", () => {
    status.textContent =
      "Send the request in your email app. If it does not open, copy the request and email sales@agroexpress.farm.";
  });
}
