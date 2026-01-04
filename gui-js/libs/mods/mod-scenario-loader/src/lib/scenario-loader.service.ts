import { Injectable } from '@angular/core';
import { ElectronService } from '@minsky/core';
import { ScenarioData, ParameterMapping, ValidationResult } from './models/scenario-data.model';
import { CsvParser } from './utils/csv-parser.util';
import { VariableMatcher } from './utils/variable-matcher.util';

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

    async createMissingVariables(names: string[]): Promise<void> {
        for (const name of names) {
            await this.electronService.minsky.canvas.addVariable(`:${name}`, 'parameter');
        }
    }
}
