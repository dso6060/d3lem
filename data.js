// Data Layer - Simple separation of data from logic
// This file contains only the data for the legal system relationships

// Grouping data for collapsible clusters
const groupingData = [
    { node: "Parliament", label: ":LegislativeBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Ministry of Law & Justice (DoJ)", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "State Governments", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Collegium", label: ":JudicialAppointmentBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Supreme Court", label: ":Judiciary", belongsTo: ":Judiciary" },
    { node: "High Courts", label: ":Judiciary", belongsTo: ":Judiciary" },
    { node: "Subordinate Courts", label: ":Judiciary", belongsTo: ":Judiciary" },
    { node: "Appellate Tribunal", label: ":Judiciary", belongsTo: ":Judiciary" },
    { node: "Tribunals", label: ":TribunalBody", belongsTo: ":TribunalsAndArbitration" },
    { node: "Arbitration Centres", label: ":ArbitrationInstitution", belongsTo: ":TribunalsAndArbitration" },
    { node: "Arbitration Council of India", label: ":RegulatoryBody", belongsTo: ":TribunalsAndArbitration" },
    { node: "Judicial Officers", label: ":People", belongsTo: ":PeopleAndOfficeholders" },
    { node: "Tribunal Members", label: ":People", belongsTo: ":PeopleAndOfficeholders" },
    { node: "Tribunal Chairs", label: ":People", belongsTo: ":PeopleAndOfficeholders" },
    { node: "Arbitrators", label: ":People", belongsTo: ":PeopleAndOfficeholders" },
    { node: "Administrative Staff", label: ":People", belongsTo: ":PeopleAndOfficeholders" },
    { node: "Court Procedures", label: ":LegalProcedure", belongsTo: ":LegalFramework" },
    { node: "Tribunal Law and Rules", label: ":LegalProcedure", belongsTo: ":LegalFramework" },
    { node: "Arbitration Act and Rules", label: ":LegalProcedure", belongsTo: ":LegalFramework" },
    { node: "Appointment Procedures", label: ":LegalProcedure", belongsTo: ":LegalFramework" },
    { node: "Oversight Mechanisms", label: ":LegalProcedure", belongsTo: ":LegalFramework" },
    { node: "President of India", label: ":ConstitutionalAuthority", belongsTo: ":NonAdministrativeEntities" },
    { node: "Governor of State", label: ":ConstitutionalAuthority", belongsTo: ":NonAdministrativeEntities" },
    { node: "Council of Ministers", label: ":ConstitutionalAuthority", belongsTo: ":NonAdministrativeEntities" },
    { node: "PM", label: ":ConstitutionalAuthority", belongsTo: ":NonAdministrativeEntities" },
    { node: "Laws governing Tribunals", label: ":LegalProcedure", belongsTo: ":LegalFramework" },
    { node: "Laws governing Arbitration", label: ":LegalProcedure", belongsTo: ":LegalFramework" },
    { node: "Sponsoring Ministry", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "National Tribunals Commission", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "CPC", label: ":LegalProcedure", belongsTo: ":LegalFramework" },
    { node: "CrPC", label: ":LegalProcedure", belongsTo: ":LegalFramework" },
    { node: "District Judges", label: ":People", belongsTo: ":PeopleAndOfficeholders" },
    { node: "Subordinate Officers", label: ":People", belongsTo: ":PeopleAndOfficeholders" },
    
    // Additional missing nodes from judicialEntityMapData
    { node: "Supreme Court Judges", label: ":People", belongsTo: ":PeopleAndOfficeholders" },
    { node: "High Court Judges", label: ":People", belongsTo: ":PeopleAndOfficeholders" },
    { node: "Registry", label: ":AdministrativeBody", belongsTo: ":LegalFramework" },
    { node: "Arbitration Awards", label: ":LegalDocument", belongsTo: ":LegalFramework" },
    { node: "Establishment of Tribunal Oversight Bodies", label: ":AdministrativeBody", belongsTo: ":LegalFramework" },
    { node: "Appellate Tribunals", label: ":TribunalBody", belongsTo: ":TribunalsAndArbitration" },
    { node: "Arbitration Proceedings", label: ":LegalProcedure", belongsTo: ":LegalFramework" },
    { node: "Central Govt (Search Committee)", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "State Legislatures", label: ":LegislativeBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Legislation (Laws, Rules, Procedures)", label: ":LegalDocument", belongsTo: ":LegalFramework" },
    
    // Additional nodes from new relationships
    { node: "Search-cum-Selection Committee", label: ":AdministrativeBody", belongsTo: ":LegalFramework" }
];

// Relationship grouping data - maps relationship labels to simple group names
const relationshipGroupingData = [
    // Funding relationships
    { relationship: "funds", belongsTo: "Funding" },
    { relationship: "allocates_funds", belongsTo: "Funding" },
    
    // Oversights relationships
    { relationship: "oversees", belongsTo: "Oversights" },
    { relationship: "supervises", belongsTo: "Oversights" },
    { relationship: "superintends", belongsTo: "Oversights" },
    { relationship: "controls", belongsTo: "Oversights" },
    { relationship: "reviews", belongsTo: "Oversights" },
    { relationship: "oversight_by", belongsTo: "Oversights" },
    
    // Appointments relationships
    { relationship: "appoints", belongsTo: "Appointments" },
    { relationship: "appoints_members", belongsTo: "Appointments" },
    { relationship: "processes_appointments", belongsTo: "Appointments" },
    { relationship: "recommends_appointments", belongsTo: "Appointments" },
    { relationship: "formal_appointment_authority_for", belongsTo: "Appointments" },
    { relationship: "appointed_by", belongsTo: "Appointments" },
    
    // Governance relationships
    { relationship: "governs", belongsTo: "Governance" },
    { relationship: "governed_by", belongsTo: "Governance" },
    { relationship: "frames_rules", belongsTo: "Governance" },
    { relationship: "self_governs", belongsTo: "Governance" },
    { relationship: "self_regulates", belongsTo: "Governance" },
    { relationship: "regulate", belongsTo: "Governance" },
    { relationship: "regulated_by", belongsTo: "Governance" },
    
    // Accountability relationships
    { relationship: "accountable_to", belongsTo: "Accountability" },
    { relationship: "reports_to", belongsTo: "Accountability" },
    { relationship: "advises", belongsTo: "Accountability" },
    { relationship: "acts_on_advice_of", belongsTo: "Accountability" },
    
    // Establishment relationships
    { relationship: "establishes", belongsTo: "Establishment" },
    { relationship: "enacts/amends", belongsTo: "Establishment" },
    
    // Operations relationships
    { relationship: "adjudicates", belongsTo: "Operations" },
    { relationship: "administer(s)", belongsTo: "Operations" },
    { relationship: "coordinates_with", belongsTo: "Operations" },
    
    // Hierarchy relationships
    { relationship: "belongs_to", belongsTo: "Hierarchy" },
    { relationship: "members_of", belongsTo: "Hierarchy" },
    { relationship: "head_of", belongsTo: "Hierarchy" },
    { relationship: "appellate_to", belongsTo: "Hierarchy" },
    
    // Directives relationships
    { relationship: "directs/mandates", belongsTo: "Directives" }
];

const judicialEntityMapData = [
    // Parliament relationships
    { source: "Parliament", target: "Legislation (Laws, Rules, Procedures)", count: 1, label: "enacts/amends" },
    { source: "Parliament", target: "Tribunals", count: 1, label: "establishes" },
    { source: "Parliament", target: "Arbitration Centres", count: 1, label: "establishes" },
    { source: "Parliament", target: "Ministry of Law & Justice (DoJ)", count: 1, label: "funds" },
    { source: "Parliament", target: "Ministry of Law & Justice (DoJ)", count: 1, label: "oversees" },
    { source: "Parliament", target: "Tribunals", count: 1, label: "oversees" },
    { source: "Parliament", target: "Arbitration Centres", count: 1, label: "oversees" },
    
    // Ministry of Law & Justice (DoJ) relationships
    { source: "Ministry of Law & Justice (DoJ)", target: "Supreme Court", count: 1, label: "allocates_funds" },
    { source: "Ministry of Law & Justice (DoJ)", target: "High Courts", count: 1, label: "allocates_funds" },
    { source: "Ministry of Law & Justice (DoJ)", target: "Subordinate Courts", count: 1, label: "allocates_funds" },
    { source: "Ministry of Law & Justice (DoJ)", target: "Tribunals", count: 1, label: "allocates_funds" },
    { source: "Ministry of Law & Justice (DoJ)", target: "Arbitration Centres", count: 1, label: "allocates_funds" },
    { source: "Ministry of Law & Justice (DoJ)", target: "Supreme Court Judges", count: 1, label: "processes_appointments" },
    { source: "Ministry of Law & Justice (DoJ)", target: "High Court Judges", count: 1, label: "processes_appointments" },
    { source: "Ministry of Law & Justice (DoJ)", target: "Arbitration Council of India", count: 1, label: "administer(s)" },
    { source: "Ministry of Law & Justice (DoJ)", target: "State Governments", count: 1, label: "coordinates_with" },
    
    // Supreme Court relationships
    { source: "Supreme Court", target: "Supreme Court", count: 1, label: "frames_rules" },
    { source: "Supreme Court", target: "Supreme Court", count: 1, label: "self_governs" },
    { source: "Supreme Court", target: "Registry", count: 1, label: "governs" },
    { source: "Supreme Court", target: "Tribunals", count: 1, label: "supervises" },
    { source: "Supreme Court", target: "Arbitration Awards", count: 1, label: "supervises" },
    { source: "Supreme Court", target: "High Court Judges", count: 1, label: "appoints" },
    { source: "Supreme Court", target: "Laws governing Tribunals", count: 1, label: "reviews" },
    { source: "Supreme Court", target: "Laws governing Arbitration", count: 1, label: "reviews" },
    { source: "Supreme Court", target: "Establishment of Tribunal Oversight Bodies", count: 1, label: "directs/mandates" },
    
    // Collegium relationships
    { source: "Collegium", target: "Supreme Court Judges", count: 1, label: "recommends_appointments" },
    { source: "Collegium", target: "High Court Judges", count: 1, label: "recommends_appointments" },
    
    // High Courts relationships
    { source: "High Courts", target: "High Courts", count: 1, label: "frames_rules" },
    { source: "High Courts", target: "High Courts", count: 1, label: "self_regulates" },
    { source: "High Courts", target: "Subordinate Courts", count: 1, label: "superintends" },
    { source: "High Courts", target: "Judicial Officers", count: 1, label: "controls" },
    { source: "High Courts", target: "Tribunals", count: 1, label: "supervises" },
    { source: "High Courts", target: "Arbitration Awards", count: 1, label: "supervises" },
    
    // State Governments relationships
    { source: "State Governments", target: "Subordinate Courts", count: 1, label: "funds" },
    { source: "State Governments", target: "Judicial Officers", count: 1, label: "funds" },
    { source: "State Governments", target: "Judicial Officers", count: 1, label: "appoints" },
    { source: "State Governments", target: "State Legislatures", count: 1, label: "accountable_to" },
    
    // Appellate Tribunals relationships
    { source: "Appellate Tribunals", target: "Appeals from Tribunals", count: 1, label: "adjudicates" },
    { source: "Appellate Tribunals", target: "Central Govt (Search Committee)", count: 1, label: "appoints_members" },
    { source: "Appellate Tribunals", target: "Sponsoring Ministry", count: 1, label: "accountable_to" },
    { source: "Appellate Tribunals", target: "Parliament", count: 1, label: "accountable_to" },
    { source: "Appellate Tribunals", target: "Sponsoring Ministry", count: 1, label: "reports_to" },
    { source: "Appellate Tribunals", target: "National Tribunals Commission", count: 1, label: "reports_to" },
    { source: "Appellate Tribunals", target: "High Courts", count: 1, label: "appellate_to" },
    { source: "Appellate Tribunals", target: "Supreme Court", count: 1, label: "appellate_to" },
    
    // Tribunals relationships
    { source: "Tribunals", target: "Disputes", count: 1, label: "adjudicates" },
    { source: "Tribunals", target: "Central Govt (Search Committee)", count: 1, label: "appoints_members" },
    { source: "Tribunals", target: "Sponsoring Ministry", count: 1, label: "accountable_to" },
    { source: "Tribunals", target: "Parliament", count: 1, label: "accountable_to" },
    { source: "Tribunals", target: "Sponsoring Ministry", count: 1, label: "reports_to" },
    { source: "Tribunals", target: "National Tribunals Commission", count: 1, label: "reports_to" },
    { source: "Tribunals", target: "Appellate Tribunals", count: 1, label: "appellate_to" },
    
    // Arbitration Centres relationships
    { source: "Arbitration Centres", target: "Arbitration Proceedings", count: 1, label: "administer(s)" },
    { source: "Arbitration Centres", target: "Ministry of Law & Justice (DoJ)", count: 1, label: "accountable_to" },
    { source: "Arbitration Centres", target: "Arbitration Council of India", count: 1, label: "accountable_to" },
    
    // Arbitration Councils relationships
    { source: "Arbitration Council of India", target: "Arbitration Centres", count: 1, label: "regulate" },
    { source: "Arbitration Council of India", target: "Arbitrators", count: 1, label: "regulate" },
    
    // Judicial Officers relationships
    { source: "Judicial Officers", target: "Subordinate Courts", count: 1, label: "administer(s)" },
    { source: "Judicial Officers", target: "High Courts", count: 1, label: "regulated_by" },
    { source: "Judicial Officers", target: "CPC", count: 1, label: "regulated_by" },
    { source: "Judicial Officers", target: "CrPC", count: 1, label: "regulated_by" },
    
    // Subordinate Courts relationships
    { source: "Subordinate Courts", target: "High Courts", count: 1, label: "governed_by" },
    { source: "Subordinate Courts", target: "CPC", count: 1, label: "governed_by" },
    { source: "Subordinate Courts", target: "CrPC", count: 1, label: "governed_by" },
    
    // President of India relationships
    { source: "President of India", target: "Supreme Court Judges", count: 1, label: "appoints" },
    { source: "President of India", target: "High Court Judges", count: 1, label: "appoints" },
    { source: "President of India", target: "Council of Ministers", count: 1, label: "acts_on_advice_of" },
    { source: "President of India", target: "PM", count: 1, label: "acts_on_advice_of" },
    
    // Governor of State relationships
    { source: "Governor of State", target: "District Judges", count: 1, label: "appoints" },
    { source: "Governor of State", target: "Subordinate Officers", count: 1, label: "appoints" },
    
    // Council of Ministers relationships
    { source: "Council of Ministers", target: "President of India", count: 1, label: "advises" },
    
    // PM relationships
    { source: "PM", target: "President of India", count: 1, label: "advises" },
    
    // New hierarchical and organizational relationships
    // Judicial hierarchy relationships
    { source: "Supreme Court Judges", target: "Supreme Court", count: 1, label: "belongs_to" },
    { source: "High Court Judges", target: "High Courts", count: 1, label: "belongs_to" },
    { source: "District Judges", target: "Subordinate Courts", count: 1, label: "belongs_to" },
    { source: "Judicial Officers", target: "Subordinate Courts", count: 1, label: "belongs_to" },
    { source: "Judicial Officers", target: "High Courts", count: 1, label: "oversight_by" },
    
    // Tribunal and arbitration relationships
    { source: "Tribunal Members", target: "Tribunals", count: 1, label: "belongs_to" },
    { source: "Tribunal Chairs", target: "Tribunals", count: 1, label: "belongs_to" },
    { source: "Tribunal Members", target: "Appellate Tribunals", count: 1, label: "belongs_to" },
    { source: "Tribunal Chairs", target: "Appellate Tribunals", count: 1, label: "belongs_to" },
    { source: "Arbitrators", target: "Arbitration Centres", count: 1, label: "belongs_to" },
    { source: "Arbitrators", target: "Tribunals", count: 1, label: "belongs_to" },
    
    // Administrative staff relationships
    { source: "Administrative Staff", target: "Supreme Court", count: 1, label: "belongs_to" },
    { source: "Administrative Staff", target: "High Courts", count: 1, label: "belongs_to" },
    { source: "Administrative Staff", target: "Subordinate Courts", count: 1, label: "belongs_to" },
    { source: "Administrative Staff", target: "Tribunals", count: 1, label: "belongs_to" },
    { source: "Administrative Staff", target: "Arbitration Centres", count: 1, label: "belongs_to" },
    
    // Appointment authority relationships
    { source: "Governor of State", target: "District Judges", count: 1, label: "formal_appointment_authority_for" },
    { source: "President of India", target: "Supreme Court Judges", count: 1, label: "formal_appointment_authority_for" },
    { source: "President of India", target: "High Court Judges", count: 1, label: "formal_appointment_authority_for" },
    
    // Committee and organizational relationships
    { source: "Search-cum-Selection Committee", target: "Ministry of Law & Justice (DoJ)", count: 1, label: "members_of" },
    { source: "Search-cum-Selection Committee", target: "Central Govt (Search Committee)", count: 1, label: "appointed_by" },
    { source: "Collegium", target: "Supreme Court", count: 1, label: "members_of" },
    { source: "Council of Ministers", target: "Central Govt (Search Committee)", count: 1, label: "head_of" },
    { source: "PM", target: "Central Govt (Search Committee)", count: 1, label: "head_of" }
];

// Configuration
const config = {
    width: 1400,
    height: 650,
    nodeRadius: 4,
    linkDistance: 200,  // Balanced distance for circular layout
    chargeStrength: -600,  // Moderate repulsion for better circular distribution
    centerStrength: 0.1,  // Reduced center pull to allow more circular spread
    xStrength: 0.05,     // Reduced directional forces
    yStrength: 0.05
};

// Color mapping for arrow markers
const colorMap = {
    "outgoing": "#1f77b4",  // Blue for outgoing relationships
    "incoming": "#d62728"   // Red for incoming relationships
};

// Access control configuration
const accessControlConfig = {
    password: "d3lem_2025",  // Password/PIN for edit access (empty string to disable, set to enable)
    ipWhitelist: [],  // Array of allowed IP addresses (for future use)
    enableIPCheck: false  // Boolean flag to enable IP checking (false for now)
};

// Export data for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        judicialEntityMapData,
        groupingData,
        relationshipGroupingData,
        config,
        colorMap,
        accessControlConfig
    };
}

// Make data available globally for browser usage
window.data = {
    judicialEntityMapData,
    groupingData,
    relationshipGroupingData,
    config,
    colorMap,
    accessControlConfig
};
