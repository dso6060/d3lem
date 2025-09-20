// Data Layer - Simple separation of data from logic
// This file contains only the data for the legal system relationships

// Grouping data for collapsible clusters
const groupingData = [
    // Legislative and Regulatory Bodies
    { node: "Parliament", label: ":LegislativeBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "State Legislatures", label: ":LegislativeBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Ministry of Law", label: ":Ministry", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Ministry of Law & Justice (DoJ)", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Department of Justice", label: ":Department", belongsTo: ":LegislativeAndRegulatory" },
    { node: "State Governments", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Collegium", label: ":JudicialAppointmentBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Sponsoring Ministry", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "National Tribunals Commission", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    { node: "Central Govt (Search Committee)", label: ":RegulatoryBody", belongsTo: ":LegislativeAndRegulatory" },
    
    // Judiciary Group
    { node: "Supreme Court", label: ":SupremeCourt", belongsTo: ":JudiciaryGroup" },
    { node: "High Court", label: ":HighCourt", belongsTo: ":JudiciaryGroup" },
    { node: "High Courts", label: ":Judiciary", belongsTo: ":JudiciaryGroup" },
    { node: "District Court", label: ":DistrictCourt", belongsTo: ":JudiciaryGroup" },
    { node: "Sessions Court", label: ":SessionsCourt", belongsTo: ":JudiciaryGroup" },
    { node: "Magistrate Court", label: ":MagistrateCourt", belongsTo: ":JudiciaryGroup" },
    { node: "Civil Court", label: ":CivilCourt", belongsTo: ":JudiciaryGroup" },
    { node: "Commercial Court", label: ":CommercialCourt", belongsTo: ":JudiciaryGroup" },
    { node: "Subordinate Courts", label: ":Judiciary", belongsTo: ":JudiciaryGroup" },
    { node: "Appellate Tribunal", label: ":Judiciary", belongsTo: ":JudiciaryGroup" },
    { node: "Appellate Tribunals", label: ":AppellateTribunal", belongsTo: ":JudiciaryGroup" },
    { node: "Commercial Appellate Tribunal", label: ":CommercialAppellateTribunal", belongsTo: ":JudiciaryGroup" },
    
    // Administration Group
    { node: "Supreme Court Registrar", label: ":CourtRegistry", belongsTo: ":AdministrationGroup" },
    { node: "High Court Registrar", label: ":CourtRegistry", belongsTo: ":AdministrationGroup" },
    { node: "District Court Registrar", label: ":CourtRegistry", belongsTo: ":AdministrationGroup" },
    { node: "Sessions Court Registrar", label: ":CourtRegistry", belongsTo: ":AdministrationGroup" },
    { node: "Magistrate Court Registrar", label: ":CourtRegistry", belongsTo: ":AdministrationGroup" },
    { node: "Registry", label: ":AdministrativeBody", belongsTo: ":AdministrationGroup" },
    { node: "Search-cum-Selection Committee", label: ":AdministrativeBody", belongsTo: ":AdministrationGroup" },
    { node: "Establishment of Tribunal Oversight Bodies", label: ":AdministrativeBody", belongsTo: ":AdministrationGroup" },
    { node: "Jail Administration", label: ":AdministrativeBody", belongsTo: ":AdministrationGroup" },
    
    // Tribunals and Arbitration Group
    { node: "Tribunals", label: ":TribunalBody", belongsTo: ":TribunalsAndArbitrationGroup" },
    { node: "Arbitration Centres", label: ":ArbitrationInstitution", belongsTo: ":TribunalsAndArbitrationGroup" },
    { node: "Arbitration Council of India", label: ":RegulatoryBody", belongsTo: ":TribunalsAndArbitrationGroup" },
    { node: "Arbitration Councils", label: ":RegulatoryBody", belongsTo: ":TribunalsAndArbitrationGroup" },
    
    // People and Officeholders Group
    { node: "Judges", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Chief Justice", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Senior High Court Judge", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Supreme Court Judges", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "High Court Judges", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "District Judges", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Judicial Officers", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Supreme Court Registrar General", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "High Court Registrar General", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Judicial Inspection Committee", label: ":AccountabilityBody", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "State Judicial Service Commission", label: ":AccountabilityBody", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Tribunal Members", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Tribunal Chairs", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Arbitrators", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Subordinate Officers", label: ":CourtStaff", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Administrative Staff", label: ":CourtStaff", belongsTo: ":PeopleAndOfficeholdersGroup" },
    { node: "Prisoners", label: ":People", belongsTo: ":PeopleAndOfficeholdersGroup" },
    
    // Legal Framework Group
    { node: "Court Procedures CPC", label: ":CivilProcedureCode", belongsTo: ":LegalFrameworkGroup" },
    { node: "Court Procedures CrPC", label: ":CriminalProcedureCode", belongsTo: ":LegalFrameworkGroup" },
    { node: "Court Procedures", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Tribunal Law and Rules", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Arbitration Act and Rules", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Appointment Procedures", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Oversight Mechanisms", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Laws governing Tribunals", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Laws governing Arbitration", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Arbitration Proceedings", label: ":LegalProcedure", belongsTo: ":LegalFrameworkGroup" },
    { node: "Legislation (Laws, Rules, Procedures)", label: ":LegalDocument", belongsTo: ":LegalFrameworkGroup" },
    { node: "Arbitration Awards", label: ":LegalDocument", belongsTo: ":LegalFrameworkGroup" },
    { node: "Civil Procedure Code", label: ":LegalDocument", belongsTo: ":LegalFrameworkGroup" },
    { node: "Criminal Procedure Code", label: ":LegalDocument", belongsTo: ":LegalFrameworkGroup" },
    { node: "Commercial Courts Act", label: ":LegalDocument", belongsTo: ":LegalFrameworkGroup" },
    { node: "Disputes", label: ":LegalMatter", belongsTo: ":LegalFrameworkGroup" },
    { node: "Appeals from Tribunals", label: ":LegalMatter", belongsTo: ":LegalFrameworkGroup" },
    
    // Non-Administrative Entities Group
    { node: "President of India", label: ":ConstitutionalAuthority", belongsTo: ":NonAdministrativeEntitiesGroup" },
    { node: "Governor of State", label: ":ConstitutionalAuthority", belongsTo: ":NonAdministrativeEntitiesGroup" },
    { node: "Council of Ministers", label: ":ConstitutionalAuthority", belongsTo: ":NonAdministrativeEntitiesGroup" },
    { node: "PM", label: ":ConstitutionalAuthority", belongsTo: ":NonAdministrativeEntitiesGroup" },
    
    // Enforcement Group
    { node: "Public Prosecutor", label: ":LawEnforcement", belongsTo: ":EnforcementGroup" },
    { node: "Police Department", label: ":LawEnforcement", belongsTo: ":EnforcementGroup" },
    { node: "Jail Administration", label: ":LawEnforcement", belongsTo: ":EnforcementGroup" },
    { node: "Corrections Department", label: ":LawEnforcement", belongsTo: ":EnforcementGroup" },
    { node: "District Magistrate", label: ":LawEnforcement", belongsTo: ":EnforcementGroup" },
    { node: "Ministry of Home Affairs", label: ":RegulatoryBody", belongsTo: ":EnforcementGroup" },
    
    // Case Types Group
    { node: "Civil Case", label: ":CaseType", belongsTo: ":CaseTypesGroup" },
    { node: "Criminal Case", label: ":CaseType", belongsTo: ":CaseTypesGroup" },
    { node: "Commercial Case", label: ":CaseType", belongsTo: ":CaseTypesGroup" }
];

const judicialEntityMapData = [
    // Parliament relationships
    { source: "Parliament", target: "All Codes And Acts", count: 1, label: "enacts/amends" },
    { source: "Parliament", target: "Legislation (Laws, Rules, Procedures)", count: 1, label: "enacts/amends" },
    { source: "Parliament", target: "Tribunals", count: 1, label: "establishes" },
    { source: "Parliament", target: "Arbitration Centres", count: 1, label: "establishes" },
    { source: "Parliament", target: "Ministry of Law & Justice (DoJ)", count: 1, label: "funds" },
    { source: "Parliament", target: "Ministry of Law & Justice (DoJ)", count: 1, label: "oversees" },
    { source: "Parliament", target: "Tribunals", count: 1, label: "oversees" },
    { source: "Parliament", target: "Arbitration Centres", count: 1, label: "oversees" },
    
    // State Legislatures relationships
    { source: "State Legislatures", target: "State Laws And Codes", count: 1, label: "enacts/amends" },
    { source: "State Legislatures", target: "State Judiciary Officers", count: 1, label: "allocates funds" },
    { source: "State Legislatures", target: "State Judiciary Staff", count: 1, label: "pays salary to" },
    
    // Ministry of Law relationships
    { source: "Ministry of Law", target: "Supreme Court", count: 1, label: "allocates funds" },
    { source: "Ministry of Law", target: "High Court", count: 1, label: "allocates funds" },
    { source: "Ministry of Law", target: "Tribunals", count: 1, label: "allocates funds" },
    { source: "Ministry of Law", target: "Arbitration Centres", count: 1, label: "allocates funds" },
    { source: "Ministry of Law", target: "Supreme Court Judges", count: 1, label: "pays salary to" },
    { source: "Ministry of Law", target: "High Court Judges", count: 1, label: "pays salary to" },
    
    // Department of Justice relationships
    { source: "Department of Justice", target: "Ministry of Law", count: 1, label: "part of" },
    { source: "Ministry of Law", target: "Department of Justice", count: 1, label: "oversees" },
    
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
    
    // State Governments relationships
    { source: "State Governments", target: "District Court", count: 1, label: "allocates funds" },
    { source: "State Governments", target: "Sessions Court", count: 1, label: "allocates funds" },
    { source: "State Governments", target: "Magistrate Court", count: 1, label: "allocates funds" },
    { source: "State Governments", target: "Civil Court", count: 1, label: "allocates funds" },
    { source: "State Governments", target: "District Judges", count: 1, label: "pays salary to" },
    { source: "State Governments", target: "Magistrates", count: 1, label: "pays salary to" },
    { source: "State Governments", target: "Subordinate Officers", count: 1, label: "pays salary to" },
    { source: "State Governments", target: "Subordinate Courts", count: 1, label: "funds" },
    { source: "State Governments", target: "Judicial Officers", count: 1, label: "funds" },
    { source: "State Governments", target: "Judicial Officers", count: 1, label: "appoints" },
    { source: "State Governments", target: "State Legislatures", count: 1, label: "accountable_to" },
    
    // Supreme Court relationships
    { source: "Supreme Court", target: "Supreme Court", count: 1, label: "frames_rules" },
    { source: "Supreme Court", target: "Supreme Court", count: 1, label: "self_governs" },
    { source: "Supreme Court", target: "Supreme Court Registrar", count: 1, label: "has registrar" },
    { source: "Supreme Court", target: "Registry", count: 1, label: "governs" },
    { source: "Supreme Court", target: "Tribunals", count: 1, label: "supervises" },
    { source: "Supreme Court", target: "Arbitration Awards", count: 1, label: "supervises" },
    { source: "Supreme Court", target: "High Court Judges", count: 1, label: "appoints" },
    { source: "Supreme Court", target: "Laws governing Tribunals", count: 1, label: "reviews" },
    { source: "Supreme Court", target: "Laws governing Arbitration", count: 1, label: "reviews" },
    { source: "Supreme Court", target: "Establishment of Tribunal Oversight Bodies", count: 1, label: "directs/mandates" },
    { source: "Supreme Court", target: "Final appellate authority", count: 1, label: "appellate jurisdiction" },
    
    // High Court relationships
    { source: "High Court", target: "High Court Registrar", count: 1, label: "has registrar" },
    { source: "High Courts", target: "High Courts", count: 1, label: "frames_rules" },
    { source: "High Courts", target: "High Courts", count: 1, label: "self_regulates" },
    { source: "High Courts", target: "Subordinate Courts", count: 1, label: "superintends" },
    { source: "High Courts", target: "Judicial Officers", count: 1, label: "controls" },
    { source: "High Courts", target: "Tribunals", count: 1, label: "supervises" },
    { source: "High Courts", target: "Arbitration Awards", count: 1, label: "supervises" },
    { source: "High Court", target: "Supreme Court", count: 1, label: "appeals to" },
    
    // District Court relationships
    { source: "District Court", target: "District Court Registrar", count: 1, label: "has registrar" },
    { source: "District Court", target: "Civil Case", count: 1, label: "adjudicates" },
    { source: "District Court", target: "High Court", count: 1, label: "appeals to" },
    
    // Sessions Court relationships
    { source: "Sessions Court", target: "Sessions Court Registrar", count: 1, label: "has registrar" },
    { source: "Sessions Court", target: "Criminal Case", count: 1, label: "adjudicates" },
    { source: "Sessions Court", target: "High Court", count: 1, label: "appeals to" },
    
    // Magistrate Court relationships
    { source: "Magistrate Court", target: "Magistrate Court Registrar", count: 1, label: "has registrar" },
    { source: "Magistrate Court", target: "Sessions Court", count: 1, label: "appeals to" },
    
    // Civil Court relationships
    { source: "Civil Court", target: "Civil Judges", count: 1, label: "presided by" },
    { source: "Civil Court", target: "High Court", count: 1, label: "appeals to" },
    
    // Commercial Court relationships
    { source: "Commercial Court", target: "Commercial Judges", count: 1, label: "presided by" },
    { source: "Commercial Court", target: "Commercial Case", count: 1, label: "adjudicates" },
    
    // Commercial Appellate Tribunal relationships
    { source: "Commercial Appellate Tribunal", target: "Tribunal Members", count: 1, label: "presided by" },
    { source: "Commercial Appellate Tribunal", target: "Tribunal Chairs", count: 1, label: "presided by" },
    { source: "Commercial Appellate Tribunal", target: "High Court", count: 1, label: "appeals to" },
    
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
    { source: "Arbitration Councils", target: "Arbitration Centres", count: 1, label: "regulate" },
    { source: "Arbitration Councils", target: "Arbitrators", count: 1, label: "regulate" },
    
    // Judges and Judicial Personnel relationships
    { source: "Supreme Court Judges", target: "Supreme Court", count: 1, label: "posted in" },
    { source: "High Court Judges", target: "High Court", count: 1, label: "posted in" },
    { source: "District Judges", target: "District Court", count: 1, label: "posted in" },
    { source: "Sessions Judges", target: "Sessions Court", count: 1, label: "posted in" },
    { source: "Magistrates", target: "Magistrate Court", count: 1, label: "posted in" },
    { source: "Judges", target: "District Court", count: 1, label: "preside over" },
    { source: "Judges", target: "Civil Court", count: 1, label: "preside over" },
    { source: "Judges", target: "Sessions Court", count: 1, label: "preside over" },
    { source: "Judges", target: "Magistrate Court", count: 1, label: "preside over" },
    { source: "Judges", target: "Commercial Court", count: 1, label: "preside over" },
    
    // Registry and Case Management relationships
    { source: "Registries", target: "Judges", count: 1, label: "allots cases to" },
    { source: "Registries", target: "Magistrates", count: 1, label: "allots cases to" },
    { source: "Registries", target: "Subordinate Officers", count: 1, label: "allots cases to" },
    
    // Court Employment relationships
    { source: "District Court", target: "Subordinate Officers", count: 1, label: "employ" },
    { source: "District Court", target: "Administrative Staff", count: 1, label: "employ" },
    { source: "Sessions Court", target: "Subordinate Officers", count: 1, label: "employ" },
    { source: "Sessions Court", target: "Administrative Staff", count: 1, label: "employ" },
    { source: "Magistrate Court", target: "Subordinate Officers", count: 1, label: "employ" },
    { source: "Magistrate Court", target: "Administrative Staff", count: 1, label: "employ" },
    { source: "Civil Court", target: "Subordinate Officers", count: 1, label: "employ" },
    { source: "Civil Court", target: "Administrative Staff", count: 1, label: "employ" },
    { source: "Commercial Court", target: "Subordinate Officers", count: 1, label: "employ" },
    { source: "Commercial Court", target: "Administrative Staff", count: 1, label: "employ" },
    
    // Subordinate Officers relationships
    { source: "Subordinate Officers", target: "District Court", count: 1, label: "work in" },
    { source: "Subordinate Officers", target: "Sessions Court", count: 1, label: "work in" },
    { source: "Subordinate Officers", target: "Magistrate Court", count: 1, label: "work in" },
    { source: "Subordinate Officers", target: "Civil Court", count: 1, label: "work in" },
    { source: "Subordinate Officers", target: "Commercial Court", count: 1, label: "work in" },
    { source: "Subordinate Officers", target: "Registries", count: 1, label: "work in" },
    { source: "Subordinate Officers", target: "Chief Justice", count: 1, label: "evaluated by" },
    { source: "Subordinate Officers", target: "Senior High Court Judges", count: 1, label: "evaluated by" },
    { source: "Subordinate Officers", target: "Supreme Court Registrar General", count: 1, label: "evaluated by" },
    { source: "Subordinate Officers", target: "High Court Registrar General", count: 1, label: "evaluated by" },
    
    // Chief Justice relationships
    { source: "Chief Justice", target: "Judges", count: 1, label: "evaluates" },
    { source: "Chief Justice", target: "Subordinate Officers", count: 1, label: "evaluates" },
    
    // Senior High Court Judges relationships
    { source: "Senior High Court Judges", target: "District Judges", count: 1, label: "evaluate" },
    { source: "Senior High Court Judges", target: "Magistrates", count: 1, label: "evaluate" },
    { source: "Senior High Court Judges", target: "Subordinate Officers", count: 1, label: "evaluate" },
    
    // Registrar General relationships
    { source: "Supreme Court Registrar General", target: "Subordinate Officers", count: 1, label: "manages personnel" },
    { source: "Supreme Court Registrar General", target: "Administrative Staff", count: 1, label: "manages personnel" },
    { source: "High Court Registrar General", target: "Subordinate Officers", count: 1, label: "manages personnel" },
    { source: "High Court Registrar General", target: "Administrative Staff", count: 1, label: "manages personnel" },
    
    // Judicial Inspection Committee relationships
    { source: "Judicial Inspection Committee", target: "Judicial Officers", count: 1, label: "assesses" },
    { source: "Judicial Inspection Committee", target: "Subordinate Officers", count: 1, label: "assesses" },
    
    // State Judicial Service Commission relationships
    { source: "State Judicial Service Commission", target: "District and Subordinate Judiciary", count: 1, label: "manages appointments" },
    
    // Jail Administration relationships
    { source: "Jail Administration", target: "Magistrate Court", count: 1, label: "executes orders from" },
    { source: "Jail Administration", target: "Sessions Court", count: 1, label: "executes orders from" },
    { source: "Jail Administration", target: "High Court", count: 1, label: "executes orders from" },
    { source: "Jail Administration", target: "Supreme Court", count: 1, label: "executes orders from" },
    { source: "Jail Administration", target: "Criminal Procedure Code", count: 1, label: "governed by" },
    { source: "Jail Administration", target: "State Prison Manual", count: 1, label: "governed by" },
    
    // Court Communication relationships
    { source: "District Court", target: "Jail Administration", count: 1, label: "communicate with" },
    { source: "District Court", target: "Registries", count: 1, label: "communicate with" },
    { source: "Sessions Court", target: "Jail Administration", count: 1, label: "communicate with" },
    { source: "Sessions Court", target: "Registries", count: 1, label: "communicate with" },
    { source: "Magistrate Court", target: "Jail Administration", count: 1, label: "communicate with" },
    { source: "Magistrate Court", target: "Registries", count: 1, label: "communicate with" },
    { source: "Civil Court", target: "Jail Administration", count: 1, label: "communicate with" },
    { source: "Civil Court", target: "Registries", count: 1, label: "communicate with" },
    { source: "Commercial Court", target: "Jail Administration", count: 1, label: "communicate with" },
    { source: "Commercial Court", target: "Registries", count: 1, label: "communicate with" },
    
    // Legal Framework relationships
    { source: "Civil Procedure Code", target: "Civil Court", count: 1, label: "governs" },
    { source: "Civil Procedure Code", target: "District Court", count: 1, label: "governs" },
    { source: "Civil Procedure Code", target: "High Court", count: 1, label: "governs" },
    { source: "Civil Procedure Code", target: "Civil Case", count: 1, label: "governs_case_type" },
    { source: "Criminal Procedure Code", target: "Magistrate Court", count: 1, label: "governs" },
    { source: "Criminal Procedure Code", target: "Sessions Court", count: 1, label: "governs" },
    { source: "Criminal Procedure Code", target: "High Court", count: 1, label: "governs" },
    { source: "Criminal Procedure Code", target: "Criminal Case", count: 1, label: "governs_case_type" },
    { source: "Commercial Courts Act", target: "Commercial Court", count: 1, label: "governs" },
    { source: "Commercial Courts Act", target: "Commercial Appellate Tribunal", count: 1, label: "governs" },
    { source: "Commercial Courts Act", target: "Commercial Case", count: 1, label: "governs_case_type" },
    
    // Case Type relationships
    { source: "Civil Case", target: "Civil Judges", count: 1, label: "heard by" },
    { source: "Civil Case", target: "District Judges", count: 1, label: "heard by" },
    { source: "Civil Case", target: "High Court", count: 1, label: "heard by" },
    { source: "Criminal Case", target: "Magistrates", count: 1, label: "heard by" },
    { source: "Criminal Case", target: "Sessions Court", count: 1, label: "heard by" },
    { source: "Criminal Case", target: "High Court", count: 1, label: "heard by" },
    { source: "Commercial Case", target: "Commercial Court", count: 1, label: "heard by" },
    { source: "Commercial Case", target: "Commercial Appellate Tribunal", count: 1, label: "heard by" },
    { source: "Commercial Case", target: "High Court", count: 1, label: "heard by" },
    
    // Enforcement relationships
    { source: "Police Department", target: "Public Prosecutor", count: 1, label: "investigates" },
    { source: "Police Department", target: "District Court", count: 1, label: "investigates" },
    { source: "Police Department", target: "Sessions Court", count: 1, label: "investigates" },
    { source: "Police Department", target: "Magistrate Court", count: 1, label: "investigates" },
    { source: "Public Prosecutor", target: "Criminal and Special Courts", count: 1, label: "prosecutes cases" },
    { source: "District Magistrate", target: "Police Department", count: 1, label: "supervises police" },
    { source: "Ministry of Home Affairs", target: "Police Department", count: 1, label: "administers police" },
    { source: "Police Department", target: "Ministry of Home Affairs", count: 1, label: "accountable_to" },
    
    // Appointment relationships
    { source: "Governor of State", target: "District Judges", count: 1, label: "appoints" },
    { source: "Governor of State", target: "Magistrates", count: 1, label: "appoints" },
    { source: "President of India", target: "Supreme Court Judges", count: 1, label: "appoints" },
    { source: "President of India", target: "High Court Judges", count: 1, label: "appoints" },
    { source: "Council of Ministers", target: "President of India", count: 1, label: "advises" },
    { source: "PM", target: "President of India", count: 1, label: "advises" },
    
    // Collegium relationships
    { source: "Collegium", target: "Supreme Court Judges", count: 1, label: "recommends_appointments" },
    { source: "Collegium", target: "High Court Judges", count: 1, label: "recommends_appointments" },
    { source: "Collegium", target: "Supreme Court", count: 1, label: "members_of" },
    
    // Committee and organizational relationships
    { source: "Search-cum-Selection Committee", target: "Ministry of Law & Justice (DoJ)", count: 1, label: "members_of" },
    { source: "Search-cum-Selection Committee", target: "Central Govt (Search Committee)", count: 1, label: "appointed_by" },
    { source: "Council of Ministers", target: "Central Govt (Search Committee)", count: 1, label: "head_of" },
    { source: "PM", target: "Central Govt (Search Committee)", count: 1, label: "head_of" },
    
    // Additional judicial and procedural relationships
    { source: "Judicial Officers", target: "Subordinate Courts", count: 1, label: "administer" },
    { source: "Judicial Officers", target: "High Courts", count: 1, label: "regulated_by" },
    { source: "Judicial Officers", target: "Civil Procedure Code", count: 1, label: "regulated_by" },
    { source: "Judicial Officers", target: "Criminal Procedure Code", count: 1, label: "regulated_by" },
    { source: "Subordinate Courts", target: "High Courts", count: 1, label: "governed_by" },
    { source: "Subordinate Courts", target: "Civil Procedure Code", count: 1, label: "governed_by" },
    { source: "Subordinate Courts", target: "Criminal Procedure Code", count: 1, label: "governed_by" },
    { source: "President of India", target: "Council of Ministers", count: 1, label: "acts_on_advice_of" },
    { source: "President of India", target: "PM", count: 1, label: "acts_on_advice_of" },
    
    // New hierarchical and organizational relationships
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
    { source: "Corrections Department", target: "Jail Administration", count: 1, label: "manages_custody" }
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