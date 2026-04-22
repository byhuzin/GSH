document.addEventListener("DOMContentLoaded", function () {
    const feesInput = document.getElementById("fees");
    const feesError = document.getElementById("fees-error");
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

    // التحقق عند الخروج من الحقل
    feesInput.addEventListener("blur", validateFees);

    // إخفاء الخطأ أثناء التصحيح
    feesInput.addEventListener("input", function () {
        if (feesInput.value.trim() === "" || isValidNumber(feesInput.value)) {
            feesError.style.display = "none";
        }
    });

        // ===== Validation للوقت المقدر =====

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

    // تعديل submit الحالي
    form.addEventListener("submit", function (e) {
        const validFees = validateFees();
        const validTime = validateEstimatedTime();
        const validUnit = validateEstimatedTimeUnit();

        if (!validFees || !validTime || !validUnit) {
            e.preventDefault();

            if (!validFees) feesInput.focus();
            else if (!validTime) estimatedTimeInput.focus();
            else if (!validUnit) estimatedTimeUnit.focus();
        }
    });
});