export const LEGAL_CLASSIFICATIONS = [
  "Political Law",
  "Labor Law",
  "Civil Law",
  "Taxation Law",
  "Commercial Law",
  "Mercantile Law",
  "Criminal Law",
  "Remedial Law",
  "Legal & Judicial Ethics",
  "Intellectual Property Law",
  "Environmental Law",
  "Special Laws",
] as const;

export type LegalClassification = (typeof LEGAL_CLASSIFICATIONS)[number];

export const SUBCATEGORIES_BY_CLASSIFICATION: Record<string, string[]> = {
  "Political Law": [
    "Constitutional Law I (Government Structure & Powers)",
    "Constitutional Law II (Bill of Rights)",
    "Administrative Law",
    "Law on Public Officers",
    "Local Government Code",
    "Election Law",
    "Public International Law",
  ],
  "Civil Law": [
    "Persons and Family Relations",
    "Property and Ownership",
    "Land Titles and Deeds",
    "Obligations and Contracts",
    "Sales and Special Contracts",
    "Succession",
    "Torts and Damages",
    "Credit Transactions",
    "Private International Law (Conflict of Laws)",
  ],
  "Commercial Law": [
    "Revised Corporation Code",
    "Intellectual Property (Patents, Trademarks, Copyright)",
    "Banking Laws & Secrecy of Deposits",
    "Insurance Law",
    "Transportation & Common Carriers",
    "Securities Regulation Code (SRC)",
    "FRIA (Insolvency & Rehabilitation)",
    "Anti-Money Laundering Act (AMLA)",
    "Data Privacy & E-Commerce",
  ],
  "Labor Law": [
    "Labor Standards (Wages, Hours, Leaves)",
    "Labor Relations & Collective Bargaining",
    "Termination, Dismissal & Severance",
    "Management Prerogative",
    "Social Legislation (SSS, GSIS, ECC)",
    "Labor Procedure & Remedies (NLRC, NCMB)",
  ],
  "Taxation Law": [
    "General Principles of Taxation",
    "Income Tax",
    "Value-Added Tax (VAT) & Percentage Taxes",
    "Estate and Donor's Taxes",
    "Local & Real Property Taxation",
    "Tax Remedies (Assessment, Protest, Refund)",
    "Judicial Remedies (Court of Tax Appeals)",
    "Tariff and Customs",
  ],
  "Criminal Law": [
    "RPC Book 1 (Principles, Penalties, Liabilities)",
    "RPC Book 2 (Crimes Against Persons, Property, etc.)",
    "Dangerous Drugs Act (RA 9165 / Chain of Custody)",
    "Anti-Graft & Plunder (RA 3019, RA 7080)",
    "VAWC & Special Protection Laws (RA 9262, RA 7610)",
    "Bouncing Checks (BP 22)",
    "Cybercrime Prevention Act (RA 10175)",
  ],
  "Remedial Law": [
    "General Principles & Jurisdiction",
    "Civil Procedure",
    "Provisional Remedies",
    "Special Civil Actions (Certiorari, Mandamus, etc.)",
    "Special Proceedings",
    "Criminal Procedure",
    "Rules of Evidence",
    "Environmental Rules & Writs (Kalikasan, Mandamus)",
  ],
  "Legal and Judicial Ethics": [
    "Code of Professional Responsibility and Accountability (CPRA)",
    "Practice of Law & Bar Admission",
    "Disciplinary Proceedings & Grievances",
    "Judicial Ethics & New Code of Judicial Conduct",
    "Notarial Practice",
    "Legal Fees and Attorney's Lien",
  ],
};

// Aliases to support variations and legacy classifications
SUBCATEGORIES_BY_CLASSIFICATION["Legal & Judicial Ethics"] =
  SUBCATEGORIES_BY_CLASSIFICATION["Legal and Judicial Ethics"];
SUBCATEGORIES_BY_CLASSIFICATION["Mercantile Law"] =
  SUBCATEGORIES_BY_CLASSIFICATION["Commercial Law"];
SUBCATEGORIES_BY_CLASSIFICATION["Intellectual Property Law"] = [
  "Intellectual Property (Patents, Trademarks, Copyright)",
  "Patents",
  "Trademarks and Service Marks",
  "Copyright and Neighboring Rights",
  "Law on Unfair Competition",
];
SUBCATEGORIES_BY_CLASSIFICATION["Environmental Law"] = [
  "Environmental Rules & Writs (Kalikasan, Mandamus)",
  "Constitutional Right to Balanced Ecology",
  "Rules of Procedure for Environmental Cases",
  "Clean Air Act (RA 8749)",
  "Clean Water Act (RA 9275)",
];
SUBCATEGORIES_BY_CLASSIFICATION["Special Laws"] = [
  "Anti-Money Laundering Act (AMLA)",
  "Data Privacy & E-Commerce",
  "Dangerous Drugs Act (RA 9165 / Chain of Custody)",
  "Anti-Graft & Plunder (RA 3019, RA 7080)",
  "VAWC & Special Protection Laws (RA 9262, RA 7610)",
  "Cybercrime Prevention Act (RA 10175)",
];
