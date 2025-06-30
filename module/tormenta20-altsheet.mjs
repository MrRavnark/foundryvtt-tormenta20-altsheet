// Código para o módulo JavaScript principal da ficha
// Caminho: module/tormenta20-altsheet.mjs

// Define a classe da sua ficha alternativa, estendendo a classe base ActorSheet do Foundry.
// ActorSheet, Hooks, CONFIG, DocumentSheetConfig, Actor, ui.windows são objetos globais do Foundry VTT.
// foundry.utils.mergeObject é a forma explícita de acessar mergeObject.

class Tormenta20AltSheet extends ActorSheet {
    /**
     * Retorna as opções padrão da ficha.
     */
    static get defaultOptions() {
        // Usa foundry.utils.mergeObject para maior compatibilidade.
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["tormenta20-altsheet", "sheet", "actor"],
            template: "modules/tormenta20-altsheet/templates/tormenta20-altsheet.hbs",
            width: 900,
            height: 700,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }],
        });
    }

    /**
     * Prepara os dados a serem enviados para o template HBS.
     */
    getData() {
        const data = super.getData(); 

        // --- Lógica para aplicar o tema ---
        let selectedThemeId = "default"; 
        if (this.options.id === "tormenta20-altsheet-dark") {
            selectedThemeId = "dark";
        } else if (this.options.id === "tormenta20-altsheet-light") {
            selectedThemeId = "light";
        }

        if (CONFIG.tormenta20AltSheet && CONFIG.tormenta20AltSheet.themes && CONFIG.tormenta20AltSheet.themes[selectedThemeId]) {
            data.actor.system.activeThemeClass = CONFIG.tormenta20AltSheet.themes[selectedThemeId].cssClass;
        } else {
            data.actor.system.activeThemeClass = CONFIG.tormenta20AltSheet.themes.default.cssClass;
        }

        // --- Puxando dados do sistema Tormenta20 (FOCO AQUI!) ---
        // Usando os caminhos DEFINITIVOS do arquivo de configuração T20 e do system.json
        const systemData = data.actor.system; // Referência para facilitar o acesso

        // Passa o objeto T20 global para o HBS para acessar labels e definições
        data.T20 = globalThis.T20; 

        // Detalhes do Personagem (Raça, Origem, Classe)
        data.detalhes = {
            raca: systemData.details?.raca?.value || "", 
            origem: systemData.details?.origem?.value || "",
            classe: systemData.details?.classe?.value || "" 
        };

        // Atributos (FOR, DES, CON, INT, SAB, CAR, PV, PM, Defesa)
        // Combinando a definição do T20.atributos com os valores do ator
        data.atributos = {};
        for (const key in globalThis.T20.atributos) { // Itera sobre FOR, DES, CON, etc.
            const attrDef = globalThis.T20.atributos[key];
            const attrData = systemData.attributes?.[key] || {};
            data.atributos[key] = {
                label: attrDef, // Ex: "T20.AbilityStr"
                value: attrData.value || 0,
                mod: attrData.mod || 0
            };
        }
        // Adiciona PV, PM, Defesa diretamente
        data.atributos.pv = systemData.attributes?.pv || { value: 0, max: 0 };
        data.atributos.pm = systemData.attributes?.pm || { value: 0, max: 0 };
        data.atributos.defesa = systemData.attributes?.defesa || { value: 0 };

        // Perícias
        // Combinando a definição do T20.pericias com os valores do ator
        data.pericias = {};
        for (const key in globalThis.T20.pericias) { // Itera sobre acro, ades, etc.
            const periciaDef = globalThis.T20.pericias[key];
            const periciaData = systemData.skills?.[key] || {};
            data.pericias[key] = {
                label: periciaDef.label, // Ex: "T20.SkillAcro"
                value: periciaData.value || 0,
                mod: periciaData.mod || 0,
                bonus: periciaData.bonus || 0 // Puxa o bônus também
            };
        }

        // Outras características (Tamanho, Deslocamento, Resistências, Imunidade, Sentidos)
        data.caracteristicas = {
            tamanho: systemData.details?.tamanho?.value || "", 
            deslocamento: systemData.attributes?.deslocamento?.value || "", 
            resistencias: systemData.resistencias || {}, 
            imunidades: systemData.imunidades || {}, 
            sentidos: systemData.sentidos || {} 
        };

        // Proficiências
        data.proficiencias = {
            armas: systemData.proficiencias?.armas || {}, 
            armaduras: systemData.proficiencias?.armaduras || {} 
        };

        return data;
    }

    /**
     * Adiciona listeners de evento à ficha.
     */
    activateListeners(html) {
        super.activateListeners(html); 

        // Exemplo de como adicionar um listener de evento:
        // html.find('.my-button-class').click(this._onMyButtonClick.bind(this));
    }

    // Exemplo de método de callback para um listener
    // _onMyButtonClick(event) {
    //     event.preventDefault();
    //     console.log("Botão clicado!");
    //     // Adicione sua lógica aqui
    // }
}

