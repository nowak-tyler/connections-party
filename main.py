import networkx as nx
import matplotlib.pyplot as plt
from pyvis.network import Network

def main():
    # --------------------------------------------------
    # 1. Raw data
    # Each tuple represents one undirected connection.
    # --------------------------------------------------
    connections = [
        ("Tyler", "Alex"),
        ("Tyler", "Ben"),
        ("Alex", "Ben"),
        ("Alex", "Emma"),
        ("Emma", "Sarah"),
        ("Sarah", "Jack"),
    ]

    # --------------------------------------------------
    # 2. Build the NetworkX graph
    # --------------------------------------------------
    G = nx.Graph()
    G.add_edges_from(connections)

    # --------------------------------------------------
    # 3. Calculate degree
    # Degree = number of connections a person has.
    # --------------------------------------------------
    degrees = dict(G.degree())

    # --------------------------------------------------
    # 4. Detect communities / clusters
    # --------------------------------------------------
    communities = nx.community.louvain_communities(
        G,
        seed=42
    )

    # Convert:
    #
    # [
    #     {"Tyler", "Alex", "Ben"},
    #     {"Emma", "Sarah", "Jack"}
    # ]
    #
    # into:
    #
    # {
    #     "Tyler": 0,
    #     "Alex": 0,
    #     ...
    # }

    community_map = {}

    for community_id, community in enumerate(communities):
        for person in community:
            community_map[person] = community_id

    # --------------------------------------------------
    # 5. Add visualization information to each node
    # --------------------------------------------------
    for person in G.nodes():

        # Get everyone this person knows
        neighbors = list(G.neighbors(person))

        # Bigger degree = bigger node
        G.nodes[person]["size"] = degrees[person] * 10

        # PyVis uses "group" to visually distinguish groups
        G.nodes[person]["group"] = community_map[person]

        # Information displayed when hovering
        G.nodes[person]["title"] = (
            f"{person}<br>"
            f"Connections: {degrees[person]}<br>"
            f"Knows: {', '.join(neighbors)}"
        )

    # --------------------------------------------------
    # 6. Create interactive PyVis visualization
    # --------------------------------------------------
    net = Network(
        height="750px",
        width="100%",
        bgcolor="#222222",
        font_color="white"
    )

    # Transfer our NetworkX graph into PyVis
    net.from_nx(G)

    # --------------------------------------------------
    # 7. Generate webpage
    # --------------------------------------------------
    net.write_html("party_graph.html")

    print("Created party_graph.html")


if __name__ == "__main__":
    main()



def add_connection(raw_data):
    party = {}
    for x in raw_data:
        # Creates each person if they do not exist yet
        if x[0] not in party:
            party[x[0]] = set()
        if x[1] not in party:
            party[x[1]] = set()
        # Add person 2 to person 1's set
        party[x[0]].add(x[1])
        party[x[1]].add(x[0])
    return party

def mutual_connections(party_data, person1, person2):
    mutual = party_data[person1] & party_data[person2]
    return mutual

def calculate_degrees(party_data):
    degrees = {}
    for person in party_data:
        degrees[person] = len(party_data[person])

    return degrees


if __name__ == "__main__":
    main()