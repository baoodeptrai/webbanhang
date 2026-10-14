
/*
 * ÁO THIẾT KẾ — LOGIC ĐẶT ÁO
 *
 * Cập nhật sản phẩm và các kênh liên hệ thật trước khi vận hành.
 */

const CONTACT = {
  messengerUrl: "",
  zaloUrl: "https://zalo.me/84939443816",
  instagramUsername: "",
};

let products = [];

const productGrid = document.getElementById("product-grid");
const productCount = document.getElementById("product-count");
const categoryFilters = document.getElementById("category-filters");
const currentYear = document.getElementById("current-year");
const messageModal = document.getElementById("message-modal");
const messageTextarea = document.getElementById("order-message");
const messageStatus = document.getElementById("message-status");

let activeCategory = "all";

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(price);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function renderProducts() {
  if (!productGrid || !Array.isArray(products)) return;

  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter(product => product.category === activeCategory);

  if (productCount) {
    productCount.textContent = `${filteredProducts.length} sản phẩm`;
  }

  if (filteredProducts.length === 0) {
    productGrid.innerHTML =
      '<p class="empty-message">Shop đang cập nhật sản phẩm. Danh mục mới sẽ sớm được bổ sung.</p>';
    return;
  }

  productGrid.innerHTML = filteredProducts.map(product => {
    const colors = product.colors.map(color => `
      <span
        class="color-dot"
        style="background-color: ${escapeHTML(color.hex)}"
        title="${escapeHTML(color.name)}"
        aria-label="${escapeHTML(color.name)}"
      ></span>
    `).join("");

    return `
      <article class="product-card">
        <div class="product-image-wrap">
          <img
            class="product-image"
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.imageAlt || product.name)}"
            loading="lazy"
            onerror="this.style.visibility='hidden'"
          />

          ${product.tag ? `
            <span class="product-tag">${escapeHTML(product.tag)}</span>
          ` : ""}
        </div>

        <div class="product-info">
          <div class="product-topline">
            <h3 class="product-name">${escapeHTML(product.name)}</h3>

            <span class="product-price">
              <span class="product-price-label">Giá tham khảo</span>
              <span class="product-price-value">${formatPrice(product.price)}</span>
            </span>
          </div>

          <p class="product-description">
            ${escapeHTML(product.description)}
          </p>

          <div class="product-colors" aria-label="Màu sắc hiện có">
            ${colors}
          </div>

          <button
            class="product-action"
            type="button"
            data-product-id="${escapeHTML(product.id)}"
          >
            Tùy chỉnh sản phẩm ↗
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function setActiveCategory(category) {
  activeCategory = category;

  categoryFilters?.querySelectorAll(".filter-button").forEach(button => {
    const isActive = button.dataset.category === category;

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  renderProducts();
}

function buildOrderMessage({ product, color, size, quantity }) {
  return [
    "Chào shop, mình muốn đặt áo theo yêu cầu.",
    "",
    `Sản phẩm: ${product.name}`,
    `Màu sắc: ${color}`,
    `Kích cỡ: ${size}`,
    `Số lượng: ${quantity}`,
    "",
    "Mình muốn gửi ý tưởng thiết kế. Shop tư vấn giúp mình nhé!"
  ].join("\n");
}

function showOrderMessage(order) {
  if (!messageModal || !messageTextarea) return;

  messageTextarea.value = buildOrderMessage(order);
  if (messageStatus) messageStatus.textContent = "";
  messageModal.hidden = false;
}

function openContactChannel(channel, statusTarget = messageStatus) {
  let url;

  if (channel === "messenger") {
    url = CONTACT.messengerUrl;
  } else if (channel === "zalo") {
    url = CONTACT.zaloUrl;
  } else if (channel === "instagram" && CONTACT.instagramUsername) {
    url = `https://www.instagram.com/${encodeURIComponent(CONTACT.instagramUsername)}/`;
  }

  if (!url) {
    if (statusTarget) {
      const channelName = channel === "instagram" ? "Instagram" : channel === "zalo" ? "Zalo" : "Messenger";
      statusTarget.textContent = `${channelName} chưa được shop cấu hình.`;
    }
    return;
  }

  if (statusTarget) statusTarget.textContent = "";
  window.open(url, "_blank", "noopener,noreferrer");
}

function openChat(product) {
  if (!product) return;

  const colorOptions = product.colors
    .map(color => `<option value="${escapeHTML(color.name)}">${escapeHTML(color.name)}</option>`)
    .join("");

  const sizeOptions = product.sizes
    .map(size => `<option value="${escapeHTML(size)}">${escapeHTML(size)}</option>`)
    .join("");

  const dialog = document.createElement("dialog");
  dialog.className = "customize-dialog";

  dialog.innerHTML = `
    <form class="customize-form">
      <button
        type="button"
        class="dialog-close"
        aria-label="Đóng cửa sổ"
      >×</button>

      ${product.image ? `
        <img
          class="dialog-image"
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.imageAlt || product.name)}"
        />
      ` : ""}
      <p class="eyebrow">TÙY CHỈNH SẢN PHẨM</p>
      <h2>${escapeHTML(product.name)}</h2>
      <p class="dialog-price">
        Giá tham khảo: ${formatPrice(product.price)} / sản phẩm
      </p>

      <label for="custom-color">Màu sắc</label>
      <select id="custom-color" name="color" required>
        <option value="" disabled selected>Chọn màu sắc</option>
        ${colorOptions}
      </select>

      <label for="custom-size">Kích cỡ</label>
      <select id="custom-size" name="size" required>
        <option value="" disabled selected>Chọn kích cỡ</option>
        ${sizeOptions}
      </select>

      <label for="custom-quantity">Số lượng</label>
      <input
        id="custom-quantity"
        name="quantity"
        type="number"
        min="1"
        max="100"
        value="1"
        required
      />
      <button class="primary-button dialog-submit" type="submit">
        Tiếp tục ↗
      </button>

      <p class="dialog-note">
        Trao đổi với shop để thống nhất thiết kế, giá và thời gian giao hàng.
      </p>

      <p class="dialog-status" role="status" aria-live="polite"></p>
    </form>
  `;

  document.body.appendChild(dialog);

  const form = dialog.querySelector(".customize-form");
  const status = dialog.querySelector(".dialog-status");

  function getOrder() {
    const order = {
      product,
      color: form.elements.color.value,
      size: form.elements.size.value,
      quantity: Number(form.elements.quantity.value)
    };

    if (!Number.isInteger(order.quantity) || order.quantity < 1 || order.quantity > 100) {
      throw new Error("Vui lòng chọn số lượng từ 1 đến 100.");
    }

    return order;
  }

  function showStatus(message) {
    status.textContent = message;
  }

  dialog.querySelector(".dialog-close").addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("click", event => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    dialog.remove();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();

    let order;

    try {
      order = getOrder();
    } catch (error) {
      showStatus(error.message);
      return;
    }

    showOrderMessage(order);
    dialog.close();
    messageTextarea?.focus();
    messageTextarea?.select();
  });

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

