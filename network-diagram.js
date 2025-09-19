// Visualization Logic - Core D3.js visualization functionality

class LegalSystemVisualization {
    constructor(data, config, colorMap) {
        this.judicialEntityMapData = data.judicialEntityMapData;
        this.groupingData = data.groupingData;
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
        this.isGrouped = false; // Track if nodes are currently grouped
        this.groupElements = null; // Store group circle elements
        
        // Create color scheme for different groups
        this.groupColors = {
            ":LegislativeAndRegulatory": "#2E8B57",      // Sea Green
            ":JudiciaryGroup": "#4169E1",                // Royal Blue
            ":TribunalsAndArbitrationGroup": "#FF6347",  // Tomato
            ":PeopleAndOfficeholdersGroup": "#9370DB",   // Medium Purple
            ":LegalFrameworkGroup": "#20B2AA",           // Light Sea Green
            ":NonAdministrativeEntitiesGroup": "#DAA520", // Goldenrod
            ":EnforcementGroup": "#DC143C",              // Crimson
            ":CaseTypesGroup": "#FF8C00"                 // Dark Orange
        };
        
        // Create mapping from node names to their group colors
        this.nodeGroupMap = this.createNodeGroupMap();
    }

    // Create mapping from node names to their group colors
    createNodeGroupMap() {
        const nodeGroupMap = {};
        this.groupingData.forEach(item => {
            nodeGroupMap[item.node] = {
                group: item.belongsTo,
                color: this.groupColors[item.belongsTo] || "#999999",
                label: item.label
            };
        });
        return nodeGroupMap;
    }

    // Get node color based on its group
    getNodeColor(nodeName) {
        const nodeInfo = this.nodeGroupMap[nodeName];
        const color = nodeInfo ? nodeInfo.color : "#999999"; // Default gray for unknown nodes
        return color;
    }

    // Get node group information
    getNodeGroup(nodeName) {
        const nodeInfo = this.nodeGroupMap[nodeName];
        return nodeInfo ? nodeInfo.group : "Unknown";
    }

    // Clear all highlights and labels
    clearAllHighlightsAndLabels() {
        // Clear any active filters
        this.filteredNodeId = null;
        
        // Reset dropdown
        const nodeFilter = document.getElementById("nodeFilter");
        if (nodeFilter) {
            nodeFilter.value = "";
        }
        
        // Hide all relationship labels
        this.hideRelationshipLabel();
        
        // Remove any arrow relationship labels
        this.svg.selectAll(".arrow-relationship-label").remove();
        
        // Hide tooltips
        this.hideTooltip();
        
        // Restore normal view (clears all highlighting)
        this.restoreNormalView();
        
        // Restore group filtering if it was active
        this.restoreGroupFiltering();
        
        // Clear selection state
        this.svg.attr("data-selected-node", null);
        
        console.log("Cleared all highlights and labels");
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
        
        // Add background click event to clear highlights and labels
        this.svg.on("click", (event) => {
            // Only clear if clicking on the background (not on nodes or links)
            if (event.target === this.svg.node()) {
                this.clearAllHighlightsAndLabels();
            }
        });
        
        this.createArrowMarkers();
        this.createForceSimulation();
        this.prepareDiagramData();
    }

