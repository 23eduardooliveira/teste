/* ================================================================================
   SCRIPT.JS - VERSÃO ATUALIZADA (MODELO NANOBANANA-PRO)
   ================================================================================ */

window.recursosAtuais = null; 
window.regra = {};             

const PONTOS_POR_NIVEL_FLOAT = 70; 
let currentSkillTab = 'ST'; 
let currentSkillType = 'A'; 
const STORAGE_KEY = 'ficha_rpg_medieval_auto_save';
let graficoInstance = null;

// --- CORES & LISTAS ---
const CORES_TEXTO_RARIDADE = { 
    'Comum': '#555555', 'Incomum': '#2e8b57', 'Raro': '#00008b', 
    'Raríssima': '#800080', 'Rarissima': '#800080', 
    'Épico': '#b8860b', 'Epico': '#b8860b', 
    'Lendário': '#8b0000', 'Lendario': '#8b0000', 
    'Mítico': '#008080', 'Mitico': '#008080' 
};

const CUSTO_RARIDADE = { 
    'Comum': 1, 'Incomum': 3, 'Raro': 6, 
    'Rarissima': 10, 'Raríssima': 10,
    'Epico': 14, 'Épico': 14,
    'Lendario': 18, 'Lendário': 18,
    'Mitico' : 22, 'Mítico' : 22
};

const CUSTO_BASE_SKILL_ATIVA = { 'Comum': 10, 'Incomum': 15, 'Raro': 20, 'Rarissima': 25, 'Epico': 30, 'Lendario': 35, 'Mitico': 40 };

const SKILL_MODIFIERS = {
    'Alcances Básicos': [ { nome: 'Toque', custo: 0 }, { nome: 'Projétil', custo: 0.5 }, { nome: 'Feitiço', custo: 1 }, { nome: 'Raio', custo: 3 }, { nome: 'Cone', custo: 1 } ],
    'Alcances Avançados': [ { nome: 'Composto', custo: 0 }, { nome: 'Proj. Guiado', custo: 1 }, { nome: 'Zona', custo: 1 }, { nome: 'Rastro', custo: 2 }, { nome: 'Atravessar', custo: 3 }, { nome: 'Ricochete', custo: 2 }, { nome: 'Curva', custo: 3 }, { nome: 'Contágio', custo: 2 }, { nome: 'Salto', custo: 2 } ],
    'Modificadores': [ { nome: 'Ataques Extras', custo: 7 }, { nome: 'Efeito Sustentado', custo: 0 }, { nome: 'Redução de custo', custo: 2 } ],
    'Efeitos Imediatos': [ { nome: 'Dano', custo: 1 }, { nome: 'Crítico Aprimorado', custo: 5 }, { nome: 'Saque Rápido', custo: 2 }, { nome: 'Deslocamento', custo: 3 }, { nome: 'Avançar', custo: 2 }, { nome: 'Investida', custo: 1 }, { nome: 'Teleporte', custo: 3 }, { nome: 'Empurrar', custo: 2 }, { nome: 'Puxar', custo: 2 }, { nome: 'Manobrar', custo: 3 }, { nome: 'Decoy', custo: 1 }, { nome: 'Nexus', custo: 5 }, { nome: 'Terminus', custo: 5 }, { nome: 'Panaceia', custo: 3 }, { nome: 'Ilusão Visual', custo: 1 }, { nome: 'Ilusão Auditiva', custo: 1 }, { nome: 'Ilusão Olfativa', custo: 1 }, { nome: 'Ilusão Tátil', custo: 1 }, { nome: 'Desarmar', custo: 3 }, { nome: 'Derrubar', custo: 3 }, { nome: 'Brutalidade', custo: 5 }, { nome: 'Absorver Marcas', custo: 3 } ],
    'Buff/Debuff': [ { nome: 'Precisão', custo: 1 }, { nome: 'Influência', custo: 1 }, { nome: 'Esquiva', custo: 1 }, { nome: 'Aparo', custo: 1 }, { nome: 'Proteção', custo: 1 }, { nome: 'Defesa', custo: 1 }, { nome: 'Dano (Buff)', custo: 1 }, { nome: 'Duração de Buff/Debuff', custo: 3 }, { nome: 'Raridade de Arma', custo: 5 }, { nome: 'Raridade de Armadura', custo: 5 }, { nome: 'Sobrevida', custo: 0.5 }, { nome: 'Duração', custo: 1 } ],
    'Status Especiais': [ { nome: 'Marca', custo: 1 }, { nome: 'Provocar', custo: 3 } ],
    'Status Positivos': [ { nome: 'Arma Encantada', custo: 3 }, { nome: 'Aparo Desarmado', custo: 3 }, { nome: 'Aparo Aprimorado', custo: 3 }, { nome: 'Desengajar', custo: 3 }, { nome: 'Esmaecer', custo: 3 }, { nome: 'Regeneração I', custo: 3 }, { nome: 'Liberdade', custo: 3 }, { nome: 'Triagem', custo: 3 }, { nome: 'Força do Gigante', custo: 3 }, { nome: 'Reflexo Felino', custo: 3 }, { nome: 'Olho de Águia', custo: 3 }, { nome: 'Couro de Elefante', custo: 3 }, { nome: 'Aura do Unicórnio', custo: 3 }, { nome: 'Astúcia da Raposa', custo: 3 }, { nome: 'Persuasão Feérica', custo: 3 }, { nome: 'Refletir Dano I', custo: 3 }, { nome: 'Aparo Místico', custo: 5 }, { nome: 'Defletir', custo: 5 }, { nome: 'Contra-ataque', custo: 5 }, { nome: 'Adrenalina', custo: 5 }, { nome: 'Erudição', custo: 5 }, { nome: 'Foco', custo: 5 }, { nome: 'Regeneração II', custo: 5 }, { nome: 'Assepsia', custo: 5 }, { nome: 'Autonomia', custo: 5 }, { nome: 'Solidez', custo: 5 }, { nome: 'Refletir Dano II', custo: 5 }, { nome: 'Invisibilidade', custo: 7 }, { nome: 'Regeneração III', custo: 7 }, { nome: 'Prevenção', custo: 7 }, { nome: 'Refletir Dano III', custo: 10 } ],
    'Barreiras': [ { nome: 'Barreira Mística: Espaços Ocupados', custo: 1 }, { nome: 'Barreira Mística: Altura da Barreira', custo: 1 }, { nome: 'Barreira Mística: Duração da Barreira', custo: 1 }, { nome: 'Barreira Mística: Proteção Bônus', custo: 1 }, { nome: 'Barreira Cinética: Espaços Ocupados', custo: 1 }, { nome: 'Barreira Cinética: Altura da Barreira', custo: 1 }, { nome: 'Barreira Cinética: Resistência da Barreira', custo: 1 } ],
    'Status Negativos': [ { nome: 'Dano Contínuo I', custo: 3 }, { nome: 'Derreter', custo: 3 }, { nome: 'Congelado', custo: 3 }, { nome: 'Peso', custo: 3 }, { nome: 'Exaustão', custo: 3 }, { nome: 'Mana Burn', custo: 3 }, { nome: 'Desconexão', custo: 3 }, { nome: 'Pasmar', custo: 3 }, { nome: 'Bloqueio Psíquico', custo: 3 }, { nome: 'Imobilização', custo: 3 }, { nome: 'Distração', custo: 3 }, { nome: 'Atraso', custo: 3 }, { nome: 'Sufocamento', custo: 3 }, { nome: 'Inflamação', custo: 3 }, { nome: 'Afugentado', custo: 3 }, { nome: 'Dissociação', custo: 3 }, { nome: 'Confusão', custo: 3 }, { nome: 'Vertigem', custo: 3 }, { nome: 'Dano Contínuo II', custo: 5 }, { nome: 'Lentidão', custo: 5 }, { nome: 'Estupidez', custo: 5 }, { nome: 'Ruído', custo: 5 }, { nome: 'Expurgo', custo: 5 }, { nome: 'Selo Físico', custo: 5 }, { nome: 'Selo Mágico', custo: 5 }, { nome: 'Selo Psíquico', custo: 5 }, { nome: 'Sugestão', custo: 5 }, { nome: 'Charm', custo: 5 }, { nome: 'Infecção', custo: 5 }, { nome: 'Medo', custo: 5 }, { nome: 'Cegueira', custo: 5 }, { nome: 'Berserk', custo: 5 }, { nome: 'Quebra Estância', custo: 5 }, { nome: 'Quebra Encanto', custo: 5 }, { nome: 'Quebra Influência', custo: 5 }, { nome: 'Quebra de Armadura', custo: 5 }, { nome: 'Quebra Arcana', custo: 5 }, { nome: 'Quebra Psíquica', custo: 5 }, { nome: 'Dano Contínuo III', custo: 7 }, { nome: 'Atordoamento', custo: 7 }, { nome: 'Comando', custo: 7 }, { nome: 'Decadência', custo: 7 }, { nome: 'Terror', custo: 7 }, { nome: 'Controle', custo: 10 } ],
    'Invocações': [ { nome: 'Invocar ilusões', custo: 1 }, { nome: 'Invocar Simulacros', custo: 10 }, { nome: 'Invocar Criatura', custo: 10 } ],
    'Transformações': [ { nome: 'Duração', custo: 1 }, { nome: 'Ficha da Transformação', custo: 5 }, { nome: 'Ascensões', custo: 5 } ],
    'Habilidades Passivas (Base)': [ { nome: 'Precisão', custo: 1 }, { nome: 'Influência', custo: 1 }, { nome: 'Esquiva', custo: 1 }, { nome: 'Aparo', custo: 1 }, { nome: 'Proteção', custo: 1 }, { nome: 'Defesa', custo: 1 }, { nome: 'Dano', custo: 1 }, { nome: 'Recuperação de Stamina', custo: 2 }, { nome: 'Recuperação de Mana', custo: 2 }, { nome: 'Recuperação de Psy', custo: 2 }, { nome: 'Passiva Reativa', custo: 3 }, { nome: 'Resistir Magia', custo: 1 }, { nome: 'Defesa Mágica', custo: 1 } ]
};

