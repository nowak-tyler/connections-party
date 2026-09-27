import networkx as nx


def build_graph(connections):
    G = nx.Graph()

    for connection in connections:
        person1 = connection["person1"]
        person2 = connection["person2"]
        reason = connection["reason"]

        G.add_edge(
            person1,
            person2,
            reason=reason
        )

    return G

def calculate_degrees(G):
    return dict(G.degree())


def detect_communities(G):
    return nx.community.louvain_communities(
        G,
        seed=42
    )


def create_community_map(communities):
    community_map = {}

    for community_id, community in enumerate(communities):
        for person in community:
            community_map[person] = community_id

    return community_map