categoryFilters?.addEventListener("click", event => {
  const button = event.target.closest(".filter-button");

  if (!button) return;

  setActiveCategory(button.dataset.category);
});

document.getElementById("close-message")?.addEventListener("click", () => {
  if (messageModal) messageModal.hidden = true;
});

messageModal?.addEventListener("click", event => {
  if (event.target === messageModal) {
    messageModal.hidden = true;
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && messageModal && !messageModal.hidden) {
    messageModal.hidden = true;
  }

  if (event.key === "Escape" && chatPanel && !chatPanel.hidden) {
    setChatOpen(false);
  }
});

document.getElementById("copy-message")?.addEventListener("click", async () => {
  if (!messageTextarea) return;

  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard access is unavailable.");
    }

    await navigator.clipboard.writeText(messageTextarea.value);
    if (messageStatus)     messageStatus.textContent = "Đã sao chép tin nhắn. Hãy chọn kênh liên hệ bên dưới.";
  } catch {
    messageTextarea.focus();
    messageTextarea.select();
    if (messageStatus) {
      messageStatus.textContent = "Không thể sao chép tự động. Tin nhắn đã được chọn để bạn sao chép thủ công.";
    }
  }
});

document.getElementById("open-messenger")?.addEventListener("click", () => {
  openContactChannel("messenger");
});

document.getElementById("open-instagram")?.addEventListener("click", () => {
  openContactChannel("instagram");
});

document.getElementById("open-zalo")?.addEventListener("click", () => {
  openContactChannel("zalo");
});

const chatToggle = document.getElementById("chatToggle");
const chatPanel = document.getElementById("chatPanel");
const chatClose = document.getElementById("chatClose");
const chatStatus = document.getElementById("chatStatus");

function setChatOpen(open) {
  if (!chatToggle || !chatPanel) return;

  chatPanel.hidden = !open;
  chatToggle.setAttribute("aria-expanded", String(open));
  chatToggle.setAttribute("aria-label", open ? "Đóng hộp chat" : "Mở hộp chat");
  if (chatStatus) chatStatus.textContent = "";
}

chatToggle?.addEventListener("click", () => {
  setChatOpen(chatPanel?.hidden ?? false);
});

chatClose?.addEventListener("click", () => {
  setChatOpen(false);
  chatToggle?.focus();
});

chatPanel?.querySelectorAll(".chat-option").forEach(button => {
  button.addEventListener("click", () => {
    const channel = button.dataset.chat;
    if (channel === "messenger" || channel === "zalo" || channel === "instagram") {
      openContactChannel(channel, chatStatus);
    }
  });
});

productGrid?.addEventListener("click", event => {
  const button = event.target.closest("[data-product-id]");

  if (!button) return;

  const product = products.find(
    item => item.id === button.dataset.productId
  );

  openChat(product);
});

async function loadProducts() {
  try {
    const response = await fetch("js/products.json");

    if (!response.ok) {
      throw new Error("Không thể tải danh sách sản phẩm.");
    }

    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error(error);

    if (productGrid) {
      productGrid.innerHTML = `
        <p class="empty-message">
          Chưa thể tải sản phẩm. Vui lòng thử lại sau.
        </p>
      `;
    }
  }
}

loadProducts();
