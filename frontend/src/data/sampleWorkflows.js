export const SAMPLE_WORKFLOW_TEMPLATES = [
  {
    id: "complaint-processing",
    title: "Customer Complaint Processing",
    badge: "Customer Support",
    actors: ["Complaints Attendant (CA)", "Product Analyst (PA)", "Service Analyst (SA)", "Quality Manager (QM)", "CRM"],
    requirement: `The Product or Service Complaint Processing is a customer service support process that involves the following actors: Complaints Attendant (CA), Product Analyst (PA), Service Analyst (SA), Quality Manager (QM), and Customer Relationship Manager (CRM).
The process starts with the customer reaching out to the attendant through a voice call, WhatsApp, or personalized email. If the contact is made through a voice call or WhatsApp, the attendant must first register the complaint in the customer service database, and the customer must provide their personal information (name, CPF, email). If the contact is made through a personalized email, the procedure is automated, and the customer can only send an email if they are registered.
If the customer cannot be located, they must be informed, and the code of the product or service must be provided for a new location attempt. If the code is also not located, the CRM is informed, and the customer's data and complaint description are registered. The customer is informed that the case will be analyzed and that they will be contacted by email by the CRM. Later, the process is closed.
If the customer is located, if necessary, their data is updated, and they are informed that all further notifications will be made by the provided email. The complaint is registered, and the attendant tries to solve the problem. When the problem is solved, the customer is invited to evaluate the service, and the process is ended.
When a problem is not solved by the attendant, a notification is sent to the QM, containing information about the problem. The QM identifies the product or service and checks if there was any production anomaly on the date it was produced. When the Attendant cannot solve the problem, if the problem is related to a product, it is referred to the Product Analyst. If the problem is related to a service, the attendant refers it to the Service Analyst.
Upon receiving the problem referral, the Service Analyst performs the Problem Analysis process. After analyzing the problem, a diagnosis is generated, and a problem-solving procedure is also created. Both are sent to the customer, and the process ends. When the process is referred to the Product Analyst, they check if the product is under warranty. After that, the analyst performs the problem analysis and sends an email to the customer with information on how to send the product to the company for repair and the cost of the repair. The process ends.`,
  },
  {
    id: "job-application",
    title: "Job Application & Probation",
    badge: "Human Resources",
    actors: ["Job Applicant", "Hiring Company", "HR Reviewer"],
    requirement: `You have to regularly report, to which companies you wrote job applications. Based on your job applications, new potential job offers are sent to you. Companies have to confirm that they received job applications and rate the application. A job interview can be negotiated. When a company wants you to work for them, you enter the probation phase. After probation phase, you can rate the company and the company can rate you. Reviews for a company can only be seen (by job applicants) after 1 year. If a job becomes permanent, the process ends, unless you rated the company C or less, then you continue to receive job offers, but no longer have to report.`,
  },
  {
    id: "order-placed",
    title: "Order Fulfillment & Inventory",
    badge: "E-Commerce",
    actors: ["Customer", "Vendor", "Inventory Manager"],
    requirement: `When an order is placed, notify the vendor, create an invoice, update inventory if stock is physical, then send a confirmation to the customer.`,
  },
  {
    id: "asset-request",
    title: "Asset Request & IT Approval",
    badge: "IT Operations",
    actors: ["Employee", "Department Approver", "IT Admin"],
    requirement: `When an asset request is submitted, validate the request, notify the approver. If approved, update status and create asset record; if rejected, notify requester.`,
  },
  {
    id: "invoice-settlement",
    title: "Invoice Verification & Settlement",
    badge: "Finance & Accounts",
    actors: ["Vendor", "Finance Auditor", "Payment Gateway"],
    requirement: `When an invoice is received, verify the invoice, mark invoice paid, release vendor payment, and generate a receipt.`,
  },
];
