document.addEventListener("DOMContentLoaded", function () {
    const dataElement = document.getElementById("serviceStatsData");
    const servicesList = document.getElementById("servicesStatsList");
    const emptyState = document.getElementById("servicesStatsEmpty");
    const visibleCount = document.getElementById("visibleServicesCount");
    const searchInput = document.getElementById("serviceStatsSearch");
    const sortSelect = document.getElementById("serviceStatsSort");
    const filterButtons = document.querySelectorAll(".dashboard-filter");
    const topServicesChart = document.getElementById("topServicesChart");

    if (!dataElement || !servicesList) return;

    const services = JSON.parse(dataElement.textContent || "[]");
    let activeFilter = "all";
    let selectedServiceId = services.length ? services[0].id : null;

    function toArabicNumber(value) {
        return Number(value || 0).toLocaleString("ar-SA");
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function getFilteredServices() {
        const searchValue = normalize(searchInput ? searchInput.value : "");
        const sortValue = sortSelect ? sortSelect.value : "requests";

        let filtered = services.filter(function (service) {
            const matchesStatus =
                activeFilter === "all" ||
                (activeFilter === "active" && service.is_active === 1) ||
                (activeFilter === "inactive" && service.is_active === 0);

            const searchableText = normalize([
                service.service_name,
                service.category,
                service.intent_name
            ].join(" "));

            return matchesStatus && searchableText.includes(searchValue);
        });

        filtered = filtered.sort(function (a, b) {
            if (sortValue === "satisfaction") {
                return b.satisfaction_rate - a.satisfaction_rate || b.request_count - a.request_count;
            }

            if (sortValue === "positive") {
                return b.positive_feedback - a.positive_feedback || b.request_count - a.request_count;
            }

            if (sortValue === "negative") {
                return b.negative_feedback - a.negative_feedback || b.request_count - a.request_count;
            }

            if (sortValue === "name") {
                return a.service_name.localeCompare(b.service_name, "ar");
            }

            return b.request_count - a.request_count || b.total_feedback - a.total_feedback;
        });

        return filtered;
    }

    function createMetric(label, value) {
        const item = document.createElement("span");
        item.className = "service-row-metric";
        item.textContent = `${label}: ${value}`;
        return item;
    }

    function renderServicesList(filtered) {
        servicesList.innerHTML = "";

        if (visibleCount) {
            visibleCount.textContent = `${toArabicNumber(filtered.length)} خدمة`;
        }

        if (emptyState) {
            emptyState.style.display = filtered.length ? "none" : "block";
        }

        const maxRequests = Math.max(1, ...filtered.map(function (service) {
            return service.request_count;
        }));

        filtered.forEach(function (service) {
            const row = document.createElement("button");
            row.type = "button";
            row.className = "service-stat-row";
            row.dataset.serviceId = service.id;

            if (service.id === selectedServiceId) {
                row.classList.add("selected");
            }

            const content = document.createElement("div");
            content.className = "service-stat-content";

            const titleLine = document.createElement("div");
            titleLine.className = "service-stat-title-line";

            const title = document.createElement("h4");
            title.textContent = service.service_name;

            const status = document.createElement("span");
            status.className = service.is_active === 1 ? "status-badge active" : "status-badge inactive";
            status.textContent = service.is_active === 1 ? "نشطة" : "معطلة";

            titleLine.appendChild(title);
            titleLine.appendChild(status);

            const meta = document.createElement("p");
            meta.textContent = `${service.category || "بدون تصنيف"} · ${service.intent_name}`;

            const metrics = document.createElement("div");
            metrics.className = "service-row-metrics";
            metrics.appendChild(createMetric("الطلبات", toArabicNumber(service.request_count)));
            metrics.appendChild(createMetric("الإيجابي", toArabicNumber(service.positive_feedback)));
            metrics.appendChild(createMetric("السلبي", toArabicNumber(service.negative_feedback)));
            metrics.appendChild(createMetric("الرضا", `${service.satisfaction_rate}%`));

            const progress = document.createElement("div");
            progress.className = "service-row-progress";

            const progressFill = document.createElement("div");
            progressFill.style.width = `${Math.round((service.request_count / maxRequests) * 100)}%`;
            progress.appendChild(progressFill);

            content.appendChild(titleLine);
            content.appendChild(meta);
            content.appendChild(metrics);
            content.appendChild(progress);
            row.appendChild(content);

            row.addEventListener("click", function () {
                selectedServiceId = service.id;
                renderDashboard();
            });

            servicesList.appendChild(row);
        });
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function setWidth(id, value) {
        const element = document.getElementById(id);
        if (element) element.style.width = `${Math.max(0, Math.min(100, value))}%`;
    }

    function renderSelectedService(filtered) {
        const selected =
            services.find(function (service) { return service.id === selectedServiceId; }) ||
            filtered[0] ||
            services[0];

        if (!selected) {
            setText("selectedServiceName", "لا توجد بيانات");
            setText("selectedServiceMeta", "");
            return;
        }

        selectedServiceId = selected.id;

        const status = document.getElementById("selectedServiceStatus");
        if (status) {
            status.className = selected.is_active === 1 ? "status-badge active" : "status-badge inactive";
            status.textContent = selected.is_active === 1 ? "نشطة" : "معطلة";
        }

        const totalFeedback = selected.total_feedback || 0;
        const positiveShare = totalFeedback ? (selected.positive_feedback / totalFeedback) * 100 : 0;
        const negativeShare = totalFeedback ? (selected.negative_feedback / totalFeedback) * 100 : 0;

        setText("selectedServiceName", selected.service_name);
        setText("selectedServiceMeta", `${selected.category || "بدون تصنيف"} · ${selected.intent_name}`);
        setText("selectedRequests", toArabicNumber(selected.request_count));
        setText("selectedPositive", toArabicNumber(selected.positive_feedback));
        setText("selectedNegative", toArabicNumber(selected.negative_feedback));
        setText("selectedSatisfaction", `${selected.satisfaction_rate}%`);
        setText("selectedSatisfactionLabel", `${selected.satisfaction_rate}%`);
        setText("selectedFeedbackTotal", `${toArabicNumber(totalFeedback)} تقييم`);
        setWidth("selectedSatisfactionBar", selected.satisfaction_rate);
        setWidth("selectedPositiveShare", positiveShare);
        setWidth("selectedNegativeShare", negativeShare);
    }

    function renderTopServicesChart() {
        if (!topServicesChart) return;

        topServicesChart.innerHTML = "";

        const topServices = services
            .slice()
            .sort(function (a, b) {
                return b.request_count - a.request_count;
            })
            .slice(0, 8);

        const maxRequests = Math.max(1, ...topServices.map(function (service) {
            return service.request_count;
        }));

        topServices.forEach(function (service) {
            const row = document.createElement("button");
            row.type = "button";
            row.className = "chart-row";

            const label = document.createElement("span");
            label.textContent = service.service_name;

            const bar = document.createElement("div");
            bar.className = "chart-bar";

            const fill = document.createElement("div");
            fill.style.width = `${Math.round((service.request_count / maxRequests) * 100)}%`;
            bar.appendChild(fill);

            const value = document.createElement("strong");
            value.textContent = toArabicNumber(service.request_count);

            row.appendChild(label);
            row.appendChild(bar);
            row.appendChild(value);

            row.addEventListener("click", function () {
                selectedServiceId = service.id;
                renderDashboard();
            });

            topServicesChart.appendChild(row);
        });
    }

    function renderDashboard() {
        const filtered = getFilteredServices();

        if (!filtered.some(function (service) { return service.id === selectedServiceId; }) && filtered.length) {
            selectedServiceId = filtered[0].id;
        }

        renderServicesList(filtered);
        renderSelectedService(filtered);
        renderTopServicesChart();
    }

    if (searchInput) {
        searchInput.addEventListener("input", renderDashboard);
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", renderDashboard);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(function (item) {
                item.classList.remove("active");
            });

            button.classList.add("active");
            activeFilter = button.dataset.filter;
            renderDashboard();
        });
    });

    renderDashboard();
});
