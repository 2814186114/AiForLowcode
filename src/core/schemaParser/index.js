import { SchemaLoader } from './SchemaLoader';
import { ComponentMapper } from './ComponentMapper';

export class SchemaParser {
    static async parse(schema) {
        const loadedSchema = await SchemaLoader.load(schema);
        const component = ComponentMapper.map(loadedSchema);
        const children = ComponentMapper.mapChildren(loadedSchema);

        return {
            ...component,
            children
        };
    }
}
