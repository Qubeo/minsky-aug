import { activeMods, modMenuContributions, modRoutes } from './mod-config.frontend.generated';

export interface ModMenuContribution {
    modId: string;
    targetMenu: string;
    label: string;
    route?: string;
    window?: { width: number; height: number; title?: string };
}

export class ModRegistry {

    static getActiveMods(): string[] {
        return activeMods;
    }

    static getRoutes(): any[] {
        return modRoutes;
    }

    static getMenuContributions(): ModMenuContribution[] {
        // Cast to our interface since the generated file is roughly typed
        return modMenuContributions as unknown as ModMenuContribution[];
    }
}
