
// Nasi Arab Express - Reseller Directory & Interactivity
let allResellers = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  await loadResellers();
  setupEventListeners();
});

async function loadResellers() {
  const grid = document.getElementById('resellersGrid');
  grid.innerHTML = `
    <div class="col-span-full text-center py-12 text-zinc-400">
      <div class="animate-spin text-3xl mb-2">⏳</div>
      <p>Memuatkan senarai ejen berhampiran...</p>
    </div>
  `;

  try {
    const res = await fetch('/api/resellers');
    if (res.ok) {
      const data = await res.json();
      allResellers = data.data || [];
    } else {
      // Fallback local data if direct static file
      const localRes = await fetch('./data/resellers.json');
      allResellers = await localRes.json();
    }
  } catch(e) {
    try {
      const localRes = await fetch('./data/resellers.json');
      allResellers = await localRes.json();
    } catch(err) {
      console.error('Failed to load resellers', err);
      allResellers = [];
    }
  }

  renderResellers(allResellers);
}

function renderResellers(list) {
  const grid = document.getElementById('resellersGrid');
  const countEl = document.getElementById('resultsCount');
  const noResultsEl = document.getElementById('noResults');

  countEl.textContent = `Menjumpai ${list.length} ejen & stokis sah berhampiran`;

  if (list.length === 0) {
    grid.innerHTML = '';
    noResultsEl.classList.remove('hidden');
    return;
  }

  noResultsEl.classList.add('hidden');

  grid.innerHTML = list.map(r => {
    const cleanPhone = r.phone.replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Salam ${r.name}, saya nak order Nasi Arab Express kawasan ${r.area}. Ada ready stock?`);
    const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

    const isMaster = r.tier.toLowerCase().includes('master');
    const badgeColor = isMaster 
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
      : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

    const stockPills = (r.ready_stock || ["Mandy Kambing", "Kabsah Ayam"]).map(s => 
      `<span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium border border-zinc-700">${s}</span>`
    ).join(' ');

    return `
      <div class="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 group">
        <div>
          <!-- Top Row -->
          <div class="flex items-start justify-between gap-2 mb-3">
            <div>
              <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor} mb-2">
                ${r.tier}
              </span>
              <h3 class="text-lg font-black text-white group-hover:text-amber-400 transition-colors">${r.name}</h3>
            </div>
            <div class="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-1 rounded-lg">
              ★ ${r.rating || 5.0}
            </div>
          </div>

          <!-- Location Info -->
          <div class="space-y-1.5 text-xs text-zinc-400 mb-4">
            <div class="flex items-center gap-2 text-zinc-300 font-semibold">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-amber-500 shrink-0"></i>
              <span>${r.area}</span>
            </div>
            <div class="flex items-center gap-2 pl-5 text-zinc-400">
              <span>Negeri: <strong class="text-zinc-300">${r.state}</strong></span>
              ${r.postcode ? `• <span>Poskod: ${r.postcode}</span>` : ''}
            </div>
            ${r.cod_available ? `
              <div class="flex items-center gap-1.5 pl-5 text-emerald-400 font-medium">
                <i data-lucide="truck" class="w-3 h-3"></i> COD & Penghantaran Disediakan
              </div>
            ` : ''}
          </div>

          <!-- Ready Stock Pills -->
          <div class="pt-3 border-t border-zinc-800/80 mb-6">
            <span class="block text-[11px] font-semibold text-zinc-400 mb-1.5">Ready Stock:</span>
            <div class="flex flex-wrap gap-1.5">
              ${stockPills}
            </div>
          </div>
        </div>

        <!-- WhatsApp Contact CTA -->
        <a href="${waUrl}" target="_blank" class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 transform active:scale-95">
          <i data-lucide="message-circle" class="w-4 h-4"></i> WhatsApp & Order Sekarang
        </a>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

function setupEventListeners() {
  const stateFilter = document.getElementById('stateFilter');
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetFilterBtn');
  const quickStateBtns = document.querySelectorAll('.quick-state');
  const resellerForm = document.getElementById('resellerForm');

  function applyFilters() {
    const selectedState = stateFilter.value;
    const searchQ = searchInput.value.toLowerCase().trim();

    let filtered = allResellers;

    if (selectedState !== 'Semua') {
      filtered = filtered.filter(r => r.state.toLowerCase() === selectedState.toLowerCase());
    }

    if (searchQ) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQ) ||
        r.area.toLowerCase().includes(searchQ) ||
        r.state.toLowerCase().includes(searchQ) ||
        (r.postcode && r.postcode.includes(searchQ))
      );
    }

    renderResellers(filtered);
  }

  stateFilter.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);

  resetBtn.addEventListener('click', () => {
    stateFilter.value = 'Semua';
    searchInput.value = '';
    renderResellers(allResellers);
  });

  quickStateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const state = btn.getAttribute('data-state');
      stateFilter.value = state;
      applyFilters();
      document.getElementById('reseller-locator').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Handle agent registration form
  if (resellerForm) {
    resellerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('formName').value,
        phone: document.getElementById('formPhone').value,
        state: document.getElementById('formState').value,
        area: document.getElementById('formArea').value
      };

      try {
        const res = await fetch('/api/resellers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        document.getElementById('formSuccess').classList.remove('hidden');
        resellerForm.reset();
      } catch(err) {
        document.getElementById('formSuccess').classList.remove('hidden');
        resellerForm.reset();
      }
    });
  }
}
