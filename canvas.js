class Cell {
  constructor(grid, x, y) {
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.density = 128;
  }

  update() {
    this.diffuse();
    this.randomChange();
  }

  diffuse() {
    const velocity = Math.random()
    const topCell = this.grid.getCellForCoordinates(this.x, this.y - this.grid.cellSize);
    const bottomCell = this.grid.getCellForCoordinates(this.x, this.y + this.grid.cellSize);
    const leftCell = this.grid.getCellForCoordinates(this.x - this.grid.cellSize, this.y);
    const rightCell = this.grid.getCellForCoordinates(this.x + this.grid.cellSize, this.y);

    let count = 1;
    let averageDensity = this.density;

    if (topCell) {
      count++;
      averageDensity += topCell.density;
    }
    if (bottomCell) {
      count++;
      averageDensity += bottomCell.density;
    }
    if (leftCell) {
      count++;
      averageDensity += leftCell.density;
    }
    if (rightCell) {
      count++;
      averageDensity += rightCell.density;
    }

    averageDensity = Math.round(averageDensity / count);

    this.density += velocity * (averageDensity - this.density);
  }

  randomChange() {
    if (Math.random() > this.grid.randomness.chance) {
      return;
    }
    this.density += Math.round((Math.random() - 0.5) * this.grid.randomness.velocity);
    this.density = Math.max(0, this.density);
    this.density = Math.min(255, this.density);
  }
}

class Grid {
  constructor(xCellsAmount, yCellsAmount, cellSize) {
    this.xCellsAmount = xCellsAmount;
    this.yCellsAmount = yCellsAmount;
    this.cellSize = cellSize;
    this.randomness = {
      chance: 0.1,
      velocity: 5,
    }

    this.cells = [];
    this.index = {};

    for (let i = 0; i < this.xCellsAmount; i++) {
      for (let j = 0; j < this.yCellsAmount; j++) {
        let x = i * this.cellSize;
        let y = j * this.cellSize;
        let cell = new Cell(this, x, y);
        this.cells.push(cell);
        if (x in this.index === false) {
          this.index[x] = {};
        }
        this.index[x][y] = cell;
      }
    }
  }

  getCellForCoordinates(x, y) {
    const coords = this.getCellCoordinates(x, y);
    if (coords.x in this.index !== false) {
      if (coords.y in this.index[coords.x] !== false) {
        return this.index[coords.x][coords.y];
      }
    }
  }

  getCellCoordinates(x, y) {
    return {
      x: Math.floor(x / this.cellSize) * this.cellSize,
      y: Math.floor(y / this.cellSize) * this.cellSize,
    };
  }
}

class CellRenderer {
  constructor(c) {
    this.c = c;
    this.trenchSize = 0;
  }

  render(cell) {
    cell.update();

    this.c.fillStyle = 'rgb(' + cell.density + ',' + cell.density + ',' + cell.density + ')';
    this.c.fillRect(cell.x, cell.y, this.cellSize - this.trenchSize, this.cellSize - this.trenchSize);
  }
}

class GridRenderer {
  constructor() {
    const canvas = document.querySelector('canvas#main');
    this.c = canvas.getContext('2d');
    this.cellRenderer = new CellRenderer(this.c);
  }

  render(grid) {
    const canvas = document.querySelector('canvas#main');


    this.c.clearRect(0, 0, innerWidth, innerHeight);
    this.c.fillStyle = 'rgb(45,55,70)';
    this.c.fillRect(0, 0, grid.cellSize * grid.xCellsAmount, grid.cellSize * grid.yCellsAmount);

    const cellRenderer = this.cellRenderer;

    this.cellRenderer.cellSize = grid.cellSize;
    grid.cells.forEach((cell) => {
      this.cellRenderer.render(cell);
    });
  }
}

const canvas = document.querySelector('canvas#main');


canvas.width = Math.min(window.innerWidth - 20, 1000);
canvas.height = Math.min(window.innerHeight - 20, 600);

const cellSize = 5;

const xCellsAmount = Math.floor(canvas.width / cellSize);
const yCellsAmount = Math.floor(canvas.height / cellSize);

const grid = new Grid(xCellsAmount, yCellsAmount, cellSize);
const gridRenderer = new GridRenderer();

function animate() {
  gridRenderer.render(grid);
  requestAnimationFrame(animate);
}
const diameter = 2;
window.addEventListener('mousemove', (e) => {
  if (e.target == canvas) {
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.x - rect.x;
    const relativeY = e.y - rect.y;
    const radius = Math.floor(diameter/2);
    for (let x = relativeX - (radius * grid.cellSize); x <= relativeX + (radius * grid.cellSize); x += grid.cellSize) {
      for (let y = relativeY - (radius * grid.cellSize); y <= relativeY + (radius * grid.cellSize); y += grid.cellSize) {
        let cell = grid.getCellForCoordinates(x, y);
        if (cell) {
          cell.density = 255;
          gridRenderer.cellRenderer.render(cell);
        }
      }
    }
    const cell = grid.getCellForCoordinates(relativeX, relativeY);
    if (cell) {
      cell.r = 255;
      cell.g = 255;
      cell.b = 255;
      gridRenderer.cellRenderer.render(cell);
    }
  }
});
document.querySelector('input#grid_enabled').addEventListener('change', (e) => {
  if (e.target.checked) {
    gridRenderer.cellRenderer.trenchSize = 1;
  } else {
    gridRenderer.cellRenderer.trenchSize = 0;
  }

});

// gridRenderer.render(grid);
animate();