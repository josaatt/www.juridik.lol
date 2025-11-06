// Flowchart Interactive Logic
let currentValues = {
    skadebelopp: 50000,
    tidsperiod: 6,
    komplexitet: 'medel',
    dokumentation: true
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeControls();
    updateFlowchart();
});

function initializeControls() {
    // Skadebelopp slider
    const skadebeloppInput = document.getElementById('skadebeloppInput');
    const skadebeloppValue = document.getElementById('skadebeloppValue');

    skadebeloppInput.addEventListener('input', function() {
        currentValues.skadebelopp = parseInt(this.value);
        skadebeloppValue.textContent = formatCurrency(currentValues.skadebelopp);
        updateFlowchart();
    });

    // Tidsperiod slider
    const tidsperiodInput = document.getElementById('tidsperiodInput');
    const tidsperiodValue = document.getElementById('tidsperiodValue');

    tidsperiodInput.addEventListener('input', function() {
        currentValues.tidsperiod = parseInt(this.value);
        tidsperiodValue.textContent = this.value;
        updateFlowchart();
    });

    // Komplexitet select
    const komplexitetInput = document.getElementById('komplexitetInput');
    const komplexitetValue = document.getElementById('komplexitetValue');

    komplexitetInput.addEventListener('change', function() {
        currentValues.komplexitet = this.value;
        const displayText = {
            'enkel': 'Enkel',
            'medel': 'Medel',
            'komplex': 'Komplex'
        };
        komplexitetValue.textContent = displayText[this.value];
        updateFlowchart();
    });

    // Dokumentation toggle
    const dokumentationInput = document.getElementById('dokumentationInput');
    const dokumentationText = document.getElementById('dokumentationText');

    dokumentationInput.addEventListener('change', function() {
        currentValues.dokumentation = this.checked;
        dokumentationText.textContent = this.checked ? 'Ja' : 'Nej';
        updateFlowchart();
    });

    // Reset button
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', function() {
        resetToDefaults();
    });
}

function resetToDefaults() {
    currentValues = {
        skadebelopp: 50000,
        tidsperiod: 6,
        komplexitet: 'medel',
        dokumentation: true
    };

    document.getElementById('skadebeloppInput').value = 50000;
    document.getElementById('skadebeloppValue').textContent = formatCurrency(50000);

    document.getElementById('tidsperiodInput').value = 6;
    document.getElementById('tidsperiodValue').textContent = '6';

    document.getElementById('komplexitetInput').value = 'medel';
    document.getElementById('komplexitetValue').textContent = 'Medel';

    document.getElementById('dokumentationInput').checked = true;
    document.getElementById('dokumentationText').textContent = 'Ja';

    updateFlowchart();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('sv-SE', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function generateFlowchartDefinition() {
    const { skadebelopp, tidsperiod, komplexitet, dokumentation } = currentValues;

    // Determine decision paths based on values
    const highAmount = skadebelopp > 50000;
    const longPeriod = tidsperiod > 12;
    const isComplex = komplexitet === 'komplex';

    // Build decision tree
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

    // Add time estimation
    const estimatedTime = calculateEstimatedTime();
    flowchart += `

    CheckAmount -.->|Uppskattad tid| TimeEst[${estimatedTime}]
    CheckDoc -.->|Uppskattad tid| TimeEst`;

    // Final nodes
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

    // Styling
    flowchart += `

    style Start fill:#ff2afc,stroke:#00ffd9,stroke-width:3px,color:#fff
    style End fill:#00ffd9,stroke:#ff2afc,stroke-width:3px,color:#000
    style Info fill:#a200ff,stroke:#00ffd9,stroke-width:2px,color:#fff
    style TimeEst fill:#1a1a1a,stroke:#00ffd9,stroke-width:2px,color:#00ffd9`;

    return flowchart;
}

function calculateEstimatedTime() {
    const { skadebelopp, komplexitet, dokumentation } = currentValues;

    let baseTime = 3; // months

    if (skadebelopp > 50000) baseTime += 3;
    if (komplexitet === 'komplex') baseTime += 4;
    if (komplexitet === 'medel') baseTime += 2;
    if (!dokumentation) baseTime += 2;

    return `${baseTime}-${baseTime + 3} månader`;
}

async function updateFlowchart() {
    const flowchartElement = document.getElementById('flowchart');
    const definition = generateFlowchartDefinition();

    try {
        // Clear previous content
        flowchartElement.removeAttribute('data-processed');
        flowchartElement.textContent = definition;

        // Re-render with Mermaid
        if (window.mermaid) {
            await window.mermaid.run({
                querySelector: '#flowchart'
            });
        }
    } catch (error) {
        console.error('Error rendering flowchart:', error);
        flowchartElement.textContent = 'Fel vid rendering av flödesschema. Försök igen.';
    }
}
