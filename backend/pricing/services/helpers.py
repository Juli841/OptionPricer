def trim(grid, levels):
    """Cut a (n+1)x(n+1) numpy grid down to the real nodes: row i keeps its first i+1 entries.

    Returns plain lists (JSON-ready) for the first `levels` rows.
    """
    return [grid[i, : i + 1].tolist() for i in range(levels)]
