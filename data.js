// Data Layer - Simple separation of data from logic
// This file contains only the data for the legal system relationships
// Generated from Excel dataset

// Grouping data for collapsible clusters
const groupingData = [
    {
        "node": "Parliament",
        "label": "Legislative Body",
        "belongsTo": ":LegislativeAndRegulatory"
    },
    {
        "node": "Ministry of Law & Justice",
        "label": "Executive Body",
        "belongsTo": ":LegislativeAndRegulatory"
    },
    {
        "node": "State Government",
        "label": "Executive Body",
        "belongsTo": ":LegislativeAndRegulatory"
    },
    {
        "node": "State Ministry of Law & Justice",
        "label": "Executive Body",
        "belongsTo": ":LegislativeAndRegulatory"
    },
    {
        "node": "Law Commission",
        "label": "Advisory Body",
        "belongsTo": ":LegislativeAndRegulatory"
    },
    {
        "node": "Supreme Court",
        "label": "Judiciary",
        "belongsTo": ":Judiciary"
    },
    {
        "node": "High Court",
        "label": "Judiciary",
        "belongsTo": ":Judiciary"
    },
    {
        "node": "Subordinate Court",
        "label": "Judiciary",
        "belongsTo": ":Judiciary"
    },
    {
        "node": "District Court",
        "label": "Judiciary",
        "belongsTo": ":Judiciary"
    },
    {
        "node": "District Judge",
        "label": "Judiciary",
        "belongsTo": ":Judiciary"
    },
    {
        "node": "Judicial Officers",
        "label": "Judiciary",
        "belongsTo": ":Judiciary"
    },
    {
        "node": "Tribunal",
        "label": "Tribunal Body",
        "belongsTo": ":TribunalsAndArbitration"
    },
    {
        "node": "Appellate Tribunal",
        "label": "Tribunal Body",
        "belongsTo": ":TribunalsAndArbitration"
    },
    {
        "node": "Tribunal Member/Chair",
        "label": "Tribunal Body",
        "belongsTo": ":TribunalsAndArbitration"
    },
    {
        "node": "Arbitration Centre",
        "label": "Arbitration Institution",
        "belongsTo": ":TribunalsAndArbitration"
    },
    {
        "node": "Arbitration Council of India",
        "label": "Regulatory Body",
        "belongsTo": ":TribunalsAndArbitration"
    },
    {
        "node": "Arbitrator",
        "label": "Legal Professional",
        "belongsTo": ":TribunalsAndArbitration"
    },
    {
        "node": "Legal Aid Authority",
        "label": "Public Service",
        "belongsTo": ":TribunalsAndArbitration"
    },
    {
        "node": "National Judicial Academy",
        "label": "Training Institution",
        "belongsTo": ":PeopleAndOfficeholders"
    },
    {
        "node": "State Judicial Academy",
        "label": "Training Institution",
        "belongsTo": ":PeopleAndOfficeholders"
    },
    {
        "node": "Bar Council of India",
        "label": "Professional Body",
        "belongsTo": ":PeopleAndOfficeholders"
    },
    {
        "node": "State Bar Council",
        "label": "Professional Body",
        "belongsTo": ":PeopleAndOfficeholders"
    },
    {
        "node": "Advocates",
        "label": "Legal Professional",
        "belongsTo": ":PeopleAndOfficeholders"
    },
    {
        "node": "Supreme Court Registrar",
        "label": "Staff/Admin",
        "belongsTo": ":PeopleAndOfficeholders"
    },
    {
        "node": "Supreme Court Registry",
        "label": "Staff/Admin",
        "belongsTo": ":PeopleAndOfficeholders"
    },
    {
        "node": "Judicial Staff (Supreme Court)",
        "label": "Staff/Admin",
        "belongsTo": ":PeopleAndOfficeholders"
    },
    {
        "node": "High Court Registrar",
        "label": "Staff/Admin",
        "belongsTo": ":PeopleAndOfficeholders"
    },
    {
        "node": "High Court Registry",
        "label": "Staff/Admin",
        "belongsTo": ":PeopleAndOfficeholders"
    },
    {
        "node": "Judicial Staff (High Court)",
        "label": "Staff/Admin",
        "belongsTo": ":PeopleAndOfficeholders"
    },
    {
        "node": "Judicial Staff (Subordinate Court)",
        "label": "Staff/Admin",
        "belongsTo": ":PeopleAndOfficeholders"
    },
    {
        "node": "Litigant/Public",
        "label": "General Public",
        "belongsTo": ":PeopleAndOfficeholders"
    },
    {
        "node": "Vigilance Committee",
        "label": "Oversight/Discipline",
        "belongsTo": ":NonAdministrativeEntities"
    },
    {
        "node": "Collegium (Supreme Court)",
        "label": "Judicial Appointment Body",
        "belongsTo": ":NonAdministrativeEntities"
    },
    {
        "node": "Collegium (High Court)",
        "label": "Judicial Appointment Body",
        "belongsTo": ":NonAdministrativeEntities"
    },
    {
        "node": "Search-cum-Selection Committee",
        "label": "Judicial Appointment Body",
        "belongsTo": ":NonAdministrativeEntities"
    },
    {
        "node": "State Selection Committee",
        "label": "Judicial Appointment Body",
        "belongsTo": ":NonAdministrativeEntities"
    },
    {
        "node": "Council of Ministers",
        "label": "Executive Body",
        "belongsTo": ":LegislativeAndRegulatory"
    },
    {
        "node": "Chief Minister",
        "label": "Executive Body",
        "belongsTo": ":LegislativeAndRegulatory"
    },
    {
        "node": "Prime Minister",
        "label": "Executive Body",
        "belongsTo": ":LegislativeAndRegulatory"
    },
    {
        "node": "President of India",
        "label": "Constitutional Office",
        "belongsTo": ":NonAdministrativeEntities"
    },
    {
        "node": "Governor of State",
        "label": "Constitutional Office",
        "belongsTo": ":NonAdministrativeEntities"
    },
    {
        "node": "Relevant Central Ministry",
        "label": "Executive Body",
        "belongsTo": ":LegislativeAndRegulatory"
    },
    {
        "node": "Supreme Court Judge",
        "label": "Judiciary",
        "belongsTo": ":Judiciary"
    },
    {
        "node": "High Court Judge",
        "label": "Judiciary",
        "belongsTo": ":Judiciary"
    },
    {
        "node": "Chief Justice of India",
        "label": "Judiciary",
        "belongsTo": ":Judiciary"
    },
    {
        "node": "Chief Justice of High Court",
        "label": "Judiciary",
        "belongsTo": ":Judiciary"
    }
];

