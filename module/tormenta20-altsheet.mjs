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
            classes: ["t20as-sheet", "sheet", "actor"], 
            template: "modules/tormenta20-altsheet/templates/tormenta20-altsheet.hbs",
            width: 1000, 
            height: 700, 
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "detalhes" }], 
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
        const systemData = data.actor.system; 
        const T20Config = globalThis.T20; 
        const T20Conditions = globalThis.T20Conditions;

        // Detalhes do Personagem (Raça, Origem, Classe, Divindade)
        data.detalhes = {
            raca: systemData.details?.raca?.value || "", 
            origem: systemData.details?.origem?.value || "",
            classe: systemData.details?.classe?.value || "",
            divindade: systemData.details?.divindade?.value || "" 
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

        // Perícias (com labels e valores)
        data.pericias = {};
        data.periciasDestacadas = {}; 
        data.periciasRestantes = {}; 

        for (const key in T20Config.pericias) { 
            const periciaDef = T20Config.pericias[key];
            const periciaData = systemData.skills?.[key] || {};
            const pericia = {
                id: key, 
                label: periciaDef.label, 
                value: periciaData.value || 0,
                mod: periciaData.mod || 0,
                bonus: periciaData.bonus || 0 
            };

            if (key === "fort" || key === "refl" || key === "vont") {
                data.periciasDestacadas[key] = pericia;
            } else {
                data.periciasRestantes[key] = pericia;
            }
            data.pericias[key] = pericia; 
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
            const resData = systemData.resistances?.[key] || {}; 
            data.caracteristicas.resistencias[key] = {
                id: key,
                label: T20Config.resistencias[key],
                value: resData.value || 0, 
                mod: resData.mod || 0 
            };
        }
        if (systemData.imunidades) {
            for (const key in systemData.imunidades) {
                if (systemData.imunidades[key]?.value) { 
                    data.caracteristicas.imunidades[key] = {
                        id: key,
                        label: systemData.imunidades[key].label || key, 
                        value: systemData.imunidades[key].value
                    };
                }
            }
        }
        if (systemData.senses) {
            for (const key in T20Config.senses) {
                const senseData = systemData.senses?.[key] || false; 
                if (senseData) {
                    data.caracteristicas.sentidos[key] = {
                        id: key,
                        label: T20Config.senses[key], 
                        value: senseData.value || "" 
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
                    id: key,
                    label: T20Config.profArmas[key],
                    value: profData 
                };
            }
        }
        for (const key in T20Config.profArmaduras) {
            const profData = systemData.proficiencias?.armaduras?.[key] || false; 
            if (profData) {
                data.proficiencias.armaduras[key] = {
                    id: key,
                    label: T20Config.profArmaduras[key],
                    value: profData 
                };
            }
        }

        // Condições (todas as possíveis, do T20Conditions)
        data.condicoes = {};
        for (const key in T20Conditions) {
            const conditionDef = T20Conditions[key];
            data.condicoes[key] = {
                id: key,
                name: conditionDef.name, 
                icon: conditionDef.icon
            };
        }

        // --- Puxando e categorizando ITENS (FOCO DO INVENTÁRIO!) ---
        data.inventario = {
            armas: [],
            equipamentos: [],
            consumiveis: [],
            tesouros: [], // para loot, joias, etc.
            moedas: {
                tp: systemData.currency?.tp?.value || 0,
                to: systemData.currency?.to?.value || 0,
                ts: systemData.currency?.ts?.value || 0,
                tc: systemData.currency?.tc?.value || 0
            }
        };

        // Categoriza os itens do ator com base no tipo
        for (let item of data.actor.items) { // data.actor.items é a coleção de itens do ator
            const itemData = item.system; // Ou item.data.data em versões mais antigas do Foundry
            const itemType = item.type; // Ex: "arma", "equipamento", "consumivel", "tesouro"

            const displayItem = {
                id: item.id,
                name: item.name,
                img: item.img,
                type: itemType,
                quantity: itemData.quantidade?.value || 0, // Ou .qtd
                esp: itemData.espaco?.value || 0, // Ou .peso, .space
                // Adicione outras propriedades importantes que você quer exibir, como dano da arma, etc.
                dano: itemData.dano?.value || "",
                critico: itemData.critico?.value || "",
                // Exemplo de como pegar o tipo de arma para o label
                tipoArma: itemData.tipo?.value ? T20Config.weaponTypes[itemData.tipo.value] : "",
            };

            switch (itemType) {
                case "arma":
                    data.inventario.armas.push(displayItem);
                    break;
                case "equipamento":
                    data.inventario.equipamentos.push(displayItem);
                    break;
                case "consumivel":
                    data.inventario.consumiveis.push(displayItem);
                    break;
                case "tesouro": // Assumindo que loot/tesouro é um tipo 'tesouro'
                    data.inventario.tesouros.push(displayItem);
                    break;
                default:
                    // console.log(`Item type not categorized: ${itemType}`);
                    break;
            }
        }

        return data;
    }

    /**
     * Adiciona listeners de evento à ficha.
     */
    activateListeners(html) {
        super.activateListeners(html); 

        // Ativar drag and drop para itens
        // Por padrão, ActorSheet já tem um _onDrop básico para itens e compendium.
        // Se ele não estiver funcionando, pode ser necessário sobrescrever _onDrop
        // ou garantir que o formulário é tratável para drag and drop.
        // No entanto, super.activateListeners(html) já deveria configurar isso.

        // Exemplo de como ativar a troca de abas manualmente (se o data-tabs não funcionar)
        const tabs = new Tabs({
            navSelector: ".sheet-tabs",
            contentSelector: ".tab-content", // Seletor correto para o conteúdo das abas
            initial: this.options.initialTab || "detalhes",
            callback: (selector, html) => {
                this.setPosition({ height: "auto" }); // Ajusta a altura da ficha
            }
        });
        tabs.bind(html);


        // Adicionar listeners para botões de abrir item, deletar, etc.
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            item.sheet.render(true);
        });

        html.find('.item-delete').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
            li.slideUp(200, () => this.render(false));
        });

        // Adicione listeners para drag-and-drop customizado, se o padrão falhar
        // this.form.addEventListener("dragover", ev => this._onDragOver(ev));
        // this.form.addEventListener("drop", ev => this._onDrop(ev));
    }

    // --- Adicione aqui métodos customizados para drag-and-drop se necessário ---
    // _onDragOver(event) {
    //     event.preventDefault();
    //     // Adicionar classes visuais para feedback de drag
    // }

    // _onDrop(event) {
    //     super._onDrop(event); // Chamar o método padrão para manter funcionalidade
    //     // Adicionar lógica customizada pós-drop se necessário
    // }
}

// Hook 'init': Executa quando o Foundry é inicializado.
Hooks.once("init", () => {
    console.log("tormenta20-altsheet | Inicializando Módulo de Ficha Alternativa");

    const templatePaths = [
        "modules/tormenta20-altsheet/templates/tormenta20-altsheet.hbs",
        // Adicione aqui os caminhos para seus parciais
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

    console.log("tormenta20-altsheet | Módulo de Ficha Alternativa carregado.");
});

// Hook 'ready': Executa quando o Foundry está completamente carregado.
Hooks.on("ready", () => {
    console.log("tormenta20-altsheet | Registrando Fichas de Ator.");

    DocumentSheetConfig.registerSheet(Actor, "tormenta20-altsheet-dark", Tormenta20AltSheet, {
        label: "T20AS.CharacterSheetLabelDark",
        types: ["character"],
        makeDefault: false, 
    });

    DocumentSheetConfig.registerSheet(Actor, "tormenta20-altsheet-light", Tormenta20AltSheet, {
        label: "T20AS.CharacterSheetLabelLight",
        types: ["character"],
        makeDefault: false, 
    });

    DocumentSheetConfig.updateDefaultSheets();

    console.log("tormenta20-altsheet | Fichas de Ator registradas.");
});