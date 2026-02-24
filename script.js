const ADMIN_PASS = "123"; // Senha admin
let isAdmin = false;
let aprovados = [];
let espera = [];
let bannerSalvo = "https://images.alphacoders.com";

const DATA_URL = "https://github.com/noobenoobN/site-equipe-odio/blob/main/dados.json";
const API_URL  = "https://api.github.com/repos/site-equipe-odio/blob/contents/dados.json";
const GITHUB_TOKEN = "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"; // Somente admin

window.onload = carregarDados;

// --- Modal ---
function abrirModal(){ document.getElementById('modalCadastro').classList.remove('hidden'); }
function fecharModal(){ document.getElementById('modalCadastro').classList.add('hidden'); }

// --- Carregar JSON ---
async function carregarDados(){
  try {
    const res = await fetch(DATA_URL);
    const dados = await res.json();
    bannerSalvo = dados.banner || bannerSalvo;
    aprovados = dados.rank || [];
    espera = dados.espera || [];
    document.getElementById('bannerImg').src = bannerSalvo;
    renderRank();
    renderAdmin();
  } catch(err){ console.error(err); }
}

// --- Alistamento ---
function solicitarEntrada(){
  const nome = document.getElementById('regNome').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const fone = document.getElementById('regFone').value.trim();
  if(!nome||!email||!fone){ alert("⚠️ Preencha todos os campos!"); return; }
  espera.push({nome,email,fone,id:Date.now()});
  renderAdmin();
  fecharModal();
}

// --- Admin ---
function toggleAdmin(){
  const senha = prompt("DIGITE A SENHA DE COMANDO:");
  if(senha === ADMIN_PASS){
    isAdmin = true;
    document.querySelectorAll('.admin-only').forEach(el=>el.style.display='block');
    document.getElementById('btnLogin').classList.add('hidden');
    document.getElementById('btnLogout').classList.remove('hidden');
    renderAdmin();
    renderRank();
  } else if(senha !== null){ alert("❌ SENHA INCORRETA!"); }
}

// --- Banner ---
function updateBanner(){
  const url = document.getElementById('newBannerUrl').value;
  if(url){ bannerSalvo=url; document.getElementById('bannerImg').src=bannerSalvo; }
}

// --- Adicionar manual ---
function adicionarJogadorManual(){
  const nome = prompt("Nome do Soldado:");
  if(nome){ aprovados.push({name:nome,matches:0,kills:0,deaths:0}); renderRank(); }
}

// --- Sortear equipes ---
function sortearEquipes(){
  if(aprovados.length<2){ alert("Precisa de pelo menos 2 soldados!"); return; }
  let lista = [...aprovados].sort(()=>Math.random()-0.5);
  let metade = Math.ceil(lista.length/2);
  let timeA = lista.slice(0,metade);
  let timeB = lista.slice(metade);
  alert("🔴 TIME ALPHA:\n"+timeA.map(p=>"- "+p.name).join("\n")+
        "\n\n🔵 TIME BRAVO:\n"+timeB.map(p=>"- "+p.name).join("\n"));
}

// --- Render ---
function renderRank(){
  const tbody = document.getElementById('rankBody'); tbody.innerHTML='';
  aprovados.sort((a,b)=>b.kills-a.kills);
  aprovados.forEach((p,i)=>{
    tbody.innerHTML+=`<tr class="border-b border-zinc-800 hover:bg-zinc-800 transition">
      <td class="p-4 font-bold text-zinc-600 italic">#${i+1}</td>
      <td class="p-4 font-bold uppercase">${p.name}${isAdmin?` <button onclick="editarNome('${p.name}')" class="ml-2 text-[9px] text-blue-500 font-bold uppercase">Editar</button>`:''}</td>
      <td class="p-4 text-center text-zinc-400">${p.matches}</td>
      <td class="p-4 text-center text-red-500 font-bold font-mono">${p.kills}</td>
      <td class="p-4 text-right admin-only" style="display:${isAdmin?'block':'none'}">
        <button onclick="addScore('${p.name}')" class="bg-blue-600 px-2 py-1 rounded text-[9px] font-bold text-white shadow-lg">+ KILLS</button>
        <button onclick="removerDoRank('${p.name}')" class="text-zinc-600 hover:text-red-500 ml-2">X</button>
      </td></tr>`;
  });
}

function renderAdmin(){
  const lista = document.getElementById('listaEspera');
  if(!lista) return;
  lista.innerHTML = espera.length===0 ? '<p class="text-zinc-700 text-[10px] italic p-2">Sem solicitações...</p>' :
  espera.map(p=>`<div class="bg-black/50 p-2 rounded flex justify-between items-center border border-zinc-800 m-1 border-l-2 border-yellow-600">
    <div class="text-[10px]"><b class="text-white uppercase font-bold italic">${p.nome}</b><br><span class="text-zinc-500">${p.fone}</span></div>
    <div class="flex gap-1">
      <button onclick="aprovar(${p.id})" class="bg-green-700 px-2 py-1 rounded text-[9px] font-bold">V</button>
      <button onclick="reprovar(${p.id})" class="bg-zinc-800 px-2 py-1 rounded text-[9px]">X</button>
    </div>
  </div>`).join('');
}

// --- Funções Admin ---
function aprovar(id){ const index=espera.findIndex(p=>p.id===id); if(index>-1){ const j=espera.splice(index,1)[0]; aprovados.push({name:j.nome,matches:0,kills:0,deaths:0}); renderRank(); renderAdmin(); } }
function reprovar(id){ if(confirm("Remover solicitação?")){ espera=espera.filter(p=>p.id!==id); renderAdmin(); } }
function addScore(nome){ const k=parseInt(prompt(`Quantas kills ${nome} fez?`,"0"))||0; const idx=aprovados.findIndex(p=>p.name===nome); aprovados[idx].matches+=1; aprovados[idx].kills+=k; renderRank(); }
function editarNome(velho){ const novo=prompt("Novo nick:",velho); if(novo){ const idx=aprovados.findIndex(p=>p.name===velho); aprovados[idx].name=novo; renderRank(); } }
function removerDoRank(nome){ if(confirm("Expulsar "+nome+"?")){ aprovados=aprovados.filter(p=>p.name!==nome); renderRank(); } }

// --- Upload Banner ---
function uploadFoto(input){ if(input.files && input.files[0]){ const reader=new FileReader(); reader.onload=e=>{bannerSalvo=e.target.result; document.getElementById('bannerImg').src=bannerSalvo;} ; reader.readAsDataURL(input.files[0]); }}

// --- Salvar na Nuvem GitHub ---
async function salvarDadosNaNuvem(){
  const content = btoa(JSON.stringify({banner:bannerSalvo, rank:aprovados, espera:espera},null,2));
  try{
    const getRes = await fetch(API_URL, {headers:{Authorization:`token ${GITHUB_TOKEN}`}});
    const data = await getRes.json();
    const sha = data.sha;
    const res = await fetch(API_URL,{
      method:"PUT",
      headers:{Authorization:`token ${GITHUB_TOKEN}`, "Content-Type":"application/json"},
      body:JSON.stringify({message:"Atualização dados ODIO",content,sha})
    });
    if(res.ok) alert("✅ Dados atualizados na nuvem!");
    else alert("❌ Falha ao atualizar dados!");
  }catch(err){ console.error(err); alert("❌ Erro ao salvar na nuvem"); }
}