// Relationship grouping data - maps relationship labels to simple group names
const relationshipGroupingData = [
    {
        "relationship": "recommends",
        "belongsTo": "Appointments"
    },
    {
        "relationship": "appoints",
        "belongsTo": "Appointments"
    },
    {
        "relationship": "performs background verification",
        "belongsTo": "Appointments"
    },
    {
        "relationship": "screens",
        "belongsTo": "Appointments"
    },
    {
        "relationship": "allocates funds",
        "belongsTo": "Funding"
    },
    {
        "relationship": "funds",
        "belongsTo": "Funding"
    },
    {
        "relationship": "supervises",
        "belongsTo": "Oversights"
    },
    {
        "relationship": "oversees",
        "belongsTo": "Oversights"
    },
    {
        "relationship": "governs",
        "belongsTo": "Oversights"
    },
    {
        "relationship": "advises",
        "belongsTo": "Accountability"
    },
    {
        "relationship": "forwards recommendation",
        "belongsTo": "Accountability"
    },
    {
        "relationship": "coordinates with",
        "belongsTo": "Accountability"
    },
    {
        "relationship": "recommends",
        "belongsTo": "Accountability"
    },
    {
        "relationship": "frames rules",
        "belongsTo": "Governance"
    },
    {
        "relationship": "self-governs",
        "belongsTo": "Governance"
    },
    {
        "relationship": "establishes",
        "belongsTo": "Governance"
    },
    {
        "relationship": "administers",
        "belongsTo": "Operations"
    },
    {
        "relationship": "appoints",
        "belongsTo": "Operations"
    },
    {
        "relationship": "appointed by",
        "belongsTo": "Operations"
    },
    {
        "relationship": "reports to",
        "belongsTo": "Operations"
    },
    {
        "relationship": "regulates",
        "belongsTo": "Governance"
    },
    {
        "relationship": "licenses",
        "belongsTo": "Governance"
    },
    {
        "relationship": "sanctioned by",
        "belongsTo": "Governance"
    },
    {
        "relationship": "accountable to",
        "belongsTo": "Governance"
    },
    {
        "relationship": "trains",
        "belongsTo": "Operations"
    },
    {
        "relationship": "trained by",
        "belongsTo": "Operations"
    },
    {
        "relationship": "governed by",
        "belongsTo": "Operations"
    },
    {
        "relationship": "provides services",
        "belongsTo": "Operations"
    },
    {
        "relationship": "initiates arbitration_with",
        "belongsTo": "Operations"
    },
    {
        "relationship": "arbitrated_by",
        "belongsTo": "Operations"
    },
    {
        "relationship": "awards_to",
        "belongsTo": "Operations"
    },
    {
        "relationship": "challenges_award_at",
        "belongsTo": "Accountability"
    },
    {
        "relationship": "reviews_award",
        "belongsTo": "Oversights"
    },
    {
        "relationship": "initiates case",
        "belongsTo": "Operations"
    },
    {
        "relationship": "appear before",
        "belongsTo": "Operations"
    },
    {
        "relationship": "enacts/amends",
        "belongsTo": "Establishment"
    },
    {
        "relationship": "establishes",
        "belongsTo": "Establishment"
    },
    {
        "relationship": "coordinates with",
        "belongsTo": "Operations"
    },
    {
        "relationship": "supervises",
        "belongsTo": "Operations"
    },
    {
        "relationship": "accountable to",
        "belongsTo": "Operations"
    },
    {
        "relationship": "vets/recommends",
        "belongsTo": "Appointments"
    },
    {
        "relationship": "belongs_to",
        "belongsTo": "Hierarchy"
    },
    {
        "relationship": "heads",
        "belongsTo": "Hierarchy"
    },
    {
        "relationship": "leads",
        "belongsTo": "Hierarchy"
    },
    {
        "relationship": "reviews",
        "belongsTo": "Oversights"
    }
];

