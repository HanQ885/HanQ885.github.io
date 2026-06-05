(() => {
  const q = {
    n: 35000,
    s: "Nz1xMhWKdNGAv0VRtm9WTQ",
    i: "BcBc3xpZWCjJqH4RMr5w6Q",
    d: "lgYo0w78t-DBJG3f-IGSc6q8eOtnhs_l1x9dy6pUCqdTQxC39Nm4pqU4-aS5_KLYE-_72MQja4ILdUiVHQ5gWF--DM4tZeeBPl2v2Ch5r-mk11o89UGupD0DSRCuos1a10byfGWP1RL2Rwe8fRj4Ve2xCJSUJYAR4KjjmWvpwFdiWJSIdQiE1jeq4N1a2NdM3L2G0Yv5WJHNnhnqJetoI4cMqTFViTk6otXx_op6xwU",
    t: "02Ythjzi9Of1xaDc4oJ6Ntv6Huuirn63whJyfsD2w70",
  };

  const z = new TextEncoder();
  const td = new TextDecoder();
  const form = document.querySelector("#pin-form");
  const inputs = Array.from(document.querySelectorAll(".pin-inputs input"));
  const message = document.querySelector("#message");
  const lockScreen = document.querySelector("#lock-screen");
  const successScreen = document.querySelector("#success-screen");
  const button = form.querySelector("button");

  const b64 = (value) => {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
    return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  };

  const same = (left, right) => {
    if (left.byteLength !== right.byteLength) {
      return false;
    }

    let diff = 0;
    for (let index = 0; index < left.byteLength; index += 1) {
      diff |= left[index] ^ right[index];
    }
    return diff === 0;
  };

  const pin = () => inputs.map((input) => input.value).join("");

  const clear = () => {
    inputs.forEach((input) => {
      input.value = "";
    });
    inputs[0].focus();
  };

  const material = async (value) => {
    const base = await crypto.subtle.importKey("raw", z.encode(value), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: b64(q.s), iterations: q.n, hash: "SHA-256" },
      base,
      512,
    );
    const bytes = new Uint8Array(bits);
    return {
      a: await crypto.subtle.importKey("raw", bytes.slice(0, 32), { name: "AES-CBC" }, false, ["decrypt"]),
      h: await crypto.subtle.importKey("raw", bytes.slice(32), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
    };
  };

  const open = async (value) => {
    const keys = await material(value);
    const iv = b64(q.i);
    const data = b64(q.d);
    const expected = b64(q.t);
    const signed = new Uint8Array(iv.byteLength + data.byteLength);
    signed.set(iv, 0);
    signed.set(data, iv.byteLength);

    const actual = new Uint8Array(await crypto.subtle.sign("HMAC", keys.h, signed));
    if (!same(actual, expected)) {
      throw new Error("closed");
    }

    return td.decode(await crypto.subtle.decrypt({ name: "AES-CBC", iv }, keys.a, data));
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
    button.disabled = true;
    message.textContent = "";

    try {
      successScreen.innerHTML = await open(pin());
      lockScreen.classList.add("hidden");
      successScreen.classList.remove("hidden");
      successScreen.querySelector("#reset-button").addEventListener("click", () => {
        successScreen.classList.add("hidden");
        successScreen.innerHTML = "";
        lockScreen.classList.remove("hidden");
        message.textContent = "";
        clear();
      });
    } catch {
      message.textContent = "틀렸습니다";
      clear();
    } finally {
      button.disabled = false;
    }
  });

  clear();
})();
