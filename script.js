const ADMIN_PASS = "123";
let isAdmin = false;

let aprovados = JSON.parse(localStorage.getItem('odio_v7_rank')) || [];
let espera = JSON.parse(localStorage.getItem('odio_v7_wait')) || [];
let bannerSalvo = localStorage.getItem('odio_v7_banner') || "https://images.alphacoders.com";

window.onload = function() {
    document.getElementById('bannerImg').src = bannerSalvo;
    renderRank();
    if (isAdmin) renderAdmin();
};

// ---------------- MODAL ----------------
function abrirModal() {
    document.getElementById('modalCadastro').classList.remove('hidden');
}
function fecharModal() {
    document.getElementById('modalCadastro').classList.add('hidden');
}

// ---------------- ALISTAMENTO ----------------
function solicitarEntrada() {
    const nome = regNome.value.trim();
    const email = regEmail.value.trim();
    const fone = regFone.value.trim();

    if (!nome || !email || !fone) {
        alert("⚠️ Preencha todos os campos!");
        return;
    }

    espera.push({ nome, email, fone, id: Date.now() });
    salvarDados();

    alert("✅ Ficha enviada!");
    regNome.value = "";
    regEmail.value = "";
    regFone.value = "";
    fecharModal();
}

// ---------------- ADMIN ----------------
function toggleAdmin() {
    const senha = prompt("DIGITE A SENHA:");
    if (senha === ADMIN_PASS) {
        isAdmin = true;
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        btnLogin.classList.add('hidden');
        btnLogout.classList.remove('hidden');
        renderAdmin();
        renderRank();
    } else if (senha !== null) {
        alert("❌ SENHA INCORRETA!");
    }
}

// ---------------- BANNER ----------------
function setBanner(src) {
    bannerImg.src = src;
    localStorage.setItem('odio_v7_banner', src);
}

function updateBanner() {
    const url = newBannerUrl.value;
    if (url) setBanner(url);
}

function uploadFoto(input) {
    const reader = new FileReader();
    reader.onload = e => setBanner(e.target.result);
    reader.readAsDataURL(input.files[0]);
}

// ---------------- RANK ----------------
function renderRank() {
    const tbody = rankBody;
    tbody.innerHTML = "";

    aprovados.sort((a, b) => b.kills - a.kills);

    aprovados.forEach((p, i) => {
        tbody.innerHTML += `
        <tr class="border-b border-zinc-800">
            <td class="p-4">#${i+1}</td>
            <td class="p-4">${p.name}</td>
            <td class="p-4 text-center">${p.matches}</td>
            <td class="p-4 text-center text-red-500">${p.kills}</td>
            <td class="p-4 text-right admin-only" style="display:${isAdmin ? 'block':'none'}">
                <button onclick="addScore('${p.name}')" class="bg-blue-600 px-2 py-1 text-xs rounded">+Kill</button>
                <button onclick="removerDoRank('${p.name}')" class="text-red-500 ml-2">X</button>
            </td>
        </tr>`;
    });
}

function addScore(nome) {
    const k = prompt("Quantas kills?");
    const idx = aprovados.findIndex(p => p.name === nome);
    aprovados[idx].kills += parseInt(k) || 0;
    aprovados[idx].matches += 1;
    salvarDados();
}

function removerDoRank(nome) {
    if (confirm("Remover jogador?")) {
        aprovados = aprovados.filter(p => p.name !== nome);
        salvarDados();
    }
}

// ---------------- RECRUTAS ----------------
function aprovar(id) {
    const idx = espera.findIndex(p => p.id === id);
    if (idx > -1) {
        const j = espera.splice(idx, 1)[0];
        aprovados.push({ name: j.nome, matches: 0, kills: 0 });
        salvarDados();
    }
}

function reprovar(id) {
    espera = espera.filter(p => p.id !== id);
    salvarDados();
}

function renderAdmin() {
    if (!listaEspera) return;

    listaEspera.innerHTML = espera.length === 0
        ? '<p class="text-zinc-700 text-xs">Sem solicitações</p>'
        : espera.map(p => `
        <div class="bg-black p-2 m-1 flex justify-between">
            <span>${p.nome}</span>
            <div>
                <button onclick="aprovar(${p.id})" class="text-green-500">V</button>
                <button onclick="reprovar(${p.id})" class="text-red-500 ml-2">X</button>
            </div>
        </div>
    `).join('');
}

// ---------------- SALVAR ----------------
function salvarDados() {
    localStorage.setItem('odio_v7_rank', JSON.stringify(aprovados));
    localStorage.setItem('odio_v7_wait', JSON.stringify(espera));
    renderRank();
    renderAdmin();
}

// ==================================================
// 🔥 BACKUP EM ARQUIVO (NOVO)
// ==================================================

function exportarDados() {
    const dados = {
        rank: aprovados,
        espera: espera,
        banner: localStorage.getItem('odio_v7_banner')
    };

    const blob = new Blob(
        [JSON.stringify(dados, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup_odio.json";
    a.click();
    URL.revokeObjectURL(url);

    alert("✅ Backup baixado!");
}

function importarDados(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);

            aprovados = dados.rank || [];
            espera = dados.espera || [];
            bannerSalvo = dados.banner || bannerSalvo;

            salvarDados();
            bannerImg.src = bannerSalvo;

            alert("✅ Backup restaurado!");
        } catch {
            alert("❌ Arquivo inválido!");
        }
    };

    reader.readAsText(file);
}
