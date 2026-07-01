let state = loadState();
let currentDate = todayISO();
let pendingImportState = null;

const nutrients = [
  { key: "cal", field: "cal", labelKey: "cal", unit: "kcal" },
  { key: "pro", field: "pro", labelKey: "protein", unit: "g" },
  { key: "carb", field: "carb", labelKey: "carbs", unit: "g" },
  { key: "fat", field: "fat", labelKey: "fat", unit: "g" }
];

function day(date = currentDate) {
  if (!state.days[date]) state.days[date] = [];
  return state.days[date];
}

function totalFor(date) {
  const totals = { cal: 0, pro: 0, carb: 0, fat: 0 };
  (state.days[date] || []).forEach(item => {
    totals.cal += Number(item.cal) || 0;
    totals.pro += Number(item.pro) || 0;
    totals.carb += Number(item.carb) || 0;
    totals.fat += Number(item.fat) || 0;
  });
  return totals;
}

function analyze(value, range) {
  if (value < range.min) {
    return { level: "low", badge: t("low"), need: range.min - value, can: range.idealMax - value, over: 0 };
  }
  if (value <= range.idealMax) {
    return { level: "ideal", badge: t("ideal"), need: 0, can: range.idealMax - value, over: 0 };
  }
  return { level: "high", badge: t("high"), need: 0, can: 0, over: value - range.idealMax };
}

function renderAll() {
  applyLanguage();
  renderDashboard();
  renderHistory();
  renderWeight();
  renderSettings();
  renderBackupStats();
  saveState();
}

function renderDashboard() {
  $("#currentDate").value = currentDate;
  $("#dateLabel").textContent = currentDate;

  const totals = totalFor(currentDate);
  renderSummary(totals);

  $("#metrics").innerHTML = nutrients.map(n => metricHTML(n, totals[n.field])).join("");
  renderMeals();
}

function renderSummary(totals) {
  const results = nutrients.map(n => ({ nutrient: n, analysis: analyze(totals[n.field], state.ranges[n.key]) }));
  const low = results.filter(r => r.analysis.level === "low");
  const high = results.filter(r => r.analysis.level === "high");

  if (low.length) {
    $("#summaryTitle").textContent = t("good");
    $("#summaryText").textContent = `${t("needFocus")}：${low.map(r => t(r.nutrient.labelKey)).join("、")}`;
  } else if (high.length) {
    $("#summaryTitle").textContent = t("attention");
    $("#summaryText").textContent = `${t("tooHigh")}：${high.map(r => t(r.nutrient.labelKey)).join("、")}`;
  } else {
    $("#summaryTitle").textContent = t("excellent");
    $("#summaryText").textContent = t("allIdeal");
  }
}

function metricHTML(nutrient, total) {
  const range = state.ranges[nutrient.key];
  const a = analyze(total, range);
  const pct = range.idealMax ? Math.min((total / range.idealMax) * 100, 100) : 0;
  const secondLabel = a.level === "high" ? t("overBy") : t("canEat");
  const secondValue = a.level === "high" ? a.over : a.can;

  return `
    <div class="metric">
      <div class="metricHead">
        <div class="metricName">${t(nutrient.labelKey)}</div>
        <div class="metricValue">${total.toFixed(1)} ${range.unit}</div>
      </div>
      <div class="bar"><div class="fill ${a.level}" style="width:${pct}%"></div></div>
      <div class="rangeText">${range.min}–${range.idealMax} ${range.unit}</div>
      <div class="infoRow">
        <div class="miniBox"><div>${t("need")}</div><div>${a.need.toFixed(1)}</div></div>
        <div class="miniBox"><div>${secondLabel}</div><div>${secondValue.toFixed(1)}</div></div>
      </div>
      <span class="badge ${a.level}">${a.badge}</span>
    </div>
  `;
}

function mealTotals(items) {
  return items.reduce((sum, item) => ({
    cal: sum.cal + (Number(item.cal) || 0),
    pro: sum.pro + (Number(item.pro) || 0),
    carb: sum.carb + (Number(item.carb) || 0),
    fat: sum.fat + (Number(item.fat) || 0)
  }), { cal: 0, pro: 0, carb: 0, fat: 0 });
}

function renderMeals() {
  const meals = ["breakfast", "lunch", "dinner", "snack"];
  const list = day(currentDate);

  $("#mealList").innerHTML = meals.map(meal => {
    const items = list.filter(item => item.meal === meal);
    const collapseKey = `${currentDate}_${meal}`;
    if (state.collapsed[collapseKey] === undefined) state.collapsed[collapseKey] = true;
    const collapsed = state.collapsed[collapseKey];
    const totals = mealTotals(items);

    const details = collapsed ? "" : (
      items.length
        ? items.map(foodCardHTML).join("")
        : `<p class="small">${t("noFood")}</p>`
    );

    return `
      <div class="card">
        <div class="mealTitle" data-meal-toggle="${meal}">
          <span>${collapsed ? "▶" : "▼"} ${t(meal)} (${items.length})</span>
        </div>
        <div class="mealSummary">${totals.cal.toFixed(0)} kcal｜P ${totals.pro.toFixed(1)}｜C ${totals.carb.toFixed(1)}｜F ${totals.fat.toFixed(1)}</div>
        ${details}
      </div>
    `;
  }).join("");

  $$("[data-meal-toggle]").forEach(el => {
    el.addEventListener("click", () => {
      const meal = el.dataset.mealToggle;
      const key = `${currentDate}_${meal}`;
      state.collapsed[key] = !state.collapsed[key];
      renderDashboard();
      saveState();
    });
  });

  $$("[data-edit-food]").forEach(el => el.addEventListener("click", () => openEditFood(el.dataset.editFood)));
  $$("[data-delete-food]").forEach(el => el.addEventListener("click", () => deleteFood(el.dataset.deleteFood)));
}

