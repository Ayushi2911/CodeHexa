const TEMPLATE =
  /^\{\{\s*([A-Za-z0-9_-]+)((?:\.[A-Za-z0-9_-]+)*)\s*\}\}$/;

const FORBIDDEN_KEYS = new Set([
  "__proto__",
  "prototype",
  "constructor",
]);

function safeGet(source, path) {
  let value = source;

  for (const key of path) {
    if (FORBIDDEN_KEYS.has(key)) {
      throw new Error(`Unsafe template key: ${key}`);
    }

    if (
      value == null ||
      typeof value !== "object" ||
      !(key in value)
    ) {
      return undefined;
    }

    value = value[key];
  }

  return value;
}

function resolveTemplate(template, context) {
  if (typeof template !== "string") {
    return template;
  }

  const match = template.match(TEMPLATE);

  // Normal strings such as "approved" or "physical"
  // are returned unchanged.
  if (!match) {
    return template;
  }

  const namespace = match[1];

  const path = match[2]
    .split(".")
    .filter(Boolean);

  if (
    namespace !== "trigger" &&
    !Object.prototype.hasOwnProperty.call(
      context,
      namespace
    )
  ) {
    throw new Error(
      `Unknown template namespace: ${namespace}`
    );
  }

  const result = safeGet(
    context[namespace],
    path
  );

  if (result === undefined) {
    throw new Error(
      `Unable to resolve template: ${template}`
    );
  }

  return result;
}

function resolveValue(value, context) {
  if (Array.isArray(value)) {
    return value.map((item) =>
      resolveValue(item, context)
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const output = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.has(key)) {
        throw new Error(
          `Unsafe inputMapping key: ${key}`
        );
      }

      output[key] = resolveValue(
        nestedValue,
        context
      );
    }

    return output;
  }

  return resolveTemplate(
    value,
    context
  );
}

function resolveMapping(
  inputMapping = {},
  context = {}
) {
  if (
    !inputMapping ||
    typeof inputMapping !== "object" ||
    Array.isArray(inputMapping)
  ) {
    throw new Error(
      "inputMapping must be an object"
    );
  }

  return resolveValue(
    inputMapping,
    context
  );
}

/*
 * Recursively scans an inputMapping/condition-style object and
 * returns every {{namespace.path}} reference it finds.
 *
 * Example:
 * {
 *   vendor_id: "{{step-001.vendorId}}",
 *   amount: "{{trigger.totalAmount}}"
 * }
 *
 * becomes:
 * [
 *   {
 *     raw: "{{step-001.vendorId}}",
 *     namespace: "step-001",
 *     path: ["vendorId"]
 *   },
 *   {
 *     raw: "{{trigger.totalAmount}}",
 *     namespace: "trigger",
 *     path: ["totalAmount"]
 *   }
 * ]
 */
function extractTemplateRefs(
  value,
  refs = []
) {
  if (typeof value === "string") {
    const match = value.match(TEMPLATE);

    if (match) {
      refs.push({
        raw: value,

        namespace:
          match[1],

        path:
          match[2]
            .split(".")
            .filter(Boolean),
      });
    }

    return refs;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      extractTemplateRefs(
        item,
        refs
      );
    }

    return refs;
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    for (const nestedValue of Object.values(value)) {
      extractTemplateRefs(
        nestedValue,
        refs
      );
    }
  }

  return refs;
}

module.exports = {
  TEMPLATE,
  FORBIDDEN_KEYS,
  safeGet,
  resolveTemplate,
  resolveMapping,
  extractTemplateRefs,
};