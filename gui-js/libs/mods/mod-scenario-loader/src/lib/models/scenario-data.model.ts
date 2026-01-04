export interface ScenarioData {
    parameters: string[];
    scenarios: ScenarioColumn[];
}

export interface ScenarioColumn {
    name: string;
    values: (number | null)[];
}

export interface ParameterMapping {
    csvName: string;
    modelName: string;
    valueId: string;
    currentValue: string;
    newValue: number;
    matched: boolean;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    missingVariables: string[];
    mappings: ParameterMapping[];
}
