// Data Layer - Simple separation of data from logic
// This file contains only the data for the legal system relationships

const lawsuitData = [
    // Parliament relationships - OUTGOING (Blue)
    { source: "Parliament", target: "Court Procedure", count: 1, color: "outgoing", label: "enacts/amends" },
    { source: "Parliament", target: "Tribunal", count: 1, color: "outgoing", label: "establishes" },
    { source: "Parliament", target: "Arbitration Centre", count: 1, color: "outgoing", label: "establishes" },
    { source: "Parliament", target: "Ministry of Law & Justice (DoJ)", count: 1, color: "outgoing", label: "provides_funds" },
    { source: "Parliament", target: "Tribunal", count: 1, color: "outgoing", label: "oversees" },
    { source: "Parliament", target: "Arbitration Centre", count: 1, color: "outgoing", label: "oversees" },
    { source: "Parliament", target: "Ministry of Law & Justice (DoJ)", count: 1, color: "outgoing", label: "oversees" },
    { source: "Parliament", target: "CPC / CrPC / Tribunal Law / Arbitration Act", count: 1, color: "outgoing", label: "amends" },
    
    // Ministry of Law & Justice relationships - OUTGOING (Blue)
    { source: "Ministry of Law & Justice (DoJ)", target: "Supreme Court", count: 1, color: "outgoing", label: "provides_funds" },
    { source: "Ministry of Law & Justice (DoJ)", target: "High Court", count: 1, color: "outgoing", label: "provides_funds" },
    { source: "Ministry of Law & Justice (DoJ)", target: "Subordinate Courts", count: 1, color: "outgoing", label: "provides_funds" },
    { source: "Ministry of Law & Justice (DoJ)", target: "Tribunal", count: 1, color: "outgoing", label: "provides_funds" },
    { source: "Ministry of Law & Justice (DoJ)", target: "Arbitration Centre", count: 1, color: "outgoing", label: "provides_funds" },
    { source: "Ministry of Law & Justice (DoJ)", target: "Parliament", count: 1, color: "incoming", label: "accountable_to" },
    { source: "Ministry of Law & Justice (DoJ)", target: "Supreme/High Court Judges", count: 1, color: "outgoing", label: "processes_appointments" },
    { source: "Ministry of Law & Justice (DoJ)", target: "Arbitration Council of India", count: 1, color: "outgoing", label: "administers" },
    { source: "Ministry of Law & Justice (DoJ)", target: "State Government", count: 1, color: "outgoing", label: "coordinates_with" },
    
    // Supreme Court relationships - OUTGOING (Blue)
    { source: "Supreme Court", target: "Court Procedure", count: 1, color: "outgoing", label: "frames_rules" },
    { source: "Supreme Court", target: "Own Registry", count: 1, color: "outgoing", label: "governs" },
    { source: "Supreme Court", target: "Tribunal Decision", count: 1, color: "outgoing", label: "appellate_supervision" },
    { source: "Supreme Court", target: "Arbitration Award", count: 1, color: "outgoing", label: "appellate_supervision" },
    { source: "Supreme Court", target: "High Court Judge", count: 1, color: "outgoing", label: "appoints (via collegium)" },
    { source: "Supreme Court", target: "Tribunal Law / Arbitration Law", count: 1, color: "outgoing", label: "reviews" },
    { source: "Supreme Court", target: "Establishment of Tribunal Oversight Bodies", count: 1, color: "outgoing", label: "directs/mandates" },
    
    // Collegium relationships - OUTGOING (Blue)
    { source: "Collegium", target: "Supreme Court / High Court Judges", count: 1, color: "outgoing", label: "recommends_appointments" },
    { source: "Collegium", target: "High Court Judges", count: 1, color: "outgoing", label: "recommends_transfers" },
    
    // High Courts relationships - OUTGOING (Blue)
    { source: "High Courts", target: "Court Procedure", count: 1, color: "outgoing", label: "frames_rules" },
    { source: "High Courts", target: "Subordinate Courts", count: 1, color: "outgoing", label: "superintends" },
    { source: "High Courts", target: "Judicial Officers", count: 1, color: "outgoing", label: "controls" },
    { source: "High Courts", target: "Tribunal Decision", count: 1, color: "outgoing", label: "appellate_supervision" },
    { source: "High Courts", target: "Arbitration Award", count: 1, color: "outgoing", label: "appellate_supervision" },
    
    // State Government relationships - OUTGOING (Blue)
    { source: "State Government", target: "Judicial Officers / Subordinate Courts", count: 1, color: "outgoing", label: "pays_salaries" },
    { source: "State Government", target: "Subordinate Courts", count: 1, color: "outgoing", label: "funds" },
    { source: "State Government", target: "Judicial Officers", count: 1, color: "outgoing", label: "appoints (through exam)" },
    { source: "State Government", target: "State Legislature", count: 1, color: "incoming", label: "accountable_to" },
    
    // Tribunal relationships - OUTGOING (Blue)
    { source: "Tribunal", target: "Tribunal Law / Tribunal Rules", count: 1, color: "outgoing", label: "applies" },
    { source: "Tribunal", target: "Dispute (type-specific)", count: 1, color: "outgoing", label: "adjudicates" },
    { source: "Tribunal", target: "Central Govt (Search-cum-Selection Committee)", count: 1, color: "outgoing", label: "appoints/members" },
    { source: "Tribunal", target: "Sponsoring Ministry / Parliament", count: 1, color: "incoming", label: "accountable_to" },
    { source: "Tribunal", target: "Sponsoring Ministry / National Tribunals Commission", count: 1, color: "incoming", label: "reports_to" },
    { source: "Tribunal", target: "High Court / Supreme Court", count: 1, color: "incoming", label: "is_appellable_to" },
    
    // Arbitration Centre relationships - OUTGOING (Blue)
    { source: "Arbitration Centre", target: "Arbitration Proceedings", count: 1, color: "outgoing", label: "administers" },
    { source: "Arbitration Centre", target: "Arbitration Act / Notified Regulations", count: 1, color: "outgoing", label: "operates_under" },
    { source: "Arbitration Centre", target: "Parties / Chairperson", count: 1, color: "outgoing", label: "appoints/arbitrators" },
    { source: "Arbitration Centre", target: "Ministry of Law & Justice / Arbitration Council of India", count: 1, color: "incoming", label: "accountable_to" },
    { source: "Arbitration Centre", target: "Arbitral Awards", count: 1, color: "outgoing", label: "maintains_repository" },
    
    // Arbitration Council of India relationships - OUTGOING (Blue)
    { source: "Arbitration Council of India", target: "Arbitration Centres / Arbitrators", count: 1, color: "outgoing", label: "regulates" },
    { source: "Arbitration Council of India", target: "Depository of Awards / Accreditation", count: 1, color: "outgoing", label: "promotes_transparency" },
    
    // Arbitral Tribunal relationships - OUTGOING (Blue)
    { source: "Arbitral Tribunal", target: "Arbitration Matters", count: 1, color: "outgoing", label: "adjudicates" },
    { source: "Arbitral Tribunal", target: "Arbitration Award", count: 1, color: "outgoing", label: "awards" },
    { source: "Arbitral Tribunal", target: "Arbitration Centre / Council", count: 1, color: "incoming", label: "accountable_to" },
    
    // Arbitration Award relationships - INCOMING (Red)
    { source: "Arbitration Award", target: "High Court / Supreme Court", count: 1, color: "incoming", label: "is_appellable_to" },
    
    // Search-cum-Selection Committee relationships - OUTGOING (Blue)
    { source: "Search-cum-Selection Committee", target: "Tribunal Member / Chair", count: 1, color: "outgoing", label: "recommends" },
    
    // Judicial Officers relationships - OUTGOING (Blue)
    { source: "Judicial Officers", target: "Subordinate Courts", count: 1, color: "outgoing", label: "administers" },
    { source: "Judicial Officers", target: "High Court Rules / CPC / CrPC", count: 1, color: "incoming", label: "regulated_by" },
    
    // Subordinate Courts relationships - INCOMING (Red)
    { source: "Subordinate Courts", target: "High Court Rules / CPC / CrPC", count: 1, color: "incoming", label: "governed_by" },
    
    // Tribunal Law / Rules relationships - INCOMING (Red)
    { source: "Tribunal Law / Rules", target: "Parliament", count: 1, color: "incoming", label: "enacted_by/amended_by" },
    
    // Arbitration Act / Rules relationships - INCOMING (Red)
    { source: "Arbitration Act / Rules", target: "Parliament", count: 1, color: "incoming", label: "enacted_by/amended_by" },
    
    // Bar Council of India relationships - OUTGOING (Blue)
    { source: "Bar Council of India", target: "Advocates", count: 1, color: "outgoing", label: "regulates" },
    { source: "Bar Council of India", target: "Advocates", count: 1, color: "outgoing", label: "supervises/discipline" },
    { source: "Bar Council of India", target: "Advocates", count: 1, color: "outgoing", label: "confers/practice_certificate" },
    { source: "Bar Council of India", target: "Disciplinary Committee Orders", count: 1, color: "outgoing", label: "hears_appeals" },
    
    // Supreme Court / High Court relationships - OUTGOING (Blue)
    { source: "Supreme Court / High Court", target: "Senior Advocates", count: 1, color: "outgoing", label: "designates" },
    { source: "Supreme Court / High Court", target: "Arbitrator (if parties/institution fail)", count: 1, color: "outgoing", label: "appoints (under Arbitration Act S.11)" },
    
    // Advocates relationships - OUTGOING (Blue)
    { source: "Advocates", target: "Citizens / Parties", count: 1, color: "outgoing", label: "represent" },
    { source: "Advocates", target: "Supreme Court / High Court / Subordinate Courts", count: 1, color: "outgoing", label: "argue_in" },
    { source: "Advocates", target: "Parties in Arbitration Tribunals", count: 1, color: "outgoing", label: "may_represent" },
    { source: "Advocates", target: "Arbitration Centres / Tribunals", count: 1, color: "incoming", label: "empanelled_by" },
    { source: "Advocates", target: "Bar Council Rules / Court Rules / Arbitration Rules", count: 1, color: "incoming", label: "subject_to" },
    { source: "Advocates", target: "Arbitrator (if parties agree; not mandatory)", count: 1, color: "outgoing", label: "can_be" },
    { source: "Advocates", target: "Parties (in Arbitration, Tribunals, Empanelment)", count: 1, color: "incoming", label: "appointed_by" },
    { source: "Advocates", target: "Bar Council / Court", count: 1, color: "incoming", label: "subject_to_discipline" },
    { source: "Advocates", target: "Bar Council / Court", count: 1, color: "incoming", label: "accountable_to" },
    
    // State Bar Councils relationships - OUTGOING (Blue)
    { source: "State Bar Councils", target: "Advocates", count: 1, color: "outgoing", label: "admit/enrol" },
    { source: "State Bar Councils", target: "Advocates", count: 1, color: "outgoing", label: "maintain_rolls" },
    
    // Citizens relationships - OUTGOING (Blue)
    { source: "Citizens", target: "Courts", count: 1, color: "outgoing", label: "file_cases" },
    { source: "Citizens", target: "Courts (PIL petitioner)", count: 1, color: "outgoing", label: "initiate_PIL" },
    { source: "Citizens", target: "Arbitrator (by party choice in arbitration)", count: 1, color: "outgoing", label: "appoint" },
    { source: "Citizens", target: "Litigants, Petitioners (in Court, Tribunal, Arbitration)", count: 1, color: "outgoing", label: "may_become" },
    { source: "Citizens", target: "Tribunal / Arbitration Award / Court Decision", count: 1, color: "outgoing", label: "challenge_decisions" },
    { source: "Citizens", target: "Judiciary via PIL or Litigation", count: 1, color: "outgoing", label: "hold_accountable" },
    { source: "Citizens", target: "Court procedures, law", count: 1, color: "incoming", label: "accountable_to" },
    { source: "Citizens", target: "Legal Services Authorities / Bar Council Legal Aid", count: 1, color: "incoming", label: "receive_legal_aid_from" },
    
    // Citizens / NGOs relationships - OUTGOING (Blue)
    { source: "Citizens / NGOs", target: "Public Interest Litigation", count: 1, color: "outgoing", label: "participate_in" },
    
    // Parties (inc. Citizens) relationships - OUTGOING (Blue)
    { source: "Parties (inc. Citizens)", target: "Arbitration Centre / Arbitrator", count: 1, color: "outgoing", label: "select/arbitrate" }
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
        lawsuitData,
        config,
        colorMap
    };
}

// Make data available globally for browser usage
window.data = {
    lawsuitData,
    config,
    colorMap
};
