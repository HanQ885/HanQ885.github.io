const PIN_CHECK = "1cea97c28cd639e0f3307fdb53660175e9e838ff799211075128e63060eb93eb";

const form = document.querySelector("#pin-form");
const inputs = Array.from(document.querySelectorAll(".pin-inputs input"));
const message = document.querySelector("#message");
const lockScreen = document.querySelector("#lock-screen");
const successScreen = document.querySelector("#success-screen");
const resetButton = document.querySelector("#reset-button");
const submitButton = form.querySelector("button");
const encoder = new TextEncoder();

const getPin = () => inputs.map((input) => input.value).join("");

const hashPin = async (pin) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(pin));
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

const stringsMatch = (left, right) => {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
};

const clearPin = () => {
  inputs.forEach((input) => {
    input.value = "";
  });
  inputs[0].focus();
};

inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 1);
    message.textContent = "";

    if (input.value && inputs[index + 1]) {
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !input.value && inputs[index - 1]) {
      inputs[index - 1].focus();
    }
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  message.textContent = "";

  const candidate = await hashPin(getPin());
  submitButton.disabled = false;

  if (stringsMatch(candidate, PIN_CHECK)) {
    lockScreen.classList.add("hidden");
    successScreen.classList.remove("hidden");
    resetButton.focus();
    return;
  }

  message.textContent = "틀렸습니다";
  clearPin();
});

resetButton.addEventListener("click", () => {
  successScreen.classList.add("hidden");
  lockScreen.classList.remove("hidden");
  message.textContent = "";
  clearPin();
});

clearPin();
