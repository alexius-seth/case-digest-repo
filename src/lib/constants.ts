export const LEGAL_CLASSIFICATIONS = [
  "Civil Law",
  "Commercial Law",
  "Criminal Law",
  "Labor Law",
  "Political Law",
  "Remedial Law",
  "Taxation Law",
  "Legal & Judicial Ethics",
  "Intellectual Property Law",
  "Environmental Law",
  "Special Laws",
] as const;

export type LegalClassification = (typeof LEGAL_CLASSIFICATIONS)[number];

export const SUBCATEGORIES_BY_CLASSIFICATION: Record<string, string[]> = {
  "Political Law": [
    "Constitutional Law",
    "Administrative Law",
    "Election Law",
    "Local Government Law",
    "Public Officers",
    "Public International Law",
  ],
  "Civil Law": [
    "Persons and Family Relations",
    "Property Law",
    "Obligations and Contracts",
    "Succession",
    "Sales and Lease",
    "Torts and Damages",
    "Private International Law",
  ],
  "Commercial Law": [
    "Corporation Law",
    "Insurance Law",
    "Banking Law",
    "Negotiable Instruments",
    "Transportation Law",
  ],
  "Labor Law": [
    "Labor Standards",
    "Labor Relations",
    "Social Legislation",
  ],
  "Remedial Law": [
    "Civil Procedure",
    "Criminal Procedure",
    "Evidence",
    "Special Proceedings",
  ],
  "Criminal Law": [
    "Revised Penal Code (Book 1)",
    "Revised Penal Code (Book 2)",
    "Special Penal Laws",
  ],
};