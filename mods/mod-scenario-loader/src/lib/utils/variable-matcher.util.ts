import { ParameterMapping, ValidationResult } from '../models/scenario-data.model';
import { ElectronService } from '@minsky/core';

export class VariableMatcher {
    static async matchVariables(
        csvParameters: string[],
        scenarioValues: (number | null)[],
        units: string[],
        descriptions: string[],
        electronService: ElectronService
    ): Promise<ParameterMapping[]> {
        const variableSummary = await electronService.minsky.variableValues.summarise();
        // variableSummary is a Record<string, object>, convert to array
        const variables = Object.values(variableSummary) as { name: string; valueId: string; init: string }[];
        const mappings: ParameterMapping[] = [];

        for (let i = 0; i < csvParameters.length; i++) {
            const csvName = csvParameters[i];
            const newValue = scenarioValues[i];

            if (newValue === null) continue;

            // Try exact match, then with : prefix for globals
            let matchedVar = variables.find(v => v.name === csvName);
            if (!matchedVar) {
                matchedVar = variables.find(v => v.name === `:${csvName}`);
            }

            mappings.push({
                csvName,
                modelName: matchedVar?.name || '',
                valueId: matchedVar?.valueId || '',
                currentValue: matchedVar?.init || '0',
                newValue,
                matched: !!matchedVar,
                units: units[i] || '',
                description: descriptions[i] || ''
            });
        }

        return mappings;
    }

    static validateMappings(mappings: ParameterMapping[]): ValidationResult {
        const missingVariables = mappings
            .filter(m => !m.matched)
            .map(m => m.csvName);

        const matchedCount = mappings.filter(m => m.matched).length;

        return {
            valid: matchedCount > 0,
            errors: matchedCount === 0 ? ['No variables from CSV found in model'] : [],
            warnings: [],
            missingVariables,
            mappings
        };
    }
}
