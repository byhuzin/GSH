const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const themeToggle = document.getElementById("theme-toggle");
const servicesToggle = document.getElementById("services-toggle");
const drawerClose = document.getElementById("drawer-close");
const drawerOverlay = document.getElementById("drawer-overlay");
const appShell = document.querySelector(".chat-modern-shell");

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function handleKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function resizeComposer() {
    if (!userInput) return;
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 150) + "px";
}

function addUserMessage(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "message user-message";

    wrapper.innerHTML = `
        <div class="message-avatar">أنت</div>
        <div class="message-content">
            <p>${escapeHtml(text)}</p>
        </div>
    `;

    chatBox.appendChild(wrapper);
    scrollChatToBottom();
}

function addBotMessage(htmlContent, messageId = null) {
    const wrapper = document.createElement("div");
    wrapper.className = "message bot-message";

    let feedbackHtml = "";
    if (messageId) {
        feedbackHtml = `
            <div class="feedback-box" id="feedback-${messageId}">
                <span class="feedback-label">هل كان الرد مفيدًا؟</span>
                <button class="feedback-btn" onclick="sendFeedback(${messageId}, 1)">مفيد</button>
                <button class="feedback-btn" onclick="sendFeedback(${messageId}, 0)">غير مفيد</button>
            </div>
        `;
    }

    wrapper.innerHTML = `
        <div class="message-avatar">G</div>
        <div class="message-content service-card">
            ${htmlContent}
            ${feedbackHtml}
        </div>
    `;

    chatBox.appendChild(wrapper);
    scrollChatToBottom();
}

function addTypingIndicator() {
    const wrapper = document.createElement("div");
    wrapper.className = "message bot-message";
    wrapper.id = "typing-message";

    wrapper.innerHTML = `
        <div class="message-avatar">G</div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;

    chatBox.appendChild(wrapper);
    scrollChatToBottom();
}

function removeTypingIndicator() {
    const typingMessage = document.getElementById("typing-message");
    if (typingMessage) {
        typingMessage.remove();
    }
}

function scrollChatToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value.trim();

    if (!message) return;

    addUserMessage(message);
    userInput.value = "";
    resizeComposer();
    addTypingIndicator();

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        removeTypingIndicator();
        addBotMessage(data.reply, data.message_id);
    } catch (error) {
        removeTypingIndicator();
        addBotMessage("<p>حدث خطأ أثناء الاتصال بالخادم. حاول مرة أخرى.</p>");
    }
}

function sendQuickMessage(text) {
    userInput.value = text;
    resizeComposer();
    sendMessage();

    if (window.innerWidth <= 900) {
        closeServicesDrawer();
    }
}

let allServicesCache = [];

async function loadAllServices() {
    try {
        const response = await fetch("/services/list");
        allServicesCache = await response.json();
    } catch (e) {
        console.error("فشل تحميل قائمة الخدمات:", e);
    }
}

function searchServices() {
    const term = document.getElementById("services-search").value.trim().toLowerCase();
    const quickSection = document.getElementById("quick-section");
    const resultsSection = document.getElementById("search-results-section");
    const resultsList = document.getElementById("search-results-list");
    const noResults = document.getElementById("no-results");
    const clearBtn = document.getElementById("search-clear");

    clearBtn.style.display = term ? "flex" : "none";

    if (!term) {
        resultsSection.style.display = "none";
        quickSection.style.display = "";
        return;
    }

    quickSection.style.display = "none";
    resultsSection.style.display = "";

    const matches = allServicesCache.filter(service => {
        const name = (service.name || "").toLowerCase();
        const category = (service.category || "").toLowerCase();
        return name.includes(term) || category.includes(term);
    });

    resultsList.innerHTML = "";

    if (matches.length === 0) {
        noResults.style.display = "";
        return;
    }

    noResults.style.display = "none";

    matches.forEach(service => {
        const item = document.createElement("button");
        item.className = "search-result-item service-drawer-item";
        item.onclick = () => {
            sendQuickMessage(service.name);
            clearServiceSearch(false);
        };
        item.innerHTML = `
            <span class="result-name">${escapeHtml(service.name)}</span>
            <span class="result-category">${escapeHtml(service.category || "خدمة حكومية")}</span>
        `;
        resultsList.appendChild(item);
    });
}

function clearServiceSearch(keepFocus = true) {
    const input = document.getElementById("services-search");
    input.value = "";
    searchServices();
    if (keepFocus) input.focus();
}

function openServicesDrawer() {
    if (!appShell) return;
    appShell.classList.remove("sidebar-collapsed");
    appShell.classList.add("drawer-open");
    if (servicesToggle) {
        servicesToggle.setAttribute("aria-expanded", "true");
        servicesToggle.setAttribute("aria-label", "إغلاق قائمة الخدمات");
    }
}

function closeServicesDrawer() {
    if (!appShell) return;
    appShell.classList.add("sidebar-collapsed");
    appShell.classList.remove("drawer-open");
    if (servicesToggle) {
        servicesToggle.setAttribute("aria-expanded", "false");
        servicesToggle.setAttribute("aria-label", "فتح قائمة الخدمات");
    }
}

function toggleServicesDrawer() {
    if (!appShell) return;

    if (appShell.classList.contains("sidebar-collapsed")) {
        openServicesDrawer();
    } else {
        closeServicesDrawer();
    }
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "الوضع الفاتح";
    } else {
        document.body.classList.remove("dark-mode");
        themeToggle.textContent = "الوضع الداكن";
    }
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        const isDark = document.body.classList.contains("dark-mode");

        if (isDark) {
            localStorage.setItem("theme", "dark");
            themeToggle.textContent = "الوضع الفاتح";
        } else {
            localStorage.setItem("theme", "light");
            themeToggle.textContent = "الوضع الداكن";
        }
    });

    applySavedTheme();
}

if (servicesToggle) {
    servicesToggle.addEventListener("click", toggleServicesDrawer);
}

if (drawerClose) {
    drawerClose.addEventListener("click", closeServicesDrawer);
}

if (drawerOverlay) {
    drawerOverlay.addEventListener("click", closeServicesDrawer);
}

if (userInput) {
    userInput.addEventListener("input", resizeComposer);
    resizeComposer();
}

loadAllServices();

async function sendFeedback(messageId, rating) {
    const feedbackBox = document.getElementById(`feedback-${messageId}`);
    if (!feedbackBox) return;

    try {
        const response = await fetch("/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message_id: messageId,
                rating: rating
            })
        });

        const data = await response.json();

        if (data.success) {
            feedbackBox.innerHTML = '<span class="feedback-saved">شكرًا، تم تسجيل تقييمك.</span>';
        } else {
            feedbackBox.innerHTML = '<span class="feedback-error">تعذر حفظ التقييم.</span>';
        }
    } catch (error) {
        feedbackBox.innerHTML = '<span class="feedback-error">حدث خطأ أثناء حفظ التقييم.</span>';
    }
}