    // Create arrow markers for group colors
    createArrowMarkers() {
        let defs = this.svg.select("defs");
        if (defs.empty()) {
            defs = this.svg.append("defs");
            
            // Create markers for each group color
            Object.entries(this.groupColors).forEach(([groupName, colorValue]) => {
                const markerId = `arrowhead-${colorValue.replace('#', '')}`;
                defs.append("marker")
                    .attr("id", markerId)
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
            .force("radial", d3.forceRadial(350, this.config.width / 2, this.config.height / 2 - 100).strength(0.05))
            .force("arrowRepulsion", this.createArrowRepulsionForce());
    }

    // Create custom force for arrow repulsion when labels are too close
    createArrowRepulsionForce() {
        const force = (alpha) => {
            if (!this._labelsVisible) return;
            
            // Get all visible labels
            const labels = this.svg.selectAll(".relationship-label-group").nodes();
            const labelData = labels.map(label => {
                const rect = d3.select(label).select("rect");
                const bbox = rect.node().getBBox();
                return {
                    x: bbox.x + bbox.width / 2,
                    y: bbox.y + bbox.height / 2,
                    width: bbox.width,
                    height: bbox.height,
                    element: label
                };
            });

            // Check for collisions and apply repulsion
            for (let i = 0; i < labelData.length; i++) {
                for (let j = i + 1; j < labelData.length; j++) {
                    const label1 = labelData[i];
                    const label2 = labelData[j];
                    
                    // Calculate distance between label centers
                    const dx = label1.x - label2.x;
                    const dy = label1.y - label2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Minimum distance to avoid collision (label width + padding)
                    const minDistance = Math.max(label1.width, label2.width) + 20;
                    
                    if (distance < minDistance && distance > 0) {
                        // Calculate repulsion force
                        const force = (minDistance - distance) / minDistance;
                        const angle = Math.atan2(dy, dx);
                        
                        // Apply repulsion to the nodes connected by these labels
                        this.applyLabelRepulsion(label1, label2, force, angle, alpha);
                    }
                }
            }
        };
        
        force.initialize = () => {}; // No initialization needed
        return force;
    }

    // Apply repulsion force to nodes when their labels collide
    applyLabelRepulsion(label1, label2, force, angle, alpha) {
        // Find the links associated with these labels
        const link1 = this.findLinkForLabel(label1.element);
        const link2 = this.findLinkForLabel(label2.element);
        
        if (!link1 || !link2) return;
        
        // Apply repulsion to the source nodes of the links
        const repulsionStrength = force * alpha * 0.1;
        
        // Repel source nodes away from each other
        if (link1.source && link2.source) {
            const dx = Math.cos(angle) * repulsionStrength;
            const dy = Math.sin(angle) * repulsionStrength;
            
            link1.source.vx = (link1.source.vx || 0) + dx;
            link1.source.vy = (link1.source.vy || 0) + dy;
            link2.source.vx = (link2.source.vx || 0) - dx;
            link2.source.vy = (link2.source.vy || 0) - dy;
        }
    }

    // Find the link data associated with a label element
    findLinkForLabel(labelElement) {
        const linkData = d3.select(labelElement).datum();
        if (linkData && linkData.source && linkData.target) {
            return linkData;
        }
        return null;
    }

    // Avoid label collisions by adjusting positions
    avoidLabelCollisions() {
        if (!this._labelsVisible) return;
        
        const labels = this.svg.selectAll(".relationship-label-group").nodes();
        const labelData = labels.map(label => {
            const rect = d3.select(label).select("rect");
            const bbox = rect.node().getBBox();
            return {
                x: bbox.x + bbox.width / 2,
                y: bbox.y + bbox.height / 2,
                width: bbox.width,
                height: bbox.height,
                element: label,
                originalX: bbox.x + bbox.width / 2,
                originalY: bbox.y + bbox.height / 2
            };
        });

        // Apply collision avoidance
        for (let i = 0; i < labelData.length; i++) {
            for (let j = i + 1; j < labelData.length; j++) {
                const label1 = labelData[i];
                const label2 = labelData[j];
                
                const dx = label1.x - label2.x;
                const dy = label1.y - label2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const minDistance = Math.max(label1.width, label2.width) + 20;
                
                if (distance < minDistance && distance > 0) {
                    // Calculate separation vector
                    const separation = (minDistance - distance) / 2;
                    const angle = Math.atan2(dy, dx);
                    
                    const offsetX = Math.cos(angle) * separation;
                    const offsetY = Math.sin(angle) * separation;
                    
                    // Apply offset to labels
                    label1.x += offsetX;
                    label1.y += offsetY;
                    label2.x -= offsetX;
                    label2.y -= offsetY;
                    
                    // Update label positions
                    this.updateLabelPosition(label1.element, label1.x, label1.y);
                    this.updateLabelPosition(label2.element, label2.x, label2.y);
                }
            }
        }
    }

    // Update the position of a specific label
    updateLabelPosition(labelElement, x, y) {
        const group = d3.select(labelElement);
        const rect = group.select("rect");
        const text = group.select("text");
        
        if (rect.node() && text.node()) {
            const padding = 8;
            const textWidth = text.text().length * 8;
            const textHeight = 16;
            
            rect
                .attr("x", x - (textWidth/2) - padding)
                .attr("y", y - (textHeight/2) - padding/2);
            
            text
                .attr("x", x)
                .attr("y", y);
        }
    }

    // Create a self-looping path for nodes that connect to themselves
    createSelfLoopPath(d, loopIndex = 0) {
        const nodeRadius = this.config.nodeRadius;
        const baseLoopRadius = nodeRadius + 20; // Base loop radius
        const loopSpacing = 15; // Spacing between concentric loops
        const loopRadius = baseLoopRadius + (loopIndex * loopSpacing);
        
        // Calculate loop center (above the node)
        const centerX = d.source.x;
        const centerY = d.source.y - loopRadius;
        
        // Create a circular path that loops back to the node
        // Start from the right side of the node, curve up and around, then back to the left side
        const startX = d.source.x + nodeRadius;
        const startY = d.source.y;
        const endX = d.source.x - nodeRadius;
        const endY = d.source.y;
        
        // Create a smooth arc that goes from right side, up and around, to left side
        const path = `M${startX},${startY} A${loopRadius},${loopRadius} 0 1,1 ${endX},${endY}`;
        
        return path;
    }

    // Prepare data for the arrow diagram
    prepareDiagramData() {
        const entities = window.helpers.createUniqueNodes(this.judicialEntityMapData, this.groupingData);
        const diagramLinks = window.helpers.createDiagramLinks(this.judicialEntityMapData, entities);
        
        // Store diagramLinks as class property for use in calculateNodeWeights
        this.diagramLinks = diagramLinks;
        
        console.log(`Created ${diagramLinks.length} links from ${this.judicialEntityMapData.length} data entries`);
        
        this.simulation.nodes(entities);
        this.simulation.force("link").links(diagramLinks);
        
        this.createLinkElements(diagramLinks);
        this.createNodeElements(entities);
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
            .attr("class", d => `link`)
            .attr("marker-end", d => {
                const sourceColor = this.getNodeColor(d.source.name);
                const markerId = `arrowhead-${sourceColor.replace('#', '')}`;
                return `url(#${markerId})`;
            })
            .attr("stroke", d => {
                const sourceColor = this.getNodeColor(d.source.name);
                return sourceColor;
            })
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

        // Add black center circle for each node (created first, so it's behind)
        this.nodeElements.append("circle")
            .attr("class", "node-center")
            .attr("r", this.config.nodeRadius)
            .style("fill", "#000")
            .style("stroke", "#fff")
            .style("stroke-width", 2);
        
        // Add colored circle around each node (larger, group-colored, created second so it's on top)
        this.nodeElements.append("circle")
            .attr("class", "node-group-circle")
            .attr("r", this.config.nodeRadius + 3)
            .style("fill", "none")
            .style("stroke", d => this.getNodeColor(d.name))
            .style("stroke-width", 3);

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
        
        // Only clear node filter if group filtering is not active
        if (this.filteredNodeId && !this.isGroupFilterActive()) {
            this.clearNodeFilter();
        }
        
        const connectedNodeIds = new Set();
        connectedNodeIds.add(d.id);
        
        this.judicialEntityMapData.forEach(link => {
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
        
        // Only highlight if group filtering is not active
        if (!this.isGroupFilterActive()) {
            this.highlightSelectedNode(d);
        }
        
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
        
        // Update label positions more frequently during drag to maintain visibility
        if (!d._labelUpdateScheduled) {
            d._labelUpdateScheduled = true;
            this.updateRelationshipLabels();
            
            // Apply collision avoidance for labels during drag
            this.avoidLabelCollisions();
            
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
        
        // Always restore the proper view state after drag ends with a small delay
        setTimeout(() => {
            this.restoreViewAfterDrag();
        }, 50);
        
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
                
                // Check if this is a self-loop (source and target are the same)
                if (d.source.id === d.target.id) {
                    // Get the loop index for this self-loop
                    const loopIndex = d.loopIndex || 0;
                    return this.createSelfLoopPath(d, loopIndex);
                }
                
                // Regular curved path for different nodes
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
            // Apply collision avoidance for labels
            this.avoidLabelCollisions();
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
                event.stopPropagation(); // Prevent bubbling to background
                const selectedNode = this.svg.attr("data-selected-node");
                if (!selectedNode) {
                    this.showRelatedNodesOnHover(d);
                }
                // Always show tethered labels for this node's relationships on hover
                this.showNodeRelationshipLabels(d);
            })
            .on("mouseout", (event, d) => {
                event.stopPropagation(); // Prevent bubbling to background
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
                event.stopPropagation(); // Prevent bubbling to background
                if (this.filteredNodeId) {
                    this.clearNodeFilter();
                }
            });

        this.linkElements
            .on("mouseover", (event, d) => {
                event.stopPropagation(); // Prevent bubbling to background
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
                event.stopPropagation(); // Prevent bubbling to background
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
        toggleBtn.textContent = "Table View";
        
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
        let dataToShow = window.helpers.getFilteredTableData(this.judicialEntityMapData, this.filteredNodeId);
        
        // Apply group filter if active
        dataToShow = this.applyGroupFilterToTableData(dataToShow);
        
        // Create rows for each relationship
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

    // Apply group filter to table data
    applyGroupFilterToTableData(data) {
        // Get active groups from checkboxes
        const checkedGroups = [];
        const groupCheckboxes = document.querySelectorAll('.group-controls input[type="checkbox"]:checked');
        groupCheckboxes.forEach(checkbox => {
            checkedGroups.push(checkbox.value);
        });

        // If no groups are selected, return empty array
        if (checkedGroups.length === 0) {
            return [];
        }

        // Get nodes that belong to active groups
        const activeNodeIds = new Set();
        this.groupingData.forEach(item => {
            if (checkedGroups.includes(item.belongsTo)) {
                activeNodeIds.add(item.node);
            }
        });

        // Filter data to only include relationships where both source and target are in active groups
        return data.filter(d => {
            return activeNodeIds.has(d.source) && activeNodeIds.has(d.target);
        });
    }

    // Setup event listeners
    setupEventListeners() {
        document.getElementById("toggleViewBtn").addEventListener("click", () => this.toggleView());
        document.getElementById("groupBtn").addEventListener("click", () => this.toggleGrouping());
        document.getElementById("nodeFilter").addEventListener("change", (event) => this.handleNodeFilter(event));
        document.getElementById("clearFilter").addEventListener("click", () => this.clearNodeFilter());
    }

    // Toggle between grouped and ungrouped view
    toggleGrouping() {
        if (this.isGrouped) {
            this.expandGroups();
        } else {
            this.collapseToGroups();
        }
    }

    // Collapse nodes into group circles
    collapseToGroups() {
        if (this.isGrouped || this.isAnimating) return;
        
        
        this.isAnimating = true;
        this.isGrouped = true;
        
        // Update button text
        document.getElementById("groupBtn").textContent = "Ungroup Nodes";
        
        // Hide individual nodes and links
        this.nodeElements
            .transition()
            .duration(500)
            .style("opacity", 0);
        
        this.linkElements
            .transition()
            .duration(500)
            .style("opacity", 0);
        
        // Hide labels
        this.hideRelationshipLabel();
        
        // Create group circles
        this.createGroupCircles();
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    // Expand groups back to individual nodes
    expandGroups() {
        if (!this.isGrouped || this.isAnimating) return;
        
        this.isAnimating = true;
        this.isGrouped = false;
        
        // Update button text
        document.getElementById("groupBtn").textContent = "Group Nodes";
        
        // Remove group circles
        this.removeGroupCircles();
        
        // Show individual nodes and links
        this.nodeElements
            .transition()
            .duration(500)
            .style("opacity", 1);
        
        this.linkElements
            .transition()
            .duration(500)
            .style("opacity", 1);
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    // Create group circles for each category
    createGroupCircles() {
        // Group nodes by their belongsTo category
        const groups = {};
        this.nodeElements.each(function(d) {
            const groupKey = d.belongsTo || "Unknown";
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(d);
        });
        
        // Create group circles
        const groupData = Object.entries(groups).map(([groupKey, nodes]) => ({
            key: groupKey,
            nodes: nodes,
            label: this.getGroupLabel(groupKey),
            color: this.getGroupColor(groupKey),
            x: this.config.width / 2,
            y: this.config.height / 2 - 100
        }));
        
        // Position groups in a circle
        groupData.forEach((group, i) => {
            const angle = (i / groupData.length) * 2 * Math.PI;
            const radius = Math.min(this.config.width, this.config.height) * 0.25;
            const centerX = this.config.width / 2;
            const centerY = this.config.height / 2 - 100;
            
            group.x = centerX + Math.cos(angle) * radius;
            group.y = centerY + Math.sin(angle) * radius;
        });
        
        // Create group elements
        this.groupElements = this.svg.selectAll(".group-circle")
            .data(groupData)
            .enter()
            .append("g")
            .attr("class", "group-circle")
            .style("opacity", 0);
        
        // Add group circle background
        this.groupElements.append("circle")
            .attr("class", "group-background")
            .attr("r", 60)
            .style("fill", d => d.color)
            .style("stroke", "#fff")
            .style("stroke-width", 3)
            .style("opacity", 0.8);
        
        // Add group circle border
        this.groupElements.append("circle")
            .attr("class", "group-border")
            .attr("r", 65)
            .style("fill", "none")
            .style("stroke", d => d.color)
            .style("stroke-width", 4);
        
        // Add group label
        this.groupElements.append("text")
            .attr("class", "group-label")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "#fff")
            .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.5)")
            .text(d => d.label);
        
        // Add node count
        this.groupElements.append("text")
            .attr("class", "group-count")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("dy", 20)
            .style("font-size", "12px")
            .style("font-weight", "normal")
            .style("fill", "#fff")
            .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.5)")
            .text(d => `${d.nodes.length} nodes`);
        
        // Position and animate group circles
        this.groupElements
            .attr("transform", d => `translate(${d.x}, ${d.y})`)
            .transition()
            .duration(500)
            .style("opacity", 1);
        
        // Add click functionality to group circles
        this.groupElements
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                this.expandSpecificGroup(d);
            });
    }

    // Remove group circles
    removeGroupCircles() {
        if (this.groupElements) {
            this.groupElements
                .transition()
                .duration(500)
                .style("opacity", 0)
                .remove();
            this.groupElements = null;
        }
    }

    // Expand a specific group to show its nodes
    expandSpecificGroup(groupData) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Remove all group circles
        this.removeGroupCircles();
        
        // Show only the nodes from this group
        this.nodeElements
            .style("opacity", d => d.belongsTo === groupData.key ? 1 : 0);
        
        this.linkElements
            .style("opacity", d => {
                const sourceGroup = d.source.belongsTo;
                const targetGroup = d.target.belongsTo;
                return (sourceGroup === groupData.key || targetGroup === groupData.key) ? 1 : 0;
            });
        
        // Update button to show we're in expanded view
        document.getElementById("groupBtn").textContent = "Show All Groups";
        
        // Add a back button or modify the group button behavior
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    // Get group label from group key
    getGroupLabel(groupKey) {
        const groupLabels = {
            ":LegislativeAndRegulatory": "Legislative & Regulatory",
            ":JudiciaryGroup": "Judiciary",
            ":TribunalsAndArbitrationGroup": "Tribunals & Arbitration",
            ":PeopleAndOfficeholdersGroup": "People & Officeholders",
            ":LegalFrameworkGroup": "Legal Framework",
            ":NonAdministrativeEntitiesGroup": "Non-Administrative",
            ":EnforcementGroup": "Enforcement",
            ":CaseTypesGroup": "Case Types"
        };
        return groupLabels[groupKey] || groupKey.replace(":", "");
    }

    // Get group color from group key
    getGroupColor(groupKey) {
        return this.groupColors[groupKey] || "#999999";
    }

    // Setup filter dropdown
    setupFilterDropdown() {
        const nodeFilter = document.getElementById("nodeFilter");
        
        // Get unique node names
        const uniqueNodes = [...new Set([
            ...this.judicialEntityMapData.map(d => d.source),
            ...this.judicialEntityMapData.map(d => d.target)
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
        toggleBtn.textContent = "Network View";
        
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

    // Filter nodes by groups
    filterNodesByGroups(activeGroups) {
        console.log('filterNodesByGroups called with:', activeGroups);
        
        if (!this.nodeElements || !this.linkElements) {
            console.warn('Node or link elements not available');
            return;
        }

        // If no groups are selected, hide all nodes
        if (activeGroups.length === 0) {
            console.log('No groups selected, hiding all nodes');
            this.nodeElements.style("opacity", 0);
            this.linkElements.style("opacity", 0);
            return;
        }

        // Get nodes that belong to active groups
        const activeNodeIds = new Set();
        this.groupingData.forEach(item => {
            if (activeGroups.includes(item.belongsTo)) {
                activeNodeIds.add(item.node);
            }
        });

        console.log('Active node IDs:', Array.from(activeNodeIds));

        // Filter nodes based on group membership
        this.nodeElements.style("opacity", d => {
            const isVisible = activeNodeIds.has(d.id);
            if (!isVisible) {
                console.log(`Hiding node: ${d.id}`);
            }
            return isVisible ? 1 : 0;
        });

        // Filter links based on whether both source and target nodes are visible
        this.linkElements.style("opacity", d => {
            const sourceVisible = activeNodeIds.has(d.source.id || d.source);
            const targetVisible = activeNodeIds.has(d.target.id || d.target);
            return (sourceVisible && targetVisible) ? 1 : 0;
        });

        // Update table to show only filtered data
        this.setupTable();

        console.log(`Filtered to show ${activeNodeIds.size} nodes from ${activeGroups.length} groups`);
    }

    // Check if group filtering is currently active
    isGroupFilterActive() {
        const groupCheckboxes = document.querySelectorAll('.group-controls input[type="checkbox"]');
        const totalGroups = groupCheckboxes.length;
        const checkedGroups = document.querySelectorAll('.group-controls input[type="checkbox"]:checked').length;
        
        // Group filtering is active if not all groups are checked
        return checkedGroups < totalGroups;
    }

    // Restore group filtering after clearing highlights
    restoreGroupFiltering() {
        if (this.isGroupFilterActive()) {
            // Get all checked groups
            const checkedGroups = [];
            const groupCheckboxes = document.querySelectorAll('.group-controls input[type="checkbox"]:checked');
            groupCheckboxes.forEach(checkbox => {
                checkedGroups.push(checkbox.value);
            });
            
            // Reapply group filter
            this.filterNodesByGroups(checkedGroups);
        }
    }

    // Restore proper view state after drag ends
    restoreViewAfterDrag() {
        console.log('restoreViewAfterDrag called');
        
        // If group filtering is active, restore group filtering
        if (this.isGroupFilterActive()) {
            console.log('Group filtering is active, restoring group filtering');
            this.restoreGroupFiltering();
        } else {
            console.log('No group filtering, restoring normal highlighting');
            // If no group filtering, restore normal highlighting state
            this.removeHighlighting();
        }
        
        // Ensure all elements are properly visible
        if (this.nodeElements && this.linkElements) {
            // Force a re-render to ensure elements are visible
            this.nodeElements.style("opacity", d => {
                // If group filtering is active, use group filter logic
                if (this.isGroupFilterActive()) {
                    const checkedGroups = [];
                    const groupCheckboxes = document.querySelectorAll('.group-controls input[type="checkbox"]:checked');
                    groupCheckboxes.forEach(checkbox => {
                        checkedGroups.push(checkbox.value);
                    });
                    
                    const activeNodeIds = new Set();
                    this.groupingData.forEach(item => {
                        if (checkedGroups.includes(item.belongsTo)) {
                            activeNodeIds.add(item.node);
                        }
                    });
                    
                    return activeNodeIds.has(d.id) ? 1 : 0;
                } else {
                    // No group filtering, show all nodes
                    return 1;
                }
            });
            
            this.linkElements.style("opacity", d => {
                // If group filtering is active, use group filter logic
                if (this.isGroupFilterActive()) {
                    const checkedGroups = [];
                    const groupCheckboxes = document.querySelectorAll('.group-controls input[type="checkbox"]:checked');
                    groupCheckboxes.forEach(checkbox => {
                        checkedGroups.push(checkbox.value);
                    });
                    
                    const activeNodeIds = new Set();
                    this.groupingData.forEach(item => {
                        if (checkedGroups.includes(item.belongsTo)) {
                            activeNodeIds.add(item.node);
                        }
                    });
                    
                    const sourceVisible = activeNodeIds.has(d.source.id || d.source);
                    const targetVisible = activeNodeIds.has(d.target.id || d.target);
                    return (sourceVisible && targetVisible) ? 1 : 0;
                } else {
                    // No group filtering, show all links
                    return 1;
                }
            });
        }
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
            .select(".node-group-circle")
            .style("stroke-width", 5)
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
            .select(".node-group-circle")
            .style("stroke-width", 6)
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
        // Don't remove highlighting if group filtering is active
        if (this.isGroupFilterActive()) {
            return;
        }
        
        // Reset all elements to normal state
        this.nodeElements
            .style("opacity", 1)
            .style("z-index", 1);
        
        // Reset node group circles to normal styling
        this.nodeElements.select(".node-group-circle")
            .style("stroke-width", 3)
            .style("filter", "none");
        
        // Reset node center circles to normal styling
        this.nodeElements.select(".node-center")
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
        
        // Group links by their source-target pair to handle multiple labels on same arrow
        const linkGroups = {};
        connectedLinks.forEach(linkData => {
            const linkKey = `${linkData.link.source.id}-${linkData.link.target.id}`;
            if (!linkGroups[linkKey]) {
                linkGroups[linkKey] = [];
            }
            linkGroups[linkKey].push(linkData);
        });
        
        // Create labels with proper stacking for each group
        let globalIndex = 0;
        Object.values(linkGroups).forEach(linkGroup => {
            linkGroup.forEach((linkData, localIndex) => {
                console.log("Creating label", globalIndex, "_labelsVisible is:", this._labelsVisible);
                this.createSimpleLabel(linkData.link, linkData.element, globalIndex);
                globalIndex++;
            });
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
        
        // Get position along the curved path instead of straight line midpoint
        const pathElement = d3.select(linkElement);
        const pathLength = pathElement.node().getTotalLength();
        
        // For self-loops, position the label at the top of the loop
        let midPoint;
        if (linkData.source.id === linkData.target.id) {
            // For self-loops, get the point at the top of the arc (around 25% of the path)
            midPoint = pathElement.node().getPointAtLength(pathLength * 0.25);
        } else {
            // For regular links, use the midpoint
            midPoint = pathElement.node().getPointAtLength(pathLength * 0.5);
        }
        
        const midX = midPoint.x;
        const midY = midPoint.y;
        
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
        
        // Get position along the curved path instead of straight line midpoint
        const pathElement = d3.select(linkElement);
        const pathLength = pathElement.node().getTotalLength();
        
        // For self-loops, position the label at the top of the loop
        let midPoint;
        if (linkData.source.id === linkData.target.id) {
            // For self-loops, get the point at the top of the arc (around 25% of the path)
            midPoint = pathElement.node().getPointAtLength(pathLength * 0.25);
        } else {
            // For regular links, use the midpoint
            midPoint = pathElement.node().getPointAtLength(pathLength * 0.5);
        }
        
        // Calculate vertical offset for stacking multiple labels
        const labelSpacing = 25; // Vertical spacing between labels
        const verticalOffset = index * labelSpacing;
        
        // Calculate the final position with vertical stacking
        const finalX = midPoint.x;
        const finalY = midPoint.y + verticalOffset;
        
        console.log("Creating label at position:", finalX, finalY, "for label:", linkData.label, "index:", index);
        
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
            .attr("x", finalX - (textWidth/2) - padding)
            .attr("y", finalY - (textHeight/2) - padding/2)
            .attr("width", textWidth + (padding * 2))
            .attr("height", textHeight + padding)
            .style("fill", "rgba(255, 255, 255, 1.0)")
            .style("stroke", "#000")
            .style("stroke-width", 2)
            .style("rx", 4)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
        
        console.log("Rectangle created at:", finalX - (textWidth/2) - padding, finalY - (textHeight/2) - padding/2);
        
        // Create text label
        const text = group.append("text")
            .attr("x", finalX)
            .attr("y", finalY)
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
        
        // Group labels by their source-target pair to handle stacking
        const labelGroups = {};
        
        this.svg.selectAll(".relationship-label-group").each(function(d, i) {
            const group = d3.select(this);
            const linkData = group.datum();
            
            if (!linkData || !linkData.source || !linkData.target) return;
            
            const linkKey = `${linkData.source.id}-${linkData.target.id}`;
            if (!labelGroups[linkKey]) {
                labelGroups[linkKey] = [];
            }
            labelGroups[linkKey].push({ group, linkData, index: i });
        });
        
        // Update each group of labels with proper stacking
        Object.values(labelGroups).forEach(labelGroup => {
            labelGroup.forEach(({ group, linkData, index }) => {
                // Find the corresponding link element to get the curved path
                const linkElement = this.linkElements.filter(d => 
                    d.source.id === linkData.source.id && d.target.id === linkData.target.id
                ).node();
                
                let finalX, finalY;
                
                if (linkElement) {
                    // Get position along the curved path
                    const pathElement = d3.select(linkElement);
                    const pathLength = pathElement.node().getTotalLength();
                    
                    // For self-loops, position the label at the top of the loop
                    let midPoint;
                    if (linkData.source.id === linkData.target.id) {
                        // For self-loops, get the point at the top of the arc (around 25% of the path)
                        midPoint = pathElement.node().getPointAtLength(pathLength * 0.25);
                    } else {
                        // For regular links, use the midpoint
                        midPoint = pathElement.node().getPointAtLength(pathLength * 0.5);
                    }
                    
                    // Calculate vertical offset for stacking multiple labels
                    const labelSpacing = 25; // Vertical spacing between labels
                    const verticalOffset = index * labelSpacing;
                    
                    // Calculate the final position with vertical stacking
                    finalX = midPoint.x;
                    finalY = midPoint.y + verticalOffset;
                } else {
                    // Fallback to straight line midpoint if link element not found
                    const sourceX = linkData.source.x;
                    const sourceY = linkData.source.y;
                    const targetX = linkData.target.x;
                    const targetY = linkData.target.y;
                    
                    const midX = (sourceX + targetX) / 2;
                    const midY = (sourceY + targetY) / 2;
                    
                    const labelSpacing = 25;
                    const verticalOffset = index * labelSpacing;
                    
                    finalX = midX;
                    finalY = midY + verticalOffset;
                }
                
                // Update labelbox position
                const rect = group.select("rect");
                const text = group.select("text");
                
                if (rect.node()) {
                    const padding = 8;
                    const textWidth = linkData.label.length * 8;
                    const textHeight = 16;
                    
                    rect
                        .attr("x", finalX - (textWidth/2) - padding)
                        .attr("y", finalY - (textHeight/2) - padding/2);
                }
                
                if (text.node()) {
                    text
                        .attr("x", finalX)
                        .attr("y", finalY);
                }
            });
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
        
        // Don't apply hover effects if group filtering is active
        if (this.isGroupFilterActive()) {
            return;
        }
        
        // Find all connected node IDs
        const connectedNodeIds = new Set();
        connectedNodeIds.add(hoveredNode.id);
        
        // Find all links connected to the hovered node
        this.judicialEntityMapData.forEach(link => {
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
        
        // Don't restore if group filtering is active
        if (this.isGroupFilterActive()) {
            return;
        }
        
        // Restore all nodes opacity and styling
        this.nodeElements
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("z-index", 1);
        
        // Restore node group circles to normal styling
        this.nodeElements.select(".node-group-circle")
            .transition()
            .duration(200)
            .style("stroke-width", 3)
            .style("filter", "none");
        
        // Restore node center circles to normal styling
        this.nodeElements.select(".node-center")
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
