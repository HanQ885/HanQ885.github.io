const CORRECT_PIN = "5376";

const form = document.querySelector("#pin-form");
const inputs = Array.from(document.querySelectorAll(".pin-inputs input"));
const message = document.querySelector("#message");
const lockScreen = document.querySelector("#lock-screen");
const successScreen = document.querySelector("#success-screen");
const resetButton = document.querySelector("#reset-button");

const getPin = () => inputs.map((input) => input.value).join("");

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

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (getPin() === CORRECT_PIN) {
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
