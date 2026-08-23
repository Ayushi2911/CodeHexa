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

module.exports =
  router;
  