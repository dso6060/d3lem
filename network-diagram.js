// Visualization Logic - Core D3.js visualization functionality

class LegalSystemVisualization {
    constructor(data, config, colorMap) {
        this.lawsuitData = data.lawsuitData;
        this.config = data.config;
        this.colorMap = data.colorMap;
        
        // Global variables
        this.svg = null;
        this.simulation = null;
        this.nodes = null;
        this.links = null;
        this.nodeElements = null;
        this.linkElements = null;
        this.isAnimating = false;
        this.filteredNodeId = null;
        this.currentView = 'diagram';
        this._labelsVisible = false; // Initialize label visibility flag
    }

    // Initialize the visualization
    init() {
        this.setupSVG();
        this.setupTable();
        this.setupEventListeners();
        this.setupFilterDropdown();
        this.showDiagramView();
    }

    // Setup SVG and force simulation
    setupSVG() {
        const container = d3.select("#arrow-diagram");
        container.selectAll(".links, .nodes").remove();
        
        this.svg = container
            .attr("width", this.config.width)
            .attr("height", this.config.height);
        
        this.createArrowMarkers();
        this.createForceSimulation();
        this.prepareDiagramData();
    }

    // Create arrow markers for the two colors
    createArrowMarkers() {
        let defs = this.svg.select("defs");
        if (defs.empty()) {
            defs = this.svg.append("defs");
            
            Object.entries(this.colorMap).forEach(([colorName, colorValue]) => {
                defs.append("marker")
                    .attr("id", `arrowhead-${colorName}`)
                    .attr("viewBox", "0 -5 10 10")
                    .attr("refX", 9)
                    .attr("refY", 0)
                    .attr("orient", "auto")
                    .attr("markerWidth", 6)
                    .attr("markerHeight", 6)
                    .attr("xoverflow", "visible")
                    .append("path")
                    .attr("d", "M 0,-5 L 10 ,0 L 0,5")
                    .attr("fill", colorValue);
            });
        }
    }