const SKILL_NERFS = [
    { nome: 'Custo de Hp', custo: 1 }, { nome: 'Restrição de Alcance de Arma', custo: 1 }, { nome: 'Restrição de Tipo de Arma', custo: 1 }, { nome: 'Restrição de Material de Arma', custo: 1 }, { nome: 'Restrição de Condição da Arma', custo: 1 }, { nome: 'Restrição de Peso de Armadura', custo: 1 }, { nome: 'Restrição de Tipo de Armadura', custo: 1 }, { nome: 'Restrição de Material da Armadura', custo: 1 }, { nome: 'Acima de 50% Hp do alvo', custo: 1 }, { nome: 'Abaixo de 50% Hp do alvo', custo: 1 }, { nome: 'Acima de 25% do Recurso', custo: 1 }, { nome: 'Restrição de Alvo (Status Negativo)', custo: 1 }, { nome: 'Restrição de Alvo (Status Positivo)', custo: 1 }, { nome: 'Deficit de Marcas', custo: 1 }, { nome: 'Aumento de Custo', custo: 2 }, { nome: 'Tempo de Resfriamento', custo: 2 }, { nome: 'Restrição de Alvo (Espécie)', custo: 2 }, { nome: 'Acima de 50% Hp do usuário', custo: 3 }, { nome: 'Abaixo de 50% Hp do usuário', custo: 3 }, { nome: '100% Hp do alvo', custo: 3 }, { nome: 'Abaixo de 25% Hp do alvo', custo: 3 }, { nome: 'Egoísmo', custo: 3 }, { nome: 'Abdicação', custo: 3 }, { nome: 'Acima de 50% do Recurso', custo: 3 }, { nome: 'Restrição de Alvo (Múltiplos Status Negativos)', custo: 3 }, { nome: 'Restrição de Alvo (Múltiplos Status Positivos)', custo: 3 }, { nome: 'Restrição de Alvo (Tipo de Status)', custo: 3 }, { nome: 'Restrição de Alvo (Sequência)', custo: 3 }, { nome: 'Efeito Quebradiço', custo: 3 }, { nome: 'Restrição a sem Arma', custo: 3 }, { nome: 'Espelhar Dano', custo: 5 }, { nome: 'Espelhar Status', custo: 5 }, { nome: 'Espelhar Debuff', custo: 5 }, { nome: 'Tempo de Carregamento', custo: 5 }, { nome: 'Atraso', custo: 5 }, { nome: 'Corrente Mental', custo: 5 }, { nome: 'Quebra-Canal', custo: 5 }, { nome: 'Restrição a Arma Única', custo: 5 }, { nome: 'Restrição a Armadura Única', custo: 5 }, { nome: 'Restrição a sem Armadura', custo: 5 }, { nome: '100% Hp do Usuário', custo: 5 }, { nome: 'Abaixo de 25% Hp do usuário', custo: 5 }, { nome: 'Seletividade Mental', custo: 5 }, { nome: 'Abaixo de 10% Hp do alvo', custo: 5 }, { nome: '100% do Recurso', custo: 5 }, { nome: 'Ao Executar um Alvo', custo: 5 }, { nome: 'Eixo Mental', custo: 7 }, { nome: 'Abaixo de 10% Hp do usuário', custo: 7 }, { nome: 'Após executar um alvo', custo: 7 }, { nome: 'Restrição a Sem Equipamento', custo: 7 }, { nome: 'Ao Morrer', custo: 10 }
];

function getAllModifierCategories() { const categories = Object.keys(SKILL_MODIFIERS); categories.push('Efeitos Adversos (Nerfs)'); return categories; }
function getEffectsForCategory(categoryName) { if (categoryName === 'Efeitos Adversos (Nerfs)') return SKILL_NERFS; return SKILL_MODIFIERS[categoryName] || []; }

// --- UI HELPERS ---
function toggleMenu() { document.getElementById("menu-dropdown").classList.toggle("show"); }
window.onclick = function(event) { if (!event.target.matches('.menu-btn')) { var dropdowns = document.getElementsByClassName("dropdown-content"); for (var i = 0; i < dropdowns.length; i++) { var openDropdown = dropdowns[i]; if (openDropdown.classList.contains('show')) { openDropdown.classList.remove('show'); } } } }

