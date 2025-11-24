/**
 * Helper Functions for Legal System Network Diagram
 * 
 * This file contains utility functions for data processing, label positioning,
 * collision detection, and other helper operations used throughout the application.
 */

/**
 * Data Processing Utilities
 */

/**
 * Get filtered table data based on node and/or relationship filter
 * @param {Array} judicialEntityMapData - Array of relationship data
 * @param {string|null} filteredNodeId - ID of the node to filter by
 * @param {string|null} filteredEntityGroupId - ID of the entity group to filter by
 * @param {string|null} filteredRelationshipId - ID of the relationship to filter by
 * @param {string|null} filteredRelationshipGroupId - ID of the relationship group to filter by
 * @param {Array} relationshipGroupingData - Array of relationship grouping data
 * @param {Array} groupingData - Array of entity grouping data
 * @returns {Array} Filtered relationship data
 */
function getFilteredTableData(judicialEntityMapData, filteredNodeId, filteredEntityGroupId, filteredRelationshipId, filteredRelationshipGroupId, relationshipGroupingData, groupingData) {
    // If no filters, return all data
    if (!filteredNodeId && !filteredEntityGroupId && !filteredRelationshipId && !filteredRelationshipGroupId) {
        return judicialEntityMapData;
    }
    
    // Create a map of relationships to groups for quick lookup
    // Normalize keys by trimming to handle any whitespace issues
    const relationshipToGroupMap = {};
    if (relationshipGroupingData && relationshipGroupingData.length > 0) {
        relationshipGroupingData.forEach(item => {
            const normalizedKey = item.relationship ? item.relationship.trim() : '';
            if (normalizedKey) {
                relationshipToGroupMap[normalizedKey] = item.belongsTo;
            }
        });
    }
    
    
    // Create a map of entities to groups for quick lookup
    const entityToGroupMap = {};
    if (groupingData && groupingData.length > 0) {
        groupingData.forEach(item => {
            entityToGroupMap[item.node] = item.belongsTo;
        });
    }
    
    // Get entities in filtered entity group
    const entitiesInGroup = new Set();
    if (filteredEntityGroupId && groupingData) {
        groupingData.forEach(item => {
            if (item.belongsTo === filteredEntityGroupId) {
                entitiesInGroup.add(item.node);
            }
        });
    }
    
    // Return only relationships matching the filters
    const filtered = judicialEntityMapData.filter(link => {
        const matchesNode = !filteredNodeId || 
            link.source === filteredNodeId || 
            link.target === filteredNodeId;
        
        // Check entity group filter
        const matchesEntityGroup = !filteredEntityGroupId || 
            entitiesInGroup.has(link.source) || 
            entitiesInGroup.has(link.target);
        
        // Trim both values for comparison to handle any whitespace issues
        const linkLabel = link.label ? link.label.trim() : '';
        const filterLabel = filteredRelationshipId ? filteredRelationshipId.trim() : '';
        const matchesRelationship = !filteredRelationshipId || 
            linkLabel === filterLabel;
        
        // Check relationship group filter
        // Normalize the filteredRelationshipGroupId for comparison
        const normalizedGroupId = filteredRelationshipGroupId ? filteredRelationshipGroupId.trim() : null;
        const linkGroup = relationshipToGroupMap[linkLabel];
        const matchesRelationshipGroup = !normalizedGroupId || 
            linkGroup === normalizedGroupId;
        
        return matchesNode && matchesEntityGroup && matchesRelationship && matchesRelationshipGroup;
    });
    
    return filtered;
}

