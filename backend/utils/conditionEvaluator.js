const {
  resolveTemplate,
} = require("./mappingResolver");

const SUPPORTED_OPERATORS = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "notIn",
  "contains",
  "exists",
];

function evaluateCondition(
  condition,
  context = {}
) {
  if (!condition) {
    return true;
  }

  if (
    !SUPPORTED_OPERATORS.includes(
      condition.operator
    )
  ) {
    throw new Error(
      `Unsupported condition operator: ${condition.operator}`
    );
  }

  const actual = resolveTemplate(
    condition.field,
    context
  );

  const expected =
    condition.value;

  switch (condition.operator) {
    case "eq":
      return actual === expected;

    case "neq":
      return actual !== expected;

    case "gt":
      return (
        Number(actual) >
        Number(expected)
      );

    case "gte":
      return (
        Number(actual) >=
        Number(expected)
      );

    case "lt":
      return (
        Number(actual) <
        Number(expected)
      );

    case "lte":
      return (
        Number(actual) <=
        Number(expected)
      );

    case "in":
      return (
        Array.isArray(expected) &&
        expected.includes(actual)
      );

    case "notIn":
      return (
        Array.isArray(expected) &&
        !expected.includes(actual)
      );

    case "contains":
      return Array.isArray(actual)
        ? actual.includes(expected)
        : String(actual ?? "")
            .includes(
              String(expected)
            );

    case "exists":
      return expected === false
        ? actual == null
        : actual != null;

    default:
      return false;
  }
}

module.exports = {
  SUPPORTED_OPERATORS,
  evaluateCondition,
};