const I18N = {
  zh: {
    title:"Nutrition Tracker", todayBtn:"今天", dashboard:"Dashboard", rangeHint:"理想區間追蹤",
    history:"歷史紀錄", historyNote:"只顯示有紀錄的日期，點進去查看詳細內容。",
    weight:"體重", todayWeight:"今日體重 kg", save:"儲存", recentWeight:"近期體重",
    settings:"設定", rangeNote:"每項營養素只需要設定：最低值、理想上限。",
    min:"最低值", idealMax:"理想上限", cal:"熱量", protein:"蛋白質", carbs:"碳水", fat:"脂肪",
    saveTarget:"儲存目標區間", backup:"備份", export:"匯出 JSON", import:"匯入 JSON",
    importNote:"選擇之前匯出的 JSON 檔，會覆蓋目前 App 內的資料。",
    clearAll:"清除全部資料", backupNote:"資料儲存在本機瀏覽器，請定期備份。",
    addFood:"新增食物", meal:"餐別", breakfast:"早餐", lunch:"午餐", dinner:"晚餐", snack:"點心",
    foodName:"食物名稱", weightG:"重量 g", note:"備註", add:"加入",
    navHome:"首頁", navHistory:"歷史", navWeight:"體重", navSettings:"設定", navBackup:"備份",
    need:"還差", canEat:"還可攝取", overBy:"超出理想", ideal:"理想", low:"偏低", high:"偏高",
    excellent:"🟢 今日狀態理想", good:"🟡 今日仍需補足", attention:"🟠 今日有項目偏高",
    allIdeal:"所有營養素都落在理想區間。", needFocus:"優先補足", tooHigh:"超出理想區間",
    edit:"編輯", del:"刪除", noFood:"尚未新增食物", confirmDel:"確定刪除？",
    confirmAll:"確定清除全部資料？", confirmImport:"匯入會覆蓋目前資料，確定繼續？",
    imported:"匯入完成", importError:"匯入失敗，檔案格式不正確", noWeight:"尚未紀錄體重",
    added:"已新增到", updated:"已更新", items:"項", emptyDay:"尚無歷史紀錄",
    recordDays:"紀錄天數", foodEntries:"食物筆數", weightEntries:"體重筆數"
  },
  id: {
    title:"Nutrition Tracker", todayBtn:"Hari ini", dashboard:"Dashboard", rangeHint:"Pantauan rentang ideal",
    history:"Riwayat", historyNote:"Hanya menampilkan tanggal yang memiliki catatan. Ketuk untuk melihat detail.",
    weight:"Berat", todayWeight:"Berat hari ini kg", save:"Simpan", recentWeight:"Berat terbaru",
    settings:"Pengaturan", rangeNote:"Untuk tiap nutrisi, cukup atur: minimum dan batas ideal.",
    min:"Minimum", idealMax:"Batas ideal", cal:"Kalori", protein:"Protein", carbs:"Karbo", fat:"Lemak",
    saveTarget:"Simpan target", backup:"Cadangan", export:"Ekspor JSON", import:"Impor JSON",
    importNote:"Pilih file JSON yang pernah diekspor. Data saat ini akan diganti.",
    clearAll:"Hapus semua data", backupNote:"Data tersimpan di browser perangkat ini. Sebaiknya lakukan cadangan secara rutin.",
    addFood:"Tambah makanan", meal:"Waktu makan", breakfast:"Sarapan", lunch:"Makan siang", dinner:"Makan malam", snack:"Camilan",
    foodName:"Nama makanan", weightG:"Berat g", note:"Catatan", add:"Tambah",
    navHome:"Beranda", navHistory:"Riwayat", navWeight:"Berat", navSettings:"Pengaturan", navBackup:"Cadangan",
    need:"Kurang", canEat:"Masih bisa", overBy:"Melebihi ideal", ideal:"Ideal", low:"Rendah", high:"Tinggi",
    excellent:"🟢 Kondisi hari ini ideal", good:"🟡 Masih perlu dilengkapi", attention:"🟠 Ada yang terlalu tinggi",
    allIdeal:"Semua nutrisi berada dalam rentang ideal.", needFocus:"Prioritaskan", tooHigh:"Melebihi rentang ideal",
    edit:"Edit", del:"Hapus", noFood:"Belum ada makanan", confirmDel:"Yakin hapus?",
    confirmAll:"Yakin hapus semua data?", confirmImport:"Impor akan mengganti data saat ini. Lanjutkan?",
    imported:"Impor selesai", importError:"Impor gagal, format file tidak benar", noWeight:"Belum ada catatan berat",
    added:"Ditambahkan ke", updated:"Diperbarui", items:"item", emptyDay:"Belum ada riwayat",
    recordDays:"Jumlah hari", foodEntries:"Catatan makanan", weightEntries:"Catatan berat"
  }
};

function t(key) {
  return I18N[state.lang]?.[key] || I18N.zh[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = state.lang === "id" ? "id" : "zh-Hant";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  $("#langSelect").value = state.lang;
}