    // Create force simulation
    createForceSimulation() {
        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(this.config.linkDistance).strength(0.8))
            .force("charge", d3.forceManyBody().strength(this.config.chargeStrength).distanceMax(400))
            .force("center", d3.forceCenter(this.config.width / 2, this.config.height / 2 - 100).strength(this.config.centerStrength * 0.5))
            .force("collision", d3.forceCollide().radius(this.config.nodeRadius + 10))
            .force("x", d3.forceX(this.config.width / 2).strength(this.config.xStrength * 0.3))
            .force("y", d3.forceY(this.config.height / 2 - 100).strength(this.config.yStrength * 0.3))
            .force("radial", d3.forceRadial(350, this.config.width / 2, this.config.height / 2 - 100).strength(0.05));
    }

    // Prepare data for the arrow diagram
    prepareDiagramData() {
        const companies = window.helpers.createUniqueNodes(this.lawsuitData);
        const diagramLinks = window.helpers.createDiagramLinks(this.lawsuitData, companies);
        
        // Store diagramLinks as class property for use in calculateNodeWeights
        this.diagramLinks = diagramLinks;
        
        console.log(`Created ${diagramLinks.length} links from ${this.lawsuitData.length} data entries`);
        
        this.simulation.nodes(companies);
        this.simulation.force("link").links(diagramLinks);
        
        this.createLinkElements(diagramLinks);
        this.createNodeElements(companies);
        this.addInteractivity();
    }

    // Create link elements
    createLinkElements(diagramLinks) {
        console.log("Creating link elements:", diagramLinks.length, "links");
        
        this.linkElements = this.svg.append("g")
            .attr("class", "links")
            .selectAll("path")
            .data(diagramLinks)
            .enter()
            .append("path")
            .attr("class", d => `link ${d.color}`)
            .attr("marker-end", d => `url(#arrowhead-${d.color})`)
            .attr("stroke", d => this.colorMap[d.color] || "#999")
            .attr("fill", "none")
            .style("opacity", 0)
            .attr("stroke-width", 2);
        
        console.log("Link elements created:", this.linkElements.size());
    }

    // Create node elements
    createNodeElements(companies) {
        this.nodeElements = this.svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(companies)
            .enter()
            .append("g")
            .attr("class", "node")
            .style("opacity", 0)
            .call(this.createDragBehavior());

        // Add circles to nodes
        this.nodeElements.append("circle")
            .attr("r", this.config.nodeRadius)
            .style("fill", "#333")
            .style("stroke", "#fff")
            .style("stroke-width", 2);

        // Add text labels to nodes with intelligent positioning
        this.nodeElements.append("text")
            .attr("class", "node-text")
            .attr("dx", 8)
            .attr("dy", 0)
            .style("font-size", "11px")
            .style("font-weight", "400")
            .style("fill", "#000")
            .text(d => d.name);
    }

    // Create drag behavior
    createDragBehavior() {
        return d3.drag()
            .on("start", (event, d) => this.dragstarted(event, d))
            .on("drag", (event, d) => this.dragged(event, d))
            .on("end", (event, d) => this.dragended(event, d));
    }

    // Drag event handlers
    dragstarted(event, d) {
        event.sourceEvent.preventDefault();
        
        if (this.filteredNodeId) {
            this.clearNodeFilter();
        }
        
        const connectedNodeIds = new Set();
        connectedNodeIds.add(d.id);
        
        this.lawsuitData.forEach(link => {
            if (link.source === d.id || link.target === d.id) {
                connectedNodeIds.add(link.source);
                connectedNodeIds.add(link.target);
            }
        });
        
        d._connectedNodes = connectedNodeIds;
        
        this.simulation.nodes().forEach(node => {
            if (!connectedNodeIds.has(node.id)) {
                node.fx = node.x;
                node.fy = node.y;
            }
        });
        
        this.simulation.force("charge").strength(-50);
        this.simulation.force("link").strength(0.1);
        
        if (!event.active) this.simulation.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
        
        this.highlightSelectedNode(d);
        
        setTimeout(() => {
            this.showNodeRelationshipLabels(d);
        }, 50);
    }

    dragged(event, d) {
        const connectedNodeIds = d._connectedNodes || new Set([d.id]);
        
        const nodeRadius = this.config.nodeRadius;
        
        // Allow free dragging - only constrain to SVG bounds
        let newX = event.x;
        let newY = event.y;
        
        // Ensure nodes stay within SVG bounds (accounting for node labels)
        // Node labels can extend up to 60px from node center
        const margin = nodeRadius + 60;
        if (newX < margin) newX = margin;
        if (newX > this.config.width - margin) newX = this.config.width - margin;
        if (newY < margin) newY = margin;
        if (newY > this.config.height - margin) newY = this.config.height - margin;
        
        d.fx = newX;
        d.fy = newY;
        
        this.simulation.nodes().forEach(node => {
            if (!connectedNodeIds.has(node.id)) {
                node.fx = node.x;
                node.fy = node.y;
            }
        });
        
        // Show tethered labels for this node's relationships during drag
        this.showNodeRelationshipLabels(d);
        
        if (!d._labelUpdateScheduled) {
            d._labelUpdateScheduled = true;
            this.updateRelationshipLabels();
            
            setTimeout(() => {
                this.optimizeNodeLabelPositions();
            }, 50);
            
            setTimeout(() => {
                d._labelUpdateScheduled = false;
            }, 16);
        }
    }

    dragended(event, d) {
        this.simulation.force("charge").strength(this.config.chargeStrength);
        this.simulation.force("link").strength(1);
        
        if (!event.active) this.simulation.alphaTarget(0);
        
        // Keep the node at its dragged position (don't release it back to elliptical constraints)
        // d.fx and d.fy remain set to keep the node fixed at its dragged position
        
        const connectedNodeIds = d._connectedNodes || new Set([d.id]);
        this.simulation.nodes().forEach(node => {
            if (!connectedNodeIds.has(node.id)) {
                node.fx = null;
                node.fy = null;
            }
        });
        
        delete d._connectedNodes;
        
        this.removeHighlighting();
        
        // Keep labels visible after drag ends - they'll be hidden when mouse leaves
        // setTimeout(() => {
        //     this.hideRelationshipLabel();
        // }, 100);
    }

    // Calculate node weights based on number of connections
    calculateNodeWeights(nodes) {
        const weights = {};
        
        // Safety check - return empty weights if diagramLinks not available yet
        if (!this.diagramLinks || !Array.isArray(this.diagramLinks)) {
            console.warn("diagramLinks not available yet, returning empty weights");
            return weights;
        }
        
        // Count connections for each node
        this.diagramLinks.forEach(link => {
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            
            weights[sourceId] = (weights[sourceId] || 0) + 1;
            weights[targetId] = (weights[targetId] || 0) + 1;
        });
        
        // Normalize weights to 0-1 range
        const maxConnections = Math.max(...Object.values(weights));
        const minConnections = Math.min(...Object.values(weights));
        const weightRange = maxConnections - minConnections;
        
        Object.keys(weights).forEach(nodeId => {
            if (weightRange > 0) {
                weights[nodeId] = (weights[nodeId] - minConnections) / weightRange;
            } else {
                weights[nodeId] = 0.5; // All nodes have same weight
            }
        });
        
        return weights;
    }

    // Update positions during simulation
    ticked() {
        const nodeRadius = this.config.nodeRadius;
        const centerX = this.config.width / 2;
        const centerY = this.config.height / 2;
        
        // Define elliptical boundaries (horizontal major axis, vertical minor axis)
        const innerSemiMajor = this.config.width * 0.15;   // 15% of width for inner ellipse (closer to center)
        const innerSemiMinor = this.config.height * 0.08;  // 8% of height for inner ellipse
        const outerSemiMajor = this.config.width * 0.45;   // 45% of width for outer ellipse
        const outerSemiMinor = this.config.height * 0.28;  // 28% of height for outer ellipse
        
        // Calculate node weights based on connections
        const nodes = this.simulation.nodes();
        const nodeWeights = this.calculateNodeWeights(nodes);
        
        nodes.forEach((d, i) => {
            // Only apply elliptical constraints to nodes that are NOT being dragged
            if (d.fx === undefined && d.fy === undefined) {
                // Get node weight (0 = least connected, 1 = most connected)
                const weight = nodeWeights[d.id] || 0;
                
                // Calculate elliptical distance from center
                const dx = d.x - centerX;
                const dy = d.y - centerY;
                
                // Calculate target ellipse based on weight
                // Higher weight = closer to center (smaller ellipse)
                const targetSemiMajor = innerSemiMajor + (outerSemiMajor - innerSemiMajor) * (1 - weight);
                const targetSemiMinor = innerSemiMinor + (outerSemiMinor - innerSemiMinor) * (1 - weight);
                
                const targetEllipseDist = (dx * dx) / (targetSemiMajor * targetSemiMajor) + (dy * dy) / (targetSemiMinor * targetSemiMinor);
                
                // If node is outside its target ellipse, project it back
                if (targetEllipseDist > 1) {
                    // Calculate parametric angle for even distribution around target ellipse
                    // Use node index to ensure consistent positioning
                    const baseAngle = (2 * Math.PI * i) / nodes.length;
                    // Add slight randomization based on weight to avoid perfect alignment
                    const angleVariation = (weight - 0.5) * 0.3; // ±0.15 radians variation
                    const parametricAngle = baseAngle + angleVariation;
                    
                    d.x = centerX + targetSemiMajor * Math.cos(parametricAngle);
                    d.y = centerY + targetSemiMinor * Math.sin(parametricAngle);
                }
            }
            
            // Ensure all nodes stay within SVG bounds (both dragged and non-dragged)
            // Account for node labels which can extend up to 60px from node center
            const margin = nodeRadius + 60;
            if (d.x < margin) d.x = margin;
            if (d.x > this.config.width - margin) d.x = this.config.width - margin;
            if (d.y < margin) d.y = margin;
            if (d.y > this.config.height - margin) d.y = this.config.height - margin;
        });
        
        this.linkElements
            .attr("d", d => {
                if (!d.source || !d.target || d.source.x === undefined || d.target.x === undefined) {
                    console.warn("Invalid link data:", d);
                    return "M0,0L0,0";
                }
                
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy);
                
                const sweep = dx < 0 ? 0 : 1;
                const path = `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,${sweep} ${d.target.x},${d.target.y}`;
                return path;
            });
        
        this.nodeElements
            .attr("transform", d => `translate(${d.x},${d.y})`);
        
        // Update relationship labels if they're visible
        if (this._labelsVisible) {
            this.updateRelationshipLabels();
        }
        
        // Optimize label positions more frequently to prevent overlaps
        if (Math.random() < 0.3) {
            setTimeout(() => {
                this.optimizeNodeLabelPositions();
            }, 0);
        }
    }

    // Add interactivity to nodes and links
    addInteractivity() {
        this.nodeElements
            .on("mouseover", (event, d) => {
                const selectedNode = this.svg.attr("data-selected-node");
                if (!selectedNode) {
                    this.showRelatedNodesOnHover(d);
                }
                // Always show tethered labels for this node's relationships on hover
                this.showNodeRelationshipLabels(d);
            })
            .on("mouseout", (event, d) => {
                const selectedNode = this.svg.attr("data-selected-node");
                if (!selectedNode) {
                    this.restoreNormalView();
                    // Hide relationship labels when mouse leaves node with a small delay
                    setTimeout(() => {
                        this.hideRelationshipLabel();
                    }, 100);
                }
            })
            .on("click", (event, d) => {
                if (this.filteredNodeId) {
                    this.clearNodeFilter();
                }
            });

        this.linkElements
            .on("mouseover", (event, d) => {
                const selectedNode = this.svg.attr("data-selected-node");
                if (!selectedNode) {
                    this.showRelatedNodesOnHover(d.source);
                }
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 2.5);
                
                // Show the simple relationship label for this specific arrow
                this.showArrowRelationshipLabel(d, event.currentTarget);
                
                // Also show the complex label in the corner
                this.showTooltip(event, `${d.source.name} → ${d.target.name}: ${d.label}`);
            })
            .on("mouseout", (event, d) => {
                const selectedNode = this.svg.attr("data-selected-node");
                if (!selectedNode) {
                    this.restoreNormalView();
                }
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 1.5);
                this.hideTooltip();
                
                // Hide the arrow relationship label
                this.svg.selectAll(".arrow-relationship-label").remove();
            });
    }

    // Show diagram view
    showDiagramView() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const toggleBtn = document.getElementById("toggleViewBtn");
        toggleBtn.disabled = true;
        toggleBtn.textContent = "Show Table View";
        
        const tableView = document.getElementById("table-view");
        const diagramView = document.getElementById("diagram-view");
        
        tableView.classList.remove("active");
        tableView.classList.add("fade-out");
        
        setTimeout(() => {
            diagramView.classList.add("active");
            
            this.nodeElements
                .each(function(d, i) {
                    const angle = (i / this.nodeElements.size()) * 2 * Math.PI;
                    const radius = Math.min(this.config.width, this.config.height) * 0.3;
                    const textMargin = 100;
                    const centerX = this.config.width / 2;
                    const centerY = this.config.height / 2 - 100;
                    
                    d.x = centerX + Math.cos(angle) * radius;
                    d.y = centerY + Math.sin(angle) * radius;
                    
                    d.x = Math.max(30 + textMargin, Math.min(this.config.width - 30 - textMargin, d.x));
                    d.y = Math.max(30 + textMargin, Math.min(this.config.height - 30 - textMargin, d.y));
                }.bind(this))
                .transition()
                .duration(800)
                .delay((d, i) => i * 100)
                .style("opacity", 1)
                .attr("transform", d => `translate(${d.x}, ${d.y})`);
            
            this.linkElements
                .transition()
                .duration(800)
                .delay(400)
                .style("opacity", 1);
            
            console.log("Making links visible, opacity set to 1");
            
            this.simulation.on("tick", () => this.ticked());
            this.simulation.alpha(1).restart();
            
            console.log("Simulation started with", this.simulation.nodes().length, "nodes and", this.simulation.force("link").links().length, "links");
            
            setTimeout(() => {
                toggleBtn.disabled = false;
                this.isAnimating = false;
                this.currentView = 'diagram';
                
                // Optimize label positions after simulation stabilizes
                setTimeout(() => {
                    this.optimizeNodeLabelPositions();
                }, 500);
                
                if (this.filteredNodeId) {
                    setTimeout(() => {
                        this.showFilteredNodeLabels(this.filteredNodeId);
                    }, 200);
                }
            }, 2000);
            
        }, 800);
    }

    // Setup the data table
    setupTable() {
        const tableBody = d3.select("#table-body");
        
        // Clear existing rows
        tableBody.selectAll("tr").remove();
        
        // Get filtered data if filter is active
        const dataToShow = window.helpers.getFilteredTableData(this.lawsuitData, this.filteredNodeId);
        
        // Create rows for each lawsuit
        const rows = tableBody.selectAll("tr")
            .data(dataToShow)
            .enter()
            .append("tr")
            .attr("class", "table-row")
            .style("opacity", 0)
            .transition()
            .duration(500)
            .style("opacity", 1);
        
        // Add cells for each row
        rows.each(function(d) {
            const row = d3.select(this);
            row.append("td").text(d.source);
            row.append("td").text(d.label);
            row.append("td").text(d.target);
        });
    }

    // Setup event listeners
    setupEventListeners() {
        document.getElementById("toggleViewBtn").addEventListener("click", () => this.toggleView());
        document.getElementById("nodeFilter").addEventListener("change", (event) => this.handleNodeFilter(event));
        document.getElementById("clearFilter").addEventListener("click", () => this.clearNodeFilter());
    }

    // Setup filter dropdown
    setupFilterDropdown() {
        const nodeFilter = document.getElementById("nodeFilter");
        
        // Get unique node names
        const uniqueNodes = [...new Set([
            ...this.lawsuitData.map(d => d.source),
            ...this.lawsuitData.map(d => d.target)
        ])].sort();
        
        // Clear existing options
        nodeFilter.innerHTML = '<option value="">Show All Entities</option>';
        
        // Add options for each node
        uniqueNodes.forEach(nodeName => {
            const option = document.createElement("option");
            option.value = nodeName;
            option.textContent = nodeName;
            nodeFilter.appendChild(option);
        });
    }

    // Toggle between diagram and table views
    toggleView() {
        if (this.isAnimating) return;
        
        if (this.currentView === 'diagram') {
            this.showTableView();
        } else {
            this.showDiagramView();
        }
    }

    // Show table view
    showTableView() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const toggleBtn = document.getElementById("toggleViewBtn");
        toggleBtn.disabled = true;
        toggleBtn.textContent = "Show Diagram View";
        
        const tableView = document.getElementById("table-view");
        const diagramView = document.getElementById("diagram-view");
        
        // Stop simulation
        this.simulation?.stop();
        
        // Fade out diagram
        diagramView.classList.remove("active");
        diagramView.classList.add("fade-out");
        
        this.nodeElements
            ?.transition()
            .duration(500)
            .style("opacity", 0);
        
        this.linkElements
            ?.transition()
            .duration(500)
            .style("opacity", 0);
        
        setTimeout(() => {
            tableView.classList.remove("fade-out");
            tableView.classList.add("active");
            
            this.setupTable();
            
            setTimeout(() => {
                toggleBtn.disabled = false;
                this.isAnimating = false;
                this.currentView = 'table';
            }, 1000);
            
        }, 500);
    }

    // Handle node filter change
    handleNodeFilter(event) {
        const selectedNodeId = event.target.value;
        
        if (selectedNodeId) {
            this.applyNodeFilter(selectedNodeId);
        } else {
            this.clearNodeFilter();
        }
    }

    // Apply node filter
    applyNodeFilter(nodeId) {
        this.filteredNodeId = nodeId;
        
        // Find the selected node data
        const selectedNode = this.nodeElements.data().find(d => d.id === nodeId);
        if (!selectedNode) return;
        
        // Apply enhanced highlighting using the same system as mouse hover
        this.highlightSelectedNode(selectedNode);
        
        // Show relationship labels for filtered node
        if (this.currentView === 'diagram') {
            setTimeout(() => {
                this.showFilteredNodeLabels(nodeId);
            }, 200);
        }
        
        // Update table
        this.setupTable();
    }

    // Clear node filter
    clearNodeFilter() {
        this.filteredNodeId = null;
        
        // Reset all nodes and links to full opacity
        this.nodeElements?.style("opacity", 1);
        this.linkElements?.style("opacity", 1);
        
        // Hide relationship labels
        this.hideRelationshipLabel();
        
        // Reset dropdown
        document.getElementById("nodeFilter").value = "";
        
        // Update table
        this.setupTable();
    }

    // Highlighting functions for selected node and connections
    highlightSelectedNode(selectedNode) {
        // First, dim all elements
        this.nodeElements
            .style("opacity", 0.3)
            .style("z-index", 1);
        
        this.linkElements
            .style("opacity", 0.2)
            .style("z-index", 1);
        
        // Find connected nodes and links
        const connectedNodeIds = new Set();
        const connectedLinks = this.linkElements.filter(d => {
            if (d.source.id === selectedNode.id || d.target.id === selectedNode.id) {
                connectedNodeIds.add(d.source.id);
                connectedNodeIds.add(d.target.id);
                return true;
            }
            return false;
        });
        
        // Highlight connected nodes with bold styling and enhanced labels
        this.nodeElements.filter(d => connectedNodeIds.has(d.id))
            .style("opacity", 1)
            .style("z-index", 10)
            .select("circle")
            .style("stroke-width", 4)
            .style("stroke", "#ff6b35")
            .style("filter", "drop-shadow(0 0 6px rgba(255, 107, 53, 0.6))");
        
        // Enhance connected node labels with larger font and background
        this.nodeElements.filter(d => connectedNodeIds.has(d.id))
            .select(".node-text")
            .style("font-size", "14px")
            .style("font-weight", "700")
            .style("fill", "#1f4e79")  // Darker blue instead of orange
            .style("stroke", "#fff")
            .style("stroke-width", "2px")
            .style("paint-order", "stroke fill")
            .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.3))");
        
        // Bold the selected node even more with enhanced label
        this.nodeElements.filter(d => d.id === selectedNode.id)
            .style("opacity", 1)
            .style("z-index", 20)
            .select("circle")
            .style("stroke-width", 5)
            .style("stroke", "#ff0000")
            .style("filter", "drop-shadow(0 0 10px rgba(255, 0, 0, 0.8))");
        
        // Enhance selected node label with largest font and strong background
        this.nodeElements.filter(d => d.id === selectedNode.id)
            .select(".node-text")
            .style("font-size", "16px")
            .style("font-weight", "900")
            .style("fill", "#0d3a5f")  // Even darker blue instead of red
            .style("stroke", "#fff")
            .style("stroke-width", "3px")
            .style("paint-order", "stroke fill")
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.5))");
        
        // Highlight connected links
        connectedLinks
            .style("opacity", 1)
            .style("z-index", 10)
            .style("stroke-width", 3)
            .style("filter", "drop-shadow(0 0 4px rgba(0, 0, 0, 0.3))");
        
        // Store selection state
        this.svg.attr("data-selected-node", selectedNode.id);
    }

    removeHighlighting() {
        // Reset all elements to normal state
        this.nodeElements
            .style("opacity", 1)
            .style("z-index", 1)
            .select("circle")
            .style("stroke-width", 2)
            .style("stroke", "#fff")
            .style("filter", "none");
        
        // Reset all node text labels to normal styling
        this.nodeElements.select(".node-text")
            .transition()
            .duration(200)
            .style("font-size", "11px")
            .style("font-weight", "400")
            .style("fill", "#000")
            .style("stroke", "none")
            .style("stroke-width", "0px")
            .style("filter", "none");
        
        this.linkElements
            .style("opacity", 1)
            .style("z-index", 1)
            .style("stroke-width", 1.5)
            .style("filter", "none");
        
        // Clear selection state
        this.svg.attr("data-selected-node", null);
    }

    // Show relationship labels for a specific node
    showNodeRelationshipLabels(node) {
        console.log("showNodeRelationshipLabels called for node:", node.id);
        
        // Remove any existing relationship labels first
        this.hideRelationshipLabel();
        
        // Enable label visibility AFTER removing existing labels
        this._labelsVisible = true;
        console.log("_labelsVisible set to:", this._labelsVisible);
        
        // Find all links connected to this node
        const connectedLinks = [];
        this.linkElements.each(function(d, i) {
            if (d.source.id === node.id || d.target.id === node.id) {
                console.log("Found connected link:", d.source.id, "->", d.target.id, "label:", d.label);
                connectedLinks.push({ 
                    link: d, 
                    element: this, 
                    index: i,
                    isOutgoing: d.source.id === node.id
                });
            }
        });
        
        console.log("Total connected links found:", connectedLinks.length);
        console.log("About to create labels, _labelsVisible is:", this._labelsVisible);
        
        // Create simple visible labels for testing
        connectedLinks.forEach((linkData, i) => {
            console.log("Creating label", i, "_labelsVisible is:", this._labelsVisible);
            this.createSimpleLabel(linkData.link, linkData.element, i);
        });
    }

    hideRelationshipLabel() {
        // Disable label visibility
        this._labelsVisible = false;
        
        // Remove all relationship labels
        this.svg.selectAll(".relationship-label-group").remove();
    }

    // Show relationship label for a specific arrow on hover
    showArrowRelationshipLabel(linkData, linkElement) {
        // Remove any existing arrow relationship labels
        this.svg.selectAll(".arrow-relationship-label").remove();
        
        // Get midpoint of the link
        const sourceX = linkData.source.x;
        const sourceY = linkData.source.y;
        const targetX = linkData.target.x;
        const targetY = linkData.target.y;
        
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;
        
        // Create a simple group for the arrow label
        const group = this.svg.append("g")
            .attr("class", "arrow-relationship-label")
            .style("pointer-events", "none")
            .style("opacity", 1)
            .style("z-index", 100);
        
        // Create background rectangle
        const padding = 8;
        const textWidth = linkData.label.length * 8;
        const textHeight = 16;
        
        const rect = group.append("rect")
            .attr("x", midX - (textWidth/2) - padding)
            .attr("y", midY - (textHeight/2) - padding/2)
            .attr("width", textWidth + (padding * 2))
            .attr("height", textHeight + padding)
            .style("fill", "rgba(255, 255, 255, 1.0)")
            .style("stroke", "#000")
            .style("stroke-width", 2)
            .style("rx", 4)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
        
        // Create text label
        const text = group.append("text")
            .attr("x", midX)
            .attr("y", midY)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#000")
            .text(linkData.label);
    }

    // Create simple visible label for testing
    createSimpleLabel(linkData, linkElement, index) {
        console.log("createSimpleLabel called with:", linkData.label, "_labelsVisible:", this._labelsVisible);
        
        // Only create labels if visibility is enabled
        if (!this._labelsVisible) {
            console.log("Labels not visible, returning");
            return;
        }
        
        // Get midpoint of the link
        const sourceX = linkData.source.x;
        const sourceY = linkData.source.y;
        const targetX = linkData.target.x;
        const targetY = linkData.target.y;
        
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;
        
        console.log("Creating label at position:", midX, midY, "for label:", linkData.label);
        
        // Create a simple group
        const group = this.svg.append("g")
            .attr("class", "relationship-label-group")
            .style("pointer-events", "none")
            .style("opacity", 1)
            .style("z-index", 100)
            .datum(linkData); // Store link data for updates
        
        console.log("Label group created, adding rectangle and text");
        
        // Create background rectangle
        const padding = 8;
        const textWidth = linkData.label.length * 8;
        const textHeight = 16;
        
        const rect = group.append("rect")
            .attr("x", midX - (textWidth/2) - padding)
            .attr("y", midY - (textHeight/2) - padding/2)
            .attr("width", textWidth + (padding * 2))
            .attr("height", textHeight + padding)
            .style("fill", "rgba(255, 255, 255, 1.0)")
            .style("stroke", "#000")
            .style("stroke-width", 2)
            .style("rx", 4)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
        
        console.log("Rectangle created at:", midX - (textWidth/2) - padding, midY - (textHeight/2) - padding/2);
        
        // Create text label
        const text = group.append("text")
            .attr("x", midX)
            .attr("y", midY)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#000")
            .text(linkData.label);
        
        console.log("Text label created with text:", linkData.label);
    }

    // Label visibility control flag - initialized in constructor

    // Create tethered label with grouped labelbox
    createTetheredLabel(linkData, linkElement, linkIndex, labelIndex) {
        const path = d3.select(linkElement);
        
        // Check if the path element exists and has a valid length
        if (!path.node() || !path.node().getTotalLength) {
            return;
        }
        
        const pathLength = path.node().getTotalLength();
        if (pathLength === 0) {
            return;
        }
        
        // Calculate position along the arrow path
        const position = 0.3 + (labelIndex * 0.15); // Spread labels along the arrow
        const point = path.node().getPointAtLength(pathLength * position);
        
        // Create a group for the label and labelbox
        const labelId = `tethered-label-${linkData.source.id}-${linkData.target.id}-${labelIndex}`;
        const group = this.svg.append("g")
            .attr("class", "relationship-label-group tethered-label")
            .attr("id", labelId)
            .style("pointer-events", "none")
            .style("opacity", 0)
            .transition()
            .duration(300)
            .style("opacity", 1);
        
        // Create labelbox background
        const padding = 6;
        const textWidth = linkData.label.length * 7;
        const textHeight = 14;
        
        const labelbox = group.append("rect")
            .attr("class", "relationship-labelbox")
            .attr("x", point.x - (textWidth/2) - padding)
            .attr("y", point.y - (textHeight/2) - padding/2)
            .attr("width", textWidth + (padding * 2))
            .attr("height", textHeight + padding)
            .style("fill", "rgba(255, 255, 255, 0.95)")
            .style("stroke", linkData.color === "outgoing" ? "#1f77b4" : "#d62728")
            .style("stroke-width", 2)
            .style("rx", 4)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");
        
        // Create label text
        const label = group.append("text")
            .attr("class", "relationship-label-text")
            .attr("x", point.x)
            .attr("y", point.y)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "11px")
            .style("font-weight", "600")
            .style("fill", "#333")
            .text(linkData.label);
        
        // Create connection line from label to arrow
        const connectionLine = group.append("line")
            .attr("class", "label-connection-line")
            .attr("x1", point.x)
            .attr("y1", point.y)
            .attr("x2", point.x)
            .attr("y2", point.y)
            .style("stroke", linkData.color === "outgoing" ? "#1f77b4" : "#d62728")
            .style("stroke-width", 1.5)
            .style("stroke-dasharray", "2,2")
            .style("opacity", 0.6);
        
        // Store reference for updates
        group.datum({
            linkData: linkData,
            linkElement: linkElement,
            pathLength: pathLength,
            position: position
        });
    }

    updateRelationshipLabels() {
        // Only update labels if they are visible
        if (!this._labelsVisible) {
            return;
        }
        
        this.svg.selectAll(".relationship-label-group").each(function() {
            const group = d3.select(this);
            const linkData = group.datum();
            
            if (!linkData || !linkData.source || !linkData.target) return;
            
            // Calculate midpoint of current link positions
            const sourceX = linkData.source.x;
            const sourceY = linkData.source.y;
            const targetX = linkData.target.x;
            const targetY = linkData.target.y;
            
            const midX = (sourceX + targetX) / 2;
            const midY = (sourceY + targetY) / 2;
            
            // Update labelbox position
            const rect = group.select("rect");
            const text = group.select("text");
            
            if (rect.node()) {
                const padding = 8;
                const textWidth = linkData.label.length * 8;
                const textHeight = 16;
                
                rect
                    .attr("x", midX - (textWidth/2) - padding)
                    .attr("y", midY - (textHeight/2) - padding/2);
            }
            
            if (text.node()) {
                text
                    .attr("x", midX)
                    .attr("y", midY);
            }
            
        });
    }

    optimizeNodeLabelPositions() {
        // Intelligent label positioning to avoid overlaps
        const nodes = this.nodeElements.nodes();
        const nodeData = nodes.map(node => ({
            element: node,
            data: d3.select(node).datum(),
            text: d3.select(node).select('.node-text')
        }));

        // Calculate optimal positions for each label
        nodeData.forEach((node, i) => {
            // Calculate radial position for better elliptical distribution
            const centerX = this.config.width / 2;
            const centerY = this.config.height / 2;
            const angle = Math.atan2(node.data.y - centerY, node.data.x - centerX);
            
            // Calculate elliptical scaling factors
            const ellipseScaleX = 1.0; // Horizontal scaling (major axis)
            const ellipseScaleY = 0.6; // Vertical scaling (minor axis)
            
            const positions = [
                { dx: 18, dy: 0 },   // Right (horizontal - more space)
                { dx: -18, dy: 0 },  // Left (horizontal - more space)
                { dx: 0, dy: -15 },  // Above (vertical - less space)
                { dx: 0, dy: 15 },   // Below (vertical - less space)
                { dx: 15, dy: -10 }, // Top-right
                { dx: -15, dy: -10 }, // Top-left
                { dx: 15, dy: 10 },  // Bottom-right
                { dx: -15, dy: 10 }, // Bottom-left
                // Elliptical-aware positions
                { dx: Math.cos(angle) * 18 * ellipseScaleX, dy: Math.sin(angle) * 15 * ellipseScaleY },     // Radial outward (elliptical)
                { dx: Math.cos(angle) * -18 * ellipseScaleX, dy: Math.sin(angle) * -15 * ellipseScaleY },   // Radial inward (elliptical)
                { dx: Math.cos(angle + Math.PI/2) * 15 * ellipseScaleX, dy: Math.sin(angle + Math.PI/2) * 15 * ellipseScaleY }, // Perpendicular
                { dx: Math.cos(angle - Math.PI/2) * 15 * ellipseScaleX, dy: Math.sin(angle - Math.PI/2) * 15 * ellipseScaleY }  // Perpendicular opposite
            ];

            let bestPosition = positions[0];
            let minOverlap = Infinity;

            // Test each position and find the one with least overlap
            positions.forEach(pos => {
                const testX = node.data.x + pos.dx;
                const testY = node.data.y + pos.dy;
                
                // Check if label position would be within SVG bounds
                const labelMargin = 20; // Margin from edges
                if (testX < labelMargin || testX > this.config.width - labelMargin ||
                    testY < labelMargin || testY > this.config.height - labelMargin) {
                    return; // Skip this position if it would go outside bounds
                }
                
                let overlap = 0;
                nodeData.forEach((otherNode, j) => {
                    if (i === j) return;
                    
                    const otherX = otherNode.data.x + (otherNode.text.attr('dx') || 8);
                    const otherY = otherNode.data.y + (otherNode.text.attr('dy') || 0);
                    
                    const distance = Math.sqrt((testX - otherX) ** 2 + (testY - otherY) ** 2);
                    const textWidth = Math.max(node.data.name.length * 6, 40); // Approximate text width
                    
                    if (distance < textWidth) {
                        overlap += (textWidth - distance);
                    }
                });
                
                if (overlap < minOverlap) {
                    minOverlap = overlap;
                    bestPosition = pos;
                }
            });

            // Apply the best position
            node.text
                .transition()
                .duration(200)
                .attr("dx", bestPosition.dx)
                .attr("dy", bestPosition.dy);
        });
    }

    showRelatedNodesOnHover(hoveredNode) {
        // Don't apply hover effects if a filter is active
        if (this.filteredNodeId) {
            return;
        }
        
        // Find all connected node IDs
        const connectedNodeIds = new Set();
        connectedNodeIds.add(hoveredNode.id);
        
        // Find all links connected to the hovered node
        this.lawsuitData.forEach(link => {
            if (link.source === hoveredNode.id || link.target === hoveredNode.id) {
                connectedNodeIds.add(link.source);
                connectedNodeIds.add(link.target);
            }
        });
        
        // Fade all nodes except connected ones
        this.nodeElements
            .transition()
            .duration(200)
            .style("opacity", d => connectedNodeIds.has(d.id) ? 1 : 0.2);
        
        // Highlight connected node labels with enhanced styling
        this.nodeElements.filter(d => connectedNodeIds.has(d.id))
            .select(".node-text")
            .transition()
            .duration(200)
            .style("font-size", d => d.id === hoveredNode.id ? "16px" : "14px")
            .style("font-weight", d => d.id === hoveredNode.id ? "900" : "700")
            .style("fill", d => d.id === hoveredNode.id ? "#0d3a5f" : "#1f4e79")
            .style("stroke", "#fff")
            .style("stroke-width", "2px")
            .style("paint-order", "stroke fill")
            .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.3))");
        
        // Fade all links except connected ones
        this.linkElements
            .transition()
            .duration(200)
            .style("opacity", d => connectedNodeIds.has(d.source.id) && connectedNodeIds.has(d.target.id) ? 1 : 0.2);
    }

    restoreNormalView() {
        // Don't restore if a filter is active
        if (this.filteredNodeId) {
            return;
        }
        
        // Restore all nodes opacity and styling
        this.nodeElements
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("z-index", 1);
        
        // Restore node circles to normal styling
        this.nodeElements.select("circle")
            .transition()
            .duration(200)
            .style("stroke-width", 2)
            .style("stroke", "#fff")
            .style("filter", "none");
        
        // Restore all node text labels to normal styling
        this.nodeElements.select(".node-text")
            .transition()
            .duration(200)
            .style("font-size", "11px")
            .style("font-weight", "400")
            .style("fill", "#000")
            .style("stroke", "none")
            .style("stroke-width", "0px")
            .style("filter", "none");
        
        // Restore all links opacity and styling
        this.linkElements
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("z-index", 1)
            .style("stroke-width", 1.5)
            .style("filter", "none");
        
        // Clear selection state
        this.svg.attr("data-selected-node", null);
    }

    showTooltip(event, text) {
        // Remove any existing relationship info
        this.hideTooltip();
        
        // Create relationship info in top-right corner
        const relationshipInfo = d3.select("#diagram-view").append("div")
            .attr("class", "relationship-info")
            .style("position", "absolute")
            .style("top", "20px")
            .style("right", "20px")
            .style("background", "rgba(0, 0, 0, 0.9)")
            .style("color", "white")
            .style("padding", "12px 16px")
            .style("border-radius", "6px")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("pointer-events", "none")
            .style("z-index", "1000")
            .style("max-width", "300px")
            .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
            .text(text);
    }

    hideTooltip() {
        d3.selectAll(".tooltip").remove();
        d3.selectAll(".relationship-info").remove();
    }

    showFilteredNodeLabels(nodeId) {
        // Only show labels if we're in diagram view
        const diagramView = document.getElementById("diagram-view");
        if (!diagramView.classList.contains("active")) {
            return;
        }
        
        // Find the selected node data
        const selectedNode = this.nodeElements.data().find(d => d.id === nodeId);
        if (!selectedNode) return;
        
        // Use the same method as drag/hover for consistency
        this.showNodeRelationshipLabels(selectedNode);
    }

    showRelationshipLabelOnArrow(linkElement, d, index) {
        // Get the path element to calculate midpoint
        const path = d3.select(linkElement);
        
        // Check if the path element exists and has a valid length
        if (!path.node() || !path.node().getTotalLength) {
            return;
        }
        
        const pathLength = path.node().getTotalLength();
        if (pathLength === 0) {
            // Fallback to simple midpoint calculation
            const labelX = (d.source.x + d.target.x) / 2;
            const labelY = (d.source.y + d.target.y) / 2;
            
            // Create relationship label with collision detection
            this.createLabelWithCollisionDetection(d, labelX, labelY, index);
            return;
        }
        
        const midpoint = path.node().getPointAtLength(pathLength / 2);
        
        // Calculate the angle of the arrow for proper label orientation
        const angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
        
        // Try multiple positions to avoid collisions
        const positions = [
            { offset: 15 + (index * 8), angle: angle + Math.PI / 2 },
            { offset: 15 + (index * 8), angle: angle - Math.PI / 2 },
            { offset: 25 + (index * 8), angle: angle + Math.PI / 2 },
            { offset: 25 + (index * 8), angle: angle - Math.PI / 2 }
        ];
        
        let bestPosition = null;
        let minCollisionScore = Infinity;
        
        // Find the best position with least collisions
        for (const pos of positions) {
            let labelX = midpoint.x + Math.cos(pos.angle) * pos.offset;
            let labelY = midpoint.y + Math.sin(pos.angle) * pos.offset;
            
            // Ensure label stays within view bounds
            const labelMargin = 20;
            labelX = Math.max(labelMargin, Math.min(this.config.width - labelMargin, labelX));
            labelY = Math.max(labelMargin, Math.min(this.config.height - labelMargin, labelY));
            
            const collisionScore = window.helpers.calculateCollisionScore(labelX, labelY, d.label, this.svg, this.nodeElements);
            if (collisionScore < minCollisionScore) {
                minCollisionScore = collisionScore;
                bestPosition = { x: labelX, y: labelY };
            }
        }
        
        if (bestPosition) {
            this.createLabelWithCollisionDetection(d, bestPosition.x, bestPosition.y, index);
        }
    }

    createLabelWithCollisionDetection(d, labelX, labelY, index) {
        // Create a group to contain both label and background
        const labelId = `label-${d.source.id}-${d.target.id}-${index}`;
        const group = this.svg.append("g")
            .attr("class", "relationship-label-group")
            .attr("id", `group-${labelId}`)
            .style("pointer-events", "none");
        
        // Create background rectangle first (so it appears behind the text)
        const padding = 8;
        const textWidth = d.label.length * 7; // Approximate text width
        const textHeight = 16; // Approximate text height
        
        const background = group.append("rect")
            .attr("class", "relationship-label-bg")
            .attr("id", `bg-${labelId}`)
            .attr("x", labelX - (textWidth/2) - padding)
            .attr("y", labelY - (textHeight/2) - padding/2)
            .attr("width", textWidth + (padding * 2))
            .attr("height", textHeight + padding)
            .style("fill", "rgba(255, 255, 255, 0.95)")
            .style("stroke", "#333")
            .style("stroke-width", 1.5)
            .style("rx", 3);
        
        // Create the text label
        const label = group.append("text")
            .attr("class", "relationship-label")
            .attr("id", labelId)
            .attr("x", labelX)
            .attr("y", labelY)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "12px")
            .style("font-weight", "700")
            .style("fill", "#000")
            .text(d.label);
        
        // Update background with actual text dimensions after text is rendered
        setTimeout(() => {
            const bbox = label.node().getBBox();
            background
                .attr("x", bbox.x - padding)
                .attr("y", bbox.y - padding/2)
                .attr("width", bbox.width + (padding * 2))
                .attr("height", bbox.height + padding);
        }, 0);
    }
}

// Export the class for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LegalSystemVisualization;
}

// Make class available globally for browser usage
window.LegalSystemVisualization = LegalSystemVisualization;
