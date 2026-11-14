const signupForm = document.querySelector("#signup-form");
const signinForm = document.querySelector("#signin-form");

function showMessage(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.classList.add("is-visible");
  element.classList.toggle("is-error", isError);
}

async function submitJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed. Please try again.");
  return result;
}

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.parentElement?.querySelector("input");
    if (!input) return;

    const shouldShow = input.type === "password";
    input.type = shouldShow ? "text" : "password";
    button.textContent = shouldShow ? "Hide" : "Show";
    button.setAttribute("aria-pressed", String(shouldShow));
    button.setAttribute(
      "aria-label",
      `${shouldShow ? "Hide" : "Show"} ${input.name === "confirmPassword" ? "confirm password" : "password"}`,
    );
  });
});

const roleInputs = document.querySelectorAll('input[name="role"][type="radio"]');
const restaurantField = document.querySelector("#restaurant-field");
const restaurantInput = restaurantField?.querySelector("input");

roleInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const isBusiness = input.checked && input.value === "business";
    if (!restaurantField || !restaurantInput) return;
    restaurantField.hidden = !isBusiness;
    restaurantInput.disabled = !isBusiness;
    restaurantInput.required = isBusiness;
  });
});

if (signupForm) {
  const password = signupForm.elements.namedItem("password");
  const confirmation = signupForm.elements.namedItem("confirmPassword");
  const message = document.querySelector("#signup-message");

  const validatePasswordMatch = () => {
    if (!(password instanceof HTMLInputElement) || !(confirmation instanceof HTMLInputElement)) return;
    confirmation.setCustomValidity(
      confirmation.value && confirmation.value !== password.value ? "Passwords do not match." : "",
    );
  };

  password?.addEventListener("input", validatePasswordMatch);
  confirmation?.addEventListener("input", validatePasswordMatch);

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    validatePasswordMatch();

    if (!signupForm.reportValidity()) {
      showMessage(message, "Please check the highlighted fields and try again.", true);
      return;
    }

    const data = new FormData(signupForm);
    const submitButton = signupForm.querySelector('[type="submit"]');
    const role = data.get("role");
    const payload = {
      name: `${data.get("firstName")} ${data.get("lastName")}`.trim(),
      email: data.get("email"),
      phone: data.get("phone"),
      password: data.get("password"),
      role,
      terms: data.get("terms") === "on",
    };
    if (role === "business") payload.restaurantName = data.get("restaurantName");

    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    showMessage(message, "Creating your account…");
    submitJson(window.LOCALBITE_API_URL("/api/auth/signup"), payload)
      .then(() => { window.location.assign("/app.html"); })
      .catch((error) => showMessage(message, error.message, true))
      .finally(() => {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      });
  });
}

if (signinForm) {
  const message = document.querySelector("#signin-message");
  signinForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!signinForm.reportValidity()) {
      showMessage(message, "Enter a valid email address and password to continue.", true);
      return;
    }

    const data = new FormData(signinForm);
    const submitButton = signinForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    showMessage(message, "Signing you in…");
    submitJson(window.LOCALBITE_API_URL("/api/auth/signin"), {
      email: data.get("email"),
      password: data.get("password"),
      role: data.get("role"),
      remember: data.get("remember") === "on",
    })
      .then(() => { window.location.assign("/app.html"); })
      .catch((error) => showMessage(message, error.message, true))
      .finally(() => {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      });
  });
}

document.querySelectorAll("[data-demo-message]").forEach((button) => {
  button.addEventListener("click", () => {
    showMessage(document.querySelector("#signin-message"), button.dataset.demoMessage ?? "");
  });
});
