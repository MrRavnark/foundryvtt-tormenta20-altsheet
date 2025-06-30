// Define a classe da sua ficha alternativa, estendendo a classe base ActorSheet do Foundry.
// Usaremos essa classe mais tarde para adicionar toda a lógica e comportamento da ficha.
class Tormenta20AltSheet extends ActorSheet {
    /**
     * Retorna as opções padrão da ficha.
     * Você pode definir o nome do template HTML aqui, ou em métodos posteriores.
     * A largura e altura mínimas são definidas aqui.
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["tormenta20-altsheet", "sheet", "actor"], // Classes CSS para a ficha
            template: "modules/tormenta20-altsheet/templates/tormenta20-altsheet.hbs", // Caminho para o template HBS principal da ficha
            width: 900, // Largura padrão da ficha
            height: 700, // Altura padrão da ficha
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }], // Configurações para abas, se você tiver
        });
    }

    /**
     * Prepara os dados a serem enviados para o template HBS.
     * Este método será usado para organizar os dados do ator para exibição.
     */
    getData() {
        const data = super.getData(); // Pega os dados básicos do ator

        // Aqui você pode adicionar ou modificar dados para seu template HBS
        // Exemplo: data.myData = "Algum dado extra";

        return data;
    }

    /**
     * Adiciona listeners de evento à ficha.
     * Por exemplo, para cliques em botões, rolagens de dados, etc.
     */
    activateListeners(html) {
        super.activateListeners(html); // Ativa listeners padrão do Foundry

        // Aqui você pode adicionar seus próprios listeners de evento
        // Exemplo: html.find('.my-roll-button').click(this._onMyRollButton.bind(this));
    }

    // Métodos auxiliares ou de lógica específica para sua ficha podem vir aqui
    // _onMyRollButton(event) { ... }
}

// Hook 'init': Executa quando o Foundry é inicializado.
// Usamos para carregar templates e registrar configurações.
Hooks.once("init", () => {
    console.log("tormenta20-altsheet | Inicializando Módulo de Ficha Alternativa");

    // Array com os caminhos para todos os seus templates HBS.
    // Inclua o template principal da ficha e todos os parciais (parts).
    const templatePaths = [
        "modules/tormenta20-altsheet/templates/tormenta20-altsheet.hbs",
        // Adicione aqui os caminhos para seus parciais, como:
        // "modules/tormenta20-altsheet/templates/parts/header.hbs",
        // "modules/tormenta20-altsheet/templates/parts/attributes.hbs",
        // "modules/tormenta20-altsheet/templates/parts/skills.hbs",
        // ... etc.
    ];

    // Carrega todos os templates HBS para uso no Foundry.
    loadTemplates(templatePaths);

    // CONFIG.altSheet.themes: Define os temas que estarão disponíveis para sua ficha.
    // Isso é o que você viu no módulo Pathfinder 1e Alt Sheet e que usaremos para o modo claro/escuro.
    CONFIG.tormenta20AltSheet = {
        themes: {
            default: {
                label: "T20AS.Themes.Default", // Chave de localização para o nome do tema
                cssClass: "theme-default",    // Classe CSS aplicada à ficha quando este tema estiver ativo
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
    //     name: "T20AS.SettingTheme", // Chave de localização
    //     hint: "T20AS.SettingThemeHint", // Chave de localização
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
// Usamos para registrar a ficha no sistema.
Hooks.on("ready", () => {
    console.log("tormenta20-altsheet | Registrando Fichas de Ator.");

    // Registra sua ficha alternativa para atores do tipo 'character'.
    DocumentSheetConfig.registerSheet(Actor, "tormenta20-altsheet", Tormenta20AltSheet, {
        label: "T20AS.CharacterSheetLabel", // Chave de localização para o nome da ficha no seletor
        types: ["character"], // A quais tipos de ator esta ficha se aplica
        makeDefault: false, // Define se esta ficha será a padrão para novos atores
    });

    // Se você quiser uma ficha alternativa para NPCs, registre-a aqui também:
    // DocumentSheetConfig.registerSheet(Actor, "tormenta20-altsheet-npc", Tormenta20AltSheetNPC, {
    //     label: "T20AS.NPCSheetLabel",
    //     types: ["npc"],
    //     makeDefault: false,
    // });

    // Atualiza as fichas disponíveis no Foundry.
    DocumentSheetConfig.updateDefaultSheets();

    console.log("tormenta20-altsheet | Fichas de Ator registradas.");
});