const DEFAULT_URL = "https://qrgenerator.ndyl.uk";
const DEFAULT_LOGO = "img/logo.png";
const DEFAULT_LOGO_SIZE = 0.45;

const fieldTemplates = {
  url: [
    {
      id: "url-value",
      label: "Website address",
      type: "url",
      value: DEFAULT_URL,
      placeholder: "https://example.com"
    }
  ],
  text: [
    {
      id: "text-value",
      label: "Text",
      type: "textarea",
      value: DEFAULT_URL,
      placeholder: "Enter the text to encode"
    }
  ],
  email: [
    {
      id: "email-value",
      label: "Email address",
      type: "email",
      value: "",
      placeholder: "name@example.com"
    },
    {
      id: "email-subject",
      label: "Subject",
      type: "text",
      value: "",
      placeholder: "Optional subject"
    },
    {
      id: "email-body",
      label: "Message",
      type: "textarea",
      value: "",
      placeholder: "Optional message"
    }
  ],
  phone: [
    {
      id: "phone-value",
      label: "Phone number",
      type: "tel",
      value: "",
      placeholder: "+441234567890"
    }
  ],
  sms: [
    {
      id: "sms-value",
      label: "SMS number",
      type: "tel",
      value: "",
      placeholder: "+441234567890"
    },
    {
      id: "sms-message",
      label: "Message",
      type: "textarea",
      value: "",
      placeholder: "Enter the SMS message"
    }
  ],
  wifi: [
    {
      id: "wifi-ssid",
      label: "SSID",
      type: "text",
      value: "",
      placeholder: "Wi-Fi network name"
    },
    {
      id: "wifi-password",
      label: "Password",
      type: "text",
      value: "",
      placeholder: "Wi-Fi password"
    },
    {
      id: "wifi-encryption",
      label: "Encryption",
      type: "select",
      value: "WPA"
    }
  ],
  vcard: [
    {
      id: "vcard-name",
      label: "Name",
      type: "text",
      value: "",
      placeholder: "Full name"
    },
    {
      id: "vcard-email",
      label: "Email",
      type: "email",
      value: "",
      placeholder: "name@example.com"
    },
    {
      id: "vcard-phone",
      label: "Phone",
      type: "tel",
      value: "",
      placeholder: "+441234567890"
    }
  ]
};

const form = document.getElementById("qr-form");
const qrType = document.getElementById("qr-type");
const dynamicFields = document.getElementById("dynamic-fields");
const enableGradient = document.getElementById("enable-gradient");
const includeLogoToggle = document.getElementById("include-logo-toggle");
const logoUpload = document.getElementById("logo-upload");
const logoUploadLabel = document.getElementById("logo-upload-label");
const logoFileName = document.getElementById("logo-file-name");
const uploadControl = document.getElementById("upload-control");
const logoSize = document.getElementById("logo-size");
const logoSizeValue = document.getElementById("logo-size-value");
const mainColour = document.getElementById("main-colour");
const mainColourText = document.getElementById("main-colour-text");
const gradientColour = document.getElementById("gradient-colour");
const gradientColourText = document.getElementById("gradient-colour-text");
const errorCorrection = document.getElementById("error-correction");
const qrPreview = document.getElementById("qr-preview");
const qrDataPreview = document.getElementById("qr-data-preview");
const downloadPngButton = document.getElementById("download-png");
const downloadSvgButton = document.getElementById("download-svg");

let uploadedLogoData = null;
let includeLogo = true;

const qrCode = new QRCodeStyling({
  width: 300,
  height: 300,
  type: "svg",
  data: DEFAULT_URL,
  image: DEFAULT_LOGO,
  margin: 12,
  qrOptions: {
    errorCorrectionLevel: "H"
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: DEFAULT_LOGO_SIZE,
    margin: 4
  },
  dotsOptions: {
    type: "square",
    gradient: {
      type: "linear",
      rotation: 0,
      colorStops: [
        { offset: 0, color: "#112557" },
        { offset: 1, color: "#fd9802" }
      ]
    }
  },
  cornersSquareOptions: {
    type: "square",
    color: "#112557"
  },
  cornersDotOptions: {
    type: "square",
    color: "#112557"
  },
  backgroundOptions: {
    color: "#ffffff"
  }
});

