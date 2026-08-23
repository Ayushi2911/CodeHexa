const mongoose =
  require("mongoose");

const {
  SAMPLE_CONTEXT,
} = require(
  "../utils/sampleContext"
);

async function tryCollections(
  db,
  names,
  query
) {
  for (const name of names) {
    try {
      const exists =
        await db
          .listCollections({
            name,
          })
          .hasNext();

      if (exists) {
        return db
          .collection(name)
          .find(query)
          .limit(1000)
          .toArray();
      }
    } catch (_) {
      // Ignore unavailable collection
    }
  }

  return [];
}

async function loadProjectContext(
  projectName
) {
  if (!projectName) {
    throw new Error(
      "projectName is required"
    );
  }

  if (
    mongoose.connection.readyState !==
    1
  ) {
    return {
      ...SAMPLE_CONTEXT,
      projectName,
      source:
        "sample-fallback",
    };
  }

  const db =
    mongoose.connection.db;

  const query = {
    projectName,
  };

  const [
    schemas,
    functions,
    buttons,
    buttonConditions,
  ] = await Promise.all([
    tryCollections(
      db,
      [
        "formschemas",
        "form_schemas",
        "formsSchema",
        "FormsSchemaModel",
      ],
      query
    ),

    tryCollections(
      db,
      [
        "customfunctions",
        "custom_functions",
        "functions",
        "customFunctionModel",
      ],
      query
    ),

    tryCollections(
      db,
      [
        "buttons",
        "buttonconfigs",
        "buttonModel",
      ],
      query
    ),

    tryCollections(
      db,
      [
        "buttonconditions",
        "button_conditions",
        "buttonConditionModel",
      ],
      query
    ),
  ]);

  const hasContext =
    schemas.length ||
    functions.length ||
    buttons.length ||
    buttonConditions.length;

  if (!hasContext) {
    return {
      ...SAMPLE_CONTEXT,
      projectName,
      source:
        "sample-fallback",
    };
  }

  return {
    projectName,
    schemas,
    functions,
    buttons,
    buttonConditions,
    source: "mongodb",
  };
}

module.exports = {
  loadProjectContext,
};