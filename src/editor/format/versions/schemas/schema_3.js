import AJV from "../../ajv";

const schema = {
  type: "object",
  properties: {
    format: {type: "integer"},
    variant: {
      type: "string",
      pattern: "^(classic|slim)$"
    },
    layers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          filters: {type: "array"},
          data: {type: "string"},
          metadata: {
            type: "object",
            properties: {
              attribution: {type: "string"}
            }
          },
          selected: {type: "boolean"},
          visible: {type: "boolean"},
        }
      }
    },
    blendPalette: {
      type: "array",
      items: {
        type: "string",
        pattern: "^#([a-fA-F0-9]{8}|[a-fA-F0-9]{6})$"
      }
    }
  }
}

const schema3Validate = AJV.compile(schema);

export default schema3Validate;