qrCode.append(qrPreview);

function createField(config) {
  const wrapper = document.createElement("div");
  wrapper.className = "form-row";

  const label = document.createElement("label");
  label.setAttribute("for", config.id);
  label.textContent = config.label;

  let input;

  if (config.type === "textarea") {
    input = document.createElement("textarea");
    input.rows = 3;
    input.value = config.value || "";
    input.placeholder = config.placeholder || "";
  } else if (config.type === "select") {
    input = document.createElement("select");

    const options = [
      { value: "WPA", text: "WPA/WPA2" },
      { value: "WEP", text: "WEP" },
      { value: "nopass", text: "None" }
    ];

    options.forEach((optionData) => {
      const option = document.createElement("option");
      option.value = optionData.value;
      option.textContent = optionData.text;
      if (optionData.value === config.value) {
        option.selected = true;
      }
      input.appendChild(option);
    });
  } else {
    input = document.createElement("input");
    input.type = config.type;
    input.value = config.value || "";
    input.placeholder = config.placeholder || "";
  }

  input.id = config.id;
  input.name = config.id;

  wrapper.appendChild(label);
  wrapper.appendChild(input);

  return wrapper;
}

function renderFields(type) {
  dynamicFields.innerHTML = "";
  const fields = fieldTemplates[type] || [];
  fields.forEach((field) => {
    dynamicFields.appendChild(createField(field));
  });
}

function getFieldValue(id) {
  const field = document.getElementById(id);
  return field ? field.value.trim() : "";
}

function getData() {
  const type = qrType.value;

  if (type === "url") {
    return getFieldValue("url-value") || DEFAULT_URL;
  }

  if (type === "text") {
    return getFieldValue("text-value") || DEFAULT_URL;
  }

  if (type === "email") {
    const email = getFieldValue("email-value");
    const subject = encodeURIComponent(getFieldValue("email-subject"));
    const body = encodeURIComponent(getFieldValue("email-body"));

    if (!email) {
      return DEFAULT_URL;
    }

    const query = [];
    if (subject) query.push(`subject=${subject}`);
    if (body) query.push(`body=${body}`);

    return `mailto:${email}${query.length ? "?" + query.join("&") : ""}`;
  }

  if (type === "phone") {
    const phone = getFieldValue("phone-value");
    return phone ? `tel:${phone}` : DEFAULT_URL;
  }

  if (type === "sms") {
    const number = getFieldValue("sms-value");
    const message = getFieldValue("sms-message");

    if (!number) {
      return DEFAULT_URL;
    }

    return message ? `SMSTO:${number}:${message}` : `SMSTO:${number}:`;
  }

  if (type === "wifi") {
    const ssid = getFieldValue("wifi-ssid");
    const password = getFieldValue("wifi-password");
    const encryptionField = document.getElementById("wifi-encryption");
    const encryption = encryptionField ? encryptionField.value : "WPA";

    if (!ssid) {
      return DEFAULT_URL;
    }

    return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
  }

  if (type === "vcard") {
    const name = getFieldValue("vcard-name");
    const email = getFieldValue("vcard-email");
    const phone = getFieldValue("vcard-phone");

    if (!name && !email && !phone) {
      return DEFAULT_URL;
    }

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

function normaliseHex(value, fallback) {
  const cleanValue = value.trim();
  return /^#[0-9A-Fa-f]{6}$/.test(cleanValue) ? cleanValue : fallback;
}

function syncColourInputs(colourInput, textInput, fallback) {
  colourInput.addEventListener("input", () => {
    textInput.value = colourInput.value.toUpperCase();
    generateQrCode();
  });

  textInput.addEventListener("input", () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(textInput.value.trim())) {
      colourInput.value = textInput.value.trim();
      textInput.value = textInput.value.trim().toUpperCase();
      generateQrCode();
    }
  });

  textInput.addEventListener("blur", () => {
    const safeColour = normaliseHex(textInput.value, fallback);
    colourInput.value = safeColour;
    textInput.value = safeColour.toUpperCase();
    generateQrCode();
  });
}

