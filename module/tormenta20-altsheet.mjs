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

        // --- Puxando dados do sistema Tormenta20 ---
        const systemData = data.actor.system; 
        const T20Config = globalThis.T20; 

        // Detalhes do Personagem (Raça, Origem, Classe)
        data.detalhes = {
            raca: systemData.details?.raca?.value || "", 
            origem: systemData.details?.origem?.value || "",
            classe: systemData.details?.classe?.value || "" 
        };

        // Atributos (FOR, DES, CON, INT, SAB, CAR, PV, PM, Defesa)
        data.atributos = {};
        for (const key in T20Config.atributos) { 
            const attrData = systemData.attributes?.[key] || {};
            data.atributos[key] = {
                id: key, 
                label: T20Config.atributos[key], 
                value: attrData.value || 0,
                mod: attrData.mod || 0
            };
        }
        data.atributos.pv = systemData.attributes?.pv || { value: 0, max: 0 };
        data.atributos.pm = systemData.attributes?.pm || { value: 0, max: 0 };
        data.atributos.defesa = systemData.attributes?.defesa || { value: 0 };

        // Perícias (CORREÇÃO DE LABEL AQUI)
        data.pericias = {};
        for (const key in T20Config.pericias) { 
            const periciaDef = T20Config.pericias[key];
            const periciaData = systemData.skills?.[key] || {};
            data.pericias[key] = {
                id: key, 
                label: periciaDef.label, // Este é o T20.SkillAcro
                value: periciaData.value || 0,
                mod: periciaData.mod || 0,
                bonus: periciaData.bonus || 0 
            };
        }

        // Outras características (Tamanho, Deslocamento, Resistências, Imunidade, Sentidos)
        data.caracteristicas = {
            tamanho: systemData.details?.tamanho?.value || "", 
            deslocamento: systemData.attributes?.deslocamento?.value || "", 
            resistencias: {},
            imunidades: {},
            sentidos: {}
        };
        for (const key in T20Config.resistencias) {
            const resData = systemData.resistencias?.[key] || {};
            data.caracteristicas.resistencias[key] = {
                label: T20Config.resistencias[key],
                value: resData.value || 0 
            };
        }
         // Imunidades (assumindo que são chaves diretas em systemData.imunidades)
         if (systemData.imunidades) {
            for (const key in systemData.imunidades) {
                if (systemData.imunidades[key].value) { // Se a imunidade está ativa/tem valor
                    data.caracteristicas.imunidades[key] = {
                        label: systemData.imunidades[key].label || key, // Puxa o label da imunidade
                        value: systemData.imunidades[key].value
                    };
                }
            }
        }
        // Sentidos (assumindo que são chaves diretas em systemData.sentidos)
        if (systemData.sentidos) {
            for (const key in systemData.sentidos) {
                if (systemData.sentidos[key].value) { // Se o sentido está ativo/tem valor
                    data.caracteristicas.sentidos[key] = {
                        label: systemData.sentidos[key].label || key, // Puxa o label do sentido
                        value: systemData.sentidos[key].value
                    };
                }
            }
        }


        // Proficiências (Armas e Armaduras)
        data.proficiencias = {
            armas: {},
            armaduras: {}
        };
        for (const key in T20Config.profArmas) {
            const profData = systemData.proficiencias?.armas?.[key] || false; 
            if (profData) {
                data.proficiencias.armas[key] = {
                    label: T20Config.profArmas[key],
                    value: profData 
                };
            }
        }
        for (const key in T20Config.profArmaduras) {
            const profData = systemData.proficiencias?.armaduras?.[key] || false; 
            if (profData) {
                data.proficiencias.armaduras[key] = {
                    label: T20Config.profArmaduras[key],
                    value: profData 
                };
            }
        }

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