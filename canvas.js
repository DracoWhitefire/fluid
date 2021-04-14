class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 25;
    this.g = 35;
    this.b = 50;

  }

  update() {
    this.randomChange();
  }

  randomChange() {
    const velocity = 32;
    this.r += Math.round((Math.random() - 0.5) * velocity);
    this.r = Math.max(0, this.r);
    this.r = Math.min(255, this.r);
    this.g += Math.round((Math.random() - 0.5) * velocity);
    this.g = Math.max(0, this.g);
    this.g = Math.min(255, this.g);
    this.b += Math.round((Math.random() - 0.5) * velocity);
    this.b = Math.max(0, this.g);
    this.b = Math.min(255, this.g);
  }
}

class Grid {
  constructor(xCellsAmount, yCellsAmount, cellSize) {
    this.xCellsAmount = xCellsAmount;
    this.yCellsAmount = yCellsAmount;
    this.cellSize = cellSize;

    this.cells = [];
    this.index = {};

    for (let i = 0; i < this.xCellsAmount; i++) {
      for (let j = 0; j < this.yCellsAmount; j++) {
        let x = i * this.cellSize;
        let y = j * this.cellSize;
        let cell = new Cell(x, y);
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
  }

  render(cell) {
    cell.update();
    this.c.fillStyle = 'rgb(' + cell.r + ',' + cell.g + ',' + cell.b + ')';
    this.c.fillRect(cell.x, cell.y, this.cellSize - 1, this.cellSize - 1);
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
    const diameter = 1;
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
              cell.r = 255;
              cell.g = 255;
              cell.b = 255;
              cellRenderer.render(cell);
            }
          }
        }
        const cell = grid.getCellForCoordinates(relativeX, relativeY);
        if (cell) {
          cell.r = 255;
          cell.g = 255;
          cell.b = 255;
          cellRenderer.render(cell);
        }

      }
    });

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


gridRenderer.render(grid);
// animate();