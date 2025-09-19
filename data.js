// Data Layer - Simple separation of data from logic
// This file contains only the data for the legal system relationships

// Grouping data for collapsible clusters
const groupingData = [
    { node: "Parliament", label: ":LegislativeBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Ministry of Law & Justice (DoJ)", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "State Governments", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Collegium", label: ":JudicialAppointmentBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Supreme Court", label: ":Judiciary", belongsTo: ":JudiciaryGroup" },
    { node: "High Courts", label: ":Judiciary", belongsTo: ":JudiciaryGroup" },
    { node: "Subordinate Courts", label: ":Judiciary", belongsTo: ":JudiciaryGroup" },
    { node: "Appellate Tribunal", label: ":Judiciary", belongsTo: ":JudiciaryGroup" },
    { node: "Tribunals", label: ":TribunalBody", belongsTo: ":TribunalsAndArbitrationGroup" },
    { node: "Arbitration Centres", label: ":ArbitrationInstitution", belongsTo: ":TribunalsAndArbitrationGroup" },
    { node: "Arbitration Council of India", label: ":RegulatoryBody", belongsTo: ":TribunalsAndArbitrationGroup" },
    { node: "Judicial Officers", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Tribunal Members", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Tribunal Chairs", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Arbitrators", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Administrative Staff", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Court Procedures", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Tribunal Law and Rules", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Arbitration Act and Rules", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Appointment Procedures", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Oversight Mechanisms", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "President of India", label: ":ConstitutionalAuthority", belongsTo: ":NonAdministrativeEntitiesGroup" },
    { node: "Governor of State", label: ":ConstitutionalAuthority", belongsTo: ":NonAdministrativeEntitiesGroup" },
    { node: "Council of Ministers", label: ":ConstitutionalAuthority", belongsTo: ":NonAdministrativeEntitiesGroup" },
    { node: "PM", label: ":ConstitutionalAuthority", belongsTo: ":NonAdministrativeEntitiesGroup" },
    { node: "Laws governing Tribunals", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Laws governing Arbitration", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Sponsoring Ministry", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "National Tribunals Commission", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "CPC", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "CrPC", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "District Judges", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Subordinate Officers", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    
    // Additional missing nodes from judicialEntityMapData
    { node: "Supreme Court Judges", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "High Court Judges", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Registry", label: ":AdministrativeBody", belongsTo: ":LegalFrameworkGroup" },
    { node: "Arbitration Awards", label: ":LegalDocument", belongsTo: ":LegalFrameworkGroup" },
    { node: "Establishment of Tribunal Oversight Bodies", label: ":AdministrativeBody", belongsTo: ":LegalFrameworkGroup" },
    { node: "Appellate Tribunals", label: ":TribunalBody", belongsTo: ":TribunalsAndArbitrationGroup" },
    { node: "Arbitration Proceedings", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Central Govt (Search Committee)", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "State Legislatures", label: ":LegislativeBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Legislation (Laws, Rules, Procedures)", label: ":LegalDocument", belongsTo: ":LegalFrameworkGroup" },
    
    // Additional nodes from new relationships
    { node: "Search-cum-Selection Committee", label: ":AdministrativeBody", belongsTo: ":LegalFrameworkGroup" },
    
    // New enforcement and case type entities
    { node: "Public Prosecutor", label: ":LawEnforcement", belongsTo: ":EnforcementGroup" },
    { node: "Police Department", label: ":LawEnforcement", belongsTo: ":EnforcementGroup" },
    { node: "Ministry of Home Affairs", label: ":RegulatoryBody", belongsTo: ":EnforcementGroup" },
    { node: "District Magistrate", label: ":LawEnforcement", belongsTo: ":EnforcementGroup" },
    { node: "Corrections Department", label: ":LawEnforcement", belongsTo: ":EnforcementGroup" },
    { node: "Civil Case", label: ":CaseType", belongsTo: ":CaseTypesGroup" },
    { node: "Criminal Case", label: ":CaseType", belongsTo: ":CaseTypesGroup" },
    { node: "Commercial Case", label: ":CaseType", belongsTo: ":CaseTypesGroup" },
    { node: "District Court", label: ":Judiciary", belongsTo: ":JudiciaryGroup" },
    { node: "Sessions Court", label: ":Judiciary", belongsTo: ":JudiciaryGroup" },
    { node: "Commercial Court", label: ":Judiciary", belongsTo: ":JudiciaryGroup" },
    { node: "Civil Procedure Code", label: ":LegalDocument", belongsTo: ":LegalFrameworkGroup" },
    { node: "Criminal Procedure Code", label: ":LegalDocument", belongsTo: ":LegalFrameworkGroup" },
    { node: "Commercial Courts Act", label: ":LegalDocument", belongsTo: ":LegalFrameworkGroup" },
    { node: "Arbitration Councils", label: ":RegulatoryBody", belongsTo: ":TribunalsAndArbitrationGroup" },
    { node: "Disputes", label: ":LegalMatter", belongsTo: ":LegalFrameworkGroup" },
    { node: "Appeals from Tribunals", label: ":LegalMatter", belongsTo: ":LegalFrameworkGroup" },
    { node: "Prisoners", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Jail Administration", label: ":AdministrativeBody", belongsTo: ":LegalFrameworkGroup" }
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
    { source: "Ministry of Law & Justice (DoJ)", target: "Arbitration Council of India", count: 1, label: "administers" },
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
    { source: "Arbitration Centres", target: "Arbitration Proceedings", count: 1, label: "administer" },
    { source: "Arbitration Centres", target: "Ministry of Law & Justice (DoJ)", count: 1, label: "accountable_to" },
    { source: "Arbitration Centres", target: "Arbitration Council of India", count: 1, label: "accountable_to" },
    
    // Arbitration Councils relationships
    { source: "Arbitration Council of India", target: "Arbitration Centres", count: 1, label: "regulate" },
    { source: "Arbitration Council of India", target: "Arbitrators", count: 1, label: "regulate" },
    
    // Judicial Officers relationships
    { source: "Judicial Officers", target: "Subordinate Courts", count: 1, label: "administer" },
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
    { source: "PM", target: "Central Govt (Search Committee)", count: 1, label: "head_of" },
    
    // Enforcement and case processing relationships
    { source: "Public Prosecutor", target: "District Court", count: 1, label: "prosecutes_cases" },
    { source: "Public Prosecutor", target: "Sessions Court", count: 1, label: "prosecutes_cases" },
    { source: "Public Prosecutor", target: "High Courts", count: 1, label: "prosecutes_cases" },
    { source: "Public Prosecutor", target: "Supreme Court", count: 1, label: "prosecutes_cases" },
    { source: "Police Department", target: "Public Prosecutor", count: 1, label: "investigates_cases" },
    { source: "Police Department", target: "District Court", count: 1, label: "investigates_cases" },
    { source: "Police Department", target: "Sessions Court", count: 1, label: "investigates_cases" },
    { source: "Ministry of Home Affairs", target: "Police Department", count: 1, label: "administers_police" },
    { source: "Police Department", target: "Ministry of Home Affairs", count: 1, label: "accountable_to" },
    { source: "District Magistrate", target: "Police Department", count: 1, label: "supervises_police" },
    { source: "District Magistrate", target: "District Court", count: 1, label: "manages_judicial_enforcement" },
    { source: "District Magistrate", target: "Police Department", count: 1, label: "manages_judicial_enforcement" },
    { source: "District Magistrate", target: "Corrections Department", count: 1, label: "manages_judicial_enforcement" },
    { source: "Corrections Department", target: "Prisoners", count: 1, label: "manages_custody" },
    { source: "Corrections Department", target: "Jail Administration", count: 1, label: "manages_custody" },
    
    // Case type and court relationships
    { source: "District Court", target: "Civil Case", count: 1, label: "adjudicates" },
    { source: "Sessions Court", target: "Criminal Case", count: 1, label: "adjudicates" },
    { source: "Commercial Court", target: "Commercial Case", count: 1, label: "adjudicates" },
    { source: "Civil Procedure Code", target: "Civil Case", count: 1, label: "governs_case_type" },
    { source: "Criminal Procedure Code", target: "Criminal Case", count: 1, label: "governs_case_type" },
    { source: "Commercial Courts Act", target: "Commercial Case", count: 1, label: "governs_case_type" },
    
    // Additional tribunal and arbitration relationships
    { source: "Appellate Tribunals", target: "Appeals from Tribunals", count: 1, label: "adjudicates" },
    { source: "Appellate Tribunals", target: "Central Govt (Search Committee)", count: 1, label: "appoints_members" },
    { source: "Appellate Tribunals", target: "Sponsoring Ministry", count: 1, label: "accountable_to" },
    { source: "Appellate Tribunals", target: "Parliament", count: 1, label: "accountable_to" },
    { source: "Appellate Tribunals", target: "Sponsoring Ministry", count: 1, label: "reports_to" },
    { source: "Appellate Tribunals", target: "National Tribunals Commission", count: 1, label: "reports_to" },
    { source: "Appellate Tribunals", target: "High Courts", count: 1, label: "appellate_to" },
    { source: "Appellate Tribunals", target: "Supreme Court", count: 1, label: "appellate_to" },
    { source: "Tribunals", target: "Disputes", count: 1, label: "adjudicates" },
    { source: "Tribunals", target: "Central Govt (Search Committee)", count: 1, label: "appoints_members" },
    { source: "Tribunals", target: "Sponsoring Ministry", count: 1, label: "accountable_to" },
    { source: "Tribunals", target: "Parliament", count: 1, label: "accountable_to" },
    { source: "Tribunals", target: "Sponsoring Ministry", count: 1, label: "reports_to" },
    { source: "Tribunals", target: "National Tribunals Commission", count: 1, label: "reports_to" },
    { source: "Tribunals", target: "Appellate Tribunals", count: 1, label: "appellate_to" },
    { source: "Arbitration Centres", target: "Arbitration Proceedings", count: 1, label: "administer" },
    { source: "Arbitration Centres", target: "Ministry of Law & Justice (DoJ)", count: 1, label: "accountable_to" },
    { source: "Arbitration Centres", target: "Arbitration Council of India", count: 1, label: "accountable_to" },
    { source: "Arbitration Councils", target: "Arbitration Centres", count: 1, label: "regulate" },
    { source: "Arbitration Councils", target: "Arbitrators", count: 1, label: "regulate" },
    
    // Additional judicial and procedural relationships
    { source: "Judicial Officers", target: "Subordinate Courts", count: 1, label: "administer" },
    { source: "Judicial Officers", target: "High Courts", count: 1, label: "regulated_by" },
    { source: "Judicial Officers", target: "CPC", count: 1, label: "regulated_by" },
    { source: "Judicial Officers", target: "CrPC", count: 1, label: "regulated_by" },
    { source: "Subordinate Courts", target: "High Courts", count: 1, label: "governed_by" },
    { source: "Subordinate Courts", target: "CPC", count: 1, label: "governed_by" },
    { source: "Subordinate Courts", target: "CrPC", count: 1, label: "governed_by" },
    { source: "President of India", target: "Council of Ministers", count: 1, label: "acts_on_advice_of" },
    { source: "President of India", target: "PM", count: 1, label: "acts_on_advice_of" },
    { source: "Council of Ministers", target: "President of India", count: 1, label: "advises" },
    { source: "PM", target: "President of India", count: 1, label: "advises" }
];

// Configuration
const config = {
    width: 1400,
    height: 900,
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

// Export data for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        judicialEntityMapData,
        groupingData,
        config,
        colorMap
    };
}

// Make data available globally for browser usage
window.data = {
    judicialEntityMapData,
    groupingData,
    config,
    colorMap
};
