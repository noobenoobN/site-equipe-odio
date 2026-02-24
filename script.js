// 🔥 FIREBASE IMPORTS (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 SUA CONFIG (já inserida)
const firebaseConfig = {
  apiKey: "AIzaSyDkwukyKZVEZKiP4J75tkUNDisqaC4KLlk",
  authDomain: "equipeodio-715f6.firebaseapp.com",
  projectId: "equipeodio-715f6",
  storageBucket: "equipeodio-715f6.firebasestorage.app",
  messagingSenderId: "399735990964",
  appId: "1:399735990964:web:6baa2428bc49c23d7845e1",
  measurementId: "G-0KSV1VY936"
};

// 🔥 INICIAR FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 VARIÁVEIS
let aprovados = [];
let espera = [];
let bannerSalvo = "";

const docRef = doc(db, "site", "dados");

// 🔥 CARREGAMENTO EM TEMPO REAL
onSnapshot(docRef, (docSnap) => {
  if (docSnap.exists()) {
    const dados = docSnap.data();
    aprovados = dados.rank || [];
    espera = dados.espera || [];
    bannerSalvo = dados.banner || "";
    document.getElementById('bannerImg').src = bannerSalvo;
    renderRank();
    renderAdmin();
  }
});

// 🔥 SALVAR
async function salvar() {
  await setDoc(docRef, {
    banner: bannerSalvo,
    rank: aprovados,
    espera: espera
  });
}

// ==========================
// SISTEMA
// ==========================

window.abrirModal = () =>
  document.getElementById('modalCadastro').classList.remove('hidden');

window.fecharModal = () =>
  document.getElementById('modalCadastro').classList.add('hidden');

window.solicitarEntrada = async function () {
  const nome = regNome.value.trim();
  const email = regEmail.value.trim();
  const fone = regFone.value.trim();

  if (!nome || !email || !fone) {
    alert("Preencha todos os campos!");
    return;
  }

  espera.push({ nome, email, fone, id: Date.now() });
  await salvar();
  fecharModal();
};

window.aprovar = async function (id) {
  const idx = espera.findIndex(p => p.id === id);
  if (idx === -1) return;

  const j = espera.splice(idx, 1)[0];
  aprovados.push({ name: j.nome, matches: 0, kills: 0 });
  await salvar();
};

window.reprovar = async function (id) {
  espera = espera.filter(p => p.id !== id);
  await salvar();
};

window.addScore = async function (nome) {
  const k = parseInt(prompt("Quantas kills?","0")) || 0;
  const idx = aprovados.findIndex(p => p.name === nome);
  if (idx === -1) return;

  aprovados[idx].matches += 1;
  aprovados[idx].kills += k;
  await salvar();
};

window.removerDoRank = async function (nome) {
  aprovados = aprovados.filter(p => p.name !== nome);
  await salvar();
};

window.updateBanner = async function () {
  const url = newBannerUrl.value;
  if (!url) return;
  bannerSalvo = url;
  await salvar();
};

// ==========================
// RENDER
// ==========================

function renderRank() {
  const tbody = document.getElementById('rankBody');
  tbody.innerHTML = '';

  aprovados.sort((a, b) => b.kills - a.kills);

  aprovados.forEach((p, i) => {
    tbody.innerHTML += `
      <tr class="border-b border-zinc-800">
        <td class="p-4">#${i + 1}</td>
        <td class="p-4">${p.name}</td>
        <td class="p-4 text-center">${p.matches}</td>
        <td class="p-4 text-center text-red-500">${p.kills}</td>
        <td class="p-4 text-right">
          <button onclick="addScore('${p.name}')" class="bg-blue-600 px-2 py-1 rounded text-xs">+K</button>
          <button onclick="removerDoRank('${p.name}')" class="text-red-500 ml-2">X</button>
        </td>
      </tr>
    `;
  });
}

function renderAdmin() {
  const lista = document.getElementById('listaEspera');
  if (!lista) return;

  lista.innerHTML = espera.map(p => `
    <div class="bg-black/50 p-2 rounded flex justify-between">
      <div>${p.nome}</div>
      <div>
        <button onclick="aprovar(${p.id})" class="bg-green-600 px-2 py-1 text-xs">V</button>
        <button onclick="reprovar(${p.id})" class="bg-red-600 px-2 py-1 text-xs">X</button>
      </div>
    </div>
  `).join('');
}
