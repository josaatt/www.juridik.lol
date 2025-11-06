// Flowchart Admin Panel JavaScript
// Handles configuration, editing, and Mermaid export

// Default Configuration
const DEFAULT_CONFIG = {
    variables: [
        {
            id: 'skadebelopp',
            label: 'Skadebelopp (kr)',
            icon: 'euro-sign',
            type: 'range',
            min: 0,
            max: 100000,
            step: 5000,
            default: 50000,
            unit: 'kr'
        },
        {
            id: 'tidsperiod',
            label: 'Tidsperiod (månader)',
            icon: 'clock',
            type: 'range',
            min: 1,
            max: 24,
            step: 1,
            default: 6,
            unit: 'mån'
        },
        {
            id: 'komplexitet',
            label: 'Komplexitet',
            icon: 'project-diagram',
            type: 'select',
            options: [
                { value: 'enkel', label: 'Enkel' },
                { value: 'medel', label: 'Medel' },
                { value: 'komplex', label: 'Komplex' }
            ],
            default: 'medel'
        },
        {
            id: 'dokumentation',
            label: 'Dokumentation fullständig?',
            icon: 'file-alt',
            type: 'checkbox',
            default: true
        }
    ],
    nodes: [
        { id: 'Start', text: 'Juridiskt Ärende Inleds', type: 'start' },
        { id: 'CheckDoc', text: 'Dokumentation Komplett?', type: 'decision' },
        { id: 'CheckAmount', text: 'Belopp över 50 000 kr?', type: 'decision' },
        { id: 'CheckComplex', text: 'Hög Komplexitet?', type: 'decision' },
        { id: 'Expert', text: 'Expertutredning Krävs', type: 'standard' },
        { id: 'Court', text: 'Domstolsprocess', type: 'standard' },
        { id: 'Negotiate', text: 'Förhandling', type: 'standard' },
        { id: 'Settlement', text: 'Uppgörelse', type: 'standard' },
        { id: 'SimplePath', text: 'Förenklad Process', type: 'standard' },
        { id: 'QuickSettle', text: 'Snabb Uppgörelse', type: 'standard' },
        { id: 'GatherDocs', text: 'Samla Dokumentation', type: 'standard' },
        { id: 'Timeline', text: 'Tid kvar?', type: 'decision' },
        { id: 'Review', text: 'Granskning', type: 'standard' },
        { id: 'Proceed', text: 'Fortsätt Process', type: 'standard' },
        { id: 'Urgent', text: 'Brådskande Åtgärd', type: 'standard' },
        { id: 'FastTrack', text: 'Snabbspår', type: 'standard' },
        { id: 'End', text: 'Avgörande/Avslut', type: 'end' }
    ]
};

// Application State
let config = JSON.parse(JSON.stringify(DEFAULT_CONFIG)); // Deep copy
let currentValues = {};
let editingVariableIndex = -1;
let editingNodeIndex = -1;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadConfigFromStorage();
    initializeCurrentValues();
    renderVariables();
    renderNodes();
    updatePreview();
    setupEventListeners();
});

// ===== INITIALIZATION =====

function initializeCurrentValues() {
    currentValues = {};
    config.variables.forEach(variable => {
        currentValues[variable.id] = variable.default;
    });
}

function loadConfigFromStorage() {
    const stored = localStorage.getItem('flowchartConfig');
    if (stored) {
        try {
            config = JSON.parse(stored);
            addLog('Konfiguration laddad från localStorage');
        } catch (e) {
            console.error('Failed to load config from storage', e);
        }
    }
}

function saveConfigToStorage() {
    localStorage.setItem('flowchartConfig', JSON.stringify(config));
    addLog('Konfiguration sparad till localStorage');
}

// ===== RENDERING =====

