/* ================================================================================
   SCRIPT.JS - VERSÃO CORRIGIDA (CÁLCULO DE STATUS BLINDADO)
   ================================================================================ */

// --- VARIÁVEIS GLOBAIS ---
window.recursosAtuais = null; 
window.regra = {};             
let docIdAtual = null; 

const PONTOS_POR_NIVEL_FLOAT = 70; 
let currentSkillTab = 'ST'; 
let currentSkillType = 'A'; 
const STORAGE_KEY = 'ficha_rpg_medieval_auto_save';
let graficoInstance = null;

// Slots (Inicial)
let slotAssignments = {
    'slot-arma1': '', 'slot-arma2': '', 'slot-armadura': '', 'slot-acessorio': '',
    'slot-magico1': '', 'slot-magico2': '', 'slot-magico3': '', 'slot-magico4': '', 'slot-magico5': '',
    'slot-cons1': '', 'slot-cons2': '', 'slot-cons3': ''
};
let itemParaUploadImagem = null; 
let slotAtualParaSelecao = null;
let tempItemImage = null; 

// --- MAPA DE STATUS AUTOMÁTICOS (Status -> Atributo Base) ---
const MAPA_STATUS_ATRIBUTO = {
    // FÍSICO
    'precisão': 'Destreza', 'precisao': 'Destreza',
    'dano físico': 'Forca', 'dano fisico': 'Forca',
    'defesa física': 'Resistencia', 'defesa fisica': 'Resistencia',
    'aparo': 'Destreza',
    'iniciativa': 'Agilidade',
    'esquiva': 'Agilidade',

    // MÁGICO
    'acerto mágico': 'Espírito', 'acerto magico': 'Espírito',
    'dano mágico': 'Espírito', 'dano magico': 'Espírito',
    'defesa mágica': 'Espírito', 'defesa magica': 'Espírito',

    // PSÍQUICO
    'acerto psíquico': 'Inteligencia', 'acerto psiquico': 'Inteligencia',
    'dano psíquico': 'Inteligencia', 'dano psiquico': 'Inteligencia',
    'defesa psíquica': 'Inteligencia', 'defesa psiquica': 'Inteligencia',
    'percepção': 'Inteligencia', 'percepcao': 'Inteligencia',
    'vontade': 'Espírito',
    'influência': 'Carisma', 'influencia': 'Carisma',

    // ESPECIAIS (Sem atributo base, apenas mods)
    'deslocamento': null,
    'área crítica': null, 'area critica': null, 'critico aprimorado': null,
    'resistir magia': null,
    'defesa real': null
};

// --- CORES & LISTAS ---
const CORES_TEXTO_RARIDADE = { 
    'Comum': '#555555', 'Incomum': '#2e8b57', 'Raro': '#00008b', 
    'Raríssima': '#800080', 'Rarissima': '#800080', 
    'Épico': '#b8860b', 'Epico': '#b8860b', 
    'Lendário': '#8b0000', 'Lendario': '#8b0000', 
    'Mítico': '#008080', 'Mitico': '#008080' 
};

const CUSTO_RARIDADE = { 'Comum': 1, 'Incomum': 3, 'Raro': 6, 'Épico': 14, 'Lendário': 18, 'Mítico': 22 };
const CUSTO_BASE_SKILL_ATIVA = { 'Comum': 10, 'Incomum': 15, 'Raro': 20, 'Rarissima': 25, 'Epico': 30, 'Lendario': 35, 'Mitico': 40 };

// LISTA DE MODIFICADORES
const SKILL_MODIFIERS = {
    'Bônus de Status (Stats)': [
        { nome: 'Precisão', custo: 1 }, { nome: 'Dano Físico', custo: 1 }, { nome: 'Defesa Física', custo: 1 },
        { nome: 'Acerto Mágico', custo: 1 }, { nome: 'Dano Mágico', custo: 1 }, { nome: 'Defesa Mágica', custo: 1 },
        { nome: 'Acerto Psíquico', custo: 1 }, { nome: 'Dano Psíquico', custo: 1 }, { nome: 'Defesa Psíquica', custo: 1 },
        { nome: 'Iniciativa', custo: 1 }, { nome: 'Deslocamento', custo: 3 }, { nome: 'Esquiva', custo: 1 },
        { nome: 'Aparo', custo: 1 }, { nome: 'Área Crítica (Crítico Aprimorado)', custo: 5 },
        { nome: 'Resistir Mágia', custo: 1 }, { nome: 'Defesa real', custo: 1 },
    ],
    'Alcances Básicos': [ { nome: 'Toque', custo: 0 }, { nome: 'Projétil', custo: 0.5 }, { nome: 'Feitiço', custo: 1 }, { nome: 'Raio', custo: 3 }, { nome: 'Cone', custo: 1 } ],
    'Modificadores Gerais': [ { nome: 'Ataques Extras', custo: 7 }, { nome: 'Efeito Sustentado', custo: 0 }, { nome: 'Redução de custo', custo: 2 } ],
    'Efeitos Imediatos': [ { nome: 'Dano (Genérico)', custo: 1 }, { nome: 'Saque Rápido', custo: 2 }, { nome: 'Avançar', custo: 2 }, { nome: 'Investida', custo: 1 }, { nome: 'Teleporte', custo: 3 }, { nome: 'Empurrar', custo: 2 }, { nome: 'Puxar', custo: 2 }, { nome: 'Manobrar', custo: 3 }, { nome: 'Decoy', custo: 1 }, { nome: 'Nexus', custo: 5 }, { nome: 'Terminus', custo: 5 }, { nome: 'Panaceia', custo: 3 }, { nome: 'Ilusão Visual', custo: 1 }, { nome: 'Ilusão Auditiva', custo: 1 }, { nome: 'Ilusão Olfativa', custo: 1 }, { nome: 'Ilusão Tátil', custo: 1 }, { nome: 'Desarmar', custo: 3 }, { nome: 'Derrubar', custo: 3 }, { nome: 'Brutalidade', custo: 5 }, { nome: 'Absorver Marcas', custo: 3 } ],
    'Buff/Debuff': [ { nome: 'Proteção', custo: 1 }, { nome: 'Dano (Buff)', custo: 1 }, { nome: 'Duração de Buff/Debuff', custo: 3 }, { nome: 'Raridade de Arma', custo: 5 }, { nome: 'Raridade de Armadura', custo: 5 }, { nome: 'Sobrevida', custo: 0.5 }, { nome: 'Duração', custo: 1 } ],
    'Status Positivos': [ { nome: 'Arma Encantada', custo: 3 }, { nome: 'Aparo Desarmado', custo: 3 }, { nome: 'Aparo Aprimorado', custo: 3 }, { nome: 'Desengajar', custo: 3 }, { nome: 'Esmaecer', custo: 3 }, { nome: 'Regeneração I', custo: 3 }, { nome: 'Liberdade', custo: 3 }, { nome: 'Triagem', custo: 3 }, { nome: 'Força do Gigante', custo: 3 }, { nome: 'Reflexo Felino', custo: 3 }, { nome: 'Olho de Águia', custo: 3 }, { nome: 'Couro de Elefante', custo: 3 }, { nome: 'Aura do Unicórnio', custo: 3 }, { nome: 'Astúcia da Raposa', custo: 3 }, { nome: 'Persuasão Feérica', custo: 3 }, { nome: 'Refletir Dano I', custo: 3 }, { nome: 'Aparo Místico', custo: 5 }, { nome: 'Defletir', custo: 5 }, { nome: 'Contra-ataque', custo: 5 }, { nome: 'Adrenalina', custo: 5 }, { nome: 'Erudição', custo: 5 }, { nome: 'Foco', custo: 5 }, { nome: 'Regeneração II', custo: 5 }, { nome: 'Assepsia', custo: 5 }, { nome: 'Autonomia', custo: 5 }, { nome: 'Solidez', custo: 5 }, { nome: 'Refletir Dano II', custo: 5 }, { nome: 'Invisibilidade', custo: 7 }, { nome: 'Regeneração III', custo: 7 }, { nome: 'Prevenção', custo: 7 }, { nome: 'Refletir Dano III', custo: 10 } ],
    'Barreiras': [ { nome: 'Barreira Mística: Espaços Ocupados', custo: 1 }, { nome: 'Barreira Mística: Altura da Barreira', custo: 1 }, { nome: 'Barreira Mística: Duração da Barreira', custo: 1 }, { nome: 'Barreira Mística: Proteção Bônus', custo: 1 }, { nome: 'Barreira Cinética: Espaços Ocupados', custo: 1 }, { nome: 'Barreira Cinética: Altura da Barreira', custo: 1 }, { nome: 'Barreira Cinética: Resistência da Barreira', custo: 1 } ],
    'Status Negativos': [ { nome: 'Dano Contínuo I', custo: 3 }, { nome: 'Derreter', custo: 3 }, { nome: 'Congelado', custo: 3 }, { nome: 'Peso', custo: 3 }, { nome: 'Exaustão', custo: 3 }, { nome: 'Mana Burn', custo: 3 }, { nome: 'Desconexão', custo: 3 }, { nome: 'Pasmar', custo: 3 }, { nome: 'Bloqueio Psíquico', custo: 3 }, { nome: 'Imobilização', custo: 3 }, { nome: 'Distração', custo: 3 }, { nome: 'Atraso', custo: 3 }, { nome: 'Sufocamento', custo: 3 }, { nome: 'Inflamação', custo: 3 }, { nome: 'Afugentado', custo: 3 }, { nome: 'Dissociação', custo: 3 }, { nome: 'Confusão', custo: 3 }, { nome: 'Vertigem', custo: 3 }, { nome: 'Dano Contínuo II', custo: 5 }, { nome: 'Lentidão', custo: 5 }, { nome: 'Estupidez', custo: 5 }, { nome: 'Ruído', custo: 5 }, { nome: 'Expurgo', custo: 5 }, { nome: 'Selo Físico', custo: 5 }, { nome: 'Selo Mágico', custo: 5 }, { nome: 'Selo Psíquico', custo: 5 }, { nome: 'Sugestão', custo: 5 }, { nome: 'Charm', custo: 5 }, { nome: 'Infecção', custo: 5 }, { nome: 'Medo', custo: 5 }, { nome: 'Cegueira', custo: 5 }, { nome: 'Berserk', custo: 5 }, { nome: 'Quebra Estância', custo: 5 }, { nome: 'Quebra Encanto', custo: 5 }, { nome: 'Quebra Influência', custo: 5 }, { nome: 'Quebra de Armadura', custo: 5 }, { nome: 'Quebra Arcana', custo: 5 }, { nome: 'Quebra Psíquica', custo: 5 }, { nome: 'Dano Contínuo III', custo: 7 }, { nome: 'Atordoamento', custo: 7 }, { nome: 'Comando', custo: 7 }, { nome: 'Decadência', custo: 7 }, { nome: 'Terror', custo: 7 }, { nome: 'Controle', custo: 10 } ],
    'Invocações': [ { nome: 'Invocar ilusões', custo: 1 }, { nome: 'Invocar Simulacros', custo: 10 }, { nome: 'Invocar Criatura', custo: 10 } ],
    'Habilidades Passivas (Base)': [ { nome: 'Recuperação de Stamina', custo: 2 }, { nome: 'Recuperação de Mana', custo: 2 }, { nome: 'Recuperação de Psy', custo: 2 }, { nome: 'Passiva Reativa', custo: 3 }, { nome: 'Resistir Magia', custo: 1 }, { nome: 'Defesa Mágica', custo: 1 } ]
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

// --- UTILITÁRIO DE IMAGEM ---
function redimensionarImagem(file, maxWidth, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width; let h = img.height;
            if (w > h) { if (w > maxWidth) { h *= maxWidth/w; w = maxWidth; } }
            else { if (h > maxWidth) { w *= maxWidth/h; h = maxWidth; } }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            callback(canvas.toDataURL('image/jpeg', 0.7)); 
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// --- SAVE LOCAL ---
function salvarAutomaticamente() { 
    const dados = gerarObjetoFicha(); 
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dados)); } 
    catch (e) { console.warn("Erro no Auto-Save Local:", e); }
}
function carregarDadosAutomaticos() { 
    const dadosSalvos = localStorage.getItem(STORAGE_KEY); 
    if (dadosSalvos) { 
        try { const dados = JSON.parse(dadosSalvos); aplicarDadosNaTela(dados); } 
        catch (e) { console.error("Erro ao carregar auto-save", e); } 
    } 
}

