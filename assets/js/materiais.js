const catalog = document.querySelector("[data-materials-catalog]");

if (catalog) {
  const manifestUrl = catalog.dataset.manifest;
  const grid = catalog.querySelector("[data-materials-grid]");
  const status = catalog.querySelector("[data-materials-status]");
  const search = catalog.querySelector("[data-materials-search]");
  const filterButtons = [...catalog.querySelectorAll("[data-filter]")];
  let materials = [];
  let activeFilter = catalog.dataset.defaultFilter || filterButtons[0]?.dataset.filter || "todos";

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const icons = {
    document: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 3.5h6l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M13 3.5V8h4M9 12h6M9 15.5h6"/></svg>`,
    arrow: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m8 16 8-8M9 8h7v7"/></svg>`,
    empty: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 4h14v16H5zM8 8h8M8 12h5"/></svg>`,
  };

  const escapeHtml = (value) => {
    const node = document.createElement("div");
    node.textContent = value;
    return node.innerHTML;
  };

  const normalize = (value) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const render = () => {
    const term = normalize(search.value.trim());
    const filtered = materials.filter((material) => {
      const matchesFilter = activeFilter === "todos" || material.categoria === activeFilter;
      const matchesTerm = !term || normalize(`${material.titulo} ${material.categoria_label}`).includes(term);
      return matchesFilter && matchesTerm;
    });

    status.textContent = `${filtered.length} ${filtered.length === 1 ? "material encontrado" : "materiais encontrados"}`;

    if (!filtered.length) {
      const hasAnyMaterials = materials.length > 0;
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${icons.empty}</div>
          <h3>${hasAnyMaterials ? "Nenhum resultado" : "Os materiais chegam em breve"}</h3>
          <p>${hasAnyMaterials ? "Tente outro termo ou selecione uma categoria diferente." : "Assim que os arquivos forem adicionados à pasta da disciplina, eles aparecerão aqui."}</p>
        </div>`;
      return;
    }

    grid.innerHTML = filtered
      .map(
        (material) => `
          <a class="material-card" href="${encodeURI(material.arquivo)}" target="_blank" rel="noopener" aria-label="Abrir ${escapeHtml(material.titulo)} em uma nova aba">
            <span class="material-icon">${icons.document}</span>
            <span class="material-info">
              <h3>${escapeHtml(material.titulo)}</h3>
              <span class="material-meta">
                <span>${escapeHtml(material.categoria_label)}</span>
                <span>${escapeHtml(material.formato)}</span>
                <span>${escapeHtml(material.tamanho)}</span>
              </span>
            </span>
            <span class="material-open">${icons.arrow}</span>
          </a>`,
      )
      .join("");
  };

  search.addEventListener("input", render);
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
      render();
    });
  });

  const freshManifestUrl = new URL(manifestUrl, window.location.href);
  freshManifestUrl.searchParams.set("atualizacao", Date.now().toString());

  fetch(freshManifestUrl, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Não foi possível carregar o catálogo.");
      return response.json();
    })
    .then((data) => {
      materials = data.materiais ?? [];
      document.querySelectorAll("[data-material-count]").forEach((node) => {
        node.textContent = materials.length;
      });
      render();
    })
    .catch(() => {
      status.textContent = "Catálogo indisponível";
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${icons.empty}</div>
          <h3>Não foi possível carregar os materiais</h3>
          <p>Atualize a página ou tente novamente em alguns instantes.</p>
        </div>`;
    });
}