function foodCardHTML(item) {
  return `
    <div class="foodCard">
      <div class="foodName">${item.name}</div>
      <div class="foodSub">${item.weight || 0} g ${item.note ? "｜" + item.note : ""}</div>
      <div class="macroRow">
        <span class="pill">${item.cal} kcal</span>
        <span class="pill">P ${item.pro}</span>
        <span class="pill">C ${item.carb}</span>
        <span class="pill">F ${item.fat}</span>
      </div>
      <div class="actions">
        <button class="gray" data-edit-food="${item.id}">${t("edit")}</button>
        <button class="red" data-delete-food="${item.id}">${t("del")}</button>
      </div>
    </div>
  `;
}

function renderHistory() {
  const dates = Object.keys(state.days).filter(date => (state.days[date] || []).length).sort().reverse();

  $("#historyList").innerHTML = dates.length
    ? dates.map(date => {
      const items = state.days[date] || [];
      const totals = totalFor(date);
      return `
        <div class="historyItem" data-open-date="${date}">
          <div>
            <div class="historyDate">${date}</div>
            <div class="historyMeta">${totals.cal.toFixed(0)} kcal｜P ${totals.pro.toFixed(1)}｜${items.length} ${t("items")}</div>
          </div>
          <div class="chevron">›</div>
        </div>
      `;
    }).join("")
    : `<p class="small">${t("emptyDay")}</p>`;

  $$("[data-open-date]").forEach(el => {
    el.addEventListener("click", () => {
      currentDate = el.dataset.openDate;
      switchTab("dashboard");
      renderDashboard();
    });
  });
}

function renderWeight() {
  const entries = Object.entries(state.weights).sort().reverse().slice(0, 10);
  $("#weightList").innerHTML = entries.length
    ? entries.map(([date, weight]) => `${date}：${weight} kg`).join("<br>")
    : t("noWeight");
}

function renderSettings() {
  $("#langSelect").value = state.lang;
  $("#rangeSettings").innerHTML = nutrients.map(n => {
    const r = state.ranges[n.key];
    return `
      <div class="settingBlock">
        <h3>${t(n.labelKey)}</h3>
        <div class="rangeGrid">
          <div><label>${t("min")}</label><input id="range_${n.key}_min" type="number" step="0.1" value="${r.min}"></div>
          <div><label>${t("idealMax")}</label><input id="range_${n.key}_idealMax" type="number" step="0.1" value="${r.idealMax}"></div>
        </div>
      </div>
    `;
  }).join("");
}


function stateStats(targetState) {
  const dates = Object.keys(targetState.days || {}).filter(date => (targetState.days[date] || []).length);
  const foodCount = dates.reduce((sum, date) => sum + (targetState.days[date] || []).length, 0);
  const weightCount = Object.keys(targetState.weights || {}).length;
  return { days: dates.length, foods: foodCount, weights: weightCount };
}

function renderBackupStats() {
  const stats = stateStats(state);
  $("#dataStats").innerHTML = `
    <div class="statBox"><div>${t("recordDays")}</div><div>${stats.days}</div></div>
    <div class="statBox"><div>${t("foodEntries")}</div><div>${stats.foods}</div></div>
    <div class="statBox"><div>${t("weightEntries")}</div><div>${stats.weights}</div></div>
    <div class="statBox"><div>Version</div><div>3.1</div></div>
  `;
}

function switchTab(name) {
  $$(".section").forEach(section => section.classList.remove("active"));
  $(`#tab-${name}`).classList.add("active");
  $$(".navBtn").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === name));
  renderHistory();
  renderBackupStats();
}

function openSheet() {
  $("#editId").value = "";
  ["foodName", "foodWeight", "foodCal", "foodPro", "foodCarb", "foodFat", "foodNote"].forEach(id => document.getElementById(id).value = "");
  $("#meal").value = state.lastMeal || "lunch";
  $("#sheetBg").style.display = "block";
  setTimeout(() => $("#foodName").focus(), 100);
}

function closeSheet() {
  $("#sheetBg").style.display = "none";
}

