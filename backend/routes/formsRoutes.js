const express =
  require("express");

const mongoose =
  require("mongoose");

const router =
  express.Router();

function createDemoId(
  prefix
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function dbReady() {
  return (
    mongoose.connection
      .readyState === 1
  );
}

router.post(
  "/function/:name",

  async (
    req,
    res,
    next
  ) => {
    try {
      const { name } = req.params;
      const body = req.body || {};

      const handlers = {
        NotifyVendorOnOrder: () => ({
          notified: true,
          vendorId: body.vendorId || "VENDOR-001",
          orderId: body.orderId,
        }),
        SendOrderConfirmation: () => ({
          notified: true,
          orderId: body.orderId,
          invoiceId: body.invoiceId,
        }),
        ValidateAssetRequest: () => ({
          valid: true,
          requestId: body.requestId,
        }),
        NotifyApproverOnRequest: () => ({
          notified: true,
          approverId: "APPROVER-001",
        }),
        NotifyRejection: () => ({
          notified: true,
          type: "rejection",
        }),
        VerifyInvoice: () => ({
          verified: true,
          invoiceId: body.invoiceId,
        }),
        ReleasePayment: () => ({
          released: true,
          paymentId: createDemoId("PAY"),
        }),
        LocateCustomer: () => ({
          located: true,
          customerFound: true,
          customerId: createDemoId("CUST"),
          email: body.email || "customer@example.com",
        }),
        NotifyQualityManager: () => ({
          notified: true,
          recipient: "Quality Manager",
          anomalyChecked: true,
          hasAnomaly: false,
        }),
        GenerateServiceDiagnosis: () => ({
          diagnosis: "Service connectivity glitch diagnosed",
          procedure: "Reset access credentials and verify router configuration",
          status: "completed",
        }),
        CheckProductWarranty: () => ({
          isUnderWarranty: true,
          warrantyValidUntil: "2027-12-31",
          repairCost: 0,
        }),
        SendRepairInstructions: () => ({
          sent: true,
          instructions: "Ship item to authorized service center using prepaid label",
          repairOrderId: createDemoId("REP"),
        }),
        NotifyCustomerCRM: () => ({
          notified: true,
          channel: "email",
          status: "case_opened",
        }),
        ConfirmApplicationReceipt: () => ({
          confirmed: true,
          applicationRating: "A",
          status: "under_review",
        }),
        NegotiateInterview: () => ({
          interviewScheduled: true,
          date: new Date(Date.now() + 86400000 * 3).toISOString(),
          mode: "video",
        }),
        SubmitCompanyRating: () => ({
          ratingSubmitted: true,
          score: body.rating || "A",
          probationCompleted: true,
        }),
      };

      const result = handlers[name]
        ? handlers[name]()
        : {
            executed: true,
            functionName: name,
            ...body,
            timestamp: new Date().toISOString(),
          };

      return res.json({
        ok: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/formCreate/:schema",

  async (
    req,
    res,
    next
  ) => {
    try {
      const doc = {
        ...req.body,

        _id:
          createDemoId(
            req.params.schema
              .toUpperCase()
          ),
      };

      if (dbReady()) {
        const copy = {
          ...req.body,
        };

        delete copy._id;

        const result =
          await mongoose
            .connection
            .db
            .collection(
              req.params
                .schema
            )
            .insertOne(
              copy
            );

        doc._id =
          result.insertedId
            .toString();
      }

      res.json({
        ok: true,
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/formUpdate/:schema",

  async (
    req,
    res,
    next
  ) => {
    try {
      res.json({
        ok: true,

        data: {
          ...req.body,

          updated: true,

          schema:
            req.params.schema,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/formDelete/:schema",

  async (
    req,
    res,
    next
  ) => {
    try {
      res.json({
        ok: true,

        data: {
          deleted: true,

          id:
            req.body._id ||
            req.body.id,

          schema:
            req.params.schema,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/operation",

  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        req.body
          .buttonId ===
        "deduct-stock"
      ) {
        return res.json({
          ok: true,

          data: {
            inventoryUpdated:
              true,

            itemId:
              req.body.id,
          },
        });
      }

      if (
        req.body
          .buttonId ===
        "approve-request"
      ) {
        return res.json({
          ok: true,

          data: {
            approved:
              true,

            id:
              req.body.id,
          },
        });
      }

      res.json({
        ok: true,

        data: {
          operationExecuted:
            true,

          formId:
            req.body.formId,

          buttonId:
            req.body
              .buttonId,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/schemas", (req, res) => {
  res.json({
    ok: true,
    data: [
      { name: "orders", title: "Orders Schema", fields: ["orderId", "totalAmount", "stock_type", "customerId", "status"] },
      { name: "invoices", title: "Invoices Schema", fields: ["invoiceId", "orderId", "amount", "dueDate", "paid"] },
      { name: "inventory", title: "Inventory Schema", fields: ["itemId", "productName", "quantity", "warehouseLocation"] },
      { name: "complaints", title: "Complaints Schema", fields: ["ticketId", "customerId", "description", "priority", "status"] },
      { name: "applications", title: "Applications Schema", fields: ["applicantId", "name", "role", "resumeUrl", "stage"] },
      { name: "assets", title: "Asset Requests Schema", fields: ["requestId", "assetType", "requesterId", "status"] },
      { name: "users", title: "Users Schema", fields: ["userId", "name", "email", "country", "location"] },
    ],
  });
});

router.get("/functions", (req, res) => {
  res.json({
    ok: true,
    data: [
      { name: "NotifyVendorOnOrder", description: "Sends vendor dispatch notifications" },
      { name: "SendOrderConfirmation", description: "Sends customer confirmation emails" },
      { name: "ValidateAssetRequest", description: "Validates asset request requirements" },
      { name: "NotifyApproverOnRequest", description: "Notifies team approver" },
      { name: "NotifyRejection", description: "Notifies user of rejected status" },
      { name: "VerifyInvoice", description: "Performs finance invoice verification" },
      { name: "ReleasePayment", description: "Releases vendor payment gateway disbursement" },
      { name: "LocateCustomer", description: "Queries CRM records for customer details" },
      { name: "NotifyQualityManager", description: "Notifies QA manager of complaint" },
      { name: "GenerateServiceDiagnosis", description: "Generates automated service diagnostics" },
      { name: "CheckProductWarranty", description: "Checks warranty validity in database" },
      { name: "SendRepairInstructions", description: "Dispatches repair guidelines to user" },
      { name: "NotifyCustomerCRM", description: "Updates CRM ticket and notifies customer" },
      { name: "ConfirmApplicationReceipt", description: "Sends job applicant confirmation" },
      { name: "NegotiateInterview", description: "Schedules interview rounds" },
      { name: "SubmitCompanyRating", description: "Submits candidate feedback and company rating" },
    ],
  });
});

module.exports = router;
  