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


            info
                .append("div")
                .attr(
                    "class",
                    "community-name"
                )
                .text(
                    `Cluster ${communityId + 1}`
                );


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


    const activeFilters =
        new Set(
            relationshipTypes
        );


    // ==================================================
    // HELPER:
    // GET LINK REASON
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
            .attr(
                "r",
                function(d) {

                    return (
                        8 +
                        d.degree * 3
                    );

                }
            )
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
            .force(
                "link",
                linkForce
            )
            .force(
                "charge",

                d3.forceManyBody()
                    .strength(-400)
            )
            .force(
                "center",

                d3.forceCenter(
                    width / 2,
                    height / 2
                )
            )
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


            // Move person details to top.

            d3.select(
                "#details-panel"
            )
                .classed(
                    "person-selected",
                    true
                );


            // Hide the default hint.

            d3.select(
                "#person-hint"
            )
                .style(
                    "display",
                    "none"
                );


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


        const activeLinks =
            data.links.filter(
                function(link) {

                    return isLinkActive(
                        link
                    );

                }
            );


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


        linkForce.links(
            activeLinks
        );


        simulation
            .alpha(1)
            .restart();


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


        // Clear person selection.

        resetPersonPanel();

    }


    // ==================================================
    // RESET PERSON PANEL
    // ==================================================

    function resetPersonPanel() {


        d3.select(
            "#person-details"
        )
            .html("");


        d3.select(
            "#person-hint"
        )
            .style(
                "display",
                null
            );


        d3.select(
            "#details-panel"
        )
            .classed(
                "person-selected",
                false
            );

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


            resetPersonPanel();

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