function mudarAbaPrincipal(aba) {
    document.getElementById('view-atributos').style.display = 'none';
    document.getElementById('view-batalha').style.display = 'none';
    document.getElementById('view-inventario').style.display = 'none';
    document.getElementById('view-radar').style.display = 'none';
    
    const btns = document.querySelectorAll('.tab-principal-btn');
    btns.forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${aba}`).style.display = 'block';
    
    if(aba === 'atributos') btns[0].classList.add('active');
    if(aba === 'batalha') btns[1].classList.add('active');
    if(aba === 'inventario') btns[2].classList.add('active');
    if(aba === 'radar') { btns[3].classList.add('active'); atualizarGrafico(); }
}

// --- SAVE / LOAD ---
function salvarAutomaticamente() { const dados = gerarObjetoFicha(); localStorage.setItem(STORAGE_KEY, JSON.stringify(dados)); }
function carregarDadosAutomaticos() { const dadosSalvos = localStorage.getItem(STORAGE_KEY); if (dadosSalvos) { try { const dados = JSON.parse(dadosSalvos); aplicarDadosNaTela(dados); } catch (e) { console.error("Erro ao carregar auto-save", e); } } }

// --- ATRIBUTOS ---
function getAttrValue(name) { 
    const row = document.querySelector(`.atributo-row[data-nome="${name}"]`); 
    if (!row) return 0; 
    const input = row.querySelector('.atributo-input'); 
    return parseInt(input ? input.value : 0) || 0; 
}
function incrementAttr(button) { 
    const input = button.closest('.atributo-input-group').querySelector('.atributo-input'); 
    let value = parseInt(input.value) || 0; input.value = value + 1; atualizarSistemaCompleto(); salvarAutomaticamente(); 
}
function decrementAttr(button) { 
    const input = button.closest('.atributo-input-group').querySelector('.atributo-input'); 
    let value = parseInt(input.value) || 0; if (value > 1) { input.value = value - 1; atualizarSistemaCompleto(); salvarAutomaticamente(); } 
}
function gerenciarClickTreino(btn) { 
    const row = btn.closest('.atributo-row'); const contadorSpan = row.querySelector('.treino-contador'); const inputAttr = row.querySelector('.atributo-input'); 
    let usoAtual = parseInt(contadorSpan.innerText) || 0; let valorAtributo = parseInt(inputAttr.value) || 0; 
    if (usoAtual >= valorAtributo) { aplicarTreino(btn); } else { alterarUsoAtributo(row, 1); } 
}
function alterarUsoAtributo(row, valor) { 
    const contadorSpan = row.querySelector('.treino-contador'); if (!contadorSpan) return; 
    let usoAtual = parseInt(contadorSpan.innerText) || 0; usoAtual += valor; 
    contadorSpan.innerText = Math.max(0, usoAtual); verificarTreinoAtributo(row); salvarAutomaticamente(); 
}
function verificarTreinoAtributo(row) { 
    const inputAttr = row.querySelector('.atributo-input'); const valorAtributo = parseInt(inputAttr.value) || 0; 
    const contadorSpan = row.querySelector('.treino-contador'); const usoAtributo = parseInt(contadorSpan.innerText) || 0; 
    const atributoValorDisplay = row.querySelector('.atributo-valor-display'); const statusSpan = row.querySelector('.msg-status'); const treinarBtn = row.querySelector('.treinar-btn'); 
    if (atributoValorDisplay) atributoValorDisplay.innerText = valorAtributo; if (!treinarBtn) return; 
    if (usoAtributo >= valorAtributo && valorAtributo > 0) { 
        row.classList.add('inspirado'); if (statusSpan) { statusSpan.textContent = 'INSPIRADO!'; statusSpan.style.color = 'var(--cor-alerta)'; } 
        treinarBtn.innerText = "UP"; treinarBtn.classList.add('aplicar-pontos-btn'); treinarBtn.disabled = false; 
    } else { 
        row.classList.remove('inspirado'); if (statusSpan) { statusSpan.textContent = ''; } 
        treinarBtn.innerText = "Treinar"; treinarBtn.classList.remove('aplicar-pontos-btn'); treinarBtn.disabled = false; 
    } 
}
function aplicarTreino(btn) { 
    const row = btn.closest('.atributo-row'); const inputAttr = row.querySelector('.atributo-input'); const contadorSpan = row.querySelector('.treino-contador'); 
    let valorAtual = parseInt(inputAttr.value) || 0; inputAttr.value = valorAtual + 1; contadorSpan.innerText = '0'; atualizarSistemaCompleto(); salvarAutomaticamente(); 
}
function calcularNivelBaseadoEmPontos(gastos) { let nivelBruto = gastos / PONTOS_POR_NIVEL_FLOAT; if (nivelBruto < 0.01) nivelBruto = 0.01; return parseFloat(nivelBruto.toFixed(2)); }
function atualizarSistemaCompleto() { 
    const rows = document.querySelectorAll('.atributo-row'); let gastos = 0; 
    rows.forEach(row => { const input = row.querySelector('.atributo-input'); const valor = parseInt(input.value) || 0; gastos += valor; verificarTreinoAtributo(row); }); 
    const nivelAtual = calcularNivelBaseadoEmPontos(gastos); 
    let totalPontosPermitidos = Math.round(nivelAtual * PONTOS_POR_NIVEL_FLOAT); 
    document.getElementById('nivel-display').innerText = nivelAtual.toFixed(2); 
    document.getElementById('total-pontos').innerText = totalPontosPermitidos; 
    window.regra = { nivelAtual, gastosAtuais: gastos }; 
    calcularRecursos(); calcularPericias(); calcularSkills(); atualizarGrafico(); 
}

// --- RECURSOS ---
function calcularRecursos() { 
    const F = getAttrValue("Forca"); const R = getAttrValue("Resistencia"); const E = getAttrValue("Espírito"); const I = getAttrValue("Inteligencia"); const C = getAttrValue("Carisma"); 
    const maxHP = R * 4; const maxST = R * 2 + F; const maxMP = E * 2 + I; const maxPSI = I * 2 + C;

    if (!window.recursosAtuais) { window.recursosAtuais = { hp: maxHP, st: maxST, mp: maxMP, psi: maxPSI }; }

    document.getElementById('hp-max').innerText = maxHP; document.getElementById('st-max').innerText = maxST; 
    document.getElementById('mp-max').innerText = maxMP; document.getElementById('psi-max').innerText = maxPSI; 
    atualizarBarrasVisuais(maxHP, maxST, maxMP, maxPSI);
}

function atualizarBarrasVisuais(maxHP, maxST, maxMP, maxPSI) {
    if (!window.recursosAtuais) return;
    let curHP = window.recursosAtuais.hp; let curST = window.recursosAtuais.st; let curMP = window.recursosAtuais.mp; let curPSI = window.recursosAtuais.psi;
    document.getElementById('hp-atual').innerText = curHP; document.getElementById('st-atual').innerText = curST; document.getElementById('mp-atual').innerText = curMP; document.getElementById('psi-atual').innerText = curPSI;
    document.getElementById('hp-bar-fill').style.width = Math.min(100, Math.max(0, (curHP / maxHP) * 100)) + '%';
    document.getElementById('st-bar-fill').style.width = Math.min(100, Math.max(0, (curST / maxST) * 100)) + '%';
    document.getElementById('mp-bar-fill').style.width = Math.min(100, Math.max(0, (curMP / maxMP) * 100)) + '%';
    document.getElementById('psi-bar-fill').style.width = Math.min(100, Math.max(0, (curPSI / maxPSI) * 100)) + '%';
}

function alterarRecurso(tipo, multiplicador) {
    const inputId = `mod-${tipo}`; const inputVal = document.getElementById(inputId).value; const valorDigitado = parseInt(inputVal) || 0; 
    if (valorDigitado === 0) return;
    if (!window.recursosAtuais) window.recursosAtuais = { hp:0, st:0, mp:0, psi:0 };
    window.recursosAtuais[tipo] += (valorDigitado * multiplicador);
    document.getElementById(inputId).value = ''; calcularRecursos(); salvarAutomaticamente();
}

// --- PERÍCIAS ---
function calcularCustoPericia(elemento) { const item = elemento.closest('.pericia-item'); const raridade = item.querySelector('.pericia-raridade').value; item.dataset.custo = CUSTO_RARIDADE[raridade] || 0; calcularPericias(); salvarAutomaticamente(); }
function calcularPericias() { const nivel = window.regra.nivelAtual || 0.01; const ptsBase = Math.floor(nivel * 10); const ptsPrincipal = ptsBase; const ptsSecundaria = Math.max(0, ptsBase - 5); const ptsTerciaria = Math.max(0, ptsBase - 10); document.getElementById('pericia-principal-pts').innerText = ptsPrincipal; document.getElementById('pericia-secundaria-pts').innerText = ptsSecundaria; document.getElementById('pericia-terciaria-pts').innerText = ptsTerciaria; atualizarDisplayGastos('principal', somarGastosPericia('principal'), ptsPrincipal); atualizarDisplayGastos('secundaria', somarGastosPericia('secundaria'), ptsSecundaria); atualizarDisplayGastos('terciaria', somarGastosPericia('terciaria'), ptsTerciaria); }
function somarGastosPericia(cat) { const container = document.getElementById(`pericias-${cat}`); let total = 0; if (container) container.querySelectorAll('.pericia-item').forEach(item => total += parseInt(item.dataset.custo) || 0); return total; }
function atualizarDisplayGastos(cat, gastos, limite) { const display = document.getElementById(`pericia-${cat}-gastos`); if (display) { display.innerText = gastos; display.style.color = (gastos > limite) ? 'var(--cor-perigo)' : 'var(--cor-sucesso)'; } }

function criarPericiaElement(categoria, dados) { 
    const item = document.createElement('div'); item.className = 'pericia-item'; item.dataset.categoria = categoria; item.dataset.custo = dados.custo || CUSTO_RARIDADE[dados.raridade] || 1; const raridade = dados.raridade || 'Comum'; const raridadeOptions = Object.keys(CUSTO_RARIDADE).map(r => `<option value="${r}" ${r === raridade ? 'selected' : ''}>${r}</option>`).join(''); 
    item.innerHTML = ` <input type="text" class="pericia-nome" value="${dados.nome || 'Nova Perícia'}" placeholder="Nome"> <select class="pericia-raridade" onchange="calcularCustoPericia(this)">${raridadeOptions}</select> <button onclick="removerPericia(this)" class="remover-pericia-btn">X</button> `; 
    item.querySelector('.pericia-nome').addEventListener('input', () => { calcularPericias(); salvarAutomaticamente(); }); item.querySelector('.pericia-raridade').addEventListener('change', () => salvarAutomaticamente()); return item; 
}
function adicionarPericia(cat) { const container = document.getElementById(`pericias-${cat}`); const item = criarPericiaElement(cat, { nome: 'Nova Perícia', raridade: 'Comum' }); container.appendChild(item); calcularCustoPericia(item.querySelector('.pericia-raridade')); salvarAutomaticamente(); }
function removerPericia(btn) { btn.closest('.pericia-item').remove(); calcularPericias(); salvarAutomaticamente(); }

// --- SKILLS ---
function mudarAbaSkills(aba) { currentSkillTab = aba; document.querySelectorAll('.skill-tab-btn').forEach(btn => { if(btn.id === `tab-btn-${aba}`) btn.classList.add('active'); else btn.classList.remove('active'); }); organizarSkillsVisualmente(); }
function mudarSubAba(tipo) { currentSkillType = tipo; document.querySelectorAll('.sub-tab-btn').forEach(btn => { if((tipo === 'A' && btn.innerText === 'Ativas') || (tipo === 'P' && btn.innerText === 'Passivas')) { btn.classList.add('active'); } else { btn.classList.remove('active'); } }); organizarSkillsVisualmente(); }

function organizarSkillsVisualmente() {
    const containerVisualizacao = document.getElementById('container-visualizacao'); 
    const containerStorage = document.getElementById('skills-storage'); 
    const todasSkills = document.querySelectorAll('.skill-item'); 
    const displayCounter = document.getElementById('skill-rarity-counters');
    
    let raridadeCount = {};
    
    todasSkills.forEach(item => { 
        const recurso = item.dataset.recurso; 
        const tipo = item.dataset.tipo; 
        const raridade = item.dataset.raridade || 'Comum'; 
        
        if (recurso === currentSkillTab) {
            if (!raridadeCount[raridade]) raridadeCount[raridade] = 0;
            raridadeCount[raridade]++;
        }

        const pertenceAba = (recurso === currentSkillTab); 
        const pertenceTipo = (tipo === currentSkillType); 
        
        if (pertenceAba && pertenceTipo) { 
            containerVisualizacao.appendChild(item); 
        } else { 
            containerStorage.appendChild(item); 
        } 
    });

    displayCounter.innerHTML = '';
    const raridadesEncontradas = Object.keys(raridadeCount);
    if(raridadesEncontradas.length === 0) {
        displayCounter.innerHTML = '<span style="color:#666;">Nenhuma habilidade neste recurso.</span>';
    } else {
        raridadesEncontradas.forEach(rar => {
            const count = raridadeCount[rar];
            const color = CORES_TEXTO_RARIDADE[rar] || '#333';
            displayCounter.innerHTML += `<span class="rarity-tag" style="background-color:${color}; border:1px solid rgba(0,0,0,0.2);">${rar}: ${count}</span>`;
        });
    }
}

function toggleSkill(btn) { const item = btn.closest('.skill-item'); item.classList.toggle('collapsed'); }

function criarSkillElement(dados) { 
    const item = document.createElement('div'); item.className = 'skill-item'; 
    const raridade = dados.raridade || 'Comum'; const tipo = dados.tipo || currentSkillType; const custoRecurso = dados.custoRecurso || currentSkillTab; 
    item.dataset.recurso = custoRecurso; item.dataset.tipo = tipo; item.dataset.custo = dados.custo || 0; item.dataset.raridade = raridade; 
    const raridadeOptions = Object.keys(CUSTO_BASE_SKILL_ATIVA).map(r => `<option value="${r}" ${r === raridade ? 'selected' : ''}>${r}</option>`).join('');

    item.innerHTML = ` 
        <div class="skill-header-row"> 
            <button class="toggle-skill-btn" onclick="toggleSkill(this)">▼</button>
            <input type="text" class="skill-nome skill-input-text" value="${dados.nome || 'Nova Skill'}" placeholder="Nome" data-tippy-content="${dados.descricao || 'Sem descrição'}" oninput="this.dataset.tippyContent = this.closest('.skill-item').querySelector('.skill-descricao').value; handleSkillChange(this)"> 
            <div class="skill-header-info">
                <span class="header-rarity-display">${raridade}</span>
                <div class="header-cost-display">Custo: <span class="header-cost-val">0.0</span></div>
            </div>
            <button onclick="removerSkill(this)" class="remover-skill-btn">✕</button> 
        </div> 
        <div class="skill-main-content">
            <textarea class="skill-descricao" placeholder="Descrição da habilidade..." oninput="handleSkillChange(this)">${dados.descricao || ''}</textarea>
            <div class="skill-stats-column">
                <select class="skill-raridade-select" onchange="handleSkillChange(this)">${raridadeOptions}</select>
                <div class="skill-costs-row"><div class="mini-cost-box"><label>Custo</label><input type="number" class="skill-custo-input skill-input-num" value="${parseFloat(item.dataset.custo).toFixed(1)}" min="0" readonly></div><div class="mini-cost-box"><label>Max</label><span class="skill-limite-display">0.0</span></div></div><span class="skill-gasto-display" style="display:none;">0.0</span>
            </div>
        </div>
        <div class="skill-modificadores-container"><label>Modificadores:</label><div class="modifier-list"></div><button onclick="adicionarModificador(this)" class="adicionar-mod-btn">+ Efeito</button></div> 
    `;
    const modListContainer = item.querySelector('.modifier-list'); 
    if (dados.modificadores) { dados.modificadores.forEach(modData => { modListContainer.appendChild(criarModificadorEntryHTML({ key: modData.categoria, nome: modData.nome, rep: modData.rep })); }); }
    
    tippy(item.querySelector('.skill-nome'), { theme: 'translucent', animation: 'scale', placement: 'top' }); 
    setTimeout(() => { calcularCustoSkill(item); calcularSkills(); }, 0); return item;
}

function criarModificadorEntryHTML(modEntryData = {}) {
    const defaultCategory = 'Efeitos Imediatos'; const effectsList = getEffectsForCategory(defaultCategory); const modKey = modEntryData.key || defaultCategory; const modNome = modEntryData.nome || effectsList[0]?.nome || ''; const rep = modEntryData.rep || 1;
    const categoryOptions = getAllModifierCategories().map(cat => `<option value="${cat}" ${cat === modKey ? 'selected' : ''}>${cat}</option>`).join('');
    const effects = getEffectsForCategory(modKey); const effectOptions = effects.map(mod => `<option value="${mod.nome}" ${mod.nome === modNome ? 'selected' : ''}>${mod.nome} (${mod.custo})</option>`).join(''); const baseMod = effects.find(m => m.nome === modNome); const baseCost = baseMod ? baseMod.custo : 0;
    
    const entry = document.createElement('div'); entry.className = 'modifier-entry'; 
    entry.dataset.category = modKey; entry.dataset.modName = modNome; entry.dataset.repetitions = rep; entry.dataset.baseCost = baseCost; 
    
    entry.innerHTML = ` <select class="skill-select mod-category-select" onchange="handleModifierCategoryChange(this)">${categoryOptions}</select> <select class="skill-select mod-name-select" onchange="handleModifierChange(this)">${effectOptions}</select> <div class="skill-mod-group"><label>x</label><input type="number" class="skill-input-num mod-repetitions-input" value="${rep}" min="1" oninput="handleModifierChange(this)"></div> <div class="skill-mod-group" style="min-width: 60px;"><label>UPs:</label><span class="skill-input-num mod-total-cost" style="text-align:right;">${(baseCost * rep).toFixed(1)}</span></div> <button onclick="removerModificador(this)" class="remover-modificador-btn">X</button> `; 
    return entry;
}
function handleModifierCategoryChange(select) { const entry = select.closest('.modifier-entry'); const category = select.value; const nameSelect = entry.querySelector('.mod-name-select'); const effects = getEffectsForCategory(category); nameSelect.innerHTML = effects.map(mod => `<option value="${mod.nome}">${mod.nome} (${mod.custo})</option>`).join(''); handleModifierChange(nameSelect); }
function handleModifierChange(element) { const entry = element.closest('.modifier-entry'); const skillItem = entry.closest('.skill-item'); const category = entry.querySelector('.mod-category-select').value; const modName = entry.querySelector('.mod-name-select').value; let rep = parseInt(entry.querySelector('.mod-repetitions-input').value) || 1; const effects = getEffectsForCategory(category); const baseMod = effects.find(m => m.nome === modName); const baseCost = baseMod ? baseMod.custo : 0; entry.dataset.category = category; entry.dataset.modName = modName; entry.dataset.repetitions = rep; entry.dataset.baseCost = baseCost; entry.querySelector('.mod-total-cost').innerText = (baseCost * rep).toFixed(1); calcularCustoSkill(skillItem); calcularSkills(); salvarAutomaticamente(); }
function adicionarModificador(btn) { btn.closest('.skill-modificadores-container').querySelector('.modifier-list').appendChild(criarModificadorEntryHTML({})); calcularCustoSkill(btn.closest('.skill-item')); calcularSkills(); salvarAutomaticamente(); }
function removerModificador(btn) { const item = btn.closest('.skill-item'); btn.closest('.modifier-entry').remove(); calcularCustoSkill(item); calcularSkills(); salvarAutomaticamente(); }

function handleSkillChange(el) { 
    const item = el.closest('.skill-item'); 
    if (el.classList.contains('skill-descricao')) {
        const nomeInput = item.querySelector('.skill-nome'); 
        const novoTexto = el.value || 'Sem descrição'; 
        nomeInput.dataset.tippyContent = novoTexto;
        if (nomeInput._tippy) { nomeInput._tippy.setContent(novoTexto); }
    }
    if (el.classList.contains('skill-raridade-select')) { item.dataset.raridade = el.value; organizarSkillsVisualmente(); calcularCustoSkill(item); } 
    calcularSkills(); salvarAutomaticamente(); 
}
function calcularCustoSkill(item) { 
    const raridade = item.querySelector('.skill-raridade-select').value; const tipo = item.dataset.tipo; 
    let upsOcupados = 0; let upsReais = 0; let bonusLimiteNerfs = 0; 
    item.querySelectorAll('.modifier-entry').forEach(e => { const cat = e.dataset.category; const nome = e.dataset.modName; const baseCost = parseFloat(e.dataset.baseCost) || 0; const reps = parseInt(e.dataset.repetitions) || 1; const totalCostMod = baseCost * reps; if (cat === 'Efeitos Adversos (Nerfs)') { bonusLimiteNerfs += totalCostMod; } else { if (nome === 'Redução de custo') { upsOcupados += (2 * reps); upsReais -= (1 * reps); } else { upsOcupados += totalCostMod; upsReais += totalCostMod; } } }); 
    const base = CUSTO_BASE_SKILL_ATIVA[raridade] || 0; const limit = (tipo === 'P' ? Math.ceil(base / 2) : base) + bonusLimiteNerfs; let finalCost = Math.max(0, upsReais); 
    item.dataset.custo = finalCost.toFixed(1); 
    const dispLimit = item.querySelector('.skill-limite-display'); if(dispLimit) dispLimit.innerText = limit.toFixed(1); 
    const inputCusto = item.querySelector('.skill-custo-input'); inputCusto.value = finalCost.toFixed(1); 
    item.querySelector('.skill-gasto-display').innerText = finalCost.toFixed(1); 
    inputCusto.style.color = (upsOcupados > limit) ? 'red' : 'inherit'; item.querySelector('.skill-gasto-display').style.color = (upsOcupados > limit) ? 'red' : 'var(--cor-sucesso)'; 
    const headerRarity = item.querySelector('.header-rarity-display'); const headerCostVal = item.querySelector('.header-cost-val');
    if (headerRarity) { headerRarity.innerText = raridade; headerRarity.style.color = CORES_TEXTO_RARIDADE[raridade] || '#333'; }
    if (headerCostVal) { headerCostVal.innerText = finalCost.toFixed(1); }
}

function adicionarSkill() { const container = document.getElementById('container-visualizacao'); const novaSkill = criarSkillElement({ custoRecurso: currentSkillTab, tipo: currentSkillType }); container.appendChild(novaSkill); adicionarModificador(novaSkill.querySelector('.adicionar-mod-btn')); salvarAutomaticamente(); }
function removerSkill(btn) { btn.closest('.skill-item').remove(); calcularSkills(); organizarSkillsVisualmente(); salvarAutomaticamente(); } 
function calcularSkills() { let total = 0; document.querySelectorAll('.skill-item').forEach(i => total += parseFloat(i.dataset.custo) || 0); }

// --- OUTROS (CROPPER, INV, DADOS) ---
let currentInvTab = 'equipado'; 

let cropperInstance = null;
function carregarImagemPersonagem(event) { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => { const modal = document.getElementById('cropper-modal'); const imageElement = document.getElementById('image-to-crop'); imageElement.src = e.target.result; modal.style.display = 'flex'; if (cropperInstance) cropperInstance.destroy(); cropperInstance = new Cropper(imageElement, { aspectRatio: 1, viewMode: 1, autoCropArea: 1, dragMode: 'move', guides: false, center: true, highlight: false, background: false }); }; reader.readAsDataURL(file); } }
function confirmarRecorte() { if (cropperInstance) { const canvas = cropperInstance.getCroppedCanvas({ width: 300, height: 300 }); document.getElementById('char-image-display').src = canvas.toDataURL(); cancelarRecorte(); salvarAutomaticamente(); } }
function cancelarRecorte() { const modal = document.getElementById('cropper-modal'); modal.style.display = 'none'; if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null; } document.getElementById('char-image-upload').value = ''; }

// --- LÓGICA DO INVENTÁRIO (COM MODAL E IMAGENS) ---

let tempItemImage = null; // Variável temporária para imagem no modal

function mudarAbaInventario(aba) {
    currentInvTab = aba;
    document.querySelectorAll('.inv-tab-btn').forEach(btn => {
        if (btn.id === `tab-inv-${aba}`) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    const itens = document.querySelectorAll('.inv-item');
    itens.forEach(item => {
        const categoriaItem = item.dataset.categoria;
        const isEquipado = item.querySelector('.inv-equip-check').checked;
        if (aba === 'equipado') { item.style.display = isEquipado ? 'block' : 'none'; } 
        else { item.style.display = (categoriaItem === aba) ? 'block' : 'none'; }
    });
}

function abrirModalItem() {
    document.getElementById('modal-inv-nome').value = '';
    document.getElementById('modal-inv-qtd').value = 1;
    document.getElementById('modal-inv-desc').value = '';
    document.getElementById('modal-inv-categoria').value = 'arma'; // Padrão
    // Reset da imagem
    document.getElementById('modal-img-preview').src = '';
    document.getElementById('modal-img-preview-box').style.display = 'none';
    document.getElementById('modal-img-upload').value = '';
    tempItemImage = null;
    
    handleModalCategoryChange();
    document.getElementById('item-modal').style.display = 'flex';
}

function handleModalCategoryChange() {
    const categoria = document.getElementById('modal-inv-categoria').value;
    const container = document.getElementById('modal-inv-extra-container');
    let html = '';
    if (categoria === 'arma') html = `<label>Dano:</label><input type="text" id="modal-inv-dano" placeholder="Ex: 1d8" style="width:100%;">`;
    else if (categoria === 'armadura') html = `<label>Defesa:</label><input type="number" id="modal-inv-defesa" placeholder="Ex: 2" style="width:100%;">`;
    else if (categoria === 'consumivel') html = `<span style="font-size:0.8rem;color:#666;">Será criado com contador +/-</span>`;
    // Acessorio não tem campo extra obrigatório
    container.innerHTML = html;
}

// Preview da imagem no Modal (Compactação simples)
function previewItemImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Redimensionar para economizar storage (Canvas)
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                // Limite máximo de 100px para thumbnails de item
                const MAX_SIZE = 100; 
                let width = img.width; let height = img.height;
                if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
                else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                canvas.width = width; canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                tempItemImage = canvas.toDataURL('image/jpeg', 0.7); // Salva compactado
                document.getElementById('modal-img-preview').src = tempItemImage;
                document.getElementById('modal-img-preview-box').style.display = 'flex';
            }
        };
        reader.readAsDataURL(file);
    }
}

function adicionarItemInventario() { 
    const categoria = document.getElementById('modal-inv-categoria').value; 
    const raridade = document.getElementById('modal-inv-raridade').value; 
    const nome = document.getElementById('modal-inv-nome').value.trim(); 
    const qtd = parseInt(document.getElementById('modal-inv-qtd').value) || 1; 
    const desc = document.getElementById('modal-inv-desc').value; 
    
    if (!nome) { alert("Nome é obrigatório!"); return; } 
    
    let extraVal = ''; 
    if (categoria === 'arma') extraVal = document.getElementById('modal-inv-dano') ? document.getElementById('modal-inv-dano').value : ''; 
    else if (categoria === 'armadura') extraVal = document.getElementById('modal-inv-defesa') ? document.getElementById('modal-inv-defesa').value : ''; 

    const container = document.getElementById('inventario-container');
    const itensExistentes = Array.from(container.querySelectorAll('.inv-item')); 
    const itemDuplicado = itensExistentes.find(item => item.dataset.nome.toLowerCase() === nome.toLowerCase() && item.dataset.raridade === raridade); 
    
    if (itemDuplicado) { 
        alterarQtdInventario(itemDuplicado, qtd); 
    } else {
        criarElementoItem(container, { categoria, raridade, nome, qtd, desc, extra: extraVal, equipado: false, imagem: tempItemImage });
        mudarAbaInventario(currentInvTab);
    } 
    
    document.getElementById('item-modal').style.display = 'none';
    salvarAutomaticamente(); 
    atualizarSelectsEquipamento(); 
}

function criarElementoItem(container, dados) { 
    const div = document.createElement('div'); 
    div.className = 'inv-item'; 
    div.dataset.categoria = dados.categoria; 
    div.dataset.raridade = dados.raridade; 
    div.dataset.nome = dados.nome; 
    div.dataset.qtd = dados.qtd; 
    div.dataset.desc = dados.desc; 
    div.dataset.extra = dados.extra; 
    div.dataset.imagem = dados.imagem || ''; // Salva a string base64
    
    const isEquipped = dados.equipado === true || dados.equipado === "true"; 
    
    let displayExtra = ''; 
    if(dados.categoria === 'arma') displayExtra = ` | Dano: ${dados.extra}`; 
    if(dados.categoria === 'armadura') displayExtra = ` | Defesa: ${dados.extra}`; 
    
    const colorRaridade = CORES_TEXTO_RARIDADE[dados.raridade] || '#333'; 

    // HTML da Imagem
    let imgHtml = '';
    if(dados.imagem) {
        imgHtml = `<img src="${dados.imagem}" class="inv-item-img">`;
    } else {
        imgHtml = `<div class="inv-item-img" style="display:flex;align-items:center;justify-content:center;color:#555;font-size:0.7rem;">S/ IMG</div>`;
    }

    div.innerHTML = ` 
        <div class="inv-header-row">
            <div class="inv-header-content">
                ${imgHtml}
                <div style="flex-grow:1;"> 
                    <div style="display:flex; justify-content:space-between;">
                         <input type="checkbox" class="inv-equip-check" ${isEquipped ? 'checked' : ''} title="Equipar" onchange="salvarAutomaticamente(); mudarAbaInventario(currentInvTab); atualizarSelectsEquipamento();"> 
                         <div class="inv-contador-group"> 
                            <button onclick="alterarQtdInventario(this.closest('.inv-item'), -1)" class="mod-btn compact-btn">-</button> 
                            <span class="inv-qtd-display" style="min-width: 25px; text-align: center; font-weight:bold;">x${dados.qtd}</span> 
                            <button onclick="alterarQtdInventario(this.closest('.inv-item'), 1)" class="mod-btn compact-btn">+</button> 
                        </div> 
                    </div>
                    <div style="display:flex; gap:5px; align-items:center; flex-wrap:wrap; margin-top:2px;"> 
                        <span class="inv-nome-display" data-tippy-content="${dados.desc || 'Sem descrição'}">${dados.nome}</span> 
                        <span class="inv-raridade-display" style="background-color:${colorRaridade};">${dados.raridade}</span> 
                    </div> 
                    <div class="inv-stats-row">${dados.categoria.toUpperCase()}${displayExtra}</div> 
                </div> 
            </div>
        </div> 
        <div class="inv-desc-display">${dados.desc}</div> 
        <div style="display: flex; justify-content: flex-end; margin-top: 5px;"> 
            <button onclick="if(confirm('Deletar este item?')) { this.closest('.inv-item').remove(); salvarAutomaticamente(); atualizarSelectsEquipamento(); }" class="mod-btn" style="font-size: 0.7rem; border-color: var(--cor-perigo); color: var(--cor-perigo);">Remover</button> 
        </div> 
    `; 
    container.appendChild(div); 
    if(window.tippy) tippy(div.querySelector('.inv-nome-display'), { theme: 'translucent', animation: 'scale' });
    return div;
}

function alterarQtdInventario(itemDiv, valor) { 
    let qtdAtual = parseInt(itemDiv.dataset.qtd) || 0; 
    qtdAtual += valor; 
    if (qtdAtual <= 0) { 
        if(confirm("Quantidade zerada. Remover item?")) { 
            itemDiv.remove(); 
            salvarAutomaticamente(); 
            atualizarSelectsEquipamento();
            return; 
        } else { qtdAtual = 0; } 
    } 
    itemDiv.dataset.qtd = qtdAtual; 
    itemDiv.querySelector('.inv-qtd-display').innerText = `x${qtdAtual}`; 
    salvarAutomaticamente(); 
}

// --- LÓGICA DE EXCLUSÃO NOS SELECTS DE EQUIPAMENTO ---
function atualizarSelectsEquipamento() {
    const selects = document.querySelectorAll('.equip-select');
    const itens = document.querySelectorAll('.inv-item');
    
    // 1. Pegar valores selecionados ATUALMENTE para não perder a seleção
    const selecoesAtuais = {};
    selects.forEach(sel => selecoesAtuais[sel.dataset.id] = sel.value);

    // 2. Limpar todos os selects (deixando apenas a opção padrão)
    selects.forEach(sel => {
        sel.innerHTML = '<option value="">(Nenhum)</option>';
    });

    // 3. Repopular selects
    itens.forEach(item => {
        const nome = item.dataset.nome;
        const cat = item.dataset.categoria;
        
        // Verifica se este item JÁ está selecionado em OUTRO select (que não seja o que estamos preenchendo agora)
        // Se estiver, não adicionamos como opção, a menos que tenhamos QTD > 1 (mas simplificaremos: nome único, seleção única)
        
        selects.forEach(sel => {
            const selId = sel.dataset.id;
            const selTipo = sel.dataset.tipo;

            // Filtra por tipo (Arma vai em Arma, Armadura em Armadura...)
            // Acessório agora pega 'acessorio'
            const tipoCompativel = (selTipo === cat) || (selTipo === 'arma' && cat === 'arma') || (selTipo === 'acessorio' && cat === 'acessorio');
            
            if (tipoCompativel) {
                // Checa se já está em uso em OUTRO campo
                let emUsoOutro = false;
                for (const [key, value] of Object.entries(selecoesAtuais)) {
                    if (key !== selId && value === nome && value !== "") {
                        emUsoOutro = true; // Está equipado em outro slot
                    }
                }

                if (!emUsoOutro) {
                    const option = document.createElement('option');
                    option.value = nome;
                    option.innerText = nome;
                    sel.appendChild(option);
                }
            }
        });
    });

    // 4. Restaurar valor selecionado (se ainda for válido/disponível)
    selects.forEach(sel => {
        const valAntigo = selecoesAtuais[sel.dataset.id];
        // Verifica se a opção ainda existe no select repopulado
        const optionExists = Array.from(sel.options).some(op => op.value === valAntigo);
        if (optionExists) {
            sel.value = valAntigo;
        } else if (valAntigo !== "") {
            // Se o item sumiu (foi deletado ou movido), reseta
            sel.value = "";
        }
        
        // Adiciona listener para Tooltip/Descrição no Hover
        sel.addEventListener('mouseover', () => atualizarDescricaoEquip(sel));
        sel.addEventListener('change', () => atualizarDescricaoEquip(sel));
    });
    
    // Atualiza descrição inicial
    selects.forEach(sel => atualizarDescricaoEquip(sel));
}

function atualizarDescricaoEquip(selectElement) {
    const nomeItem = selectElement.value;
    const display = document.getElementById('equip-desc-display');
    
    if (!nomeItem) {
        display.innerText = "Nenhum item selecionado.";
        return;
    }

    // Busca item no DOM do inventário
    const item = Array.from(document.querySelectorAll('.inv-item')).find(i => i.dataset.nome === nomeItem);
    if (item) {
        const desc = item.dataset.desc || "Sem descrição.";
        const extra = item.dataset.extra ? ` (${item.dataset.extra})` : "";
        display.innerText = `${nomeItem}${extra}: ${desc}`;
    }
}

// --- FUNÇÃO SAVE (ATUALIZADA) ---
function gerarObjetoFicha() {
    const dados = {
        nome: document.getElementById('nome-personagem-input').value,
        cabecalho: {
            talento: document.getElementById('cabecalho-talento').value,
            ascensao: document.getElementById('cabecalho-ascensao').value,
            racial: document.getElementById('cabecalho-racial').value,
            info: document.getElementById('cabecalho-info').value
        },
        imagem: document.getElementById('char-image-display').src, 
        titulosPericias: {
            principal: document.getElementById('titulo-principal') ? document.getElementById('titulo-principal').value : "Perícias Principais",
            secundaria: document.getElementById('titulo-secundaria') ? document.getElementById('titulo-secundaria').value : "Perícias Secundárias",
            terciaria: document.getElementById('titulo-terciaria') ? document.getElementById('titulo-terciaria').value : "Perícias Terciárias"
        },
        recursosAtuais: window.recursosAtuais,
        atributos: {}, batalha: {}, pericias: { principal: [], secundaria: [], terciaria: [] }, skills: [], inventario: [] 
    };
    
    document.querySelectorAll('.atributo-row').forEach(row => { 
        dados.atributos[row.dataset.nome] = { valor: parseInt(row.querySelector('.atributo-input').value) || 0, uso: parseInt(row.querySelector('.treino-contador').innerText) || 0 }; 
    });
    
    document.querySelectorAll('.batalha-input').forEach(input => { dados.batalha[input.dataset.id] = input.value; });
    
    ['principal', 'secundaria', 'terciaria'].forEach(cat => { 
        document.getElementById(`pericias-${cat}`).querySelectorAll('.pericia-item').forEach(item => { 
            dados.pericias[cat].push({ nome: item.querySelector('.pericia-nome').value, raridade: item.querySelector('.pericia-raridade').value, custo: item.dataset.custo }); 
        }); 
    });
    
    document.querySelectorAll('.skill-item').forEach(item => { 
        const mods = []; 
        item.querySelectorAll('.modifier-entry').forEach(entry => { 
            mods.push({ categoria: entry.dataset.category, nome: entry.dataset.modName, rep: parseInt(entry.dataset.repetitions), baseCost: parseFloat(entry.dataset.baseCost) }); 
        }); 
        dados.skills.push({ nome: item.querySelector('.skill-nome').value, raridade: item.querySelector('.skill-raridade-select').value, tipo: item.dataset.tipo, custoRecurso: item.dataset.recurso, descricao: item.querySelector('.skill-descricao').value, modificadores: mods }); 
    });
    
    document.querySelectorAll('.inv-item').forEach(item => { 
        const checkbox = item.querySelector('.inv-equip-check'); 
        dados.inventario.push({ 
            categoria: item.dataset.categoria, 
            raridade: item.dataset.raridade, 
            nome: item.dataset.nome, 
            qtd: item.dataset.qtd, 
            desc: item.dataset.desc, 
            extra: item.dataset.extra, 
            imagem: item.dataset.imagem, // Nova propriedade
            equipado: checkbox ? checkbox.checked : false 
        }); 
    });
    
    return dados;
}

function aplicarDadosNaTela(dados) {
    if(dados.nome) document.getElementById('nome-personagem-input').value = dados.nome;
    if(dados.imagem) document.getElementById('char-image-display').src = dados.imagem;
    
    if(dados.titulosPericias) { if(document.getElementById('titulo-principal')) document.getElementById('titulo-principal').value = dados.titulosPericias.principal || "Perícias Principais"; if(document.getElementById('titulo-secundaria')) document.getElementById('titulo-secundaria').value = dados.titulosPericias.secundaria || "Perícias Secundárias"; if(document.getElementById('titulo-terciaria')) document.getElementById('titulo-terciaria').value = dados.titulosPericias.terciaria || "Perícias Terciárias"; }
    if(dados.cabecalho) { if(document.getElementById('cabecalho-talento')) document.getElementById('cabecalho-talento').value = dados.cabecalho.talento || ""; if(document.getElementById('cabecalho-ascensao')) document.getElementById('cabecalho-ascensao').value = dados.cabecalho.ascensao || ""; if(document.getElementById('cabecalho-racial')) document.getElementById('cabecalho-racial').value = dados.cabecalho.racial || ""; if(document.getElementById('cabecalho-info')) document.getElementById('cabecalho-info').value = dados.cabecalho.info || ""; document.querySelectorAll('.auto-resize').forEach(el => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }); }
    if (dados.recursosAtuais) { window.recursosAtuais = dados.recursosAtuais; } else { window.recursosAtuais = null; }
    if (dados.atributos) { document.querySelectorAll('.atributo-row').forEach(row => { const nomeAttr = row.dataset.nome; if (dados.atributos[nomeAttr]) { let valor = typeof dados.atributos[nomeAttr] === 'object' ? dados.atributos[nomeAttr].valor : dados.atributos[nomeAttr]; let uso = typeof dados.atributos[nomeAttr] === 'object' ? dados.atributos[nomeAttr].uso : 0; row.querySelector('.atributo-input').value = valor; row.querySelector('.treino-contador').innerText = uso; } }); }
    
    ['principal', 'secundaria', 'terciaria'].forEach(cat => { const container = document.getElementById(`pericias-${cat}`); container.innerHTML = ''; if(dados.pericias && dados.pericias[cat]) dados.pericias[cat].forEach(p => { const novo = criarPericiaElement(cat, p); container.appendChild(novo); calcularCustoPericia(novo.querySelector('.pericia-raridade')); }); });
    
    // Skills
    document.getElementById('container-visualizacao').innerHTML = ''; 
    document.getElementById('skills-storage').innerHTML = ''; 
    const storage = document.getElementById('skills-storage'); 
    if(dados.skills) dados.skills.forEach(s => storage.appendChild(criarSkillElement(s))); 
    organizarSkillsVisualmente();
    
    // Inventário
    const invContainer = document.getElementById('inventario-container'); 
    invContainer.innerHTML = ''; 
    if(dados.inventario) {
        dados.inventario.forEach(item => criarElementoItem(invContainer, item));
    }
    
    // IMPORTANTE: Atualiza selects APÓS criar itens
    atualizarSelectsEquipamento();

    // Aplica valores de batalha (inputs e selects)
    if (dados.batalha) { 
        document.querySelectorAll('.batalha-input').forEach(input => { 
            if(dados.batalha[input.dataset.id]) input.value = dados.batalha[input.dataset.id]; 
        }); 
    }

    mudarAbaInventario('equipado');
    atualizarSistemaCompleto();
}

function baixarFicha() { const dados = gerarObjetoFicha(); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" })); a.download = (dados.nome || "Ficha") + ".json"; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
function carregarFicha(event) { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(e) { try { const dados = JSON.parse(e.target.result); aplicarDadosNaTela(dados); salvarAutomaticamente(); alert("Ficha carregada com sucesso!"); } catch (err) { console.error(err); alert("Erro ao ler o arquivo JSON: " + err.message); } }; reader.readAsText(file); }
function rolarD20() { const resultado = Math.floor(Math.random() * 20) + 1; let msg = ""; if (resultado === 20) msg = " (CRÍTICO!)"; else if (resultado === 1) msg = " (FALHA!)"; alert(`🎲 Resultado D20: ${resultado}${msg}`); }

// --- FIREBASE ---
const firebaseConfig = { apiKey: "AIzaSyB4tfFp463ZwSHTW22uiyV35GwdlCEgk8k", authDomain: "ficha-rpg-3112e.firebaseapp.com", projectId: "ficha-rpg-3112e", storageBucket: "ficha-rpg-3112e.firebasestorage.app", messagingSenderId: "1009323913618", appId: "1:1009323913618:web:202ed84838549bf990514b" };
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); const db = firebase.firestore(); let usuarioAtual = null;

auth.onAuthStateChanged((user) => { 
    if (user) { 
        usuarioAtual = user; 
        document.getElementById('login-modal').style.display = 'none'; 
    } else { 
        usuarioAtual = null; 
        document.getElementById('login-modal').style.display = 'flex'; 
    } 
});

window.addEventListener('DOMContentLoaded', () => {
    carregarDadosAutomaticos();
    document.querySelectorAll('input, textarea, select').forEach(el => { el.addEventListener('input', salvarAutomaticamente); el.addEventListener('change', salvarAutomaticamente); });
    document.querySelectorAll('.auto-resize').forEach(textarea => { textarea.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px'; }); });
    organizarSkillsVisualmente(); atualizarSistemaCompleto();
});

function fazerLogin() { const email = document.getElementById('email-input').value.trim(); const pass = document.getElementById('senha-input').value.trim(); const msg = document.getElementById('msg-erro'); if (!email || !pass) { msg.innerText = "Por favor, preencha E-mail e Senha."; return; } auth.signInWithEmailAndPassword(email, pass).catch((error) => { msg.innerText = "Erro no login: " + error.code; }); }
function criarConta() { const email = document.getElementById('email-input').value.trim(); const pass = document.getElementById('senha-input').value.trim(); const msg = document.getElementById('msg-erro'); if (!email || !pass) { msg.innerText = "Preencha E-mail e Senha."; return; } auth.createUserWithEmailAndPassword(email, pass).catch((error) => { msg.innerText = "Erro ao criar: " + error.code; }); }
function fazerLogout() { auth.signOut(); }
function abrirModalLogin() { document.getElementById('login-modal').style.display = 'flex'; }
function abrirModalNuvem() { if (!usuarioAtual) { alert("Você precisa estar logado!"); return; } document.getElementById('nuvem-modal').style.display = 'flex'; listarFichasNuvem(); }
function fecharModalNuvem() { document.getElementById('nuvem-modal').style.display = 'none'; }
function salvarNovaFichaNuvem() { if (!usuarioAtual) return; const dadosFicha = gerarObjetoFicha(); db.collection("fichas").add({ uid_dono: usuarioAtual.uid, nome_personagem: dadosFicha.nome || "Sem Nome", dados: JSON.stringify(dadosFicha), data_atualizacao: firebase.firestore.FieldValue.serverTimestamp() }).then(() => { alert("Salvo na nuvem!"); listarFichasNuvem(); }).catch((error) => { alert("Erro ao salvar."); }); }
function listarFichasNuvem() { const listaDiv = document.getElementById('lista-fichas-nuvem'); listaDiv.innerHTML = "Carregando..."; db.collection("fichas").where("uid_dono", "==", usuarioAtual.uid).orderBy("data_atualizacao", "desc").get().then((querySnapshot) => { listaDiv.innerHTML = ""; if (querySnapshot.empty) { listaDiv.innerHTML = "<p>Nenhuma ficha salva.</p>"; return; } querySnapshot.forEach((doc) => { const ficha = doc.data(); const idDoc = doc.id; let dataStr = ""; if (ficha.data_atualizacao && ficha.data_atualizacao.toDate) { const date = ficha.data_atualizacao.toDate(); dataStr = date.toLocaleString('pt-BR'); } const item = document.createElement('div'); item.style.borderBottom = "1px solid #444"; item.style.padding = "10px"; item.style.display = "flex"; item.style.justifyContent = "space-between"; item.style.alignItems = "center"; item.innerHTML = ` <div><strong style="color: var(--cor-destaque); display:block;">${ficha.nome_personagem}</strong><span style="font-size: 0.75rem; color: #666; font-style: italic;">📅 ${dataStr}</span></div> <div> <button class="mod-btn compact-btn" onclick="carregarDaNuvem('${idDoc}')" style="border-color: var(--cor-sucesso);">Abrir</button> <button class="mod-btn compact-btn" onclick="deletarDaNuvem('${idDoc}')" style="border-color: var(--cor-perigo);">X</button> </div> `; listaDiv.appendChild(item); }); }).catch((error) => { console.error(error); db.collection("fichas").where("uid_dono", "==", usuarioAtual.uid).get().then((querySnapshot) => { listaDiv.innerHTML = ""; querySnapshot.forEach((doc) => { const ficha = doc.data(); const idDoc = doc.id; let dataStr = "Sem data"; if (ficha.data_atualizacao && ficha.data_atualizacao.toDate) { dataStr = ficha.data_atualizacao.toDate().toLocaleString('pt-BR'); } const item = document.createElement('div'); item.style.borderBottom = "1px solid #444"; item.style.padding = "10px"; item.style.display = "flex"; item.style.justifyContent = "space-between"; item.style.alignItems = "center"; item.innerHTML = ` <div><strong style="color: var(--cor-destaque); display:block;">${ficha.nome_personagem}</strong><span style="font-size: 0.75rem; color: #666; font-style: italic;">📅 ${dataStr}</span></div> <div> <button class="mod-btn compact-btn" onclick="carregarDaNuvem('${idDoc}')" style="border-color: var(--cor-sucesso);">Abrir</button> <button class="mod-btn compact-btn" onclick="deletarDaNuvem('${idDoc}')" style="border-color: var(--cor-perigo);">X</button> </div> `; listaDiv.appendChild(item); }); }); }); }
function carregarDaNuvem(idDoc) { db.collection("fichas").doc(idDoc).get().then((doc) => { if (doc.exists) { aplicarDadosNaTela(JSON.parse(doc.data().dados)); salvarAutomaticamente(); fecharModalNuvem(); alert("Personagem carregado!"); } }); }
function deletarDaNuvem(idDoc) { if(confirm("Apagar ficha da nuvem?")) { db.collection("fichas").doc(idDoc).delete().then(() => listarFichasNuvem()); } }
function atualizarGrafico() { const ctx = document.getElementById('graficoAtributos'); if (!ctx) return; const dados = [ getAttrValue("Forca"), getAttrValue("Destreza"), getAttrValue("Agilidade"), getAttrValue("Resistencia"), getAttrValue("Espírito"), getAttrValue("Carisma"), getAttrValue("Inteligencia") ]; if (graficoInstance) { graficoInstance.data.datasets[0].data = dados; graficoInstance.update(); return; } graficoInstance = new Chart(ctx, { type: 'radar', data: { labels: ['FOR', 'DES', 'AGI', 'RES', 'ESP', 'CAR', 'INT'], datasets: [{ label: 'Nível', data: dados, backgroundColor: 'rgba(139, 0, 0, 0.4)', borderColor: '#8B0000', borderWidth: 2, pointBackgroundColor: '#B8860B', pointBorderColor: '#2E2315' }] }, options: { scales: { r: { angleLines: { color: 'rgba(0,0,0,0.2)' }, grid: { color: 'rgba(0,0,0,0.1)' }, pointLabels: { color: '#5c0a0a', font: { size: 12, family: 'Cinzel' } }, ticks: { display: false }, suggestedMin: 0, suggestedMax: 10 } }, plugins: { legend: { display: false } } } }); }
function gerarPDF() { const elemento = document.querySelector(".container"); const opt = { margin: [5, 5, 5, 5], filename: 'Grimorio.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, backgroundColor: '#e3dcd2', useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }; html2pdf().set(opt).from(elemento).save(); }

// --- FUNÇÃO DE GERAÇÃO DE IMAGEM IA (MODELO NANOBANANA-PRO) ---

async function gerarImagemIA() {
    const nome = document.getElementById('modal-inv-nome').value;
    const desc = document.getElementById('modal-inv-desc').value;
    const tipo = document.getElementById('modal-inv-categoria').value;
    const btn = document.getElementById('btn-gerar-ia');

    if (!nome) {
        alert("Digite o Nome do item primeiro!");
        return;
    }

    const textoOriginal = btn.innerText;
    btn.innerText = "⏳ Criando...";
    btn.disabled = true;

    // 1. Monta o Prompt
    const promptBase = `RPG item icon, ${tipo}, ${nome}, ${desc}, white background, fantasy art style, high quality, 2d game asset, no text, centered`;
    const promptEncoded = encodeURIComponent(promptBase);
    const seed = Math.floor(Math.random() * 99999);
    
    // 2. URL COM NANOBANANA-PRO (Modelo Avançado)
    const url = `https://image.pollinations.ai/prompt/${promptEncoded}?width=256&height=256&seed=${seed}&model=nanobanana-pro&nologo=true`;

    try {
        // Tentativa 1: Baixar (Salvar Offline)
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erro na API");

        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onloadend = function() {
            tempItemImage = reader.result; 
            mostrarPreview(tempItemImage);
            finalizarBotao(btn, textoOriginal);
        }
        reader.readAsDataURL(blob);

    } catch (error) {
        console.warn("Erro ao baixar (CORS) ou Modelo Premium. Usando link direto.", error);
        
        // Tentativa 2: Link Direto
        tempItemImage = url; 
        mostrarPreview(url);
        finalizarBotao(btn, textoOriginal);
        
        avisarLinkOnline();
    }
}

function mostrarPreview(src) {
    const imgPreview = document.getElementById('modal-img-preview');
    const boxPreview = document.getElementById('modal-img-preview-box');
    imgPreview.src = src;
    boxPreview.style.display = 'flex';
}

function finalizarBotao(btn, texto) {
    btn.innerText = texto;
    btn.disabled = false;
}

function avisarLinkOnline() {
    const box = document.getElementById('modal-img-preview-box');
    if(!document.getElementById('aviso-link')) {
        const msg = document.createElement('div');
        msg.id = 'aviso-link';
        msg.innerText = "⚠️ Imagem via Link (Online)";
        msg.style.color = "orange";
        msg.style.fontSize = "0.7rem";
        box.appendChild(msg);
    }
}