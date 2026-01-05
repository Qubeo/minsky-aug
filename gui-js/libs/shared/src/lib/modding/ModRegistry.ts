import { activeMods, topLevelMenus, menuItems, commands, modRoutes } from './mod-config.frontend.generated';

export interface TopLevelMenu {
    id: string;
    label: string;
    after?: string;
    modId: string;
}

export interface MenuItem {
    menu: string;
    label: string;
    command: string;
    modId: string;
}

export interface Command {
    id: string;
    route?: string;
    window?: { width: number; height: number; title?: string };
    modId: string;
}

export class ModRegistry {
    static getActiveMods(): string[] {
        return activeMods;
    }

    static getRoutes(): any[] {
        return modRoutes;
    }

    static getTopLevelMenus(): TopLevelMenu[] {
        return topLevelMenus as TopLevelMenu[];
    }

    static getMenuItems(): MenuItem[] {
        return menuItems as MenuItem[];
    }

    static getCommands(): Command[] {
        return commands as Command[];
    }

    static getCommand(id: string): Command | undefined {
        return (commands as Command[]).find(c => c.id === id);
    }
}