// Create unique entities/nodes from judicial entity map data
function createUniqueNodes(judicialEntityMapData, groupingData) {
    const uniqueNames = [...new Set([
        ...judicialEntityMapData.map(d => d.source),
        ...judicialEntityMapData.map(d => d.target)
    ])];
    
    return uniqueNames.map(name => {
        // Find the group information for this node
        const groupInfo = groupingData.find(item => item.node === name);
        return { 
            id: name, 
            name: name,
            belongsTo: groupInfo ? groupInfo.belongsTo : "Unknown",
            label: groupInfo ? groupInfo.label : name,
            isProcessFlowEntity: groupInfo ? (groupInfo.isProcessFlowEntity || false) : false
        };
    });
}

// Create properly linked diagram data
function createDiagramLinks(judicialEntityMapData, entities) {
    // First, group self-loops by node to assign loop indices
    const selfLoopCounts = {};
    
    // Count self-loops for each node
    judicialEntityMapData.forEach(d => {
        if (d.source === d.target) {
            if (!selfLoopCounts[d.source]) {
                selfLoopCounts[d.source] = 0;
            }
        }
    });
    
    return judicialEntityMapData.map(d => {
        const sourceNode = entities.find(node => node.id === d.source);
        const targetNode = entities.find(node => node.id === d.target);
        
        if (!sourceNode || !targetNode) {
            console.warn(`Missing node for link: ${d.source} -> ${d.target}`);
            return null;
        }
        
        const link = {
            source: sourceNode,
            target: targetNode,
            count: d.count,
            label: d.label,
            isProcessFlow: d.isProcessFlow || false
        };
        
        // Assign loop index for self-loops
        if (d.source === d.target) {
            link.loopIndex = selfLoopCounts[d.source];
            selfLoopCounts[d.source]++;
        }
        
        return link;
    }).filter(link => link !== null);
}

// Calculate collision score for label positioning
function calculateCollisionScore(x, y, text, svg, nodeElements) {
    let score = 0;
    const labelWidth = text.length * 7;
    const labelHeight = 16;
    const padding = 8;
    const margin = 10;
    
    svg.selectAll(".relationship-label-group").each(function() {
        const group = d3.select(this);
        const existingLabel = group.select(".relationship-label");
        if (existingLabel.empty()) return;
        
        const existingX = parseFloat(existingLabel.attr("x"));
        const existingY = parseFloat(existingLabel.attr("y"));
        const existingText = existingLabel.text();
        const existingWidth = existingText.length * 7;
        
        const distance = Math.sqrt((x - existingX) ** 2 + (y - existingY) ** 2);
        const minDistance = Math.max(labelWidth + padding, existingWidth + padding) / 2 + margin;
        
        if (distance < minDistance) {
            score += (minDistance - distance) * 10;
        }
    });
    
    nodeElements.each(function(d) {
        const nodeX = d.x;
        const nodeY = d.y;
        const nodeRadius = 30;
        const nodeLabelWidth = d.name.length * 8;
        
        const distanceToNode = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
        if (distanceToNode < nodeRadius + margin) {
            score += (nodeRadius + margin - distanceToNode) * 15;
        }
        
        const nodeLabelX = nodeX + nodeRadius + 5;
        const nodeLabelY = nodeY;
        const distanceToNodeLabel = Math.sqrt((x - nodeLabelX) ** 2 + (y - nodeLabelY) ** 2);
        const minLabelDistance = Math.max(labelWidth + padding, nodeLabelWidth) / 2 + margin;
        
        if (distanceToNodeLabel < minLabelDistance) {
            score += (minLabelDistance - distanceToNodeLabel) * 12;
        }
    });
    
    return score;
}