// --- ATRIBUTOS ---
function getAttrValue(name) { const row = document.querySelector(`.atributo-row[data-nome="${name}"]`); if (!row) return 0; const input = row.querySelector('.atributo-input'); return parseInt(input ? input.value : 0) || 0; }
function incrementAttr(button) { const input = button.closest('.atributo-input-group').querySelector('.atributo-input'); let value = parseInt(input.value) || 0; input.value = value + 1; atualizarSistemaCompleto(); salvarAutomaticamente(); }
function decrementAttr(button) { const input = button.closest('.atributo-input-group').querySelector('.atributo-input'); let value = parseInt(input.value) || 0; if (value > 1) { input.value = value - 1; atualizarSistemaCompleto(); salvarAutomaticamente(); } }
function gerenciarClickTreino(btn) { const row = btn.closest('.atributo-row'); const contadorSpan = row.querySelector('.treino-contador'); const inputAttr = row.querySelector('.atributo-input'); let usoAtual = parseInt(contadorSpan.innerText) || 0; let valorAtributo = parseInt(inputAttr.value) || 0; if (usoAtual >= valorAtributo) { aplicarTreino(btn); } else { alterarUsoAtributo(row, 1); } }
function alterarUsoAtributo(row, valor) { const contadorSpan = row.querySelector('.treino-contador'); if (!contadorSpan) return; let usoAtual = parseInt(contadorSpan.innerText) || 0; usoAtual += valor; contadorSpan.innerText = Math.max(0, usoAtual); verificarTreinoAtributo(row); salvarAutomaticamente(); }
function verificarTreinoAtributo(row) { const inputAttr = row.querySelector('.atributo-input'); const valorAtributo = parseInt(inputAttr.value) || 0; const contadorSpan = row.querySelector('.treino-contador'); const usoAtributo = parseInt(contadorSpan.innerText) || 0; const atributoValorDisplay = row.querySelector('.atributo-valor-display'); const statusSpan = row.querySelector('.msg-status'); const treinarBtn = row.querySelector('.treinar-btn'); if (atributoValorDisplay) atributoValorDisplay.innerText = valorAtributo; if (!treinarBtn) return; if (usoAtributo >= valorAtributo && valorAtributo > 0) { row.classList.add('inspirado'); if (statusSpan) { statusSpan.textContent = 'INSPIRADO!'; statusSpan.style.color = 'var(--cor-alerta)'; } treinarBtn.innerText = "UP"; treinarBtn.classList.add('aplicar-pontos-btn'); treinarBtn.disabled = false; } else { row.classList.remove('inspirado'); if (statusSpan) { statusSpan.textContent = ''; } treinarBtn.innerText = "Treinar"; treinarBtn.classList.remove('aplicar-pontos-btn'); treinarBtn.disabled = false; } }
function aplicarTreino(btn) { const row = btn.closest('.atributo-row'); const inputAttr = row.querySelector('.atributo-input'); const contadorSpan = row.querySelector('.treino-contador'); let valorAtual = parseInt(inputAttr.value) || 0; inputAttr.value = valorAtual + 1; contadorSpan.innerText = '0'; atualizarSistemaCompleto(); salvarAutomaticamente(); }
function calcularNivelBaseadoEmPontos(gastos) { let nivelBruto = gastos / PONTOS_POR_NIVEL_FLOAT; if (nivelBruto < 0.01) nivelBruto = 0.01; return parseFloat(nivelBruto.toFixed(2)); }

function atualizarSistemaCompleto() { 
    const rows = document.querySelectorAll('.atributo-row'); let gastos = 0; 
    rows.forEach(row => { const input = row.querySelector('.atributo-input'); const valor = parseInt(input.value) || 0; gastos += valor; verificarTreinoAtributo(row); }); 
    const nivelAtual = calcularNivelBaseadoEmPontos(gastos); let totalPontosPermitidos = Math.round(nivelAtual * PONTOS_POR_NIVEL_FLOAT); 
    document.getElementById('nivel-display').innerText = nivelAtual.toFixed(2); 
    document.getElementById('total-pontos').innerText = totalPontosPermitidos; 
    window.regra = { nivelAtual, gastosAtuais: gastos }; 
    calcularRecursos(); 
    calcularPericias(); 
    calcularSkills(); 
    atualizarGrafico();
    calcularStatusDerivados(); 
}

