const mongoose =
  require("mongoose");

const {
  SAMPLE_CONTEXT,
} = require(
  "./sampleContext"
);

async function seedSampleData() {
  if (
    mongoose.connection
      .readyState !== 1
  ) {
    throw new Error(
      "MongoDB must be connected before seeding"
    );
  }

  const db =
    mongoose.connection.db;

  await Promise.all([
    db
      .collection(
        "formschemas"
      )
      .deleteMany({
        projectName:
          "sample-flow",
      }),

    db
      .collection(
        "customfunctions"
      )
      .deleteMany({
        projectName:
          "sample-flow",
      }),

    db
      .collection(
        "buttons"
      )
      .deleteMany({
        projectName:
          "sample-flow",
      }),

    db
      .collection(
        "buttonconditions"
      )
      .deleteMany({
        projectName:
          "sample-flow",
      }),
  ]);

  await db
    .collection(
      "formschemas"
    )
    .insertMany(
      SAMPLE_CONTEXT.schemas
    );

  await db
    .collection(
      "customfunctions"
    )
    .insertMany(
      SAMPLE_CONTEXT.functions
    );

  await db
    .collection("buttons")
    .insertMany(
      SAMPLE_CONTEXT.buttons
    );

  await db
    .collection(
      "buttonconditions"
    )
    .insertMany(
      SAMPLE_CONTEXT
        .buttonConditions
    );

  await Promise.all([
    db.collection("orders").deleteMany({ projectName: "sample-flow" }),
    db.collection("complaints").deleteMany({ projectName: "sample-flow" }),
    db.collection("job_applications").deleteMany({ projectName: "sample-flow" }),
    db.collection("invoices").deleteMany({ projectName: "sample-flow" }),
    db.collection("asset_requests").deleteMany({ projectName: "sample-flow" }),
  ]);

  await Promise.all([
    db.collection("orders").insertOne({
      projectName: "sample-flow",
      totalAmount: 5000,
      stock_type: "physical",
      item_id: "ITEM-001",
      status: "placed",
    }),
    db.collection("complaints").insertOne({
      projectName: "sample-flow",
      customerName: "Alex Doe",
      cpf: "123.456.789-00",
      email: "alex.doe@example.com",
      channel: "WhatsApp",
      productOrServiceCode: "PRD-9981",
      complaintDescription: "Device shuts down randomly after 10 minutes",
      status: "open",
      complaintType: "product",
    }),
    db.collection("job_applications").insertOne({
      projectName: "sample-flow",
      applicantId: "APP-401",
      companyName: "Acme Corp",
      applicationDate: new Date().toISOString().split("T")[0],
      status: "submitted",
      rating: "A",
    }),
    db.collection("invoices").insertOne({
      projectName: "sample-flow",
      order_id: "ORD-1001",
      vendor_id: "VENDOR-001",
      amount: 5000,
      payment_status: "received",
    }),
    db.collection("asset_requests").insertOne({
      projectName: "sample-flow",
      requested_asset: "MacBook Pro M3",
      approver_response: "approved",
      status: "pending",
    }),
  ]);

  console.log("PS11 sample context and demo records seeded");
}

if (
  require.main ===
  module
) {
  require("dotenv")
    .config();

  mongoose
    .connect(
      process.env
        .MONGODB_URI ||
        "mongodb://127.0.0.1:27017/codehexa_ps11"
    )
    .then(
      seedSampleData
    )
    .then(() =>
      mongoose.disconnect()
    )
    .catch((error) => {
      console.error(
        error
      );

      process.exit(1);
    });
}

module.exports = {
  SAMPLE_CONTEXT,
  seedSampleData,
};