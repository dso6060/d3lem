// Utility Functions - Helper functions for the legal system visualization

// Get filtered table data based on current filter
function getFilteredTableData(lawsuitData, filteredNodeId) {
    if (!filteredNodeId) {
        return lawsuitData;
    }
    
    // Return only relationships involving the filtered node
    return lawsuitData.filter(link => 
        link.source === filteredNodeId || link.target === filteredNodeId
    );
}

// Create unique companies/nodes from lawsuit data
function createUniqueNodes(lawsuitData) {
    return [...new Set([
        ...lawsuitData.map(d => d.source),
        ...lawsuitData.map(d => d.target)
    ])].map(name => ({ id: name, name: name }));
}

// Create properly linked diagram data
function createDiagramLinks(lawsuitData, companies) {
    return lawsuitData.map(d => {
        const sourceNode = companies.find(node => node.id === d.source);
        const targetNode = companies.find(node => node.id === d.target);
        
        if (!sourceNode || !targetNode) {
            console.warn(`Missing node for link: ${d.source} -> ${d.target}`);
            return null;
        }
        
        return {
            source: sourceNode,
            target: targetNode,
            count: d.count,
            color: d.color,
            label: d.label
        };
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

// Make utilities available globally for browser usage
window.utils = {
    getFilteredTableData,
    createUniqueNodes,
    createDiagramLinks,
    calculateCollisionScore,
    calculateTotalOverlap
};
