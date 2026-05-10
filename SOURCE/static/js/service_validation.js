document.addEventListener("DOMContentLoaded", function () {
    const feesInput = document.getElementById("fees");
    const feesError = document.getElementById("fees-error");
    const intentNameInput = document.getElementById("intent_name");
    const intentNameError = document.getElementById("intent-name-error");
    const form = document.querySelector("form");

    if (!feesInput || !feesError || !form) return;

    function isValidNumber(value) {
        const trimmed = value.trim();
        if (trimmed === "") return false;
        return !isNaN(trimmed) && Number(trimmed) >= 0;
    }

    function validateFees() {
        const value = feesInput.value.trim();

        if (value === "") {
            feesError.textContent = "هذا الحقل مطلوب";
            feesError.style.display = "block";
            return false;
        }

        if (!isValidNumber(value)) {
            feesError.textContent = "يجب إدخال رقم فقط";
            feesError.style.display = "block";
            return false;
        }

        feesError.style.display = "none";
        return true;
    }

    feesInput.addEventListener("blur", validateFees);

    feesInput.addEventListener("input", function () {
        if (feesInput.value.trim() === "" || isValidNumber(feesInput.value)) {
            feesError.style.display = "none";
        }
    });

    const estimatedTimeInput = document.getElementById("estimated_time");
    const estimatedTimeError = document.getElementById("estimated-time-error");

    const estimatedTimeUnit = document.getElementById("estimated_time_unit");
    const estimatedTimeUnitError = document.getElementById("estimated-time-unit-error");

    function isValidInteger(value) {
        return /^\d+$/.test(value.trim());
    }

    function validateEstimatedTime() {
        if (!estimatedTimeInput || !estimatedTimeError) return true;

        const value = estimatedTimeInput.value.trim();

        if (value === "") {
            estimatedTimeError.textContent = "هذا الحقل مطلوب";
            estimatedTimeError.style.display = "block";
            return false;
        }

        if (!isValidInteger(value)) {
            estimatedTimeError.textContent = "يجب إدخال رقم فقط";
            estimatedTimeError.style.display = "block";
            return false;
        }

        estimatedTimeError.style.display = "none";
        return true;
    }

    function validateEstimatedTimeUnit() {
        if (!estimatedTimeUnit || !estimatedTimeUnitError) return true;

        if (estimatedTimeUnit.value.trim() === "") {
            estimatedTimeUnitError.style.display = "block";
            return false;
        }

        estimatedTimeUnitError.style.display = "none";
        return true;
    }

    function isValidIntentName(value) {
        return /^[A-Za-z][A-Za-z0-9_]*$/.test(value.trim());
    }

    function validateIntentNameFormat() {
        if (!intentNameInput || !intentNameError) return true;

        const value = intentNameInput.value.trim();

        if (value === "") {
            intentNameError.textContent = "هذا الحقل مطلوب";
            intentNameError.style.display = "block";
            return false;
        }

        if (!isValidIntentName(value)) {
            intentNameError.textContent = "يجب ان يتكون اسم ال Intent من أحرف إنجليزية فقط";
            intentNameError.style.display = "block";
            return false;
        }

        intentNameError.style.display = "none";
        return true;
    }

    async function validateIntentName() {
        if (!validateIntentNameFormat()) {
            return false;
        }

        let url ="/admin/services/check-intent?intent_name=" + encodeURIComponent(intentNameInput.value.trim());
        const serviceId = intentNameInput.dataset.serviceId;
        if (serviceId) {
            url += "&service_id=" + serviceId;
        }

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.exists) {
                intentNameError.textContent ="اسم الـ Intent مستخدم مسبقًا";
                intentNameError.style.display = "block";
                return false;
            }
            intentNameError.style.display = "none";
            return true;

        } catch (error) {
            intentNameError.textContent ="تعذر التحقق من اسم الـ Intent، حاول مرة أخرى";
            intentNameError.style.display = "block";
            return false;
        }
    }

    if (estimatedTimeInput) {
        estimatedTimeInput.addEventListener("blur", validateEstimatedTime);

        estimatedTimeInput.addEventListener("input", function () {
            if (
                estimatedTimeInput.value.trim() === "" ||
                isValidInteger(estimatedTimeInput.value)
            ) {
                estimatedTimeError.style.display = "none";
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
                intentNameError.style.display = "none";
            }
        });
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const validFees = validateFees();
        const validTime = validateEstimatedTime();
        const validUnit = validateEstimatedTimeUnit();
        const validIntentNameFormat = validateIntentNameFormat();

        if (!validFees || !validTime || !validUnit || !validIntentNameFormat) {

            if (!validFees) {
                feesInput.focus();
            }

            else if (!validTime) {
                estimatedTimeInput.focus();
            }

            else if (!validUnit) {
                estimatedTimeUnit.focus();
            }

            else if (!validIntentNameFormat) {
                intentNameInput.focus();
            }

            return;
        }

        const validIntentName = await validateIntentName();

        if (!validIntentName) {
            intentNameInput.focus();
            return;
        }

        form.submit();

    });
});