// --- HELPER PARA REMOVER ACENTOS ---
function removerAcentos(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// --- CÁLCULO DE STATUS AUTOMÁTICO (CORRIGIDO) ---
function calcularStatusDerivados() {
    const todosCampos = document.querySelectorAll('.battle-group, .status-extra-wrapper');
    
    todosCampos.forEach(grupo => {
        let labelEl = grupo.querySelector('label');
        let nomeStatus = "";
        
        if (labelEl) { nomeStatus = labelEl.innerText.trim(); } 
        else {
            let inputNome = grupo.querySelector('.status-nome-editavel');
            if (inputNome) nomeStatus = inputNome.value.trim();
        }

        let inputValor = grupo.querySelector('.batalha-input');
        if (!nomeStatus || !inputValor) return;

        // Normaliza para comparação (remove acentos e lowercase)
        const nomeStatusNorm = removerAcentos(nomeStatus);

        let total = 0;
        
        // 1. ATRIBUTO BASE (Se existir no mapa)
        // Usa a chave original com acento se existir, ou tenta achar compatível
        let attrBase = null;
        for (const [key, val] of Object.entries(MAPA_STATUS_ATRIBUTO)) {
            if (removerAcentos(key) === nomeStatusNorm && val !== null) {
                attrBase = val;
                break;
            }
        }
        if (attrBase) {
            total += getAttrValue(attrBase);
        }

        // 2. SKILLS (Passivas + Ativas com Buff Ligado)
        document.querySelectorAll('.skill-item').forEach(skill => {
            const tipo = skill.dataset.tipo; 
            const isBuffAtivo = skill.querySelector('.chk-buff-ativo')?.checked;

            if (tipo === 'P' || (tipo === 'A' && isBuffAtivo)) {
                skill.querySelectorAll('.modifier-entry').forEach(mod => {
                    const nomeModNorm = removerAcentos(mod.dataset.modName);
                    const rep = parseInt(mod.dataset.repetitions) || 0;
                    
                    if (nomeModNorm === nomeStatusNorm || nomeModNorm.includes(nomeStatusNorm)) { 
                        total += rep; 
                    }
                    if ((nomeStatusNorm === 'area critica') && nomeModNorm.includes('critico aprimorado')) {
                        total += rep;
                    }
                });
            }
        });

        // 3. ITENS EQUIPADOS (Slots)
        // Recalcula do zero a cada alteração. Se removeu o item, ele não está em 'slotAssignments' ou está vazio.
        for (const [slot, nomeItem] of Object.entries(slotAssignments)) {
            if (!nomeItem || nomeItem.includes('BLOQUEADO')) continue;
            
            const itemInv = Array.from(document.querySelectorAll('.inv-item')).find(i => i.dataset.nome === nomeItem);
            
            if (itemInv) {
                const categoria = itemInv.dataset.categoria;
                const descNorm = removerAcentos(itemInv.dataset.desc || "");
                const extra = parseInt(itemInv.dataset.extra) || 0;

                // Procura bônus explícito na descrição (ex: "Defesa Magica +2")
                const regex1 = new RegExp(`${nomeStatusNorm}\\s*\\+\\s*(\\d+)`); 
                const match1 = descNorm.match(regex1);
                
                const regex2 = new RegExp(`\\+\\s*(\\d+)\\s*${nomeStatusNorm}`); 
                const match2 = descNorm.match(regex2);

                let encontrouNaDescricao = (match1 || match2);

                // Prioridade: Valor escrito na descrição
                if (match1) total += parseInt(match1[1]);
                else if (match2) total += parseInt(match2[1]);

                // Fallback: Valor base da Armadura (dataset.extra)
                // SÓ conta se o status for DEFESA FÍSICA e o item for ARMADURA.
                // Se o status for "Defesa Mágica", ele IGNORA o extra, a menos que esteja escrito na descrição.
                // Adicionalmente: se já achou "Defesa Física +X" na descrição da própria armadura, não soma o extra para não duplicar.
                
                if (!encontrouNaDescricao && 
                    nomeStatusNorm === 'defesa fisica' && 
                    categoria === 'armadura') { 
                    total += extra; 
                }
            }
        }
        
        inputValor.value = total;
    });
}

function adicionarStatusExtra(nome = "", valor = "") {
    const container = document.getElementById('grid-status-extras');
    const div = document.createElement('div');
    div.className = 'status-extra-wrapper';
    div.innerHTML = `
        <button class="btn-remove-status" onclick="this.parentElement.remove(); salvarAutomaticamente();" title="Remover">x</button>
        <input type="text" class="status-nome-editavel" placeholder="NOME" value="${nome}" oninput="calcularStatusDerivados(); salvarAutomaticamente()">
        <input type="text" class="batalha-input" placeholder="0" value="${valor}" oninput="salvarAutomaticamente()">
    `;
    container.appendChild(div);
    salvarAutomaticamente();
    calcularStatusDerivados();
}

// --- RECURSOS ---
function calcularRecursos() { const F = getAttrValue("Forca"); const R = getAttrValue("Resistencia"); const E = getAttrValue("Espírito"); const I = getAttrValue("Inteligencia"); const C = getAttrValue("Carisma"); const maxHP = R * 4; const maxST = R * 2 + F; const maxMP = E * 2 + I; const maxPSI = I * 2 + C; if (!window.recursosAtuais) { window.recursosAtuais = { hp: maxHP, st: maxST, mp: maxMP, psi: maxPSI }; } document.getElementById('hp-max').innerText = maxHP; document.getElementById('st-max').innerText = maxST; document.getElementById('mp-max').innerText = maxMP; document.getElementById('psi-max').innerText = maxPSI; atualizarBarrasVisuais(maxHP, maxST, maxMP, maxPSI); }
function atualizarBarrasVisuais(maxHP, maxST, maxMP, maxPSI) { if (!window.recursosAtuais) return; let curHP = window.recursosAtuais.hp; let curST = window.recursosAtuais.st; let curMP = window.recursosAtuais.mp; let curPSI = window.recursosAtuais.psi; document.getElementById('hp-atual').innerText = curHP; document.getElementById('st-atual').innerText = curST; document.getElementById('mp-atual').innerText = curMP; document.getElementById('psi-atual').innerText = curPSI; document.getElementById('hp-bar-fill').style.width = Math.min(100, Math.max(0, (curHP / maxHP) * 100)) + '%'; document.getElementById('st-bar-fill').style.width = Math.min(100, Math.max(0, (curST / maxST) * 100)) + '%'; document.getElementById('mp-bar-fill').style.width = Math.min(100, Math.max(0, (curMP / maxMP) * 100)) + '%'; document.getElementById('psi-bar-fill').style.width = Math.min(100, Math.max(0, (curPSI / maxPSI) * 100)) + '%'; }
function alterarRecurso(tipo, multiplicador) { const inputId = `mod-${tipo}`; const inputVal = document.getElementById(inputId).value; const valorDigitado = parseInt(inputVal) || 0; if (valorDigitado === 0) return; if (!window.recursosAtuais) window.recursosAtuais = { hp:0, st:0, mp:0, psi:0 }; window.recursosAtuais[tipo] += (valorDigitado * multiplicador); document.getElementById(inputId).value = ''; calcularRecursos(); salvarAutomaticamente(); }

// --- PERÍCIAS ---
function calcularCustoPericia(elemento) { const item = elemento.closest('.pericia-item'); const raridade = item.querySelector('.pericia-raridade').value; item.dataset.custo = CUSTO_RARIDADE[raridade] || 0; calcularPericias(); salvarAutomaticamente(); }
function calcularPericias() { const nivel = window.regra.nivelAtual || 0.01; const ptsBase = Math.floor(nivel * 10); const ptsPrincipal = ptsBase; const ptsSecundaria = Math.max(0, ptsBase - 5); const ptsTerciaria = Math.max(0, ptsBase - 10); document.getElementById('pericia-principal-pts').innerText = ptsPrincipal; document.getElementById('pericia-secundaria-pts').innerText = ptsSecundaria; document.getElementById('pericia-terciaria-pts').innerText = ptsTerciaria; atualizarDisplayGastos('principal', somarGastosPericia('principal'), ptsPrincipal); atualizarDisplayGastos('secundaria', somarGastosPericia('secundaria'), ptsSecundaria); atualizarDisplayGastos('terciaria', somarGastosPericia('terciaria'), ptsTerciaria); }
function somarGastosPericia(cat) { const container = document.getElementById(`pericias-${cat}`); let total = 0; if (container) container.querySelectorAll('.pericia-item').forEach(item => total += parseInt(item.dataset.custo) || 0); return total; }
function atualizarDisplayGastos(cat, gastos, limite) { const display = document.getElementById(`pericia-${cat}-gastos`); if (display) { display.innerText = gastos; display.style.color = (gastos > limite) ? 'var(--cor-perigo)' : 'var(--cor-sucesso)'; } }
function criarPericiaElement(categoria, dados) { const item = document.createElement('div'); item.className = 'pericia-item'; item.dataset.categoria = categoria; item.dataset.custo = dados.custo || CUSTO_RARIDADE[dados.raridade] || 1; const raridade = dados.raridade || 'Comum'; const raridadeOptions = Object.keys(CUSTO_RARIDADE).map(r => `<option value="${r}" ${r === raridade ? 'selected' : ''}>${r}</option>`).join(''); item.innerHTML = ` <input type="text" class="pericia-nome" value="${dados.nome || 'Nova Perícia'}" placeholder="Nome"> <select class="pericia-raridade" onchange="calcularCustoPericia(this)">${raridadeOptions}</select> <button onclick="removerPericia(this)" class="remover-pericia-btn">X</button> `; item.querySelector('.pericia-nome').addEventListener('input', () => { calcularPericias(); salvarAutomaticamente(); }); item.querySelector('.pericia-raridade').addEventListener('change', () => salvarAutomaticamente()); return item; }
function adicionarPericia(cat) { const container = document.getElementById(`pericias-${cat}`); const item = criarPericiaElement(cat, { nome: 'Nova Perícia', raridade: 'Comum' }); container.appendChild(item); calcularCustoPericia(item.querySelector('.pericia-raridade')); salvarAutomaticamente(); }
function removerPericia(btn) { btn.closest('.pericia-item').remove(); calcularPericias(); salvarAutomaticamente(); }

// --- SKILLS ---
function mudarAbaSkills(aba) { currentSkillTab = aba; document.querySelectorAll('.skill-tab-btn').forEach(btn => { if(btn.id === `tab-btn-${aba}`) btn.classList.add('active'); else btn.classList.remove('active'); }); organizarSkillsVisualmente(); }
function mudarSubAba(tipo) { currentSkillType = tipo; document.querySelectorAll('.sub-tab-btn').forEach(btn => { if((tipo === 'A' && btn.innerText === 'Ativas') || (tipo === 'P' && btn.innerText === 'Passivas')) { btn.classList.add('active'); } else { btn.classList.remove('active'); } }); organizarSkillsVisualmente(); }
function organizarSkillsVisualmente() { const containerVisualizacao = document.getElementById('container-visualizacao'); const containerStorage = document.getElementById('skills-storage'); const todasSkills = document.querySelectorAll('.skill-item'); const displayCounter = document.getElementById('skill-rarity-counters'); let raridadeCount = {}; todasSkills.forEach(item => { const recurso = item.dataset.recurso; const tipo = item.dataset.tipo; const raridade = item.dataset.raridade || 'Comum'; if (recurso === currentSkillTab) { if (!raridadeCount[raridade]) raridadeCount[raridade] = 0; raridadeCount[raridade]++; } const pertenceAba = (recurso === currentSkillTab); const pertenceTipo = (tipo === currentSkillType); if (pertenceAba && pertenceTipo) containerVisualizacao.appendChild(item); else containerStorage.appendChild(item); }); displayCounter.innerHTML = ''; const raridadesEncontradas = Object.keys(raridadeCount); if(raridadesEncontradas.length === 0) displayCounter.innerHTML = '<span style="color:#666;">Nenhuma habilidade neste recurso.</span>'; else raridadesEncontradas.forEach(rar => { displayCounter.innerHTML += `<span class="rarity-tag" style="background-color:${CORES_TEXTO_RARIDADE[rar]}; color:#fff; padding:2px 5px; border-radius:3px; margin-right:5px;">${rar}: ${raridadeCount[rar]}</span>`; }); }
function toggleSkill(btn) { const item = btn.closest('.skill-item'); item.classList.toggle('collapsed'); }

// SKILL ELEMENT (COM CHECKBOX BUFF)
function criarSkillElement(dados) { 
    const item = document.createElement('div'); item.className = 'skill-item collapsed'; 
    const raridade = dados.raridade || 'Comum'; const tipo = dados.tipo || currentSkillType; const custoRecurso = dados.custoRecurso || currentSkillTab; 
    item.dataset.recurso = custoRecurso; item.dataset.tipo = tipo; item.dataset.custo = dados.custo || 0; item.dataset.raridade = raridade; 
    const isBuffAtivo = dados.isBuffAtivo ? 'checked' : '';
    const raridadeOptions = Object.keys(CUSTO_BASE_SKILL_ATIVA).map(r => `<option value="${r}" ${r === raridade ? 'selected' : ''}>${r}</option>`).join(''); 
    const buffHtml = (tipo === 'A') ? `<label style="font-size:0.7rem; margin-right:5px; display:flex; align-items:center; cursor:pointer; background:rgba(0,0,0,0.1); padding:2px 5px; border-radius:3px;"><input type="checkbox" class="chk-buff-ativo" ${isBuffAtivo} onchange="calcularStatusDerivados(); salvarAutomaticamente()" style="margin-right:4px;"> Buff</label>` : '';
    item.innerHTML = ` <div class="skill-header-row"> <div style="display:flex; align-items:center; flex-grow:1;"> <button class="toggle-skill-btn" onclick="toggleSkill(this)">▼</button> ${buffHtml} <input type="text" class="skill-nome skill-input-text" value="${dados.nome || 'Nova Skill'}" placeholder="Nome" data-tippy-content="${dados.descricao || 'Sem descrição'}" oninput="this.dataset.tippyContent = this.closest('.skill-item').querySelector('.skill-descricao').value; handleSkillChange(this)"> </div> <div class="skill-header-info"> <span class="header-rarity-display" style="color:${CORES_TEXTO_RARIDADE[raridade]}">${raridade}</span> <div class="header-cost-box"> <span style="font-size:0.7rem; color:#666;">Custo:</span> <span class="header-cost-val" style="font-weight:bold; font-size:1.1rem;">0.0</span> </div> <button onclick="removerSkill(this)" class="remover-skill-btn">✕</button> </div> </div> <div class="skill-main-content"> <div class="skill-controls-row"> <div style="flex:1; margin-right:10px;"> <label>Raridade Base:</label> <select class="skill-raridade-select" onchange="handleSkillChange(this)" style="width:100%;">${raridadeOptions}</select> </div> <div class="skill-cost-detail"> <label>Limite:</label> <span class="skill-limite-display">0.0</span> <span style="margin:0 5px;">|</span> <label>Total:</label> <input type="number" class="skill-custo-input skill-input-num" value="${parseFloat(item.dataset.custo).toFixed(1)}" min="0" readonly> </div> <span class="skill-gasto-display" style="display:none;">0.0</span> </div> <textarea class="skill-descricao" placeholder="Descrição da habilidade..." oninput="handleSkillChange(this)">${dados.descricao || ''}</textarea> </div> <div class="skill-modificadores-container"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;"> <label style="font-weight:bold; font-size:0.8rem;">Modificadores:</label> <button onclick="adicionarModificador(this)" class="adicionar-mod-btn">+ Efeito</button> </div> <div class="modifier-list"></div> </div> `; 
    const modListContainer = item.querySelector('.modifier-list'); if (dados.modificadores) { dados.modificadores.forEach(modData => { modListContainer.appendChild(criarModificadorEntryHTML({ key: modData.categoria, nome: modData.nome, rep: modData.rep })); }); } 
    tippy(item.querySelector('.skill-nome'), { theme: 'translucent', animation: 'scale', placement: 'top' }); 
    setTimeout(() => { calcularCustoSkill(item); calcularSkills(); }, 0); 
    return item; 
}
function criarModificadorEntryHTML(modEntryData = {}) { const defaultCategory = 'Bônus de Status (Stats)'; const effectsList = getEffectsForCategory(defaultCategory); const modKey = modEntryData.key || defaultCategory; const modNome = modEntryData.nome || effectsList[0]?.nome || ''; const rep = modEntryData.rep || 1; const categoryOptions = getAllModifierCategories().map(cat => `<option value="${cat}" ${cat === modKey ? 'selected' : ''}>${cat}</option>`).join(''); const effects = getEffectsForCategory(modKey); const effectOptions = effects.map(mod => `<option value="${mod.nome}" ${mod.nome === modNome ? 'selected' : ''}>${mod.nome} (${mod.custo})</option>`).join(''); const baseMod = effects.find(m => m.nome === modNome); const baseCost = baseMod ? baseMod.custo : 0; const entry = document.createElement('div'); entry.className = 'modifier-entry'; entry.dataset.category = modKey; entry.dataset.modName = modNome; entry.dataset.repetitions = rep; entry.dataset.baseCost = baseCost; entry.innerHTML = ` <select class="skill-select mod-category-select" onchange="handleModifierCategoryChange(this)">${categoryOptions}</select> <select class="skill-select mod-name-select" onchange="handleModifierChange(this)">${effectOptions}</select> <div class="skill-mod-group"><label>x</label><input type="number" class="skill-input-num mod-repetitions-input" value="${rep}" min="1" oninput="handleModifierChange(this)"></div> <div class="skill-mod-group" style="min-width: 50px;"><label>UPs:</label><span class="skill-input-num mod-total-cost" style="text-align:right;">${(baseCost * rep).toFixed(1)}</span></div> <button onclick="removerModificador(this)" class="remover-modificador-btn">X</button> `; return entry; }
function handleModifierCategoryChange(select) { const entry = select.closest('.modifier-entry'); const category = select.value; const nameSelect = entry.querySelector('.mod-name-select'); const effects = getEffectsForCategory(category); nameSelect.innerHTML = effects.map(mod => `<option value="${mod.nome}">${mod.nome} (${mod.custo})</option>`).join(''); handleModifierChange(nameSelect); }
function handleModifierChange(element) { const entry = element.closest('.modifier-entry'); const skillItem = entry.closest('.skill-item'); const category = entry.querySelector('.mod-category-select').value; const modName = entry.querySelector('.mod-name-select').value; let rep = parseInt(entry.querySelector('.mod-repetitions-input').value) || 1; const effects = getEffectsForCategory(category); const baseMod = effects.find(m => m.nome === modName); const baseCost = baseMod ? baseMod.custo : 0; entry.dataset.category = category; entry.dataset.modName = modName; entry.dataset.repetitions = rep; entry.dataset.baseCost = baseCost; entry.querySelector('.mod-total-cost').innerText = (baseCost * rep).toFixed(1); calcularCustoSkill(skillItem); calcularSkills(); calcularStatusDerivados(); salvarAutomaticamente(); }
function adicionarModificador(btn) { btn.closest('.skill-modificadores-container').querySelector('.modifier-list').appendChild(criarModificadorEntryHTML({})); calcularCustoSkill(btn.closest('.skill-item')); calcularSkills(); calcularStatusDerivados(); salvarAutomaticamente(); }
function removerModificador(btn) { const item = btn.closest('.skill-item'); btn.closest('.modifier-entry').remove(); calcularCustoSkill(item); calcularSkills(); calcularStatusDerivados(); salvarAutomaticamente(); }
function handleSkillChange(el) { const item = el.closest('.skill-item'); if (el.classList.contains('skill-descricao')) { const nomeInput = item.querySelector('.skill-nome'); const novoTexto = el.value || 'Sem descrição'; nomeInput.dataset.tippyContent = novoTexto; if (nomeInput._tippy) { nomeInput._tippy.setContent(novoTexto); } } if (el.classList.contains('skill-raridade-select')) { item.dataset.raridade = el.value; organizarSkillsVisualmente(); calcularCustoSkill(item); } calcularSkills(); calcularStatusDerivados(); salvarAutomaticamente(); }
function calcularCustoSkill(item) { const raridade = item.querySelector('.skill-raridade-select').value; const tipo = item.dataset.tipo; let upsOcupados = 0; let upsReais = 0; let bonusLimiteNerfs = 0; item.querySelectorAll('.modifier-entry').forEach(e => { const cat = e.dataset.category; const nome = e.dataset.modName; const baseCost = parseFloat(e.dataset.baseCost) || 0; const reps = parseInt(e.dataset.repetitions) || 1; const totalCostMod = baseCost * reps; if (cat === 'Efeitos Adversos (Nerfs)') { bonusLimiteNerfs += totalCostMod; } else { if (nome === 'Redução de custo') { upsOcupados += (2 * reps); upsReais -= (1 * reps); } else { upsOcupados += totalCostMod; upsReais += totalCostMod; } } }); const base = CUSTO_BASE_SKILL_ATIVA[raridade] || 0; const limit = (tipo === 'P' ? Math.ceil(base / 2) : base) + bonusLimiteNerfs; let finalCost = Math.max(0, upsReais); item.dataset.custo = finalCost.toFixed(1); const dispLimit = item.querySelector('.skill-limite-display'); if(dispLimit) dispLimit.innerText = limit.toFixed(1); const inputCusto = item.querySelector('.skill-custo-input'); if(inputCusto) { inputCusto.value = finalCost.toFixed(1); inputCusto.style.color = (upsOcupados > limit) ? 'red' : 'inherit'; } const headerRarity = item.querySelector('.header-rarity-display'); const headerCostVal = item.querySelector('.header-cost-val'); if (headerRarity) { headerRarity.innerText = raridade; headerRarity.style.color = CORES_TEXTO_RARIDADE[raridade] || '#333'; } if (headerCostVal) { headerCostVal.innerText = finalCost.toFixed(1); headerCostVal.style.color = (upsOcupados > limit) ? 'red' : '#2e8b57'; } }
function adicionarSkill() { const container = document.getElementById('container-visualizacao'); const novaSkill = criarSkillElement({ custoRecurso: currentSkillTab, tipo: currentSkillType }); container.appendChild(novaSkill); adicionarModificador(novaSkill.querySelector('.adicionar-mod-btn')); salvarAutomaticamente(); }
function removerSkill(btn) { btn.closest('.skill-item').remove(); calcularSkills(); organizarSkillsVisualmente(); salvarAutomaticamente(); } 
function calcularSkills() { let total = 0; document.querySelectorAll('.skill-item').forEach(i => total += parseFloat(i.dataset.custo) || 0); }

// --- OUTROS ---
let currentInvTab = 'equipado'; 
let cropperInstance = null;
function carregarImagemPersonagem(event) { const file = event.target.files[0]; if (file) { redimensionarImagem(file, 300, (base64) => { document.getElementById('char-image-display').src = base64; salvarAutomaticamente(); }); } }
function carregarImagemCorpo(event) { const file = event.target.files[0]; if (file) { redimensionarImagem(file, 1024, (base64) => { const img = document.getElementById('full-body-img'); if(img) { img.src = base64; salvarAutomaticamente(); } }); } }

// --- INVENTÁRIO ---
function mudarAbaInventario(aba) {
    currentInvTab = aba;
    document.querySelectorAll('.inv-tab-btn').forEach(btn => { if (btn.id === `tab-inv-${aba}`) btn.classList.add('active'); else btn.classList.remove('active'); });
    const itens = document.querySelectorAll('.inv-item');
    itens.forEach(item => { const categoriaItem = item.dataset.categoria; let isEquipado = false; const nome = item.dataset.nome; if(nome) { isEquipado = Object.values(slotAssignments).includes(nome); } if (aba === 'equipado') { item.style.display = isEquipado ? 'block' : 'none'; } else { item.style.display = (categoriaItem === aba) ? 'block' : 'none'; } });
}

function abrirModalItem() {
    document.getElementById('modal-inv-nome').value = ''; document.getElementById('modal-inv-qtd').value = 1; document.getElementById('modal-inv-desc').value = '';
    if(document.getElementById('modal-img-prompt')) document.getElementById('modal-img-prompt').value = '';
    document.getElementById('modal-inv-categoria').value = 'arma'; document.getElementById('modal-img-preview').src = ''; document.getElementById('modal-img-preview-box').style.display = 'none'; document.getElementById('modal-img-upload').value = '';
    tempItemImage = null; handleModalCategoryChange(); document.getElementById('item-modal').style.display = 'flex';
}

function handleModalCategoryChange() {
    const categoria = document.getElementById('modal-inv-categoria').value; 
    const container = document.getElementById('modal-inv-extra-container'); 
    let html = '';
    
    if (categoria === 'arma') { 
        html = ` 
        <div style="display:flex; gap:10px; align-items:center;"> 
            <div style="flex:1;"><label>Dano:</label><input type="text" id="modal-inv-dano" placeholder="Ex: 1d8" style="width:100%;"></div> 
            <div style="display:flex; align-items:center; gap:5px; margin-top:15px;"> <input type="checkbox" id="modal-inv-duas-maos"> <label for="modal-inv-duas-maos" style="margin:0; cursor:pointer; font-size:0.8rem;">Duas Mãos?</label> </div> 
        </div>`; 
    }
    else if (categoria === 'armadura' || categoria === 'acessorio') { 
        html = `
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:5px;">
            <div><label>D. Física:</label><input type="number" id="modal-inv-def-fis" placeholder="0" style="width:100%;"></div>
            <div><label>D. Mágica:</label><input type="number" id="modal-inv-def-mag" placeholder="0" style="width:100%;"></div>
            <div><label>D. Psíq:</label><input type="number" id="modal-inv-def-psi" placeholder="0" style="width:100%;"></div>
        </div>`;
    }
    else if (categoria === 'consumivel') { 
        html = `<span style="font-size:0.8rem;color:#666;">Será criado com contador +/-</span>`;
    }
    container.innerHTML = html;
}

function previewItemImage(event) { const file = event.target.files[0]; if (file) { redimensionarImagem(file, 150, (base64) => { tempItemImage = base64; document.getElementById('modal-img-preview').src = tempItemImage; document.getElementById('modal-img-preview-box').style.display = 'flex'; }); } }

function adicionarItemInventario() { 
    const categoria = document.getElementById('modal-inv-categoria').value; 
    const raridade = document.getElementById('modal-inv-raridade').value; 
    const nome = document.getElementById('modal-inv-nome').value.trim(); 
    const qtd = parseInt(document.getElementById('modal-inv-qtd').value) || 1; 
    let desc = document.getElementById('modal-inv-desc').value; 
    
    if (!nome) { alert("Nome é obrigatório!"); return; } 
    
    let extraVal = ''; 
    let isDuasMaos = false;

    if (categoria === 'arma') { 
        extraVal = document.getElementById('modal-inv-dano') ? document.getElementById('modal-inv-dano').value : ''; 
        isDuasMaos = document.getElementById('modal-inv-duas-maos') ? document.getElementById('modal-inv-duas-maos').checked : false; 
    }
    else if (categoria === 'armadura' || categoria === 'acessorio') {
        const defFis = document.getElementById('modal-inv-def-fis') ? parseInt(document.getElementById('modal-inv-def-fis').value) || 0 : 0;
        const defMag = document.getElementById('modal-inv-def-mag') ? parseInt(document.getElementById('modal-inv-def-mag').value) || 0 : 0;
        const defPsi = document.getElementById('modal-inv-def-psi') ? parseInt(document.getElementById('modal-inv-def-psi').value) || 0 : 0;
        
        // Monta o texto dos bônus extras para a descrição
        let bonusTexto = [];
        if (defFis > 0) bonusTexto.push(`Defesa Física +${defFis}`);
        if (defMag > 0) bonusTexto.push(`Defesa Mágica +${defMag}`);
        if (defPsi > 0) bonusTexto.push(`Defesa Psíquica +${defPsi}`);
        
        if (bonusTexto.length > 0) {
            desc += (desc ? "\n" : "") + "[" + bonusTexto.join(" | ") + "]";
        }

        // Se for armadura, o valor principal 'extra' é a Defesa Física para aparecer no card
        if (categoria === 'armadura') {
            extraVal = defFis > 0 ? defFis : '';
        }
    }
    
    const container = document.getElementById('inventario-container'); 
    const itensExistentes = Array.from(container.querySelectorAll('.inv-item')); 
    const itemDuplicado = itensExistentes.find(item => item.dataset.nome.toLowerCase() === nome.toLowerCase() && item.dataset.raridade === raridade); 
    
    if (itemDuplicado) { alterarQtdInventario(itemDuplicado, qtd); } 
    else { criarElementoItem(container, { categoria, raridade, nome, qtd, desc, extra: extraVal, duasMaos: isDuasMaos, imagem: tempItemImage }); mudarAbaInventario(currentInvTab); } 
    document.getElementById('item-modal').style.display = 'none'; salvarAutomaticamente(); 
}

function criarElementoItem(container, dados) { 
    const div = document.createElement('div'); div.className = 'inv-item'; 
    div.dataset.categoria = dados.categoria; div.dataset.raridade = dados.raridade; div.dataset.nome = dados.nome; div.dataset.qtd = dados.qtd; div.dataset.desc = dados.desc; div.dataset.extra = dados.extra; div.dataset.imagem = dados.imagem || ''; div.dataset.duasmaos = dados.duasMaos;
    
    let displayStats = ''; 
    if(dados.categoria === 'arma') displayStats = `Dano: ${dados.extra} ${dados.duasMaos ? '(2 Mãos)' : ''}`; 
    else if(dados.categoria === 'armadura') displayStats = `Def. Física: ${dados.extra || 0}`; 
    else displayStats = dados.categoria.charAt(0).toUpperCase() + dados.categoria.slice(1);
    
    const colorRaridade = CORES_TEXTO_RARIDADE[dados.raridade] || '#333'; let imgHtml = ''; if (dados.imagem) { imgHtml = `<img src="${dados.imagem}" class="inv-item-real-img">`; } else { imgHtml = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:#777;">S/ IMG</div>`; }
    div.innerHTML = ` <div class="inv-main-row"> <div class="inv-img-wrapper" onclick="this.querySelector('input[type=file]').click()" title="Alterar Imagem"> ${imgHtml} <div class="inv-img-upload-icon">📷</div> <input type="file" accept="image/*" style="display:none;" onchange="uploadImagemItemInventario(event, this)"> </div> <div class="inv-info-col"> <div class="inv-nome-linha"> ${dados.nome} <span style="color:#aaa;">|</span> <span class="inv-raridade-text" style="color:${colorRaridade};">${dados.raridade}</span> </div> <div class="inv-stats-text">${displayStats}</div> </div> <div class="inv-contador-absolute"> <button onclick="alterarQtdInventario(this.closest('.inv-item'), 1)" class="btn-qtd-mini">+</button> <span class="inv-qtd-display">x${dados.qtd}</span> <button onclick="alterarQtdInventario(this.closest('.inv-item'), -1)" class="btn-qtd-mini">-</button> </div> </div> <div class="inv-desc-display">${dados.desc}</div> <div class="inv-footer"> <button onclick="if(confirm('Deletar este item?')) { this.closest('.inv-item').remove(); salvarAutomaticamente(); }" class="btn-remover-mini">Remover Item</button> </div> `; 
    container.appendChild(div); return div;
}

function uploadImagemItemInventario(event, inputEl) {
    const file = event.target.files[0];
    if (file) {
        redimensionarImagem(file, 150, (base64) => {
            const itemDiv = inputEl.closest('.inv-item'); const wrapper = inputEl.closest('.inv-img-wrapper'); itemDiv.dataset.imagem = base64; 
            const oldImg = wrapper.querySelector('img'); const oldDiv = wrapper.querySelector('div:not(.inv-img-upload-icon)'); if(oldImg) oldImg.remove(); if(oldDiv) oldDiv.remove();
            const newImg = document.createElement('img'); newImg.src = base64; newImg.className = 'inv-item-real-img'; newImg.style.width = '100%'; newImg.style.height = '100%'; newImg.style.objectFit = 'cover'; wrapper.insertBefore(newImg, wrapper.firstChild);
            for (const [id, nome] of Object.entries(slotAssignments)) { if(nome === itemDiv.dataset.nome) { renderizarSlot(id, nome); } }
            salvarAutomaticamente();
        });
    }
}

function alterarQtdInventario(itemDiv, valor) { 
    let qtdAtual = parseInt(itemDiv.dataset.qtd) || 0; qtdAtual += valor; 
    if (qtdAtual <= 0) { 
        if(confirm("Quantidade zerada. Remover item?")) { const nome = itemDiv.dataset.nome; for(let slot in slotAssignments) { if(slotAssignments[slot] === nome) { slotAssignments[slot] = ''; renderizarSlot(slot, ''); } } itemDiv.remove(); salvarAutomaticamente(); return; } 
        else { qtdAtual = 0; } 
    } 
    itemDiv.dataset.qtd = qtdAtual; itemDiv.querySelector('.inv-qtd-display').innerText = `x${qtdAtual}`; 
    for(let slot in slotAssignments) { if(slotAssignments[slot] === itemDiv.dataset.nome) { renderizarSlot(slot, itemDiv.dataset.nome); } }
    salvarAutomaticamente(); 
}

// --- SLOTS E CONSUMÍVEIS ---
function gerarSlotConsumivelHTML(idSlot) {
    const div = document.createElement('div'); div.className = 'consumivel-compacto'; div.id = idSlot.replace('slot-cons', 'con-slot-');
    div.innerHTML = ` <div class="slot-wrapper-relative"> <button class="btn-fechar-slot" onclick="removerSlotConsumivel('${idSlot}')" title="Remover">x</button> <div class="equip-slot" onclick="cliqueSlot('consumivel', '${idSlot}')" id="${idSlot}"> <img src="" class="slot-img"> <span class="slot-placeholder">🧪</span> <span class="cons-qtd-badge" id="${idSlot.replace('slot-', 'qtd-')}">0</span> </div> </div> <button class="mod-btn btn-usar-mini" onclick="usarConsumivel('${idSlot}')">Usar</button> `;
    return div;
}

function adicionarNovoSlotConsumivel() {
    let maxIndex = 0; const regex = /slot-cons(\d+)/; for (const key in slotAssignments) { const match = key.match(regex); if (match) { const idx = parseInt(match[1]); if (idx > maxIndex) maxIndex = idx; } }
    const newIndex = maxIndex + 1; const newId = `slot-cons${newIndex}`; slotAssignments[newId] = '';
    const container = document.getElementById('consumiveis-grid'); container.appendChild(gerarSlotConsumivelHTML(newId)); salvarAutomaticamente();
}

function removerSlotConsumivel(idSlot) { if(confirm("Deseja remover este slot de atalho?")) { delete slotAssignments[idSlot]; const wrapper = document.getElementById(idSlot.replace('slot-cons', 'con-slot-')); if(wrapper) wrapper.remove(); salvarAutomaticamente(); } }

function renderizarSlotsConsumiveisIniciais() {
    const container = document.getElementById('consumiveis-grid'); if(!container) return; container.innerHTML = '';
    const consSlots = Object.keys(slotAssignments).filter(k => k.startsWith('slot-cons')).sort((a,b) => { return parseInt(a.replace('slot-cons','')) - parseInt(b.replace('slot-cons','')); });
    if (consSlots.length === 0) { ['slot-cons1', 'slot-cons2', 'slot-cons3'].forEach(id => { slotAssignments[id] = ''; container.appendChild(gerarSlotConsumivelHTML(id)); }); } 
    else { consSlots.forEach(id => { container.appendChild(gerarSlotConsumivelHTML(id)); }); }
}

function cliqueSlot(tipo, idSlot) { abrirSelecaoSlot(tipo, idSlot); }
function abrirSelecaoSlot(tipoFiltro, idSlot) {
    slotAtualParaSelecao = idSlot; const listaDiv = document.getElementById('lista-selecao-itens'); listaDiv.innerHTML = '';
    const btnDesequipar = document.createElement('div'); btnDesequipar.className = 'item-selecao-row'; btnDesequipar.innerHTML = `<span>🚫 (Remover Item)</span>`; btnDesequipar.onclick = () => confirmarSelecaoSlot(''); listaDiv.appendChild(btnDesequipar);
    const todosItens = document.querySelectorAll('.inv-item'); let encontrou = false;
    todosItens.forEach(divItem => {
        const cat = divItem.dataset.categoria;
        if (cat === tipoFiltro || (tipoFiltro === 'arma' && cat === 'arma') || (tipoFiltro === 'consumivel' && cat === 'consumivel') || (tipoFiltro === 'acessorio' && (cat === 'acessorio' || cat === 'acessorio'))) {
            const nome = divItem.dataset.nome; const img = divItem.dataset.imagem; const qtd = divItem.dataset.qtd;
            const row = document.createElement('div'); row.className = 'item-selecao-row'; let imgTag = img ? `<img src="${img}" class="item-selecao-img">` : `<div class="item-selecao-img" style="background:#ccc;"></div>`;
            row.innerHTML = `${imgTag} <div><strong>${nome}</strong> <span style="font-size:0.8rem;">(x${qtd})</span></div>`; row.onclick = () => confirmarSelecaoSlot(nome); listaDiv.appendChild(row); encontrou = true;
        }
    });
    if (!encontrou) { listaDiv.innerHTML += `<div style="padding:10px; text-align:center;">Nenhum item disponível.</div>`; }
    document.getElementById('modal-selecao-equip').style.display = 'flex';
}

function confirmarSelecaoSlot(nomeItem) {
    if (!slotAtualParaSelecao) return;
    if (slotAtualParaSelecao === 'slot-arma1') {
        const itemInv = Array.from(document.querySelectorAll('.inv-item')).find(i => i.dataset.nome === nomeItem);
        if (itemInv && itemInv.dataset.duasmaos === "true") {
            if (slotAssignments['slot-arma2'] && slotAssignments['slot-arma2'] !== 'BLOQUEADO (2 Mãos)') { alert("Desequipe a Mão Esquerda antes!"); return; }
            slotAssignments['slot-arma1'] = nomeItem; slotAssignments['slot-arma2'] = 'BLOQUEADO (2 Mãos)';
            renderizarSlot('slot-arma1', nomeItem); renderizarSlot('slot-arma2', 'BLOQUEADO (2 Mãos)');
            document.getElementById('modal-selecao-equip').style.display = 'none'; salvarAutomaticamente(); return;
        } 
        if (slotAssignments['slot-arma2'] === 'BLOQUEADO (2 Mãos)') { slotAssignments['slot-arma2'] = ''; renderizarSlot('slot-arma2', ''); }
    }
    if (slotAtualParaSelecao === 'slot-arma2') { if (slotAssignments['slot-arma1']) { const arma1 = Array.from(document.querySelectorAll('.inv-item')).find(i => i.dataset.nome === slotAssignments['slot-arma1']); if (arma1 && arma1.dataset.duasmaos === "true") { alert("Mão direita ocupada por arma de 2 mãos!"); return; } } }
    slotAssignments[slotAtualParaSelecao] = nomeItem; renderizarSlot(slotAtualParaSelecao, nomeItem); document.getElementById('modal-selecao-equip').style.display = 'none'; salvarAutomaticamente();
}

function renderizarSlot(idSlot, nomeItem) {
    const slotEl = document.getElementById(idSlot); if(!slotEl) return;
    const imgEl = slotEl.querySelector('.slot-img'); const placeholderEl = slotEl.querySelector('.slot-placeholder');
    const nameDisplay = document.getElementById(idSlot.replace('slot-', 'name-')); const qtdDisplay = document.getElementById(idSlot.replace('slot-', 'qtd-'));
    if (slotEl._tippy) { slotEl._tippy.destroy(); }
    if (nomeItem === 'BLOQUEADO (2 Mãos)') { imgEl.style.display = 'none'; placeholderEl.innerText = "🔒"; placeholderEl.style.display = 'block'; if(nameDisplay) nameDisplay.innerText = "(2 Mãos)"; slotEl.style.backgroundColor = "#331111"; tippy(slotEl, { content: "Slot bloqueado pela arma de duas mãos", theme: 'translucent' }); return; } else { slotEl.style.backgroundColor = ""; }
    if (!nomeItem) { imgEl.style.display = 'none'; placeholderEl.style.display = 'block'; if(idSlot.includes('arma')) placeholderEl.innerText = idSlot.includes('1') ? '⚔️' : '🛡️'; if(idSlot.includes('armadura')) placeholderEl.innerText = '👕'; if(idSlot.includes('acessorio') || idSlot.includes('magico')) placeholderEl.innerText = '💍'; if(idSlot.includes('cons')) placeholderEl.innerText = '🧪'; if(nameDisplay) nameDisplay.innerText = '-'; if(qtdDisplay) qtdDisplay.innerText = '0'; return; }
    const itemInv = Array.from(document.querySelectorAll('.inv-item')).find(i => i.dataset.nome === nomeItem);
    if (itemInv) {
        const imgSrc = itemInv.dataset.imagem; const qtd = itemInv.dataset.qtd; const desc = itemInv.dataset.desc || "Sem descrição"; const raridade = itemInv.dataset.raridade || "Comum"; const extra = itemInv.dataset.extra ? `(${itemInv.dataset.extra})` : ""; const corRaridade = CORES_TEXTO_RARIDADE[raridade] || '#fff';
        if (imgSrc) { imgEl.src = imgSrc; imgEl.style.display = 'block'; placeholderEl.style.display = 'none'; } else { imgEl.style.display = 'none'; placeholderEl.style.display = 'block'; placeholderEl.innerText = "📦"; }
        if(nameDisplay) nameDisplay.innerText = nomeItem; if(qtdDisplay) qtdDisplay.innerText = qtd;
        const htmlTooltip = ` <div style="text-align: center; min-width: 200px; max-width: 300px;"> <strong style="color: var(--cor-destaque); font-size: 1rem; display:block; margin-bottom:2px;">${nomeItem}</strong> <span style="font-size: 0.8rem; color: #ccc;">${extra}</span> <div style="font-size: 0.75rem; color: ${corRaridade}; margin-bottom: 5px; font-weight: bold;">${raridade}</div> <hr style="border-color: #555; margin: 4px 0;"> <div style="font-size: 0.85rem; text-align: left; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; color: #e0e0e0;">${desc}</div> </div> `;
        tippy(slotEl, { content: htmlTooltip, allowHTML: true, theme: 'translucent', animation: 'scale', placement: 'top', maxWidth: 350 });
    } else { if(nameDisplay) nameDisplay.innerText = `${nomeItem} (?)`; tippy(slotEl, { content: "Item não encontrado no inventário", theme: 'translucent' }); }
    
    calcularStatusDerivados(); // GATILHO AUTOMÁTICO
}

function usarConsumivel(idSlot) {
    const nomeItem = slotAssignments[idSlot]; if (!nomeItem) { alert("Vazio!"); return; }
    const itemInv = Array.from(document.querySelectorAll('.inv-item')).find(i => i.dataset.nome === nomeItem);
    if (itemInv) { alterarQtdInventario(itemInv, -1); setTimeout(() => renderizarSlot(idSlot, nomeItem), 100); } else { alert("Item não encontrado!"); }
}

// --- GERAR E APLICAR DADOS ---
function gerarObjetoFicha() {
    const dados = {
        docId: docIdAtual,
        nome: document.getElementById('nome-personagem-input').value,
        cabecalho: {
            talento: document.getElementById('cabecalho-talento').value,
            ascensao: document.getElementById('cabecalho-ascensao').value,
            racial: document.getElementById('cabecalho-racial').value,
            info: document.getElementById('cabecalho-info').value
        },
        imagem: document.getElementById('char-image-display').src,
        imagemCorpo: document.getElementById('full-body-img').src,
        slotAssignments: slotAssignments, 
        titulosPericias: {
            principal: document.getElementById('titulo-principal').value,
            secundaria: document.getElementById('titulo-secundaria').value,
            terciaria: document.getElementById('titulo-terciaria').value
        },
        recursosAtuais: window.recursosAtuais,
        atributos: {}, batalha: {}, batalhaExtras: [], pericias: { principal: [], secundaria: [], terciaria: [] }, skills: [], inventario: [] 
    };
    
    document.querySelectorAll('.atributo-row').forEach(row => { dados.atributos[row.dataset.nome] = { valor: parseInt(row.querySelector('.atributo-input').value) || 0, uso: parseInt(row.querySelector('.treino-contador').innerText) || 0 }; });
    document.querySelectorAll('.batalha-input').forEach(input => { 
        if(!input.closest('.status-extra-wrapper')) { dados.batalha[input.dataset.id] = input.value; }
    });
    document.querySelectorAll('.status-extra-wrapper').forEach(wrapper => {
        const nome = wrapper.querySelector('.status-nome-editavel').value;
        const valor = wrapper.querySelector('.batalha-input').value;
        dados.batalhaExtras.push({ nome, valor });
    });
    ['principal', 'secundaria', 'terciaria'].forEach(cat => { document.getElementById(`pericias-${cat}`).querySelectorAll('.pericia-item').forEach(item => { dados.pericias[cat].push({ nome: item.querySelector('.pericia-nome').value, raridade: item.querySelector('.pericia-raridade').value, custo: item.dataset.custo }); }); });
    document.querySelectorAll('.skill-item').forEach(item => { 
        const mods = []; 
        item.querySelectorAll('.modifier-entry').forEach(entry => { mods.push({ categoria: entry.dataset.category, nome: entry.dataset.modName, rep: parseInt(entry.dataset.repetitions), baseCost: parseFloat(entry.dataset.baseCost) }); }); 
        const isBuffAtivo = item.querySelector('.chk-buff-ativo') ? item.querySelector('.chk-buff-ativo').checked : false;
        dados.skills.push({ nome: item.querySelector('.skill-nome').value, raridade: item.querySelector('.skill-raridade-select').value, tipo: item.dataset.tipo, custoRecurso: item.dataset.recurso, descricao: item.querySelector('.skill-descricao').value, modificadores: mods, isBuffAtivo: isBuffAtivo }); 
    });
    document.querySelectorAll('.inv-item').forEach(item => { 
        dados.inventario.push({ categoria: item.dataset.categoria, raridade: item.dataset.raridade, nome: item.dataset.nome, qtd: item.dataset.qtd, desc: item.dataset.desc, extra: item.dataset.extra, imagem: item.dataset.imagem, duasMaos: item.dataset.duasmaos }); 
    });
    return dados;
}

function aplicarDadosNaTela(dados) {
    if (dados.docId) { docIdAtual = dados.docId; } else { docIdAtual = null; }
    if(dados.nome) document.getElementById('nome-personagem-input').value = dados.nome;
    if(dados.imagem) document.getElementById('char-image-display').src = dados.imagem;
    if(dados.imagemCorpo) document.getElementById('full-body-img').src = dados.imagemCorpo;
    if(dados.titulosPericias) { if(document.getElementById('titulo-principal')) document.getElementById('titulo-principal').value = dados.titulosPericias.principal; if(document.getElementById('titulo-secundaria')) document.getElementById('titulo-secundaria').value = dados.titulosPericias.secundaria; if(document.getElementById('titulo-terciaria')) document.getElementById('titulo-terciaria').value = dados.titulosPericias.terciaria; }
    if(dados.cabecalho) { if(document.getElementById('cabecalho-talento')) document.getElementById('cabecalho-talento').value = dados.cabecalho.talento || ""; if(document.getElementById('cabecalho-ascensao')) document.getElementById('cabecalho-ascensao').value = dados.cabecalho.ascensao || ""; if(document.getElementById('cabecalho-racial')) document.getElementById('cabecalho-racial').value = dados.cabecalho.racial || ""; if(document.getElementById('cabecalho-info')) document.getElementById('cabecalho-info').value = dados.cabecalho.info || ""; document.querySelectorAll('.auto-resize').forEach(el => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }); }
    if (dados.recursosAtuais) { window.recursosAtuais = dados.recursosAtuais; } else { window.recursosAtuais = null; }
    if (dados.atributos) { document.querySelectorAll('.atributo-row').forEach(row => { const nomeAttr = row.dataset.nome; if (dados.atributos[nomeAttr]) { let valor = typeof dados.atributos[nomeAttr] === 'object' ? dados.atributos[nomeAttr].valor : dados.atributos[nomeAttr]; let uso = typeof dados.atributos[nomeAttr] === 'object' ? dados.atributos[nomeAttr].uso : 0; row.querySelector('.atributo-input').value = valor; row.querySelector('.treino-contador').innerText = uso; } }); }
    ['principal', 'secundaria', 'terciaria'].forEach(cat => { const container = document.getElementById(`pericias-${cat}`); container.innerHTML = ''; if(dados.pericias && dados.pericias[cat]) dados.pericias[cat].forEach(p => { const novo = criarPericiaElement(cat, p); container.appendChild(novo); calcularCustoPericia(novo.querySelector('.pericia-raridade')); }); });
    document.getElementById('container-visualizacao').innerHTML = ''; document.getElementById('skills-storage').innerHTML = ''; const storage = document.getElementById('skills-storage'); if(dados.skills) dados.skills.forEach(s => storage.appendChild(criarSkillElement(s))); organizarSkillsVisualmente();
    const invContainer = document.getElementById('inventario-container'); invContainer.innerHTML = ''; if(dados.inventario) { dados.inventario.forEach(item => criarElementoItem(invContainer, item)); }
    if (dados.batalha) { document.querySelectorAll('.batalha-input').forEach(input => { if(input.dataset.id && dados.batalha[input.dataset.id]) input.value = dados.batalha[input.dataset.id]; }); }
    
    const containerExtras = document.getElementById('grid-status-extras');
    if (containerExtras) { containerExtras.innerHTML = ''; if (dados.batalhaExtras && Array.isArray(dados.batalhaExtras)) { dados.batalhaExtras.forEach(item => { adicionarStatusExtra(item.nome, item.valor); }); } }

    if (dados.slotAssignments) { slotAssignments = dados.slotAssignments; renderizarSlotsConsumiveisIniciais(); setTimeout(() => { for (const [id, nome] of Object.entries(slotAssignments)) { renderizarSlot(id, nome); } }, 100); } else { renderizarSlotsConsumiveisIniciais(); }
    mudarAbaInventario('equipado'); 
    setTimeout(() => { atualizarSistemaCompleto(); calcularStatusDerivados(); }, 500);
}

// --- FIREBASE ---
const firebaseConfig = { apiKey: "AIzaSyB4tfFp463ZwSHTW22uiyV35GwdlCEgk8k", authDomain: "ficha-rpg-3112e.firebaseapp.com", projectId: "ficha-rpg-3112e", storageBucket: "ficha-rpg-3112e.firebasestorage.app", messagingSenderId: "1009323913618", appId: "1:1009323913618:web:202ed84838549bf990514b" };
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth(); const db = firebase.firestore(); let usuarioAtual = null;

auth.onAuthStateChanged((user) => { if (user) { usuarioAtual = user; document.getElementById('login-modal').style.display = 'none'; } else { usuarioAtual = null; document.getElementById('login-modal').style.display = 'flex'; } });
window.addEventListener('DOMContentLoaded', () => { carregarDadosAutomaticos(); document.querySelectorAll('input, textarea, select').forEach(el => { el.addEventListener('input', salvarAutomaticamente); el.addEventListener('change', salvarAutomaticamente); }); document.querySelectorAll('.auto-resize').forEach(textarea => { textarea.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px'; }); }); organizarSkillsVisualmente(); atualizarSistemaCompleto(); });

function fazerLogin() { const email = document.getElementById('email-input').value.trim(); const pass = document.getElementById('senha-input').value.trim(); const msg = document.getElementById('msg-erro'); if (!email || !pass) { msg.innerText = "Por favor, preencha E-mail e Senha."; return; } auth.signInWithEmailAndPassword(email, pass).catch((error) => { msg.innerText = "Erro no login: " + error.message; }); }
function criarConta() { const email = document.getElementById('email-input').value.trim(); const pass = document.getElementById('senha-input').value.trim(); const msg = document.getElementById('msg-erro'); if (!email || !pass) { msg.innerText = "Preencha E-mail e Senha."; return; } auth.createUserWithEmailAndPassword(email, pass).catch((error) => { msg.innerText = "Erro ao criar: " + error.message; }); }
function fazerLogout() { auth.signOut(); alert("Desconectado."); }
function abrirModalLogin() { document.getElementById('login-modal').style.display = 'flex'; }
function abrirModalNuvem() { if (!usuarioAtual) { alert("Você precisa estar logado!"); return; } document.getElementById('nuvem-modal').style.display = 'flex'; listarFichasNuvem(); }
function fecharModalNuvem() { document.getElementById('nuvem-modal').style.display = 'none'; }

function salvarNovaFichaNuvem() { 
    if (!usuarioAtual) return; 
    const btn = document.querySelector('#nuvem-modal button'); const txt = btn?btn.innerText:"Salvar"; if(btn) btn.innerText="Processando...";
    const dadosFicha = gerarObjetoFicha(); 
    if (docIdAtual) {
        if (confirm(`Já existe uma versão salva desta ficha na nuvem.\n\nClique OK para SOBREPOR (Atualizar o arquivo existente).\nClique CANCELAR para criar uma NOVA cópia.`)) {
            db.collection("fichas").doc(docIdAtual).update({ nome_personagem: dadosFicha.nome || "Sem Nome", dados: JSON.stringify(dadosFicha), data_atualizacao: firebase.firestore.FieldValue.serverTimestamp() })
            .then(() => { alert("Atualizado!"); salvarAutomaticamente(); listarFichasNuvem(); })
            .catch((error) => { alert("Erro ao atualizar: " + error.message); })
            .finally(() => { if(btn) btn.innerText = txt; });
            return;
        }
    }
    dadosFicha.docId = null; 
    db.collection("fichas").add({ uid_dono: usuarioAtual.uid, nome_personagem: dadosFicha.nome || "Sem Nome", dados: JSON.stringify(dadosFicha), data_atualizacao: firebase.firestore.FieldValue.serverTimestamp() })
    .then((docRef) => { docIdAtual = docRef.id; alert("Salvo na nuvem!"); salvarAutomaticamente(); listarFichasNuvem(); })
    .catch((error) => { alert("Erro ao salvar: " + error.message); })
    .finally(()=>{ if(btn) btn.innerText=txt; }); 
}

function listarFichasNuvem() { 
    const listaDiv = document.getElementById('lista-fichas-nuvem'); listaDiv.innerHTML = "Carregando..."; 
    db.collection("fichas").where("uid_dono", "==", usuarioAtual.uid).orderBy("data_atualizacao", "desc").get()
    .then((querySnapshot) => { renderizarListaNuvem(querySnapshot); })
    .catch((error) => { 
        console.warn("Falha na ordenação, tentando sem ordem...", error);
        db.collection("fichas").where("uid_dono", "==", usuarioAtual.uid).get()
        .then((q2) => { renderizarListaNuvem(q2); }).catch((e2) => { listaDiv.innerHTML = "Erro ao listar: " + e2.message; });
    }); 
}

function renderizarListaNuvem(querySnapshot) {
    const listaDiv = document.getElementById('lista-fichas-nuvem'); listaDiv.innerHTML = ""; 
    if (querySnapshot.empty) { listaDiv.innerHTML = "<p>Nenhuma ficha salva.</p>"; return; } 
    querySnapshot.forEach((doc) => { 
        const ficha = doc.data(); const idDoc = doc.id; 
        let dataStr = "S/ Data"; if (ficha.data_atualizacao && ficha.data_atualizacao.toDate) { dataStr = ficha.data_atualizacao.toDate().toLocaleString('pt-BR'); } 
        const item = document.createElement('div'); item.style.cssText = "border-bottom:1px solid #aaa; padding:10px; display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.2); margin-bottom:5px;";
        item.innerHTML = ` <div><strong style="color:var(--cor-destaque); display:block;">${ficha.nome_personagem}</strong><span style="font-size:0.75rem;">${dataStr}</span></div> <div> <button class="mod-btn compact-btn" onclick="carregarDaNuvem('${idDoc}')" style="color:green; border-color:green;">Abrir</button> <button class="mod-btn compact-btn" onclick="deletarDaNuvem('${idDoc}')" style="color:red; border-color:red;">X</button> </div> `; 
        listaDiv.appendChild(item); 
    }); 
}

function carregarDaNuvem(idDoc) { 
    if(!confirm("Substituir ficha atual?")) return;
    db.collection("fichas").doc(idDoc).get().then((doc) => { 
        if (doc.exists) { 
            try { 
                const dados = JSON.parse(doc.data().dados); dados.docId = idDoc; aplicarDadosNaTela(dados); salvarAutomaticamente(); fecharModalNuvem(); alert("Carregado!"); 
            } catch(e) { alert("Erro ao ler dados: " + e.message); }
        } 
    }).catch(e => alert("Erro conexão: " + e.message)); 
}
function deletarDaNuvem(idDoc) { if(confirm("Apagar da nuvem?")) { db.collection("fichas").doc(idDoc).delete().then(() => listarFichasNuvem()); } }

// --- EXPORTAR / IMPORTAR / D20 ---
function baixarFicha() { const dados = gerarObjetoFicha(); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" })); a.download = (dados.nome || "Ficha") + ".json"; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
function carregarFicha(event) { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(e) { try { const dados = JSON.parse(e.target.result); aplicarDadosNaTela(dados); salvarAutomaticamente(); alert("Ficha carregada com sucesso!"); } catch (err) { console.error(err); alert("Erro ao ler o arquivo JSON: " + err.message); } }; reader.readAsText(file); }
function rolarD20() { const resultado = Math.floor(Math.random() * 20) + 1; let msg = ""; if (resultado === 20) msg = " (CRÍTICO!)"; else if (resultado === 1) msg = " (FALHA!)"; alert(`🎲 Resultado D20: ${resultado}${msg}`); }
async function gerarImagemIA() {
    const nome = document.getElementById('modal-inv-nome').value; const descGeral = document.getElementById('modal-inv-desc').value; const descVisual = document.getElementById('modal-img-prompt') ? document.getElementById('modal-img-prompt').value : ""; const tipo = document.getElementById('modal-inv-categoria').value; const btn = document.getElementById('btn-gerar-ia');
    if (!nome) { alert("Digite o Nome do item primeiro!"); return; } const textoOriginal = btn.innerText; btn.innerText = "⏳ Criando..."; btn.disabled = true; let textoParaIA = ""; if (descVisual && descVisual.trim() !== "") { textoParaIA = descVisual; } else { textoParaIA = `${nome}, ${descGeral}`; } const promptBase = `RPG item icon, ${tipo}, ${textoParaIA}, white background, fantasy art style, high quality, 2d game asset, no text, centered, full color`; const promptEncoded = encodeURIComponent(promptBase); const seed = Math.floor(Math.random() * 999999); const url = `https://image.pollinations.ai/prompt/${promptEncoded}?width=256&height=256&seed=${seed}&model=nanobanana-pro&nologo=true`;
    try { const response = await fetch(url); if (!response.ok) throw new Error("Erro na API"); const blob = await response.blob(); const reader = new FileReader(); reader.onloadend = function() { redimensionarImagem(new File([blob], "ia.jpg"), 150, (base64) => { tempItemImage = base64; mostrarPreview(tempItemImage); finalizarBotao(btn, textoOriginal); }); }; reader.readAsDataURL(blob); } catch (error) { tempItemImage = url; mostrarPreview(url); finalizarBotao(btn, textoOriginal); }
}
function mostrarPreview(src) { const imgPreview = document.getElementById('modal-img-preview'); const boxPreview = document.getElementById('modal-img-preview-box'); imgPreview.src = src; boxPreview.style.display = 'flex'; }
function finalizarBotao(btn, texto) { btn.innerText = texto; btn.disabled = false; }
function atualizarGrafico() { const ctx = document.getElementById('graficoAtributos'); if (!ctx) return; const dados = [ getAttrValue("Forca"), getAttrValue("Destreza"), getAttrValue("Agilidade"), getAttrValue("Resistencia"), getAttrValue("Espírito"), getAttrValue("Carisma"), getAttrValue("Inteligencia") ]; if (graficoInstance) { graficoInstance.data.datasets[0].data = dados; graficoInstance.update(); return; } graficoInstance = new Chart(ctx, { type: 'radar', data: { labels: ['FOR', 'DES', 'AGI', 'RES', 'ESP', 'CAR', 'INT'], datasets: [{ label: 'Nível', data: dados, backgroundColor: 'rgba(139, 0, 0, 0.4)', borderColor: '#8B0000', borderWidth: 2, pointBackgroundColor: '#B8860B', pointBorderColor: '#2E2315' }] }, options: { scales: { r: { angleLines: { color: 'rgba(0,0,0,0.2)' }, grid: { color: 'rgba(0,0,0,0.1)' }, pointLabels: { color: '#5c0a0a', font: { size: 12, family: 'Cinzel' } }, ticks: { display: false }, suggestedMin: 0, suggestedMax: 10 } }, plugins: { legend: { display: false } } } }); }
function gerarPDF() { const elemento = document.querySelector(".container"); const opt = { margin: [5, 5, 5, 5], filename: 'Grimorio.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, backgroundColor: '#e3dcd2', useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }; html2pdf().set(opt).from(elemento).save(); }