function renderVariables() {
    const container = document.getElementById('variablesList');
    container.innerHTML = '';

    config.variables.forEach((variable, index) => {
        const card = document.createElement('div');
        card.className = 'variable-card';
        card.innerHTML = `
            <div class="variable-header">
                <div class="variable-info">
                    <i class="fas fa-${variable.icon}"></i>
                    <strong>${variable.label}</strong>
                    <span class="variable-type">${getTypeLabel(variable.type)}</span>
                </div>
                <div class="variable-actions">
                    <button class="btn-icon" onclick="editVariable(${index})" title="Redigera">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteVariable(${index})" title="Ta bort">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="variable-details">
                <span>ID: <code>${variable.id}</code></span>
                ${variable.min !== undefined ? `<span>Range: ${variable.min} - ${variable.max}</span>` : ''}
                ${variable.options ? `<span>Alternativ: ${variable.options.length}</span>` : ''}
                <span>Default: <code>${variable.default}</code></span>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderNodes() {
    const container = document.getElementById('nodesList');
    container.innerHTML = '';

    config.nodes.forEach((node, index) => {
        const card = document.createElement('div');
        card.className = 'node-card';
        card.innerHTML = `
            <div class="node-header">
                <div class="node-info">
                    <strong>${node.id}</strong>
                    <span class="node-type">${getNodeTypeLabel(node.type)}</span>
                </div>
                <div class="node-actions">
                    <button class="btn-icon" onclick="editNode(${index})" title="Redigera">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteNode(${index})" title="Ta bort">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="node-text">${node.text}</div>
        `;
        container.appendChild(card);
    });
}

function getTypeLabel(type) {
    const labels = {
        'range': 'Slider',
        'select': 'Dropdown',
        'checkbox': 'Toggle',
        'text': 'Text',
        'number': 'Nummer'
    };
    return labels[type] || type;
}

function getNodeTypeLabel(type) {
    const labels = {
        'start': 'Start',
        'end': 'Slut',
        'decision': 'Beslut',
        'standard': 'Standard'
    };
    return labels[type] || type;
}

// ===== VARIABLE CRUD =====

function addVariable() {
    editingVariableIndex = -1;
    document.getElementById('modalTitle').textContent = 'Lägg till Variabel';
    clearVariableForm();
    showModal('variableModal');
}

function editVariable(index) {
    editingVariableIndex = index;
    const variable = config.variables[index];
    document.getElementById('modalTitle').textContent = 'Redigera Variabel';

    document.getElementById('varId').value = variable.id;
    document.getElementById('varLabel').value = variable.label;
    document.getElementById('varIcon').value = variable.icon;
    document.getElementById('varType').value = variable.type;
    document.getElementById('varDefault').value = variable.default;
    document.getElementById('varUnit').value = variable.unit || '';

    if (variable.type === 'range') {
        document.getElementById('varMin').value = variable.min;
        document.getElementById('varMax').value = variable.max;
        document.getElementById('varStep').value = variable.step;
    } else if (variable.type === 'select') {
        document.getElementById('varOptions').value = JSON.stringify(variable.options, null, 2);
    }

    updateVariableFormVisibility();
    showModal('variableModal');
}

function deleteVariable(index) {
    if (confirm(`Vill du verkligen ta bort variabeln "${config.variables[index].label}"?`)) {
        config.variables.splice(index, 1);
        renderVariables();
        saveConfigToStorage();
        updatePreview();
        addLog(`Variabel borttagen`);
    }
}

function saveVariable() {
    const variable = {
        id: document.getElementById('varId').value,
        label: document.getElementById('varLabel').value,
        icon: document.getElementById('varIcon').value,
        type: document.getElementById('varType').value,
        default: getDefaultValue()
    };

    const unit = document.getElementById('varUnit').value;
    if (unit) variable.unit = unit;

    if (variable.type === 'range') {
        variable.min = parseInt(document.getElementById('varMin').value);
        variable.max = parseInt(document.getElementById('varMax').value);
        variable.step = parseInt(document.getElementById('varStep').value);
    } else if (variable.type === 'select') {
        try {
            variable.options = JSON.parse(document.getElementById('varOptions').value);
        } catch (e) {
            alert('Ogiltigt JSON-format för alternativ');
            return;
        }
    }

    if (editingVariableIndex >= 0) {
        config.variables[editingVariableIndex] = variable;
        addLog(`Variabel "${variable.label}" uppdaterad`);
    } else {
        config.variables.push(variable);
        addLog(`Variabel "${variable.label}" tillagd`);
    }

    renderVariables();
    saveConfigToStorage();
    updatePreview();
    hideModal('variableModal');
}

function getDefaultValue() {
    const type = document.getElementById('varType').value;
    const defaultInput = document.getElementById('varDefault').value;

    if (type === 'checkbox') {
        return defaultInput.toLowerCase() === 'true';
    } else if (type === 'range' || type === 'number') {
        return parseFloat(defaultInput) || 0;
    }
    return defaultInput;
}

function clearVariableForm() {
    document.getElementById('varId').value = '';
    document.getElementById('varLabel').value = '';
    document.getElementById('varIcon').value = '';
    document.getElementById('varType').value = 'range';
    document.getElementById('varDefault').value = '';
    document.getElementById('varUnit').value = '';
    document.getElementById('varMin').value = '0';
    document.getElementById('varMax').value = '100';
    document.getElementById('varStep').value = '1';
    document.getElementById('varOptions').value = '';
    updateVariableFormVisibility();
}

function updateVariableFormVisibility() {
    const type = document.getElementById('varType').value;
    document.getElementById('rangeOptions').style.display = type === 'range' ? 'block' : 'none';
    document.getElementById('selectOptions').style.display = type === 'select' ? 'block' : 'none';
}

// ===== NODE CRUD =====

function addNode() {
    editingNodeIndex = -1;
    document.getElementById('nodeModalTitle').textContent = 'Lägg till Nod';
    clearNodeForm();
    showModal('nodeModal');
}

function editNode(index) {
    editingNodeIndex = index;
    const node = config.nodes[index];
    document.getElementById('nodeModalTitle').textContent = 'Redigera Nod';

    document.getElementById('nodeId').value = node.id;
    document.getElementById('nodeText').value = node.text;
    document.getElementById('nodeType').value = node.type;

    showModal('nodeModal');
}

function deleteNode(index) {
    if (confirm(`Vill du verkligen ta bort noden "${config.nodes[index].id}"?`)) {
        config.nodes.splice(index, 1);
        renderNodes();
        saveConfigToStorage();
        updatePreview();
        addLog(`Nod borttagen`);
    }
}

function saveNode() {
    const node = {
        id: document.getElementById('nodeId').value,
        text: document.getElementById('nodeText').value,
        type: document.getElementById('nodeType').value
    };

    if (editingNodeIndex >= 0) {
        config.nodes[editingNodeIndex] = node;
        addLog(`Nod "${node.id}" uppdaterad`);
    } else {
        config.nodes.push(node);
        addLog(`Nod "${node.id}" tillagd`);
    }

    renderNodes();
    saveConfigToStorage();
    updatePreview();
    hideModal('nodeModal');
}

function clearNodeForm() {
    document.getElementById('nodeId').value = '';
    document.getElementById('nodeText').value = '';
    document.getElementById('nodeType').value = 'standard';
}

// ===== MERMAID GENERATION =====

function generateMermaidCode(values = currentValues) {
    // Use the same logic as flowchart-script.js
    const skadebelopp = values.skadebelopp || 50000;
    const tidsperiod = values.tidsperiod || 6;
    const komplexitet = values.komplexitet || 'medel';
    const dokumentation = values.dokumentation !== undefined ? values.dokumentation : true;

    const highAmount = skadebelopp > 50000;
    const longPeriod = tidsperiod > 12;
    const isComplex = komplexitet === 'komplex';

    let flowchart = `flowchart TD
    Start([Juridiskt Ärende Inleds])
    Start --> Info[Skadebelopp: ${formatCurrency(skadebelopp)} kr<br/>Tidsperiod: ${tidsperiod} mån<br/>Komplexitet: ${komplexitet.charAt(0).toUpperCase() + komplexitet.slice(1)}]

    Info --> CheckDoc{Dokumentation<br/>Komplett?}`;

    if (dokumentation) {
        flowchart += `
    CheckDoc -->|Ja| CheckAmount{Belopp över<br/>50 000 kr?}`;

        if (highAmount) {
            flowchart += `
    CheckAmount -->|Ja ${formatCurrency(skadebelopp)} kr| CheckComplex{Hög<br/>Komplexitet?}`;

            if (isComplex) {
                flowchart += `
    CheckComplex -->|Ja| Expert[Expertutredning<br/>Krävs]
    Expert --> Court[Domstolsprocess]`;
            } else {
                flowchart += `
    CheckComplex -->|Nej| Negotiate[Förhandling]
    Negotiate --> Settlement[Uppgörelse]`;
            }
        } else {
            flowchart += `
    CheckAmount -->|Nej ${formatCurrency(skadebelopp)} kr| SimplePath[Förenklad<br/>Process]
    SimplePath --> QuickSettle[Snabb Uppgörelse]`;
        }
    } else {
        flowchart += `
    CheckDoc -->|Nej| GatherDocs[Samla<br/>Dokumentation]
    GatherDocs --> Timeline{Tid kvar?}`;

        if (longPeriod) {
            flowchart += `
    Timeline -->|Ja ${tidsperiod} mån| Review[Granskning]
    Review --> Proceed[Fortsätt Process]`;
        } else {
            flowchart += `
    Timeline -->|Nej ${tidsperiod} mån| Urgent[Brådskande<br/>Åtgärd]
    Urgent --> FastTrack[Snabbspår]`;
        }
    }

    const estimatedTime = calculateEstimatedTime(skadebelopp, komplexitet, dokumentation);
    flowchart += `

    CheckAmount -.->|Uppskattad tid| TimeEst[${estimatedTime}]
    CheckDoc -.->|Uppskattad tid| TimeEst`;

    if (dokumentation && highAmount && isComplex) {
        flowchart += `
    Court --> End([Avgörande])`;
    } else if (dokumentation && highAmount) {
        flowchart += `
    Settlement --> End([Avslut])`;
    } else if (dokumentation) {
        flowchart += `
    QuickSettle --> End([Avslut])`;
    } else if (longPeriod) {
        flowchart += `
    Proceed --> End([Fortsättning])`;
    } else {
        flowchart += `
    FastTrack --> End([Fortsättning])`;
    }

    flowchart += `

    style Start fill:#ff2afc,stroke:#00ffd9,stroke-width:3px,color:#fff
    style End fill:#00ffd9,stroke:#ff2afc,stroke-width:3px,color:#000
    style Info fill:#a200ff,stroke:#00ffd9,stroke-width:2px,color:#fff
    style TimeEst fill:#1a1a1a,stroke:#00ffd9,stroke-width:2px,color:#00ffd9`;

    return flowchart;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('sv-SE', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function calculateEstimatedTime(skadebelopp, komplexitet, dokumentation) {
    let baseTime = 3;
    if (skadebelopp > 50000) baseTime += 3;
    if (komplexitet === 'komplex') baseTime += 4;
    if (komplexitet === 'medel') baseTime += 2;
    if (!dokumentation) baseTime += 2;
    return `${baseTime}-${baseTime + 3} månader`;
}

// ===== PREVIEW =====

async function updatePreview() {
    const previewElement = document.getElementById('previewMermaid');
    const mermaidCode = generateMermaidCode(currentValues);

    try {
        previewElement.removeAttribute('data-processed');
        previewElement.textContent = mermaidCode;

        if (window.mermaid) {
            await window.mermaid.run({
                querySelector: '#previewMermaid'
            });
        }
    } catch (error) {
        console.error('Preview error:', error);
        previewElement.textContent = 'Fel vid rendering. Kontrollera konfigurationen.';
    }
}

// ===== EXPORT FUNCTIONS =====

function exportCurrent() {
    const mermaidCode = generateMermaidCode(currentValues);
    const blob = new Blob([mermaidCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart-current.mmd';
    a.click();
    URL.revokeObjectURL(url);
    addLog('Nuvarande scenario exporterat som .mmd');
}

async function exportAll() {
    addLog('Genererar alla scenarios...');

    const zip = new JSZip();
    const scenarios = generateAllScenarios();

    scenarios.forEach((scenario, index) => {
        const mermaidCode = generateMermaidCode(scenario.values);
        zip.file(`scenario-${index + 1}-${scenario.name}.mmd`, mermaidCode);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'flowchart-all-scenarios.zip');
    addLog(`${scenarios.length} scenarios exporterade som .zip`);
}

function generateAllScenarios() {
    const scenarios = [];

    // Generate combinations based on variables
    // For simplicity, we'll generate key scenarios
    const skadebeloppValues = [25000, 75000];
    const tidsperiodValues = [6, 18];
    const komplexitetValues = ['enkel', 'medel', 'komplex'];
    const dokumentationValues = [true, false];

    skadebeloppValues.forEach(skadebelopp => {
        tidsperiodValues.forEach(tidsperiod => {
            komplexitetValues.forEach(komplexitet => {
                dokumentationValues.forEach(dokumentation => {
                    scenarios.push({
                        name: `${skadebelopp}-${tidsperiod}m-${komplexitet}-dok${dokumentation}`,
                        values: { skadebelopp, tidsperiod, komplexitet, dokumentation }
                    });
                });
            });
        });
    });

    return scenarios;
}

function exportConfig() {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart-config.json';
    a.click();
    URL.revokeObjectURL(url);
    addLog('Konfiguration exporterad som .json');
}

function copyMermaidToClipboard() {
    const mermaidCode = generateMermaidCode(currentValues);
    navigator.clipboard.writeText(mermaidCode).then(() => {
        addLog('Mermaid-kod kopierad till urklipp!');
        alert('Mermaid-kod kopierad till urklipp!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        addLog('Fel vid kopiering till urklipp');
    });
}

// ===== CONFIG MANAGEMENT =====

function saveConfig() {
    saveConfigToStorage();
    exportConfig();
}

function loadConfig() {
    document.getElementById('loadConfigInput').click();
}

function handleLoadConfig(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            config = JSON.parse(e.target.result);
            saveConfigToStorage();
            initializeCurrentValues();
            renderVariables();
            renderNodes();
            updatePreview();
            addLog('Konfiguration importerad från fil');
        } catch (error) {
            alert('Fel vid läsning av konfigurationsfil');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

function resetToDefault() {
    if (confirm('Vill du verkligen återställa till standardkonfiguration? All anpassad data går förlorad.')) {
        config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        saveConfigToStorage();
        initializeCurrentValues();
        renderVariables();
        renderNodes();
        updatePreview();
        addLog('Återställt till standardkonfiguration');
    }
}

// ===== MODALS =====

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ===== LOGGING =====

function addLog(message) {
    const logContainer = document.getElementById('exportLog');
    if (logContainer.querySelector('.log-empty')) {
        logContainer.innerHTML = '';
    }

    const timestamp = new Date().toLocaleTimeString('sv-SE');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `<span class="log-time">${timestamp}</span> ${message}`;
    logContainer.insertBefore(logEntry, logContainer.firstChild);
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Variables
    document.getElementById('addVariableBtn').addEventListener('click', addVariable);
    document.getElementById('saveVariableBtn').addEventListener('click', saveVariable);
    document.getElementById('cancelModalBtn').addEventListener('click', () => hideModal('variableModal'));
    document.getElementById('closeModalBtn').addEventListener('click', () => hideModal('variableModal'));
    document.getElementById('varType').addEventListener('change', updateVariableFormVisibility);

    // Nodes
    document.getElementById('addNodeBtn').addEventListener('click', addNode);
    document.getElementById('saveNodeBtn').addEventListener('click', saveNode);
    document.getElementById('cancelNodeModalBtn').addEventListener('click', () => hideModal('nodeModal'));
    document.getElementById('closeNodeModalBtn').addEventListener('click', () => hideModal('nodeModal'));

    // Actions
    document.getElementById('saveConfigBtn').addEventListener('click', saveConfig);
    document.getElementById('loadConfigBtn').addEventListener('click', loadConfig);
    document.getElementById('loadConfigInput').addEventListener('change', handleLoadConfig);
    document.getElementById('resetToDefaultBtn').addEventListener('click', resetToDefault);

    // Preview
    document.getElementById('refreshPreviewBtn').addEventListener('click', updatePreview);

    // Export
    document.getElementById('exportCurrentBtn').addEventListener('click', exportCurrent);
    document.getElementById('exportAllBtn').addEventListener('click', exportAll);
    document.getElementById('exportConfigBtn').addEventListener('click', exportConfig);
    document.getElementById('copyMermaidBtn').addEventListener('click', copyMermaidToClipboard);

    // Modal close on outside click
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Make functions globally accessible
window.editVariable = editVariable;
window.deleteVariable = deleteVariable;
window.editNode = editNode;
window.deleteNode = deleteNode;
