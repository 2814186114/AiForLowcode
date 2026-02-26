import { componentTypeMap as componentMap, componentDefaultProps } from '../propertyConfig';

export class ComponentMapper {
    static map(schema) {
        const { 'x-component': componentType, 'x-props': props = {} } = schema;

        if (!componentType || !componentMap[componentType]) {
            throw new Error(`Component type ${componentType} is not supported`);
        }

        return {
            type: componentType,
            props: {
                ...componentDefaultProps[componentType],
                ...props
            }
        };
    }

    static mapChildren(schema) {
        if (schema.type === 'object' && schema.properties) {
            return Object.entries(schema.properties).map(([name, childSchema]) => ({
                ...this.map(childSchema),
                name
            }));
        }

        if (schema.type === 'array' && schema.items) {
            return [this.map(schema.items)];
        }

        return [];
    }
}
