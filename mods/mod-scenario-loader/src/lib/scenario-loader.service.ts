import { Injectable } from '@angular/core';
import { ElectronService } from '@minsky/core';
import { ScenarioData, ParameterMapping, ValidationResult } from './models/scenario-data.model';
import { CsvParser } from './utils/csv-parser.util';
import { VariableMatcher } from './utils/variable-matcher.util';
import { VariableBase } from '@minsky/shared';

@Injectable({ providedIn: 'root' })
export class ScenarioLoaderService {
    constructor(private electronService: ElectronService) { }

    async readCsvFile(filePath: string): Promise<string> {
        return await this.electronService.readFileText(filePath);
    }

    parseScenarioData(csvText: string): ScenarioData {
        return CsvParser.parse(csvText);
    }

    async validateScenario(
        scenarioData: ScenarioData,
        scenarioName: string
    ): Promise<ValidationResult> {
        const scenario = scenarioData.scenarios.find(s => s.name === scenarioName);
        if (!scenario) {
            return {
                valid: false,
                errors: [`Scenario "${scenarioName}" not found`],
                warnings: [],
                missingVariables: [],
                mappings: []
            };
        }

        const mappings = await VariableMatcher.matchVariables(
            scenarioData.parameters,
            scenario.values,
            scenarioData.units || [],
            scenarioData.descriptions || [],
            this.electronService
        );

        return VariableMatcher.validateMappings(mappings);
    }

    async applyScenario(mappings: ParameterMapping[]): Promise<void> {
        for (const mapping of mappings) {
            if (mapping.matched && mapping.valueId) {
                await this.electronService.minsky.variableValues
                    .elem(mapping.valueId)
                    .init(mapping.newValue.toString());
            }
        }
    }

    async createMissingVariables(mappings: ParameterMapping[]): Promise<void> {
        let y = 100;
        const x = 100;

        for (const m of mappings) {
            await this.electronService.minsky.canvas.addVariable(`:${m.csvName}`, 'parameter');

            // Note: addVariable creates item and focuses it.
            // We need to create a wrapper for the focused item.
            const v = new VariableBase(this.electronService.minsky.canvas.itemFocus);
            await v.moveTo(x, y);

            // Set units and description (tooltip) if available
            if (m.units) await v.setUnits(m.units);
            if (m.description) await v.tooltip(m.description);

            y += 50; // Vertical spacing
        }
    }
}
