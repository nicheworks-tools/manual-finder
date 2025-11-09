(function () {
  const state = {
    manuals: [],
    filtered: [],
  };

  const els = {
    results: document.getElementById("results"),
    resultCount: document.getElementById("resultCount"),
    emptyMessage: document.getElementById("emptyMessage"),
    searchInput: document.getElementById("searchInput"),
    categorySelect: document.getElementById("categorySelect"),
    quickButtons: document.getElementById("quickButtons"),
    year: document.getElementById("year"),
  };

  // 年表示
  if (els.year) {
    els.year.textContent = new Date().getFullYear();
  }

  // データ読み込み
  fetch("./data/manuals.json", { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error("failed to load manuals.json");
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error("invalid manuals.json");
      state.manuals = data;
      applyFilter();
    })
    .catch((err) => {
      console.error(err);
      els.results.innerHTML =
        '<div class="empty-message">manuals.json の読み込みに失敗しました。パスまたはJSON構造を確認してください。</div>';
      els.resultCount.textContent = "0 件";
    });

  // フィルター適用
  function applyFilter(quickBrand) {
    const keywordRaw = (els.searchInput.value || "").trim().toLowerCase();
    const keyword = quickBrand
      ? quickBrand.toLowerCase()
      : keywordRaw;
    const category = els.categorySelect.value;

    let list = state.manuals.slice();

    if (keyword) {
      list = list.filter((item) => {
        const haystack =
          (item.brand || "") +
          " " +
          (item.nameJa || "") +
          " " +
          (item.nameEn || "") +
          " " +
          (item.category || "") +
          " " +
          (item.tags || []).join(" ");
        return haystack.toLowerCase().includes(keyword);
      });
    }

    if (category) {
      list = list.filter((item) => item.category === category);
    }

    state.filtered = list;
    render();
  }

  // 描画
  function render() {
    const list = state.filtered;

    els.results.innerHTML = "";

    if (!list.length) {
      els.emptyMessage.hidden = false;
      els.resultCount.textContent = "0 件";
      return;
    }

    els.emptyMessage.hidden = true;
    els.resultCount.textContent = `${list.length} 件`;

    const frag = document.createDocumentFragment();

    list.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card";

      const header = document.createElement("div");
      header.className = "card-header";

      const brandEl = document.createElement("div");
      brandEl.className = "card-brand";
      brandEl.textContent =
        item.nameJa && item.nameEn && item.nameJa !== item.brand
          ? `${item.nameJa} / ${item.nameEn}`
          : item.brand || item.nameJa || item.nameEn || "";

      const right = document.createElement("div");
      right.style.display = "flex";
      right.style.flexDirection = "column";
      right.style.alignItems = "flex-end";
      right.style.gap = "2px";

      const cat = document.createElement("div");
      cat.className = "card-category";
      cat.textContent = item.category || "";

      const country = document.createElement("div");
      country.className = "card-country";
      country.textContent = item.country || "";

      const tag = document.createElement("div");
      tag.className = "tag-official";
      tag.textContent = "Official manual / support";

      right.appendChild(cat);
      if (item.country) right.appendChild(country);
      right.appendChild(tag);

      header.appendChild(brandEl);
      header.appendChild(right);
      card.appendChild(header);

      if (item.note) {
        const note = document.createElement("p");
        note.className = "card-note";
        note.textContent = item.note;
        card.appendChild(note);
      }

      const links = document.createElement("div");
      links.className = "card-links";

      if (item.manualUrl) {
        const a = document.createElement("a");
        a.href = item.manualUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "マニュアルページ";
        links.appendChild(a);
      }

      if (item.supportUrl) {
        const a = document.createElement("a");
        a.href = item.supportUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "サポートTOP";
        links.appendChild(a);
      }

      card.appendChild(links);
      frag.appendChild(card);
    });

    els.results.appendChild(frag);
  }

  // イベント
  els.searchInput.addEventListener("input", () => applyFilter());
  els.categorySelect.addEventListener("change", () => applyFilter());

  if (els.quickButtons) {
    els.quickButtons.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-brand]");
      if (!btn) return;
      const brand = btn.getAttribute("data-brand") || "";
      els.searchInput.value = brand;
      applyFilter(brand);
    });
  }
})();