function saveFood() {
  const editing = Boolean($("#editId").value);
  const id = $("#editId").value || uid();
  const item = {
    id,
    meal: $("#meal").value,
    name: $("#foodName").value || "Food",
    weight: numberValue("foodWeight"),
    cal: numberValue("foodCal"),
    pro: numberValue("foodPro"),
    carb: numberValue("foodCarb"),
    fat: numberValue("foodFat"),
    note: $("#foodNote").value
  };

  const list = day(currentDate);
  const index = list.findIndex(existing => existing.id === id);
  if (index >= 0) list[index] = item;
  else list.push(item);

  state.lastMeal = item.meal;
  closeSheet();
  renderAll();
  toast(editing ? t("updated") : `${t("added")} ${t(item.meal)}`);
}

function openEditFood(id) {
  const item = day(currentDate).find(food => food.id === id);
  if (!item) return;

  $("#editId").value = item.id;
  $("#meal").value = item.meal;
  $("#foodName").value = item.name;
  $("#foodWeight").value = item.weight;
  $("#foodCal").value = item.cal;
  $("#foodPro").value = item.pro;
  $("#foodCarb").value = item.carb;
  $("#foodFat").value = item.fat;
  $("#foodNote").value = item.note || "";
  $("#sheetBg").style.display = "block";
}

function deleteFood(id) {
  if (!confirm(t("confirmDel"))) return;
  state.days[currentDate] = day(currentDate).filter(item => item.id !== id);
  renderAll();
}

function saveWeight() {
  state.weights[currentDate] = numberValue("weightInput");
  $("#weightInput").value = "";
  renderAll();
  toast(t("updated"));
}

function saveRanges() {
  nutrients.forEach(n => {
    state.ranges[n.key].min = numberValue(`range_${n.key}_min`);
    state.ranges[n.key].idealMax = numberValue(`range_${n.key}_idealMax`);
  });
  renderAll();
  toast(t("updated"));
}

function exportData() {
  downloadJSON("nutrition_tracker_backup.json", {
    ...state,
    exportedAt: new Date().toISOString(),
    appVersion: "3.1"
  });
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.days || !data.ranges) throw new Error("Invalid backup");

      pendingImportState = normalizeState(data);
      const incoming = stateStats(pendingImportState);
      const current = stateStats(state);

      $("#importPreviewStats").innerHTML = `
        <div class="statBox"><div>${t("backupVersion")}</div><div>${data.appVersion || "Unknown"}</div></div>
        <div class="statBox"><div>${t("currentData")}</div><div>${current.days} / ${current.foods}</div></div>
        <div class="statBox"><div>${t("recordDays")}</div><div>${incoming.days}</div></div>
        <div class="statBox"><div>${t("foodEntries")}</div><div>${incoming.foods}</div></div>
        <div class="statBox"><div>${t("weightEntries")}</div><div>${incoming.weights}</div></div>
        <div class="statBox"><div>File</div><div>JSON</div></div>
      `;

      $("#importPreviewBg").classList.add("show");
    } catch {
      toast(t("importError"));
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}


function confirmImport() {
  if (!pendingImportState) return;
  state = pendingImportState;
  pendingImportState = null;
  $("#importPreviewBg").classList.remove("show");
  saveState();
  renderAll();
  toast(t("imported"));
}

function cancelImport() {
  pendingImportState = null;
  $("#importPreviewBg").classList.remove("show");
}

function clearAll() {
  if (!confirm(t("confirmAll"))) return;
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(DEFAULT_STATE);
  currentDate = todayISO();
  renderAll();
}

function bindEvents() {
  $("#todayBtn").addEventListener("click", () => {
    currentDate = todayISO();
    renderDashboard();
  });

  $("#currentDate").addEventListener("change", event => {
    currentDate = event.target.value;
    renderDashboard();
  });

  $$(".navBtn").forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
  $("#openSheetBtn").addEventListener("click", openSheet);
  $("#closeSheetBtn").addEventListener("click", closeSheet);
  $("#sheetBg").addEventListener("click", event => {
    if (event.target.id === "sheetBg") closeSheet();
  });

  $("#saveFoodBtn").addEventListener("click", saveFood);
  $("#saveWeightBtn").addEventListener("click", saveWeight);
  $("#saveRangesBtn").addEventListener("click", saveRanges);
  $("#exportBtn").addEventListener("click", exportData);
  $("#importFile").addEventListener("change", importData);
  $("#clearAllBtn").addEventListener("click", clearAll);
  $("#confirmImportBtn").addEventListener("click", confirmImport);
  $("#cancelImportBtn").addEventListener("click", cancelImport);
  $("#importPreviewBg").addEventListener("click", event => { if (event.target.id === "importPreviewBg") cancelImport(); });

  $("#langSelect").addEventListener("change", event => {
    state.lang = event.target.value;
    renderAll();
  });

  $$(".foodInput").forEach((el, index, arr) => {
    el.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (index < arr.length - 1) arr[index + 1].focus();
        else saveFood();
      }
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeSheet();
  });
}

bindEvents();
renderAll();

function setupServiceWorkerUpdate() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    const registration = await navigator.serviceWorker.register("./service-worker.js");

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          $("#updateBanner").classList.add("show");
        }
      });
    });

    $("#reloadBtn")?.addEventListener("click", () => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      window.location.reload();
    });
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

setupServiceWorkerUpdate();
