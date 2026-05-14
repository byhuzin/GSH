document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("servicesSearch");
    const sortSelect = document.getElementById("servicesSort");
    const filterButtons = document.querySelectorAll(".segmented-control .segment");
    const rows = Array.from(document.querySelectorAll(".service-row"));
    const visibleCount = document.getElementById("servicesVisibleCount");
    const emptyState = document.getElementById("servicesEmptyState");
    const tableBody = document.getElementById("servicesTableBody");

    if (!tableBody || rows.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    let activeFilter = "all";

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function updateVisibleCount(count) {
        if (!visibleCount) return;
        visibleCount.textContent = `${count.toLocaleString("ar-SA")} خدمة`;
    }

    function getRowSearchText(row) {
        return normalize([
            row.dataset.name,
            row.dataset.category,
            row.dataset.intent
        ].join(" "));
    }

    function sortRows(filteredRows) {
        const sortValue = sortSelect ? sortSelect.value : "latest";

        filteredRows.sort(function (a, b) {
            if (sortValue === "name") {
                return a.dataset.name.localeCompare(b.dataset.name, "ar");
            }

            if (sortValue === "category") {
                return a.dataset.category.localeCompare(b.dataset.category, "ar");
            }

            if (sortValue === "status") {
                return a.dataset.status.localeCompare(b.dataset.status);
            }

            return Number(b.dataset.id) - Number(a.dataset.id);
        });
    }

    function renderRows() {
        const searchValue = normalize(searchInput ? searchInput.value : "");
        const visibleRows = [];

        rows.forEach(function (row) {
            const matchesFilter =
                activeFilter === "all" ||
                row.dataset.status === activeFilter;
            const matchesSearch = getRowSearchText(row).includes(searchValue);
            const isVisible = matchesFilter && matchesSearch;

            row.hidden = !isVisible;

            if (isVisible) {
                visibleRows.push(row);
            }
        });

        sortRows(visibleRows);
        visibleRows.forEach(function (row) {
            tableBody.appendChild(row);
        });

        updateVisibleCount(visibleRows.length);

        if (emptyState) {
            emptyState.style.display = visibleRows.length ? "none" : "block";
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", renderRows);
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", renderRows);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(function (item) {
                item.classList.remove("active");
            });

            button.classList.add("active");
            activeFilter = button.dataset.filter;
            renderRows();
        });
    });

    document.querySelectorAll("[data-confirm]").forEach(function (button) {
        button.addEventListener("click", function (event) {
            if (!window.confirm(button.dataset.confirm)) {
                event.preventDefault();
            }
        });
    });

    renderRows();
});
