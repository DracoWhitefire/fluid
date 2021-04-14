class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 200;
    this.g = 200;
    this.b = 200;
  }

  update() {
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
    for (let i = 0; i < this.xCellsAmount; i++) {
      for (let j = 0; j < this.yCellsAmount; j++) {
        this.cells.push(new Cell(i * this.cellSize, j * this.cellSize));
      }
    }
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
    const cellRenderer = this.cellRenderer;
    window.addEventListener('mousemove', (e) => {
      if (e.target == canvas) {
        const rect = canvas.getBoundingClientRect();
        const relativeX = e.x - rect.x;
        const relativeY = e.y - rect.y;
        const cells = grid.cells.filter((cell) => {
          // return cell.x == Math.floor(relativeX / grid.cellSize) * grid.cellSize
          //   && cell.y == Math.floor(relativeY / grid.cellSize) * grid.cellSize;
          return cell.x - relativeX < 5 && cell.x - relativeX > -5
          && cell.y - relativeY < 5 && cell.y - relativeY > -5;
        });
        if (cells.length) {
          cells.forEach(function (cell) {
            cell.r = 255;
            cell.g = 255;
            cell.b = 255;
            cellRenderer.render(cell);
          })

        }
      }
    });

    this.c.clearRect(0, 0, innerWidth, innerHeight);
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