document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("[data-service-form]");
    if (!form) return;

    const requiredFields = Array.from(form.querySelectorAll("[required]"));
    const progressLabel = document.getElementById("formProgressLabel");
    const progressBar = document.getElementById("formProgressBar");
    const keywordsInput = form.querySelector("[data-keywords-input]");
    const keywordTags = form.querySelector("[data-keyword-tags]");
    const resetButton = form.querySelector("[data-reset-form]");
    const changesNotice = document.getElementById("unsavedChangesNotice");
    const initialValues = new Map();

    Array.from(form.elements).forEach(function (field) {
        if (!field.name) return;
        initialValues.set(field.name, field.value);
    });

    function value(name) {
        const field = form.elements[name];
        return field ? field.value.trim() : "";
    }

    function splitLines(text) {
        return text
            .split(/\n+/)
            .map(function (item) { return item.trim(); })
            .filter(Boolean)
            .slice(0, 5);
    }

    function setText(id, text) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    }

    function renderList(id, items) {
        const list = document.getElementById(id);
        if (!list) return;

        list.innerHTML = "";

        if (!items.length) {
            const item = document.createElement("li");
            item.textContent = "-";
            list.appendChild(item);
            return;
        }

        items.forEach(function (text) {
            const item = document.createElement("li");
            item.textContent = text;
            list.appendChild(item);
        });
    }

    function updatePreview() {
        const serviceName = value("service_name") || "اسم الخدمة";
        const description = value("service_description") || "سيظهر وصف الخدمة هنا أثناء الكتابة.";
        const category = value("category") || "-";
        const fees = value("fees") ? `${value("fees")} ريال` : "-";
        const time = value("estimated_time");
        const unit = value("estimated_time_unit");

        setText("previewName", serviceName);
        setText("previewDescription", description);
        setText("previewCategory", category);
        setText("previewFees", fees);
        setText("previewTime", time && unit ? `${time} ${unit}` : "-");
        renderList("previewDocuments", splitLines(value("required_documents")));
        renderList("previewSteps", splitLines(value("steps")));
    }

    function updateProgress() {
        const filledCount = requiredFields.filter(function (field) {
            return field.value.trim() !== "";
        }).length;
        const percentage = requiredFields.length
            ? Math.round((filledCount / requiredFields.length) * 100)
            : 100;

        if (progressLabel) progressLabel.textContent = `${percentage}%`;
        if (progressBar) progressBar.style.width = `${percentage}%`;
    }

    function parseKeywords() {
        if (!keywordsInput) return [];

        return keywordsInput.value
            .split(/[,،\n]/)
            .map(function (keyword) { return keyword.trim(); })
            .filter(Boolean);
    }

    function renderKeywordTags() {
        if (!keywordTags || !keywordsInput) return;

        keywordTags.innerHTML = "";

        parseKeywords().forEach(function (keyword) {
            const tag = document.createElement("span");
            tag.className = "keyword-tag";
            tag.textContent = keyword;
            keywordTags.appendChild(tag);
        });
    }

    function updateChangesNotice() {
        if (!changesNotice) return;

        const hasChanges = Array.from(form.elements).some(function (field) {
            if (!field.name || !initialValues.has(field.name)) return false;
            return field.value !== initialValues.get(field.name);
        });

        changesNotice.style.display = hasChanges ? "inline-flex" : "none";
    }

    function refreshExperience() {
        updatePreview();
        updateProgress();
        renderKeywordTags();
        updateChangesNotice();
    }

    form.addEventListener("input", refreshExperience);
    form.addEventListener("change", refreshExperience);

    if (resetButton) {
        resetButton.addEventListener("click", function () {
            Array.from(form.elements).forEach(function (field) {
                if (!field.name || !initialValues.has(field.name)) return;
                field.value = initialValues.get(field.name);
            });

            refreshExperience();
        });
    }

    refreshExperience();
});
