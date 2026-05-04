import random

BOARD_WIDTH = 6
BOARD_HEIGHT = 13
COLORS = ['R', 'G', 'B', 'Y', 'P']


class Board:
    def __init__(self):
        self.grid = [[None] * BOARD_WIDTH for _ in range(BOARD_HEIGHT)]

    def is_valid(self, col, row):
        return 0 <= col < BOARD_WIDTH and 0 <= row < BOARD_HEIGHT

    def place_puyo(self, col, color):
        for row in range(BOARD_HEIGHT - 1, -1, -1):
            if self.grid[row][col] is None:
                self.grid[row][col] = color
                return True
        return False

    def place_pair(self, col, rotation, pair):
        col = max(0, min(col, BOARD_WIDTH - 1))
        c1, c2 = pair
        if rotation == 0:   # vertical: c1 bottom, c2 top
            return self.place_puyo(col, c1) and self.place_puyo(col, c2)
        elif rotation == 1:  # horizontal: c1 left, c2 right
            col = min(col, BOARD_WIDTH - 2)
            return self.place_puyo(col, c1) and self.place_puyo(col + 1, c2)
        elif rotation == 2:  # vertical: c2 bottom, c1 top
            return self.place_puyo(col, c2) and self.place_puyo(col, c1)
        elif rotation == 3:  # horizontal: c1 right, c2 left
            col = max(col, 1)
            return self.place_puyo(col - 1, c2) and self.place_puyo(col, c1)
        return False

    def find_groups(self):
        visited = [[False] * BOARD_WIDTH for _ in range(BOARD_HEIGHT)]
        groups = []
        for row in range(BOARD_HEIGHT):
            for col in range(BOARD_WIDTH):
                if not self.grid[row][col] or visited[row][col]:
                    continue
                color = self.grid[row][col]
                group = []
                stack = [(row, col)]
                while stack:
                    r, c = stack.pop()
                    if not self.is_valid(c, r) or visited[r][c] or self.grid[r][c] != color:
                        continue
                    visited[r][c] = True
                    group.append((r, c))
                    for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                        stack.append((r + dr, c + dc))
                if len(group) >= 4:
                    groups.append(group)
        return groups

    def apply_gravity(self):
        for col in range(BOARD_WIDTH):
            puyos = [self.grid[row][col] for row in range(BOARD_HEIGHT)
                     if self.grid[row][col] is not None]
            for row in range(BOARD_HEIGHT - 1, -1, -1):
                self.grid[row][col] = puyos.pop() if puyos else None

    def process_chains(self):
        chains = 0
        total_cleared = 0
        while True:
            groups = self.find_groups()
            if not groups:
                break
            total_cleared += sum(len(g) for g in groups)
            for group in groups:
                for row, col in group:
                    self.grid[row][col] = None
            self.apply_gravity()
            chains += 1
        return chains, total_cleared

    def is_game_over(self):
        return any(self.grid[0][col] is not None for col in range(BOARD_WIDTH))

    def to_string(self):
        return '\n'.join(
            ''.join(self.grid[row][col] or '.' for col in range(BOARD_WIDTH))
            for row in range(BOARD_HEIGHT)
        )


def generate_pair():
    return random.choice(COLORS), random.choice(COLORS)