function getCornerTypes(selectedCornerStyle) {
  if (selectedCornerStyle === "dot") {
    return {
      squareType: "dot",
      dotType: "dot"
    };
  }

  if (selectedCornerStyle === "extra-rounded") {
    return {
      squareType: "extra-rounded",
      dotType: "square"
    };
  }

  return {
    squareType: "square",
    dotType: "square"
  };
}

function updateLogoUi() {
  includeLogoToggle.classList.toggle("is-active", includeLogo);
  includeLogoToggle.setAttribute("aria-pressed", String(includeLogo));

  if (includeLogo) {
    uploadControl.classList.remove("is-disabled");
    logoUpload.disabled = false;
    logoUploadLabel.setAttribute("for", "logo-upload");

    if (logoUpload.files && logoUpload.files.length > 0) {
      logoFileName.textContent = logoUpload.files[0].name;
    } else if (uploadedLogoData) {
      logoFileName.textContent = "Uploaded logo";
    } else {
      logoFileName.textContent = "Default logo";
    }
  } else {
    uploadControl.classList.add("is-disabled");
    logoUpload.disabled = true;
    logoUploadLabel.removeAttribute("for");
    logoFileName.textContent = "Logo disabled";
  }
}

function generateQrCode() {
  const data = getData();
  const main = normaliseHex(mainColour.value, "#112557");
  const gradient = normaliseHex(gradientColour.value, "#fd9802");

  const selectedDotStyle =
    document.querySelector('input[name="dot-style"]:checked')?.value || "square";

  const selectedCornerStyle =
    document.querySelector('input[name="corner-style"]:checked')?.value || "square";

  const cornerTypes = getCornerTypes(selectedCornerStyle);

  const dotsOptions = enableGradient.checked
    ? {
        type: selectedDotStyle,
        gradient: {
          type: "linear",
          rotation: 0,
          colorStops: [
            { offset: 0, color: main },
            { offset: 1, color: gradient }
          ]
        }
      }
    : {
        type: selectedDotStyle,
        color: main
      };

  qrCode.update({
    data: data,
    image: includeLogo ? (uploadedLogoData || DEFAULT_LOGO) : "",
    qrOptions: {
      errorCorrectionLevel: errorCorrection.value
    },
    dotsOptions: dotsOptions,
    cornersSquareOptions: {
      type: cornerTypes.squareType,
      color: main
    },
    cornersDotOptions: {
      type: cornerTypes.dotType,
      color: main
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: parseFloat(logoSize.value),
      margin: 4
    }
  });

  if (qrDataPreview) {
    qrDataPreview.textContent = `Current QR data: ${data}`;
  }
}

form.addEventListener("input", (event) => {
  if (event.target.id === "logo-size") {
    logoSizeValue.textContent = Number(logoSize.value).toFixed(2);
  }
  generateQrCode();
});

qrType.addEventListener("change", () => {
  renderFields(qrType.value);
  generateQrCode();
});

includeLogoToggle.addEventListener("click", () => {
  includeLogo = !includeLogo;
  updateLogoUi();
  generateQrCode();
});

logoUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) {
    uploadedLogoData = null;
    updateLogoUi();
    generateQrCode();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    uploadedLogoData = reader.result;
    updateLogoUi();
    generateQrCode();
  };
  reader.readAsDataURL(file);
});

if (downloadPngButton) {
  downloadPngButton.addEventListener("click", () => {
    qrCode.download({
      name: "qr-code",
      extension: "png"
    });
  });
}

if (downloadSvgButton) {
  downloadSvgButton.addEventListener("click", () => {
    qrCode.download({
      name: "qr-code",
      extension: "svg"
    });
  });
}

syncColourInputs(mainColour, mainColourText, "#112557");
syncColourInputs(gradientColour, gradientColourText, "#fd9802");

renderFields("url");
logoSize.value = DEFAULT_LOGO_SIZE.toFixed(2);
logoSizeValue.textContent = Number(logoSize.value).toFixed(2);
updateLogoUi();
generateQrCode();