// Calculate total overlap for label optimization
function calculateTotalOverlap(x, y, label, allLabels, nodeElements) {
    let totalOverlap = 0;
    const margin = 8;
    const padding = 8;
    
    for (const otherLabel of allLabels) {
        if (otherLabel.id === label.id) continue;
        
        const distance = Math.sqrt((x - otherLabel.x) ** 2 + (y - otherLabel.y) ** 2);
        const minDistance = Math.max(label.width + padding, otherLabel.width + padding) / 2 + margin;
        
        if (distance < minDistance) {
            totalOverlap += (minDistance - distance);
        }
    }
    
    nodeElements.each(function(d) {
        const nodeX = d.x;
        const nodeY = d.y;
        const nodeRadius = 30;
        
        const distanceToNode = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
        if (distanceToNode < nodeRadius + margin) {
            totalOverlap += (nodeRadius + margin - distanceToNode) * 2;
        }
        
        const nodeLabelX = nodeX + nodeRadius + 5;
        const nodeLabelY = nodeY;
        const distanceToNodeLabel = Math.sqrt((x - nodeLabelX) ** 2 + (y - nodeLabelY) ** 2);
        const minLabelDistance = Math.max(label.width + padding, d.name.length * 8) / 2 + margin;
        
        if (distanceToNodeLabel < minLabelDistance) {
            totalOverlap += (minLabelDistance - distanceToNodeLabel) * 1.5;
        }
    });
    
    return totalOverlap;
}

// Export utilities for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getFilteredTableData,
        createUniqueNodes,
        createDiagramLinks,
        calculateCollisionScore,
        calculateTotalOverlap
    };
}

/**
 * Validate row data before saving
 * @param {string} source - Source entity
 * @param {string} label - Relationship label
 * @param {string} target - Target entity
 * @returns {Object} Validation result with valid boolean and message
 */
function validateRowData(source, label, target) {
    if (!source || !source.trim()) {
        return { valid: false, message: "Source entity is required" };
    }
    if (!label || !label.trim()) {
        return { valid: false, message: "Relationship is required" };
    }
    if (!target || !target.trim()) {
        return { valid: false, message: "Target entity is required" };
    }
    return { valid: true, message: "" };
}

/**
 * Get unique entities from data
 * @param {Array} data - Array of relationship data
 * @returns {Array} Array of unique entity names
 */
function getUniqueEntities(data) {
    const entities = new Set();
    if (data && Array.isArray(data)) {
        data.forEach(d => {
            if (d.source) entities.add(d.source);
            if (d.target) entities.add(d.target);
        });
    }
    return Array.from(entities).sort();
}

/**
 * Get unique relationships from data
 * @param {Array} data - Array of relationship data
 * @returns {Array} Array of unique relationship labels
 */
function getUniqueRelationships(data) {
    const relationships = new Set();
    if (data && Array.isArray(data)) {
        data.forEach(d => {
            if (d.label) relationships.add(d.label);
        });
    }
    return Array.from(relationships).sort();
}

/**
 * Get client IP address (placeholder for future implementation)
 * @returns {string|null} Client IP address or null
 */
function getClientIP() {
    // Placeholder for future IP detection
    // Would require backend service or API call
    return null;
}

/**
 * Format date for filename
 * @param {string} prefix - Filename prefix
 * @param {string} extension - File extension (without dot)
 * @returns {string} Formatted filename with timestamp
 */
function formatDateForFilename(prefix, extension) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
    return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Convert data array to CSV and trigger download
 * @param {Array} data - Array of objects to convert
 * @param {string} filename - Filename for download
 */
function convertToCSV(data, filename) {
    if (!data || data.length === 0) {
        console.error('No data to convert to CSV');
        return;
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    // Convert each row to CSV
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            return escapeCSVValue(value);
        });
        csvRows.push(values.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Escape CSV value (handles commas, quotes, newlines)
 * @param {*} value - Value to escape
 * @returns {string} Escaped CSV value
 */
function escapeCSVValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    const stringValue = String(value);
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

// Make helper functions available globally for browser usage
window.helpers = {
    getFilteredTableData,
    createUniqueNodes,
    createDiagramLinks,
    calculateCollisionScore,
    calculateTotalOverlap,
    validateRowData,
    getUniqueEntities,
    getUniqueRelationships,
    getClientIP,
    formatDateForFilename,
    convertToCSV,
    escapeCSVValue
};