// Hook 'init': Executa quando o Foundry é inicializado.
Hooks.once("init", () => {
    console.log("tormenta20-altsheet | Inicializando Módulo de Ficha Alternativa");

    const templatePaths = [
        "modules/tormenta20-altsheet/templates/tormenta20-altsheet.hbs",
        // Adicione aqui os caminhos para seus parciais, como:
        // "modules/tormenta20-altsheet/templates/parts/header.hbs",
        // "modules/tormenta20-altsheet/templates/parts/attributes.hbs",
        // "modules/tormenta20-altsheet/templates/parts/skills.hbs",
        // ... etc.
    ];

    loadTemplates(templatePaths);

    // Define os temas que estarão disponíveis para sua ficha.
    CONFIG.tormenta20AltSheet = {
        themes: {
            default: {
                label: "T20AS.Themes.Default",
                cssClass: "theme-default",
            },
            light: {
                label: "T20AS.Themes.Light",
                cssClass: "theme-light",
            },
            dark: {
                label: "T20AS.Themes.Dark",
                cssClass: "theme-dark",
            },
        },
    };

    // TODO: Registre as configurações do módulo aqui (para seleção de tema, etc.)
    // game.settings.register("tormenta20-altsheet", "sheetTheme", {
    //     name: "T20AS.SettingTheme",
    //     hint: "T20AS.SettingThemeHint",
    //     scope: "client",
    //     config: true,
    //     type: String,
    //     choices: Object.entries(CONFIG.tormenta20AltSheet.themes).reduce((obj, [key, value]) => {
    //         obj[key] = value.label;
    //         return obj;
    //     }, {}),
    //     default: "default",
    //     onChange: (value) => {
    //         // Força a re-renderização das fichas abertas ao mudar o tema
    //         for (const app of Object.values(ui.windows)) {
    //             if (app instanceof ActorSheet && app.actor.sheet.id === "tormenta20-altsheet") { // Verifica se é a sua ficha
    //                 app.render(true);
    //             }
    //         }
    //     },
    // });

    console.log("tormenta20-altsheet | Módulo de Ficha Alternativa carregado.");
});

// Hook 'ready': Executa quando o Foundry está completamente carregado.
Hooks.on("ready", () => {
    console.log("tormenta20-altsheet | Registrando Fichas de Ator.");

    // Registra a ficha para o tema DARK
    DocumentSheetConfig.registerSheet(Actor, "tormenta20-altsheet-dark", Tormenta20AltSheet, {
        label: "T20AS.CharacterSheetLabelDark",
        types: ["character"],
        makeDefault: false, 
    });

    // Registra a ficha para o tema LIGHT
    DocumentSheetConfig.registerSheet(Actor, "tormenta20-altsheet-light", Tormenta20AltSheet, {
        label: "T20AS.CharacterSheetLabelLight",
        types: ["character"],
        makeDefault: false, 
    });

    // Exemplo: Registra a ficha alternativa para NPCs
    // DocumentSheetConfig.registerSheet(Actor, "tormenta20-altsheet-npc", Tormenta20AltSheetNPC, {
    //     label: "T20AS.NPCSheetLabel",
    //     types: ["npc"],
    //     makeDefault: false,
    // });

    DocumentSheetConfig.updateDefaultSheets();

    console.log("tormenta20-altsheet | Fichas de Ator registradas.");
});