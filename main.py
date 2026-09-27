

from src.data_loader import load_connections


def main():
    connections = load_connections(
        "data/connections.csv"
    )

    for connection in connections:
        print(connection)


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