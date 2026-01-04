import { ScenarioData, ScenarioColumn } from '../models/scenario-data.model';

export class CsvParser {
    static parse(csvText: string): ScenarioData {
        const lines = csvText.trim().split('\n').filter(line => line.trim());

        if (lines.length === 0) {
            throw new Error('CSV file is empty');
        }

        const headers = this.parseLine(lines[0]);

        if (headers.length < 2) {
            throw new Error('CSV must have at least one scenario column');
        }

        const scenarioNames = headers.slice(1);
        const scenarios: ScenarioColumn[] = scenarioNames.map(name => ({
            name: name.trim(),
            values: []
        }));

        const parameters: string[] = [];

        for (let i = 1; i < lines.length; i++) {
            const cells = this.parseLine(lines[i]);
            if (cells.length === 0 || !cells[0].trim()) continue;

            parameters.push(cells[0].trim());

            for (let j = 0; j < scenarios.length; j++) {
                const value = cells[j + 1]?.trim();
                scenarios[j].values.push(this.parseNumeric(value));
            }
        }

        return { parameters, scenarios };
    }

    private static parseLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (const char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }

    private static parseNumeric(value: string | undefined): number | null {
        if (!value || value.trim() === '') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }
}
