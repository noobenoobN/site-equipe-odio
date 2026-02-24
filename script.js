const ADMIN_PASS = "123"; // Senha do Admin
let isAdmin = false;

// Bancos de Dados Locais
let aprovados = JSON.parse(localStorage.getItem('odio_v7_rank')) || [];
let espera = JSON.parse(localStorage.getItem('odio_v7_wait')) || [];
let bannerSalvo = localStorage.getItem('odio_v7_banner') || "https://images.alphacoders.com";

// Inicialização ao carregar a página
window.onload = function() {
    document.getElementById('bannerImg').src = bannerSalvo;
    renderRank();
    if (isAdmin) renderAdmin();
};

// --- FUNÇÕES DO MODAL ---
function abrirModal() { document.getElementById('modalCadastro').classList.remove('hidden'); }
function fecharModal() { document.getElementById('modalCadastro').classList.add('hidden'); }

// --- SISTEMA DE ALISTAMENTO ---
function solicitarEntrada() {
    const nome = document.getElementById('regNome').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const fone = document.getElementById('regFone').value.trim();

    if (!nome || !email || !fone) {
        alert("⚠️ Preencha todos os campos!");
        return;
    }

    const novoRecruta = { nome, email, fone, id: Date.now() };
    espera.push(novoRecruta);
    localStorage.setItem('odio_v7_wait', JSON.stringify(espera));

    alert("✅ Ficha enviada! Aguarde a aprovação do Admin.");
    document.getElementById('regNome').value = "";
    document.getElementById('regEmail').value = "";
    document.getElementById('regFone').value = "";
    fecharModal();
    if (isAdmin) renderAdmin();
}

// --- CONTROLE ADMIN ---
function toggleAdmin() {
    const senha = prompt("DIGITE A SENHA DE COMANDO:");
    if (senha === ADMIN_PASS) {
        isAdmin = true;
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        document.getElementById('btnLogin').classList.add('hidden');
        document.getElementById('btnLogout').classList.remove('hidden');
        renderAdmin();
        renderRank();
    } else if (senha !== null) {
        alert("❌ SENHA INCORRETA!");
    }
}

// --- GESTÃO DO BANNER ---
function updateBanner() {
    const url = document.getElementById('newBannerUrl').value;
    if (url) setBanner(url);
}

function uploadFoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => setBanner(e.target.result);
        reader.readAsDataURL(input.files[0]);
    }
}

function setBanner(src) {
    document.getElementById('bannerImg').src = src;
    localStorage.setItem('odio_v7_banner', src);
    alert("🖼️ Banner atualizado!");
}

// --- FUNÇÃO ADICIONAR MANUAL (EXCLUSIVO ADMIN) ---
function adicionarJogadorManual() {
    const nome = prompt("Nome do Soldado para adicionar ao RANK:");
    if (nome) {
        aprovados.push({ name: nome, matches: 0, kills: 0, deaths: 0 });
        salvarDados();
        alert(nome + " adicionado ao ranking!");
    }
}

// --- SORTEADOR DE EQUIPES ---
function sortearEquipes() {
    if (aprovados.length < 2) return alert("Precisa de pelo menos 2 soldados no ranking!");
    
    // Embaralhar jogadores
    let lista = [...aprovados].sort(() => Math.random() - 0.5);
    let metade = Math.ceil(lista.length / 2);
    
    let timeA = lista.slice(0, metade);
    let timeB = lista.slice(metade);

    let msg = "🔴 TIME ALPHA:\n" + timeA.map(p => "- " + p.name).join("\n") + 
              "\n\n🔵 TIME BRAVO:\n" + timeB.map(p => "- " + p.name).join("\n");
    
    alert(msg);
}

// --- GESTÃO DE MEMBROS ---
function aprovar(id) {
    const index = espera.findIndex(p => p.id === id);
    if (index > -1) {
        const j = espera.splice(index, 1)[0];
        aprovados.push({ name: j.nome, matches: 0, kills: 0, deaths: 0 });
        salvarDados();
    }
}

function reprovar(id) {
    if (confirm("Remover solicitação?")) {
        espera = espera.filter(p => p.id !== id);
        salvarDados();
    }
}

// --- GESTÃO DO RANKING ---
function renderRank() {
    const tbody = document.getElementById('rankBody');
    tbody.innerHTML = '';
    aprovados.sort((a, b) => b.kills - a.kills);

    aprovados.forEach((p, i) => {
        tbody.innerHTML += `
            <tr class="border-b border-zinc-800 hover:bg-zinc-800 transition">
                <td class="p-4 font-bold text-zinc-600 italic">#${i+1}</td>
                <td class="p-4 font-bold uppercase">
                    ${p.name}
                    ${isAdmin ? `<button onclick="editarNome('${p.name}')" class="ml-2 text-[9px] text-blue-500 font-bold uppercase">Editar</button>` : ''}
                </td>
                <td class="p-4 text-center text-zinc-400">${p.matches}</td>
                <td class="p-4 text-center text-red-500 font-bold font-mono">${p.kills}</td>
                <td class="p-4 text-right admin-only" style="display: ${isAdmin ? 'block' : 'none'}">
                    <button onclick="addScore('${p.name}')" class="bg-blue-600 px-2 py-1 rounded text-[9px] font-bold text-white shadow-lg">+ KILLS</button>
                    <button onclick="removerDoRank('${p.name}')" class="text-zinc-600 hover:text-red-500 ml-2">X</button>
                </td>
            </tr>`;
    });
}

function addScore(nome) {
    const k = prompt(`Quantas kills ${nome} fez?`, "0");
    if (k !== null) {
        const idx = aprovados.findIndex(p => p.name === nome);
        aprovados[idx].matches += 1;
        aprovados[idx].kills += parseInt(k) || 0;
        salvarDados();
    }
}

function editarNome(velho) {
    const novo = prompt("Novo nick:", velho);
    if (novo) {
        const idx = aprovados.findIndex(p => p.name === velho);
        aprovados[idx].name = novo;
        salvarDados();
    }
}

function removerDoRank(nome) {
    if (confirm("Expulsar " + nome + "?")) {
        aprovados = aprovados.filter(p => p.name !== nome);
        salvarDados();
    }
}

// --- SISTEMA ---
function salvarDados() {
    localStorage.setItem('odio_v7_rank', JSON.stringify(aprovados));
    localStorage.setItem('odio_v7_wait', JSON.stringify(espera));
    renderRank();
    renderAdmin();
}

function renderAdmin() {
    const lista = document.getElementById('listaEspera');
    if (!lista) return;
    lista.innerHTML = espera.length === 0 ? '<p class="text-zinc-700 text-[10px] italic p-2">Sem solicitações...</p>' : 
    espera.map(p => `
        <div class="bg-black/50 p-2 rounded flex justify-between items-center border border-zinc-800 m-1 border-l-2 border-yellow-600">
            <div class="text-[10px]">
                <b class="text-white uppercase font-bold italic">${p.nome}</b><br>
                <span class="text-zinc-500">${p.fone}</span>
            </div>
            <div class="flex gap-1">
                <button onclick="aprovar(${p.id})" class="bg-green-700 px-2 py-1 rounded text-[9px] font-bold">V</button>
                <button onclick="reprovar(${p.id})" class="bg-zinc-800 px-2 py-1 rounded text-[9px]">X</button>
            </div>
        </div>
    `).join('');
}
