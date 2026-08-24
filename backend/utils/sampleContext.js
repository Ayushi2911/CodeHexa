const SAMPLE_CONTEXT = {
  projectName: "sample-flow",

  schemas: [
    {
      projectName: "sample-flow",
      schemaName: "orders",
      fields: [
        "_id",
        "projectName",
        "totalAmount",
        "stock_type",
        "item_id",
        "status",
      ],
    },
    {
      projectName: "sample-flow",
      schemaName: "invoices",
      fields: [
        "_id",
        "order_id",
        "vendor_id",
        "amount",
        "payment_status",
      ],
    },
    {
      projectName: "sample-flow",
      schemaName: "asset_requests",
      fields: [
        "_id",
        "approver_response",
        "status",
        "requested_asset",
      ],
    },
    {
      projectName: "sample-flow",
      schemaName: "assets",
      fields: [
        "_id",
        "request_id",
        "asset_type",
        "status",
      ],
    },
    {
      projectName: "sample-flow",
      schemaName: "receipts",
      fields: [
        "_id",
        "invoice_id",
        "amount",
      ],
    },
    {
      projectName: "sample-flow",
      schemaName: "complaints",
      fields: [
        "_id",
        "customerName",
        "cpf",
        "email",
        "channel",
        "productOrServiceCode",
        "complaintDescription",
        "status",
        "complaintType",
      ],
    },
    {
      projectName: "sample-flow",
      schemaName: "customer_records",
      fields: [
        "_id",
        "name",
        "cpf",
        "email",
        "isRegistered",
        "phone",
      ],
    },
    {
      projectName: "sample-flow",
      schemaName: "anomaly_reports",
      fields: [
        "_id",
        "complaintId",
        "productOrServiceCode",
        "productionDate",
        "hasAnomaly",
      ],
    },
    {
      projectName: "sample-flow",
      schemaName: "repair_orders",
      fields: [
        "_id",
        "complaintId",
        "productCode",
        "isUnderWarranty",
        "repairCost",
        "shippingInstructions",
      ],
    },
    {
      projectName: "sample-flow",
      schemaName: "job_applications",
      fields: [
        "_id",
        "applicantId",
        "companyName",
        "applicationDate",
        "status",
        "rating",
      ],
    },
    {
      projectName: "sample-flow",
      schemaName: "job_offers",
      fields: [
        "_id",
        "applicantId",
        "companyName",
        "position",
        "salary",
        "status",
      ],
    },
    {
      projectName: "sample-flow",
      schemaName: "probation_records",
      fields: [
        "_id",
        "applicantId",
        "companyName",
        "applicantRating",
        "companyRating",
        "status",
      ],
    },
  ],

  functions: [
    {
      projectName: "sample-flow",
      functionName: "NotifyVendorOnOrder",
      description: "Notify vendor when order is placed",
    },
    {
      projectName: "sample-flow",
      functionName: "SendOrderConfirmation",
      description: "Send order confirmation notification",
    },
    {
      projectName: "sample-flow",
      functionName: "ValidateAssetRequest",
      description: "Validate an asset request",
    },
    {
      projectName: "sample-flow",
      functionName: "NotifyApproverOnRequest",
      description: "Notify approver about asset request",
    },
    {
      projectName: "sample-flow",
      functionName: "NotifyRejection",
      description: "Notify requester of rejection",
    },
    {
      projectName: "sample-flow",
      functionName: "VerifyInvoice",
      description: "Verify invoice before settlement",
    },
    {
      projectName: "sample-flow",
      functionName: "ReleasePayment",
      description: "Release vendor payment",
    },
    {
      projectName: "sample-flow",
      functionName: "LocateCustomer",
      description: "Verify or locate customer record in database",
    },
    {
      projectName: "sample-flow",
      functionName: "NotifyQualityManager",
      description: "Notify Quality Manager about unsolved complaint and anomaly check",
    },
    {
      projectName: "sample-flow",
      functionName: "GenerateServiceDiagnosis",
      description: "Generate problem diagnosis and solving procedure by Service Analyst",
    },
    {
      projectName: "sample-flow",
      functionName: "CheckProductWarranty",
      description: "Check if product is under warranty and compute repair cost",
    },
    {
      projectName: "sample-flow",
      functionName: "SendRepairInstructions",
      description: "Send email with product repair instructions and cost",
    },
    {
      projectName: "sample-flow",
      functionName: "NotifyCustomerCRM",
      description: "Notify Customer Relationship Manager and send customer email",
    },
    {
      projectName: "sample-flow",
      functionName: "ConfirmApplicationReceipt",
      description: "Company confirms job application receipt and rates application",
    },
    {
      projectName: "sample-flow",
      functionName: "NegotiateInterview",
      description: "Negotiate and schedule job interview",
    },
    {
      projectName: "sample-flow",
      functionName: "SubmitCompanyRating",
      description: "Submit probation rating for company and applicant",
    },
  ],

  buttons: [
    {
      projectName: "sample-flow",
      formId: "inventory-form",
      buttonId: "deduct-stock",
      name: "Update Inventory",
      type: "query",
    },
    {
      projectName: "sample-flow",
      formId: "asset-request-form",
      buttonId: "approve-request",
      name: "Approve Request",
      type: "operation",
    },
    {
      projectName: "sample-flow",
      formId: "complaint-form",
      buttonId: "resolve-complaint",
      name: "Resolve Complaint",
      type: "operation",
    },
    {
      projectName: "sample-flow",
      formId: "job-form",
      buttonId: "accept-offer",
      name: "Accept Job Offer",
      type: "operation",
    },
  ],

  buttonConditions: [
    {
      projectName: "sample-flow",
      buttonId: "deduct-stock",
      field: "stock_type",
      operator: "eq",
      value: "physical",
    },
    {
      projectName: "sample-flow",
      buttonId: "resolve-complaint",
      field: "status",
      operator: "eq",
      value: "solved",
    },
  ],
};

module.exports = {
  SAMPLE_CONTEXT,
};