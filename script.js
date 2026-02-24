/* ======================= CONFIGURAÇÃO ======================= */
const ADMIN_PASS = "123";
let isAdmin = false;
let aprovados = [];
let espera = [];

/* ======================= MODAL ======================= */
function abrirModal() { document.getElementById('modalCadastro').classList.remove('hidden'); }
function fecharModal() { document.getElementById('modalCadastro').classList.add('hidden'); }

/* ======================= LOCALSTORAGE ======================= */
function salvarDados() {
    localStorage.setItem('odio_rank', JSON.stringify(aprovados));
    localStorage.setItem('odio_espera', JSON.stringify(espera));
    localStorage.setItem('odio_banner', document.getElementById('bannerImg').src);
}

function carregarDados() {
    aprovados = JSON.parse(localStorage.getItem('odio_rank')) || [];
    espera = JSON.parse(localStorage.getItem('odio_espera')) || [];
    const banner = localStorage.getItem('odio_banner');
    if(banner) document.getElementById('bannerImg').src = banner;

    renderRank();
    renderAdmin();
}

/* ======================= BACKUP ======================= */
function exportarBackup() {
    const backup = {
        rank: aprovados,
        espera: espera,
        banner: document.getElementById('bannerImg').src
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup_equipe_odio.json";
    a.click();
    URL.revokeObjectURL(url);
    alert("✅ Backup exportado!");
}

function importarBackup(input) {
    if(input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                aprovados = backup.rank || [];
                espera = backup.espera || [];
                if(backup.banner) document.getElementById('bannerImg').src = backup.banner;
                salvarDados();
                renderRank();
                renderAdmin();
                alert("✅ Backup importado com sucesso!");
            } catch(err) {
                alert("❌ Arquivo inválido!");
            }
        };
        reader.readAsText(input.files[0]);
    }
}

/* ======================= ALISTAMENTO ======================= */
function solicitarEntrada() {
    const nome = document.getElementById('regNome').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const fone = document.getElementById('regFone').value.trim();

    if (!nome || !email || !fone) return alert("⚠️ Preencha todos os campos!");

    const novoRecruta = { nome, email, fone, id: Date.now() };
    espera.push(novoRecruta);
    salvarDados();
    fecharModal();
    if(isAdmin) renderAdmin();
}

/* ======================= ADMIN ======================= */
function toggleAdmin() {
    const senha = prompt("DIGITE A SENHA DE COMANDO:");
    if(senha === ADMIN_PASS){
        isAdmin = true;
        document.querySelectorAll('.admin-only').forEach(el=>el.style.display='block');
        document.getElementById('btnLogin').classList.add('hidden');
        document.getElementById('btnLogout').classList.remove('hidden');
        renderAdmin();
        renderRank();
    } else if(senha!==null) alert("❌ SENHA INCORRETA!");
}

/* ======================= BANNER ======================= */
function updateBanner() {
    const url = document.getElementById('newBannerUrl').value;
    if(url){
        document.getElementById('bannerImg').src = url;
        salvarDados();
        alert("🖼️ Banner atualizado!");
    }
}

function uploadFoto(input){
    if(input.files && input.files[0]){
        const reader = new FileReader();
        reader.onload = (e)=> {
            document.getElementById('bannerImg').src = e.target.result;
            salvarDados();
        }
        reader.readAsDataURL(input.files[0]);
    }
}

/* ======================= RANKING ======================= */
function renderRank() {
    const tbody = document.getElementById('rankBody');
    tbody.innerHTML = '';
    aprovados.sort((a,b)=> b.kills - a.kills);

    aprovados.forEach((p,i)=>{
        tbody.innerHTML += `
        <tr class="border-b border-zinc-800 hover:bg-zinc-800 transition">
            <td class="p-4 font-bold text-zinc-600 italic">#${i+1}</td>
            <td class="p-4 font-bold uppercase">${p.name}</td>
            <td class="p-4 text-center text-zinc-400">${p.matches}</td>
            <td class="p-4 text-center text-red-500 font-bold font-mono">${p.kills}</td>
            <td class="p-4 text-right admin-only">
                <button onclick="addScore(${p.id})" class="bg-blue-600 px-2 py-1 rounded text-[9px] font-bold text-white shadow-lg">+ KILLS</button>
                <button onclick="removerDoRank(${p.id})" class="text-zinc-600 hover:text-red-500 ml-2">X</button>
            </td>
        </tr>`;
    });
}

function addScore(id) {
    const jogador = aprovados.find(p=>p.id===id);
    const k = parseInt(prompt(`Quantas kills ${jogador.name} fez?`, "0")) || 0;
    jogador.kills += k;
    jogador.matches += 1;
    salvarDados();
    renderRank();
}

function removerDoRank(id) {
    if(confirm("Expulsar esse soldado?")){
        aprovados = aprovados.filter(p=>p.id!==id);
        salvarDados();
        renderRank();
    }
}

/* ======================= RECRUTAS ======================= */
function renderAdmin() {
    const lista = document.getElementById('listaEspera');
    if(!lista) return;
    lista.innerHTML = espera.length===0 ? '<p class="text-zinc-700 text-[10px] italic p-2">Sem solicitações...</p>' :
    espera.map(p=>`
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

function aprovar(id){
    const index = espera.findIndex(p=>p.id===id);
    if(index>-1){
        const j = espera.splice(index,1)[0];
        aprovados.push({name:j.nome,matches:0,kills:0,deaths:0,id:Date.now()});
        salvarDados();
        renderRank();
        renderAdmin();
    }
}

function reprovar(id){
    if(confirm("Remover solicitação?")){
        espera = espera.filter(p=>p.id!==id);
        salvarDados();
        renderAdmin();
    }
}

/* ======================= SORTER ======================= */
function sortearEquipes(){
    if(aprovados.length<2) return alert("Precisa de pelo menos 2 soldados!");
    const lista = [...aprovados].sort(()=>Math.random()-0.5);
    const metade = Math.ceil(lista.length/2);
    const timeA = lista.slice(0,metade);
    const timeB = lista.slice(metade);
    let msg = "🔴 TIME ALPHA:\n"+timeA.map(p=>"- "+p.name).join("\n")+
              "\n\n🔵 TIME BRAVO:\n"+timeB.map(p=>"- "+p.name).join("\n");
    alert(msg);
}

/* ======================= MANUAL ======================= */
function adicionarJogadorManual(){
    const nome = prompt("Nome do Soldado para adicionar ao RANK:");
    if(nome){
        aprovados.push({name:nome,matches:0,kills:0,deaths:0,id:Date.now()});
        salvarDados();
        renderRank();
    }
}

/* ======================= INICIALIZAÇÃO ======================= */
window.onload = function(){
    carregarDados();
}