const judicialEntityMapData = [
    {
        "source": "Parliament",
        "target": "Tribunal",
        "label": "establishes",
        "count": 1
    },
    {
        "source": "Parliament",
        "target": "Arbitration Centre",
        "label": "establishes",
        "count": 1
    },
    {
        "source": "Parliament",
        "target": "Ministry of Law & Justice",
        "label": "funds",
        "count": 1
    },
    {
        "source": "Parliament",
        "target": "Ministry of Law & Justice",
        "label": "oversees",
        "count": 1
    },
    {
        "source": "Parliament",
        "target": "Tribunal",
        "label": "oversees",
        "count": 1
    },
    {
        "source": "Parliament",
        "target": "Arbitration Centre",
        "label": "oversees",
        "count": 1
    },
    {
        "source": "Parliament",
        "target": "Law Commission",
        "label": "establishes",
        "count": 1
    },
    {
        "source": "Ministry of Law & Justice",
        "target": "Supreme Court",
        "label": "allocates funds",
        "count": 1
    },
    {
        "source": "Ministry of Law & Justice",
        "target": "High Court",
        "label": "allocates funds",
        "count": 1
    },
    {
        "source": "Ministry of Law & Justice",
        "target": "Subordinate Court",
        "label": "allocates funds",
        "count": 1
    },
    {
        "source": "Ministry of Law & Justice",
        "target": "Tribunal",
        "label": "allocates funds",
        "count": 1
    },
    {
        "source": "Ministry of Law & Justice",
        "target": "Arbitration Centre",
        "label": "allocates funds",
        "count": 1
    },
    {
        "source": "Ministry of Law & Justice",
        "target": "Supreme Court Judge",
        "label": "processes appointment",
        "count": 1
    },
    {
        "source": "Ministry of Law & Justice",
        "target": "High Court Judge",
        "label": "processes appointment",
        "count": 1
    },
    {
        "source": "Ministry of Law & Justice",
        "target": "Arbitration Council of India",
        "label": "administers",
        "count": 1
    },
    {
        "source": "Ministry of Law & Justice",
        "target": "State Government",
        "label": "coordinates with",
        "count": 1
    },
    {
        "source": "State Ministry of Law & Justice",
        "target": "High Court",
        "label": "allocates funds",
        "count": 1
    },
    {
        "source": "State Ministry of Law & Justice",
        "target": "Subordinate Court",
        "label": "allocates funds",
        "count": 1
    },
    {
        "source": "State Ministry of Law & Justice",
        "target": "State Judicial Academy",
        "label": "allocates funds",
        "count": 1
    },
    {
        "source": "State Ministry of Law & Justice",
        "target": "Legal Aid Authority",
        "label": "allocates funds",
        "count": 1
    },
    {
        "source": "Law Commission",
        "target": "Parliament",
        "label": "recommends",
        "count": 1
    },
    {
        "source": "Law Commission",
        "target": "Ministry of Law & Justice",
        "label": "recommends",
        "count": 1
    },
    {
        "source": "Supreme Court",
        "target": "Supreme Court",
        "label": "frames rules",
        "count": 1
    },
    {
        "source": "Supreme Court",
        "target": "Supreme Court",
        "label": "self-governs",
        "count": 1
    },
    {
        "source": "Supreme Court",
        "target": "Supreme Court Registry",
        "label": "governs",
        "count": 1
    },
    {
        "source": "Supreme Court",
        "target": "High Court",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "Supreme Court",
        "target": "Tribunal",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "Supreme Court",
        "target": "Arbitration Council of India",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "Supreme Court",
        "target": "Supreme Court Registrar",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "Supreme Court",
        "target": "Judicial Staff (Supreme Court)",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "Supreme Court",
        "target": "National Judicial Academy",
        "label": "trained by",
        "count": 1
    },
    {
        "source": "Supreme Court",
        "target": "Ministry of Law & Justice",
        "label": "funded by",
        "count": 1
    },
    {
        "source": "Supreme Court Registrar",
        "target": "Supreme Court Registry",
        "label": "administers",
        "count": 1
    },
    {
        "source": "Supreme Court Registrar",
        "target": "Judicial Staff (Supreme Court)",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "Judicial Staff (Supreme Court)",
        "target": "Supreme Court Registrar",
        "label": "appointed by",
        "count": 1
    },
    {
        "source": "Judicial Staff (Supreme Court)",
        "target": "Supreme Court Registrar",
        "label": "reports to",
        "count": 1
    },
    {
        "source": "High Court",
        "target": "High Court",
        "label": "frames rules",
        "count": 1
    },
    {
        "source": "High Court",
        "target": "High Court",
        "label": "self-governs",
        "count": 1
    },
    {
        "source": "High Court",
        "target": "High Court Registry",
        "label": "governs",
        "count": 1
    },
    {
        "source": "High Court",
        "target": "Subordinate Court",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "High Court",
        "target": "Tribunal",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "High Court",
        "target": "High Court Registrar",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "High Court",
        "target": "Judicial Staff (High Court)",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "High Court",
        "target": "State Judicial Academy",
        "label": "trained by",
        "count": 1
    },
    {
        "source": "High Court",
        "target": "Ministry of Law & Justice",
        "label": "funded by",
        "count": 1
    },
    {
        "source": "High Court Registrar",
        "target": "High Court Registry",
        "label": "administers",
        "count": 1
    },
    {
        "source": "High Court Registrar",
        "target": "Judicial Staff (High Court)",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "Judicial Staff (High Court)",
        "target": "High Court Registrar",
        "label": "appointed by",
        "count": 1
    },
    {
        "source": "Judicial Staff (High Court)",
        "target": "High Court Registrar",
        "label": "reports to",
        "count": 1
    },
    {
        "source": "Subordinate Court",
        "target": "Ministry of Law & Justice",
        "label": "funded by",
        "count": 1
    },
    {
        "source": "Subordinate Court",
        "target": "Judicial Staff (Subordinate Court)",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "Collegium (Supreme Court)",
        "target": "President of India",
        "label": "recommends",
        "count": 1
    },
    {
        "source": "Collegium (High Court)",
        "target": "Governor of State",
        "label": "advises",
        "count": 1
    },
    {
        "source": "President of India",
        "target": "Supreme Court Judge",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "President of India",
        "target": "High Court Judge",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "Governor of State",
        "target": "District Judge",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "Chief Minister",
        "target": "Governor of State",
        "label": "advises",
        "count": 1
    },
    {
        "source": "Chief Minister",
        "target": "Collegium (High Court)",
        "label": "forwards recommendation",
        "count": 1
    },
    {
        "source": "State Selection Committee",
        "target": "High Court Judge",
        "label": "screens",
        "count": 1
    },
    {
        "source": "State Selection Committee",
        "target": "High Court Judge",
        "label": "performs background verification",
        "count": 1
    },
    {
        "source": "State Bar Council",
        "target": "High Court Judge",
        "label": "recommends",
        "count": 1
    },
    {
        "source": "Bar Council of India",
        "target": "Advocates",
        "label": "licenses",
        "count": 1
    },
    {
        "source": "Bar Council of India",
        "target": "Advocates",
        "label": "regulates",
        "count": 1
    },
    {
        "source": "Bar Council of India",
        "target": "State Bar Council",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "State Bar Council",
        "target": "Advocates",
        "label": "licenses",
        "count": 1
    },
    {
        "source": "State Bar Council",
        "target": "Advocates",
        "label": "regulates",
        "count": 1
    },
    {
        "source": "State Bar Council",
        "target": "Bar Council of India",
        "label": "accountable to",
        "count": 1
    },
    {
        "source": "National Judicial Academy",
        "target": "Supreme Court Judge",
        "label": "trains",
        "count": 1
    },
    {
        "source": "National Judicial Academy",
        "target": "Supreme Court",
        "label": "governed by",
        "count": 1
    },
    {
        "source": "State Judicial Academy",
        "target": "High Court Judge",
        "label": "trains",
        "count": 1
    },
    {
        "source": "State Judicial Academy",
        "target": "High Court",
        "label": "governed by",
        "count": 1
    },
    {
        "source": "District Judge",
        "target": "Judicial Staff (Subordinate Court)",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "Arbitrator",
        "target": "Arbitration Centre",
        "label": "appointed by",
        "count": 1
    },
    {
        "source": "Arbitration Centre",
        "target": "Arbitrator",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "Arbitration Centre",
        "target": "Arbitration Council of India",
        "label": "administered by",
        "count": 1
    },
    {
        "source": "Arbitration Council of India",
        "target": "Ministry of Law & Justice",
        "label": "administered by",
        "count": 1
    },
    {
        "source": "Legal Aid Authority",
        "target": "Litigant/Public",
        "label": "provides services",
        "count": 1
    },
    {
        "source": "Legal Aid Authority",
        "target": "Ministry of Law & Justice",
        "label": "funded by",
        "count": 1
    },
    {
        "source": "Legal Aid Authority",
        "target": "State Government",
        "label": "funded by",
        "count": 1
    },
    {
        "source": "Litigant/Public",
        "target": "Arbitration Centre",
        "label": "initiates arbitration_with",
        "count": 1
    },
    {
        "source": "Litigant/Public",
        "target": "Arbitrator",
        "label": "arbitrated_by",
        "count": 1
    },
    {
        "source": "Advocates",
        "target": "Bar Council of India",
        "label": "sanctioned by",
        "count": 1
    },
    {
        "source": "Advocates",
        "target": "State Bar Council",
        "label": "sanctioned by",
        "count": 1
    },
    {
        "source": "Advocates",
        "target": "Supreme Court",
        "label": "appear before",
        "count": 1
    },
    {
        "source": "Advocates",
        "target": "High Court",
        "label": "appear before",
        "count": 1
    },
    {
        "source": "Advocates",
        "target": "Subordinate Court",
        "label": "appear before",
        "count": 1
    },
    {
        "source": "Litigant/Public",
        "target": "Subordinate Court",
        "label": "initiates case",
        "count": 1
    },
    {
        "source": "Litigant/Public",
        "target": "High Court",
        "label": "initiates case",
        "count": 1
    },
    {
        "source": "Litigant/Public",
        "target": "Supreme Court",
        "label": "initiates case",
        "count": 1
    },
    {
        "source": "Arbitrator",
        "target": "Litigant/Public",
        "label": "awards_to",
        "description": "Arbitrator issues an award (decision)",
        "count": 1
    },
    {
        "source": "Litigant/Public",
        "target": "District Court",
        "label": "challenges_award_at",
        "description": "Party seeks to set aside/appeal an award",
        "count": 1
    },
    {
        "source": "District Court",
        "target": "Arbitrator",
        "label": "reviews_award",
        "description": "Court reviews the award of arbitrator",
        "count": 1
    },
    {
        "source": "Litigant/Public",
        "target": "High Court",
        "label": "challenges_award_at",
        "description": "If statute provides or award is challenged/high value",
        "count": 1
    },
    {
        "source": "High Court",
        "target": "Arbitrator",
        "label": "reviews_award",
        "description": "Appellate or original review",
        "count": 1
    },
    {
        "source": "Litigant/Public",
        "target": "Supreme Court",
        "label": "challenges_award_at",
        "description": "Very limited, only constitutional/exceptional grounds",
        "count": 1
    },
    {
        "source": "Supreme Court",
        "target": "Arbitrator",
        "label": "reviews_award",
        "description": "Judicial review under special leave or writs",
        "count": 1
    },
    {
        "source": "Tribunal",
        "target": "Tribunal Member/Chair",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "Prime Minister",
        "target": "President of India",
        "label": "advises",
        "count": 1
    },
    {
        "source": "Search-cum-Selection Committee",
        "target": "Collegium (Supreme Court)",
        "label": "recommends",
        "count": 1
    },
    {
        "source": "Search-cum-Selection Committee",
        "target": "Supreme Court Judge",
        "label": "performs background verification",
        "count": 1
    },
    {
        "source": "Ministry of Law & Justice",
        "target": "Tribunal Member/Chair",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "Search-cum-Selection Committee",
        "target": "Tribunal Member/Chair",
        "label": "vets/recommends",
        "count": 1
    },
    {
        "source": "Ministry of Law & Justice",
        "target": "Tribunal",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "Relevant Central Ministry",
        "target": "Tribunal Member/Chair",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "Relevant Central Ministry",
        "target": "Tribunal",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "Supreme Court Judge",
        "target": "Supreme Court",
        "label": "belongs_to",
        "count": 1
    },
    {
        "source": "Collegium (Supreme Court)",
        "target": "Supreme Court Judge",
        "label": "recommends",
        "count": 1
    },
    {
        "source": "Collegium (Supreme Court)",
        "target": "Chief Justice of India",
        "label": "recommends",
        "count": 1
    },
    {
        "source": "President of India",
        "target": "Chief Justice of India",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "Chief Justice of India",
        "target": "Supreme Court",
        "label": "belongs_to",
        "count": 1
    },
    {
        "source": "Chief Justice of India",
        "target": "Supreme Court",
        "label": "heads",
        "count": 1
    },
    {
        "source": "Chief Justice of India",
        "target": "Collegium (Supreme Court)",
        "label": "leads",
        "count": 1
    },
    {
        "source": "Chief Justice of India",
        "target": "Supreme Court Registrar",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "Chief Justice of India",
        "target": "Judicial Staff (Supreme Court)",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "Supreme Court Registrar",
        "target": "Chief Justice of India",
        "label": "reports_to",
        "count": 1
    },
    {
        "source": "High Court Judge",
        "target": "High Court",
        "label": "belongs_to",
        "count": 1
    },
    {
        "source": "Collegium (High Court)",
        "target": "High Court Judge",
        "label": "recommends",
        "count": 1
    },
    {
        "source": "Collegium (High Court)",
        "target": "Chief Justice of High Court",
        "label": "recommends",
        "count": 1
    },
    {
        "source": "President of India",
        "target": "Chief Justice of High Court",
        "label": "appoints",
        "count": 1
    },
    {
        "source": "Chief Justice of High Court",
        "target": "High Court",
        "label": "belongs_to",
        "count": 1
    },
    {
        "source": "Chief Justice of High Court",
        "target": "High Court",
        "label": "heads",
        "count": 1
    },
    {
        "source": "Chief Justice of High Court",
        "target": "Collegium (High Court)",
        "label": "leads",
        "count": 1
    },
    {
        "source": "Chief Justice of High Court",
        "target": "High Court Registrar",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "Chief Justice of High Court",
        "target": "Judicial Staff (High Court)",
        "label": "supervises",
        "count": 1
    },
    {
        "source": "High Court Registrar",
        "target": "Chief Justice of High Court",
        "label": "reports_to",
        "count": 1
    },
    {
        "source": "District Judge",
        "target": "Subordinate Court",
        "label": "belongs_to",
        "count": 1
    },
    {
        "source": "Judicial Officers",
        "target": "High Court",
        "label": "belongs_to",
        "count": 1
    },
    {
        "source": "Judicial Officers",
        "target": "Subordinate Court",
        "label": "belongs_to",
        "count": 1
    },
    {
        "source": "National Judicial Academy",
        "target": "High Court Judge",
        "label": "trains",
        "count": 1
    },
    {
        "source": "National Judicial Academy",
        "target": "Judicial Officers",
        "label": "trains",
        "count": 1
    },
    {
        "source": "National Judicial Academy",
        "target": "District Judge",
        "label": "trains",
        "count": 1
    },
    {
        "source": "State Judicial Academy",
        "target": "Supreme Court Judge",
        "label": "trains",
        "count": 1
    },
    {
        "source": "State Judicial Academy",
        "target": "Judicial Officers",
        "label": "trains",
        "count": 1
    },
    {
        "source": "State Judicial Academy",
        "target": "District Judge",
        "label": "trains",
        "count": 1
    },
    {
        "source": "Judicial Staff (Subordinate Court)",
        "target": "Subordinate Court",
        "label": "belongs_to",
        "count": 1
    },
    {
        "source": "Judicial Staff (Supreme Court)",
        "target": "Supreme Court",
        "label": "belongs_to",
        "count": 1
    },
    {
        "source": "Judicial Staff (High Court)",
        "target": "High Court",
        "label": "belongs_to",
        "count": 1
    },
    {
        "source": "Vigilance Committee",
        "target": "Supreme Court Judge",
        "label": "oversees",
        "count": 1
    },
    {
        "source": "Vigilance Committee",
        "target": "High Court Judge",
        "label": "oversees",
        "count": 1
    },
    {
        "source": "Vigilance Committee",
        "target": "District Judge",
        "label": "oversees",
        "count": 1
    },
    {
        "source": "Vigilance Committee",
        "target": "Ministry of Law & Justice",
        "label": "belongs_to",
        "count": 1
    },
    {
        "source": "State Bar Council",
        "target": "Bar Council of India",
        "label": "belongs_to",
        "count": 1
    },
    {
        "source": "Arbitrator",
        "target": "Arbitration Centre",
        "label": "belongs_to",
        "count": 1
    },
    {
        "source": "Appellate Tribunal",
        "target": "Litigant/Public",
        "label": "hears appeal",
        "count": 1
    },
    {
        "source": "Appellate Tribunal",
        "target": "High Court",
        "label": "decision reviewed by",
        "count": 1
    },
    {
        "source": "Appellate Tribunal",
        "target": "Supreme Court",
        "label": "decision reviewed by",
        "count": 1
    },
    {
        "source": "State Government",
        "target": "State Selection Committee",
        "label": "appoints/constitutes",
        "count": 1
    },
    {
        "source": "High Court",
        "target": "State Selection Committee",
        "label": "nominates member",
        "count": 1
    },
    {
        "source": "State Selection Committee",
        "target": "High Court Judge",
        "label": "recommends",
        "count": 1
    },
    {
        "source": "Supreme Court Judge",
        "target": "Search-cum-Selection Committee",
        "label": "evaluated_by",
        "count": 1
    },
    {
        "source": "Supreme Court Judge",
        "target": "President of India",
        "label": "appointed_by",
        "count": 1
    },
    {
        "source": "Council of Ministers",
        "target": "Prime Minister",
        "label": "advises",
        "count": 1
    },
    // Process-flow relationships (marked as process flows, not entity nodes)
    {
        "source": "Supreme Court Judge",
        "target": "Collegium (Supreme Court)",
        "label": "evaluated_by",
        "count": 1,
        "isProcessFlow": true
    },
    {
        "source": "High Court Judge",
        "target": "State Selection Committee",
        "label": "evaluated_by",
        "count": 1,
        "isProcessFlow": true
    },
    {
        "source": "Collegium (High Court)",
        "target": "Governor of State",
        "label": "recommends",
        "count": 1
    },
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
    // Password intentionally omitted before pushing to remote. Set locally to enable edit mode.
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
