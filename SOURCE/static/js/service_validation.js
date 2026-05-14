document.addEventListener("DOMContentLoaded", function () {
    const feesInput = document.getElementById("fees");
    const feesError = document.getElementById("fees-error");
    const intentNameInput = document.getElementById("intent_name");
    const intentNameError = document.getElementById("intent-name-error");
    const estimatedTimeInput = document.getElementById("estimated_time");
    const estimatedTimeError = document.getElementById("estimated-time-error");
    const estimatedTimeUnit = document.getElementById("estimated_time_unit");
    const estimatedTimeUnitError = document.getElementById("estimated-time-unit-error");
    const form = document.querySelector("form");
    let submittingAfterValidation = false;

    if (!feesInput || !feesError || !form) return;

    function showError(element, message) {
        if (!element) return;
        element.textContent = message;
        element.style.display = "block";
    }

    function hideError(element) {
        if (!element) return;
        element.style.display = "none";
    }

    function isValidNumber(value) {
        const trimmed = value.trim();
        return trimmed !== "" && !isNaN(trimmed) && Number(trimmed) >= 0;
    }

    function validateFees() {
        const value = feesInput.value.trim();

        if (value === "") {
            showError(feesError, "هذا الحقل مطلوب");
            return false;
        }

        if (!isValidNumber(value)) {
            showError(feesError, "يجب إدخال رقم فقط");
            return false;
        }

        hideError(feesError);
        return true;
    }

    function isValidInteger(value) {
        return /^\d+$/.test(value.trim());
    }

    function validateEstimatedTime() {
        if (!estimatedTimeInput || !estimatedTimeError) return true;

        const value = estimatedTimeInput.value.trim();

        if (value === "") {
            showError(estimatedTimeError, "هذا الحقل مطلوب");
            return false;
        }

        if (!isValidInteger(value)) {
            showError(estimatedTimeError, "يجب إدخال رقم فقط");
            return false;
        }

        hideError(estimatedTimeError);
        return true;
    }

    function validateEstimatedTimeUnit() {
        if (!estimatedTimeUnit || !estimatedTimeUnitError) return true;

        if (estimatedTimeUnit.value.trim() === "") {
            showError(estimatedTimeUnitError, "يجب اختيار وحدة الوقت");
            return false;
        }

        hideError(estimatedTimeUnitError);
        return true;
    }

    function isValidIntentName(value) {
        return /^[A-Za-z][A-Za-z0-9_]*$/.test(value.trim());
    }

    function validateIntentNameFormat() {
        if (!intentNameInput || !intentNameError) return true;

        const value = intentNameInput.value.trim();

        if (value === "") {
            showError(intentNameError, "هذا الحقل مطلوب");
            return false;
        }

        if (!isValidIntentName(value)) {
            showError(intentNameError, "يجب أن يبدأ اسم الـ Intent بحرف إنجليزي ويحتوي على أحرف إنجليزية وأرقام وشرطة سفلية فقط");
            return false;
        }

        hideError(intentNameError);
        return true;
    }

    async function validateIntentName() {
        if (!validateIntentNameFormat()) return false;
        if (intentNameInput.readOnly) return true;

        let url = "/admin/services/check-intent?intent_name=" + encodeURIComponent(intentNameInput.value.trim());
        const serviceId = intentNameInput.dataset.serviceId;

        if (serviceId) {
            url += "&service_id=" + encodeURIComponent(serviceId);
        }

        try {
            const response = await fetch(url, {
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Intent check failed");
            }

            const data = await response.json();

            if (data.exists) {
                showError(intentNameError, "اسم الـ Intent مستخدم مسبقًا");
                return false;
            }

            hideError(intentNameError);
            return true;
        } catch (error) {
            showError(intentNameError, "تعذر التحقق من اسم الـ Intent، حاول مرة أخرى");
            return false;
        }
    }

    feesInput.addEventListener("blur", validateFees);
    feesInput.addEventListener("input", function () {
        if (feesInput.value.trim() === "" || isValidNumber(feesInput.value)) {
            hideError(feesError);
        }
    });

    if (estimatedTimeInput) {
        estimatedTimeInput.addEventListener("blur", validateEstimatedTime);
        estimatedTimeInput.addEventListener("input", function () {
            if (estimatedTimeInput.value.trim() === "" || isValidInteger(estimatedTimeInput.value)) {
                hideError(estimatedTimeError);
            }
        });
    }

    if (estimatedTimeUnit) {
        estimatedTimeUnit.addEventListener("change", validateEstimatedTimeUnit);
    }

    if (intentNameInput) {
        intentNameInput.addEventListener("blur", validateIntentName);
        intentNameInput.addEventListener("input", function () {
            if (intentNameInput.value.trim() === "" || isValidIntentName(intentNameInput.value)) {
                hideError(intentNameError);
            }
        });
    }

    form.addEventListener("submit", async function (event) {
        if (submittingAfterValidation) return;

        event.preventDefault();

        const validFees = validateFees();
        const validTime = validateEstimatedTime();
        const validUnit = validateEstimatedTimeUnit();
        const validIntentNameFormat = validateIntentNameFormat();

        if (!validFees || !validTime || !validUnit || !validIntentNameFormat) {
            if (!validFees) feesInput.focus();
            else if (!validTime) estimatedTimeInput.focus();
            else if (!validUnit) estimatedTimeUnit.focus();
            else if (!validIntentNameFormat) intentNameInput.focus();
            return;
        }

        const validIntentName = await validateIntentName();

        if (!validIntentName) {
            intentNameInput.focus();
            return;
        }

        submittingAfterValidation = true;

        if (form.requestSubmit) {
            form.requestSubmit();
        } else {
            form.submit();
        }
    });
});
