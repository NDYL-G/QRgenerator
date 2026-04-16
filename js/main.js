const DEFAULT_URL = "https://qrgenerator.ndyl.uk";
const DEFAULT_LOGO = "img/logo.png";

const fieldTemplates = {
  url: [
    { id: "url-value", label: "Website address", type: "url", value: DEFAULT_URL }
  ],
  text: [
    { id: "text-value", label: "Text", type: "textarea", value: DEFAULT_URL }
  ]
};

const form = document.getElementById("qr-form");
const qrType = document.getElementById("qr-type");
const dynamicFields = document.getElementById("dynamic-fields");
const enableGradient = document.getElementById("enable-gradient");
const includeLogo = document.getElementById("include-logo");
const logoUpload = document.getElementById("logo-upload");
const logoSize = document.getElementById("logo-size");
const logoSizeValue = document.getElementById("logo-size-value");
const mainColour = document.getElementById("main-colour");
const mainColourText = document.getElementById("main-colour-text");
const gradientColour = document.getElementById("gradient-colour");
const gradientColourText = document.getElementById("gradient-colour-text");
const qrPreview = document.getElementById("qr-preview");

let uploadedLogoData = null;

const qrCode = new QRCodeStyling({
  width: 300,
  height: 300,
  type: "svg",
  data: DEFAULT_URL,
  image: DEFAULT_LOGO,
  qrOptions: {
    errorCorrectionLevel: "H"
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: parseFloat(logoSize.value),
    margin: 4
  },
  dotsOptions: {
    type: "square",
    gradient: {
      type: "linear",
      colorStops: [
        { offset: 0, color: "#112557" },
        { offset: 1, color: "#fd9802" }
      ]
    }
  }
});

qrCode.append(qrPreview);

// -------- Dynamic Fields --------
function createField(config) {
  const wrapper = document.createElement("div");
  wrapper.className = "form-row";

  const label = document.createElement("label");
  label.textContent = config.label;

  let input;

  if (config.type === "textarea") {
    input = document.createElement("textarea");
    input.rows = 3;
  } else {
    input = document.createElement("input");
    input.type = config.type;
  }

  input.id = config.id;
  input.value = config.value || "";

  wrapper.appendChild(label);
  wrapper.appendChild(input);
  return wrapper;
}

function renderFields(type) {
  dynamicFields.innerHTML = "";
  const fields = fieldTemplates[type] || [];
  fields.forEach(f => dynamicFields.appendChild(createField(f)));
}

// -------- QR Data Builder --------
function getData() {
  const type = qrType.value;

  if (type === "url") {
    const field = document.getElementById("url-value");
    return field && field.value.trim() ? field.value.trim() : DEFAULT_URL;
  }

  if (type === "text") {
    const field = document.getElementById("text-value");
    return field && field.value.trim() ? field.value.trim() : DEFAULT_URL;
  }

  if (type === "email") {
    const emailField = document.getElementById("email-value");
    const subjectField = document.getElementById("email-subject");
    const bodyField = document.getElementById("email-body");

    const email = emailField ? emailField.value.trim() : "";
    const subject = subjectField ? encodeURIComponent(subjectField.value.trim()) : "";
    const body = bodyField ? encodeURIComponent(bodyField.value.trim()) : "";

    if (!email) return DEFAULT_URL;

    let query = [];
    if (subject) query.push(`subject=${subject}`);
    if (body) query.push(`body=${body}`);

    return `mailto:${email}${query.length ? "?" + query.join("&") : ""}`;
  }

  if (type === "phone") {
    const field = document.getElementById("phone-value");
    const phone = field ? field.value.trim() : "";
    return phone ? `tel:${phone}` : DEFAULT_URL;
  }

  if (type === "sms") {
    const numberField = document.getElementById("sms-value");
    const messageField = document.getElementById("sms-message");

    const number = numberField ? numberField.value.trim() : "";
    const message = messageField ? messageField.value.trim() : "";

    if (!number) return DEFAULT_URL;

    return message
      ? `SMSTO:${number}:${message}`
      : `SMSTO:${number}:`;
  }

  if (type === "wifi") {
    const ssidField = document.getElementById("wifi-ssid");
    const passwordField = document.getElementById("wifi-password");
    const encryptionField = document.getElementById("wifi-encryption");

    const ssid = ssidField ? ssidField.value.trim() : "";
    const password = passwordField ? passwordField.value.trim() : "";
    const encryption = encryptionField ? encryptionField.value : "WPA";

    if (!ssid) return DEFAULT_URL;

    return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
  }

  if (type === "vcard") {
    const nameField = document.getElementById("vcard-name");
    const emailField = document.getElementById("vcard-email");
    const phoneField = document.getElementById("vcard-phone");

    const name = nameField ? nameField.value.trim() : "";
    const email = emailField ? emailField.value.trim() : "";
    const phone = phoneField ? phoneField.value.trim() : "";

    if (!name && !email && !phone) return DEFAULT_URL;

    return [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${name}`,
      email ? `EMAIL:${email}` : "",
      phone ? `TEL:${phone}` : "",
      "END:VCARD"
    ].filter(Boolean).join("\\n");
  }

  return DEFAULT_URL;
}

// -------- Generate QR --------
function generateQrCode() {
  const data = getData();

  const main = mainColour.value;
  const gradient = gradientColour.value;

  const dots = enableGradient.checked
    ? {
        gradient: {
          type: "linear",
          colorStops: [
            { offset: 0, color: main },
            { offset: 1, color: gradient }
          ]
        }
      }
    : {
        color: main
      };

  qrCode.update({
    data: data,
    image: includeLogo.checked ? (uploadedLogoData || DEFAULT_LOGO) : "",
    dotsOptions: dots,
    imageOptions: {
      imageSize: parseFloat(logoSize.value)
    }
  });
}

// -------- Events --------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  generateQrCode();
});

form.addEventListener("input", () => {
  logoSizeValue.textContent = logoSize.value;
  generateQrCode();
});

qrType.addEventListener("change", () => {
  renderFields(qrType.value);
  setTimeout(() => {
    generateQrCode();
  }, 0);
});

logoUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    uploadedLogoData = reader.result;
    generateQrCode();
  };
  reader.readAsDataURL(file);
});

// -------- Init --------
renderFields("url");
generateQrCode();
