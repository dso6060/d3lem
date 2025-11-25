#!/usr/bin/env python3
"""
Convert Excel dataset to data.js format
Reads the Excel file and converts it to the JavaScript data structure
"""

import json
import sys
import os

try:
    import pandas as pd
except ImportError:
    print("pandas is required. Installing...")
    os.system("pip3 install pandas openpyxl")
    import pandas as pd

def convert_excel_to_js(excel_file, output_file):
    """Convert Excel file to JavaScript data format"""
    
    # Mapping from Excel group names to visualization group names
    group_name_mapping = {
        "Legislature": ":LegislativeAndRegulatory",
        "Executive": ":LegislativeAndRegulatory",
        "Advisory Bodies": ":LegislativeAndRegulatory",
        "Judiciary": ":Judiciary",
        "Tribunals & Arbitration": ":TribunalsAndArbitration",
        "Public Services": ":TribunalsAndArbitration",
        "Training Institutions": ":PeopleAndOfficeholders",
        "Professional Bodies": ":PeopleAndOfficeholders",
        "Staff & Administration": ":PeopleAndOfficeholders",
        "General Public": ":PeopleAndOfficeholders",
        "Oversight & Discipline": ":LegalFramework",
        "Appointment Bodies": ":NonAdministrativeEntities",
        "Constitutional Offices": ":NonAdministrativeEntities"
    }
    
    # Mapping from Excel relationship types to visualization relationship group names
    relationship_type_mapping = {
        "Appointment & Selection": "Appointments",
        "Funding & Budget Allocation": "Funding",
        "Oversight & Supervision": "Oversights",
        "Advisory & Coordination": "Accountability",
        "Governance & Rule-making": "Governance",
        "Administration & Staffing": "Operations",
        "Regulation & Professional Standards": "Governance",
        "Training & Development": "Operations",
        "Legal Service Delivery": "Operations",
        "Legislative & Policy Making": "Establishment",
        "Inter-institutional Coordination": "Operations"
    }
    
    # Read all sheets from Excel
    excel_data = pd.read_excel(excel_file, sheet_name=None)
    
    # Initialize data structures
    grouping_data = []
    relationship_grouping_data = []
    judicial_entity_map_data = []
    
    # Process each sheet
    for sheet_name, df in excel_data.items():
        
        # Process "Relationships" sheet: Entity (source), Relationship (label), Target Entity (target)
        if sheet_name == "Relationships":
            if 'Entity' in df.columns and 'Relationship' in df.columns and 'Target Entity' in df.columns:
                for _, row in df.iterrows():
                    if pd.notna(row['Entity']) and pd.notna(row['Relationship']) and pd.notna(row['Target Entity']):
                        relationship = {
                            'source': str(row['Entity']).strip(),
                            'target': str(row['Target Entity']).strip(),
                            'label': str(row['Relationship']).strip(),
                            'count': 1
                        }
                        judicial_entity_map_data.append(relationship)
        
        # Process "Entity Groupings" sheet: Entity (node), Label, Group (belongsTo)
        elif sheet_name == "Entity Groupings":
            if 'Entity' in df.columns:
                for _, row in df.iterrows():
                    if pd.notna(row['Entity']):
                        grouping = {
                            'node': str(row['Entity']).strip()
                        }
                        if 'Label' in df.columns and pd.notna(row['Label']):
                            grouping['label'] = str(row['Label']).strip()
                        if 'Group' in df.columns and pd.notna(row['Group']):
                            excel_group = str(row['Group']).strip()
                            # Map Excel group name to visualization group name
                            grouping['belongsTo'] = group_name_mapping.get(excel_group, excel_group)
                        grouping_data.append(grouping)
        
        # Process "Relationship Groupings" sheet: Relationship Type (belongsTo), Relationships (relationship)
        elif sheet_name == "Relationship Groupings":
            if 'Relationships' in df.columns and 'Relationship Type' in df.columns:
                for _, row in df.iterrows():
                    if pd.notna(row['Relationships']) and pd.notna(row['Relationship Type']):
                        # The Relationships column might contain multiple relationships separated by commas/semicolons
                        relationships_str = str(row['Relationships']).strip()
                        relationship_type = str(row['Relationship Type']).strip()
                        
                        # Split by semicolons first, then by commas
                        relationships = []
                        for part in relationships_str.split(';'):
                            relationships.extend([r.strip() for r in part.split(',') if r.strip()])
                        
                        for rel in relationships:
                            # Map Excel relationship type to visualization relationship group name
                            mapped_type = relationship_type_mapping.get(relationship_type, relationship_type)
                            rel_grouping = {
                                'relationship': rel,
                                'belongsTo': mapped_type
                            }
                            relationship_grouping_data.append(rel_grouping)
    
    # Generate JavaScript file
    js_content = """// Data Layer - Simple separation of data from logic
// This file contains only the data for the legal system relationships
// Generated from Excel dataset

// Grouping data for collapsible clusters
const groupingData = """ + json.dumps(grouping_data, indent=4) + """;

// Relationship grouping data - maps relationship labels to simple group names
const relationshipGroupingData = """ + json.dumps(relationship_grouping_data, indent=4) + """;

const judicialEntityMapData = """ + json.dumps(judicial_entity_map_data, indent=4) + """;

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
    password: "",  // Password/PIN for edit access (empty string to disable, set to enable)
    ipWhitelist: [],  // Array of allowed IP addresses (for future use)
    enableIPCheck: false  // Boolean flag to enable IP checking (false for now)
};

function applyAccessControlOverrides(overrides) {
    if (!overrides || typeof overrides !== "object") {
        return;
    }

    if (typeof overrides.password === "string") {
        accessControlConfig.password = overrides.password;
    }

    if (Array.isArray(overrides.ipWhitelist)) {
        accessControlConfig.ipWhitelist = overrides.ipWhitelist;
    }

    if (typeof overrides.enableIPCheck === "boolean") {
        accessControlConfig.enableIPCheck = overrides.enableIPCheck;
    }

    if (typeof window !== 'undefined' && window.data) {
        window.data.accessControlConfig = accessControlConfig;
    }
}

if (typeof window !== 'undefined') {
    window.applyAccessControlOverrides = applyAccessControlOverrides;

    if (window.pendingAccessControlOverrides) {
        applyAccessControlOverrides(window.pendingAccessControlOverrides);
        delete window.pendingAccessControlOverrides;
    }
}

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
"""
    
    # Write to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"\nConversion complete!")
    print(f"Found {len(judicial_entity_map_data)} relationships")
    print(f"Found {len(grouping_data)} grouping entries")
    print(f"Found {len(relationship_grouping_data)} relationship grouping entries")
    print(f"Output written to: {output_file}")

if __name__ == "__main__":
    excel_file = "Indian_Judicial_System_Complete_Dataset_Final.xlsx"
    output_file = "data.js"
    
    if not os.path.exists(excel_file):
        print(f"Error: Excel file '{excel_file}' not found!")
        sys.exit(1)
    
    convert_excel_to_js(excel_file, output_file)

