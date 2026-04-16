const DEFAULT_URL = "https://QR_generator.ndyl.uk";
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
    const urlField = document.getElementById("url-value");
    return urlField ? (urlField.value || DEFAULT_URL) : DEFAULT_URL;
  }

  if (type === "text") {
    const textField = document.getElementById("text-value");
    return textField ? (textField.value || DEFAULT_URL) : DEFAULT_URL;
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
