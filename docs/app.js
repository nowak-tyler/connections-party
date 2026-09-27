// ==================================================
// BASIC SVG SETUP
// ==================================================

const svg = d3.select("#network");

const width = 1200;
const height = 750;


svg.attr(
    "viewBox",
    `0 0 ${width} ${height}`
);


// Everything in the graph lives inside this group.
//
// This allows us to zoom/pan the entire visualization.

const graphGroup =
    svg.append("g");


// ==================================================
// LOAD GRAPH DATA
// ==================================================

d3.json("graph.json").then(function(data) {


    // ==================================================
    // COLORS
    // ==================================================

    const color =
        d3.scaleOrdinal(
            d3.schemeCategory10
        );


    const NO_REASON =
        "No reason provided";


    // ==================================================
    // COMMUNITY LEGEND
    // ==================================================

    const communities =
        d3.group(
            data.nodes,
            function(d) {

                return d.community;

            }
        );


    const communityLegend =
        d3.select(
            "#community-legend"
        );


    communities.forEach(
        function(
            members,
            communityId
        ) {

            const item =
                communityLegend
                    .append("div")
                    .attr(
                        "class",
                        "community-item"
                    );


            // Colored dot

            item
                .append("div")
                .attr(
                    "class",
                    "community-color"
                )
                .style(
                    "background-color",
                    color(communityId)
                );


            const info =
                item
                    .append("div")
                    .attr(
                        "class",
                        "community-info"
                    );


            // Cluster name

            info
                .append("div")
                .attr(
                    "class",
                    "community-name"
                )
                .text(
                    `Cluster ${communityId + 1}`
                );


            // Cluster members

            info
                .append("div")
                .attr(
                    "class",
                    "community-members"
                )
                .text(
                    members
                        .map(
                            function(d) {

                                return d.id;

                            }
                        )
                        .join(", ")
                );

        }
    );


    // ==================================================
    // RELATIONSHIP TYPES
    // ==================================================

    const relationshipTypes =
        new Set();


    data.links.forEach(
        function(link) {

            const reason =
                link.reason === null
                    ? NO_REASON
                    : link.reason;


            relationshipTypes.add(
                reason
            );

        }
    );


    // Every relationship type starts enabled.

    const activeFilters =
        new Set(
            relationshipTypes
        );


    // ==================================================
    // HELPER:
    // GET DISPLAYABLE LINK REASON
    // ==================================================

    function getLinkReason(link) {

        return link.reason === null
            ? NO_REASON
            : link.reason;

    }


    // ==================================================
    // FILTER UI
    // ==================================================

    const filterContainer =
        d3.select(
            "#relationship-filters"
        );


    relationshipTypes.forEach(
        function(type) {

            const option =
                filterContainer
                    .append("label")
                    .attr(
                        "class",
                        "filter-option"
                    );


            option
                .append("input")
                .attr(
                    "type",
                    "checkbox"
                )
                .property(
                    "checked",
                    true
                )
                .attr(
                    "value",
                    type
                )
                .on(
                    "change",
                    function() {

                        if (this.checked) {

                            activeFilters.add(
                                type
                            );

                        }
                        else {

                            activeFilters.delete(
                                type
                            );

                        }


                        updateFilters();

                    }
                );


            option
                .append("span")
                .text(type);

        }
    );


    // ==================================================
    // EDGES
    // ==================================================

    const links =
        graphGroup
            .append("g")
            .selectAll("line")
            .data(
                data.links
            )
            .join("line")
            .attr(
                "class",
                "link"
            );


    // ==================================================
    // NODES
    // ==================================================

    const nodes =
        graphGroup
            .append("g")
            .selectAll("circle")
            .data(
                data.nodes
            )
            .join("circle")
            .attr(
                "class",
                "node"
            )

            // More connections =
            // larger node

            .attr(
                "r",
                function(d) {

                    return (
                        8 +
                        d.degree * 3
                    );

                }
            )

            // Community =
            // node color

            .attr(
                "fill",
                function(d) {

                    return color(
                        d.community
                    );

                }
            );


    // ==================================================
    // NODE LABELS
    // ==================================================

    const labels =
        graphGroup
            .append("g")
            .selectAll("text")
            .data(
                data.nodes
            )
            .join("text")
            .attr(
                "class",
                "node-label"
            )
            .text(
                function(d) {

                    return d.id;

                }
            );


    // ==================================================
    // LINK FORCE
    // ==================================================

    const linkForce =
        d3.forceLink(
            data.links
        )
            .id(
                function(d) {

                    return d.id;

                }
            )
            .distance(120);


    // ==================================================
    // FORCE SIMULATION
    // ==================================================

    const simulation =
        d3.forceSimulation(
            data.nodes
        )

            // Connected nodes
            // pull toward each other

            .force(
                "link",
                linkForce
            )

            // Nodes repel one another

            .force(
                "charge",

                d3.forceManyBody()
                    .strength(-400)
            )

            // Pull entire network
            // toward center

            .force(
                "center",

                d3.forceCenter(
                    width / 2,
                    height / 2
                )
            )

            // Prevent overlapping nodes

            .force(
                "collision",

                d3.forceCollide()
                    .radius(
                        function(d) {

                            return (
                                20 +
                                d.degree * 3
                            );

                        }
                    )
            );


    // ==================================================
    // SIMULATION TICK
    // ==================================================

    simulation.on(
        "tick",
        function() {


            // Move edges

            links

                .attr(
                    "x1",
                    function(d) {

                        return d.source.x;

                    }
                )

                .attr(
                    "y1",
                    function(d) {

                        return d.source.y;

                    }
                )

                .attr(
                    "x2",
                    function(d) {

                        return d.target.x;

                    }
                )

                .attr(
                    "y2",
                    function(d) {

                        return d.target.y;

                    }
                );


            // Move nodes

            nodes

                .attr(
                    "cx",
                    function(d) {

                        return d.x;

                    }
                )

                .attr(
                    "cy",
                    function(d) {

                        return d.y;

                    }
                );


            // Move labels

            labels

                .attr(
                    "x",
                    function(d) {

                        return d.x;

                    }
                )

                .attr(
                    "y",
                    function(d) {

                        return (
                            d.y -
                            (
                                15 +
                                d.degree * 3
                            )
                        );

                    }
                );

        }
    );


    // ==================================================
    // DRAGGING
    // ==================================================

    nodes.call(

        d3.drag()

            .on(
                "start",
                function(
                    event,
                    d
                ) {

                    if (
                        !event.active
                    ) {

                        simulation
                            .alphaTarget(
                                0.3
                            )
                            .restart();

                    }


                    d.fx = d.x;
                    d.fy = d.y;

                }
            )


            .on(
                "drag",
                function(
                    event,
                    d
                ) {

                    d.fx =
                        event.x;

                    d.fy =
                        event.y;

                }
            )


            .on(
                "end",
                function(
                    event,
                    d
                ) {

                    if (
                        !event.active
                    ) {

                        simulation
                            .alphaTarget(
                                0
                            );

                    }


                    d.fx = null;
                    d.fy = null;

                }
            )

    );


    // ==================================================
    // CHECK IF LINK IS ACTIVE
    // ==================================================

    function isLinkActive(link) {

        return activeFilters.has(
            getLinkReason(
                link
            )
        );

    }


    // ==================================================
    // CLICK NODE
    // ==================================================

    nodes.on(
        "click",
        function(
            event,
            selectedNode
        ) {

            event.stopPropagation();


            highlightConnections(
                selectedNode
            );


            showDetails(
                selectedNode
            );

        }
    );


    // ==================================================
    // HIGHLIGHT DIRECT CONNECTIONS
    // ==================================================

    function highlightConnections(
        selectedNode
    ) {

        const connectedNodes =
            new Set([
                selectedNode.id
            ]);


        data.links.forEach(
            function(link) {


                // Ignore relationships
                // currently filtered out

                if (
                    !isLinkActive(
                        link
                    )
                ) {

                    return;

                }


                if (
                    link.source.id ===
                    selectedNode.id
                ) {

                    connectedNodes.add(
                        link.target.id
                    );

                }


                if (
                    link.target.id ===
                    selectedNode.id
                ) {

                    connectedNodes.add(
                        link.source.id
                    );

                }

            }
        );


        // Fade unrelated nodes

        nodes.attr(
            "opacity",
            function(d) {

                return connectedNodes.has(
                    d.id
                )
                    ? 1
                    : 0.15;

            }
        );


        // Fade unrelated labels

        labels.attr(
            "opacity",
            function(d) {

                return connectedNodes.has(
                    d.id
                )
                    ? 1
                    : 0.15;

            }
        );


        // Highlight direct edges

        links

            .attr(
                "stroke-opacity",
                function(d) {


                    if (
                        !isLinkActive(
                            d
                        )
                    ) {

                        return 0;

                    }


                    if (
                        d.source.id ===
                            selectedNode.id
                        ||
                        d.target.id ===
                            selectedNode.id
                    ) {

                        return 1;

                    }


                    return 0.08;

                }
            )


            .attr(
                "stroke-width",
                function(d) {


                    if (
                        isLinkActive(
                            d
                        )
                        &&
                        (
                            d.source.id ===
                                selectedNode.id
                            ||
                            d.target.id ===
                                selectedNode.id
                        )
                    ) {

                        return 4;

                    }


                    return 2;

                }
            );

    }


    // ==================================================
    // PERSON DETAILS
    // ==================================================

    function showDetails(
        person
    ) {

        const panel =
            d3.select(
                "#person-details"
            );


        panel.html("");


        panel
            .append("h3")
            .text(
                person.id
            );


        // Only count currently
        // visible connections.

        const connections =
            data.links.filter(
                function(link) {


                    if (
                        !isLinkActive(
                            link
                        )
                    ) {

                        return false;

                    }


                    return (
                        link.source.id ===
                            person.id
                        ||
                        link.target.id ===
                            person.id
                    );

                }
            );


        panel
            .append("p")
            .text(
                `${connections.length} visible connections`
            );


        connections.forEach(
            function(link) {

                let otherPerson;


                if (
                    link.source.id ===
                    person.id
                ) {

                    otherPerson =
                        link.target.id;

                }
                else {

                    otherPerson =
                        link.source.id;

                }


                const connection =
                    panel
                        .append("div")
                        .attr(
                            "class",
                            "connection"
                        );


                connection
                    .append("div")
                    .attr(
                        "class",
                        "connection-name"
                    )
                    .text(
                        otherPerson
                    );


                connection
                    .append("div")
                    .attr(
                        "class",
                        "connection-reason"
                    )
                    .text(
                        getLinkReason(
                            link
                        )
                    );

            }
        );

    }


    // ==================================================
    // UPDATE FILTERS + RECLUSTER
    // ==================================================

    function updateFilters() {


        // Get only edges whose
        // relationship type is enabled.

        const activeLinks =
            data.links.filter(
                function(link) {

                    return isLinkActive(
                        link
                    );

                }
            );


        // Show/hide edges.

        links.attr(
            "display",
            function(link) {

                return isLinkActive(
                    link
                )
                    ? null
                    : "none";

            }
        );


        // IMPORTANT:
        //
        // Give D3's physics engine
        // only the active relationships.
        //
        // This causes the graph to
        // physically reorganize.

        linkForce.links(
            activeLinks
        );


        // Give the simulation
        // energy again.

        simulation
            .alpha(1)
            .restart();


        // Reset node visibility.

        nodes.attr(
            "opacity",
            1
        );


        labels.attr(
            "opacity",
            1
        );


        links

            .attr(
                "stroke-opacity",
                function(link) {

                    return isLinkActive(
                        link
                    )
                        ? 0.6
                        : 0;

                }
            )

            .attr(
                "stroke-width",
                2
            );


        // Clear selected person
        // because visible relationships
        // may have changed.

        d3.select(
            "#person-details"
        )
            .html("");

    }


    // ==================================================
    // SHOW ALL RELATIONSHIPS
    // ==================================================

    d3.select(
        "#show-all-button"
    )
        .on(
            "click",
            function(event) {

                event.stopPropagation();


                relationshipTypes.forEach(
                    function(type) {

                        activeFilters.add(
                            type
                        );

                    }
                );


                d3.selectAll(
                    "#relationship-filters input"
                )
                    .property(
                        "checked",
                        true
                    );


                updateFilters();

            }
        );


    // ==================================================
    // RESET SELECTED PERSON
    // ==================================================

    svg.on(
        "click",
        function() {


            nodes.attr(
                "opacity",
                1
            );


            labels.attr(
                "opacity",
                1
            );


            links

                .attr(
                    "stroke-opacity",
                    function(link) {

                        return isLinkActive(
                            link
                        )
                            ? 0.6
                            : 0;

                    }
                )

                .attr(
                    "stroke-width",
                    2
                );


            d3.select(
                "#person-details"
            )
                .html("");

        }
    );


    // ==================================================
    // ZOOM + PAN
    // ==================================================

    const zoom =
        d3.zoom()

            .scaleExtent([
                0.3,
                5
            ])

            .on(
                "zoom",
                function(event) {

                    graphGroup.attr(
                        "transform",
                        event.transform
                    );

                }
            );


    svg.call(
        zoom
    );


});