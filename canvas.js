class Cell {
  constructor(grid, x, y) {
    this.grid = grid;
    this.x = x;
    this.y = y;

    this.velocityVector = {
      x: 0,
      y: 0,
    };
    this.neutralDensity = 64;

    this.density = this.neutralDensity;
  }

  update() {
    this.velocityVector = this.newVelocityVector;
    this.density = this.newDensity;
  }

  getTopCell() {
    return this.grid.getCellForCoordinates(this.x, this.y - this.grid.cellSize);
  }

  getBottomCell() {
    return this.grid.getCellForCoordinates(this.x, this.y + this.grid.cellSize);
  }

  getLeftCell() {
    return this.grid.getCellForCoordinates(this.x - this.grid.cellSize, this.y);
  }

  getRightCell() {
    return this.grid.getCellForCoordinates(this.x + this.grid.cellSize, this.y);
  }

  diffuse() {
    const densityDiffusionVelocity = Math.random() / 2;
    const velocityVectorDiffusionVelocity = Math.random();

    const topCell = this.getTopCell();
    const bottomCell = this.getBottomCell();
    const leftCell = this.getLeftCell();
    const rightCell = this.getRightCell();

    let count = 1;
    let averageDensity = this.density;
    const averageVelocityVector = {
      x: this.velocityVector.x,
      y: this.velocityVector.y,
    };

    if (topCell) {
      count++;
      averageDensity += topCell.density;
      averageVelocityVector.x += topCell.velocityVector.x;
      averageVelocityVector.y += topCell.velocityVector.y;
    }
    if (bottomCell) {
      count++;
      averageDensity += bottomCell.density;
      averageVelocityVector.x += bottomCell.velocityVector.x;
      averageVelocityVector.y += bottomCell.velocityVector.y;
    }
    if (leftCell) {
      count++;
      averageDensity += leftCell.density;
      averageVelocityVector.x += leftCell.velocityVector.x;
      averageVelocityVector.y += leftCell.velocityVector.y;
    }
    if (rightCell) {
      count++;
      averageDensity += rightCell.density;
      averageVelocityVector.x += rightCell.velocityVector.x;
      averageVelocityVector.y += rightCell.velocityVector.y;
    }

    averageDensity = Math.round(averageDensity / count);
    averageVelocityVector.x = Math.round(averageVelocityVector.x / count);
    averageVelocityVector.y = Math.round(averageVelocityVector.y / count);

    this.newDensity = this.density + (densityDiffusionVelocity * (averageDensity - this.density));

    this.newVelocityVector = {
      x: this.velocityVector.x
        + Math.round(velocityVectorDiffusionVelocity * (averageVelocityVector.x - this.velocityVector.x))
      ,
      y: this.velocityVector.y
        + Math.round(velocityVectorDiffusionVelocity * (averageVelocityVector.y - this.velocityVector.y))
      ,
    }
  }

  advect() {
    this.newVelocityVector = {
      x: this.velocityVector.x,
      y: this.velocityVector.y,
    };
    const targetX = this.x - this.velocityVector.x;
    const targetY = this.y - this.velocityVector.y;
    const targetCell = this.grid.getCellForCoordinates(targetX, targetY);
    if (targetCell) {
      this.newDensity = (this.density + targetCell.density) / 2;
      this.newVelocityVector.x = (targetCell.velocityVector.x + this.velocityVector.x) / 2;
      this.newVelocityVector.y = (targetCell.velocityVector.y + this.velocityVector.y) / 2;
    }

  }


  randomChange() {
    if (Math.random() < this.grid.randomness.chance) {
      return;
    }
    this.density += Math.round((Math.random() - 0.5) * this.grid.randomness.velocity);
    this.density = Math.max(0, this.density);
    this.density = Math.min(255, this.density);
  }

  dissipate() {
    let dissipationFactor = 0.1;
    if (this.density > this.neutralDensity) {
      this.density -= Math.random() * dissipationFactor;
    } else if (this.density < this.neutralDensity) {
      this.density += Math.random() * dissipationFactor;
    }
    if (Math.random() < this.grid.randomness.chance) {
      return;
    }

    if (this.velocityVector.x > 0) {
      this.velocityVector.x -= Math.random() * dissipationFactor;
    } else if (this.velocityVector.x < 0) {
      this.velocityVector.x += Math.random() * dissipationFactor;
    }
    if (this.velocityVector.y > 0) {
      this.velocityVector.y -= Math.random() * dissipationFactor;
    } else if (this.velocityVector.y < 0) {
      this.velocityVector.y += Math.random() * dissipationFactor;
    }
  }
}

class Grid {
  constructor(xCellsAmount, yCellsAmount, cellSize) {
    this.xCellsAmount = xCellsAmount;
    this.yCellsAmount = yCellsAmount;
    this.cellSize = cellSize;
    this.randomness = {
      chance: 0.1,
      velocity: 3,
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
    this.renderVectors = false;
  }

  render(cell) {
    this.c.fillStyle = 'rgb(' + cell.density + ',' + cell.density + ',' + cell.density + ')';
    this.c.fillRect(cell.x, cell.y, this.cellSize - this.trenchSize, this.cellSize - this.trenchSize);

    if (this.renderVectors) {
      const centerX = cell.x + (cell.grid.cellSize / 2);
      const centerY = cell.y + (cell.grid.cellSize / 2);
      this.c.fillStyle = 'red';
      this.c.fillRect(centerX, centerY, 1, 1);
      this.c.beginPath();
      this.c.moveTo(centerX + cell.velocityVector.x, centerY + cell.velocityVector.y);
      this.c.lineTo(centerX, centerY);
      this.c.strokeStyle = 'red';
      this.c.stroke();
    }

  }
}

class GridRenderer {
  constructor() {
    const canvas = document.querySelector('canvas#main');
    this.c = canvas.getContext('2d');
    this.cellRenderer = new CellRenderer(this.c);
  }

  clear() {
    const canvas = document.querySelector('canvas#main');
    this.c.clearRect(0, 0, innerWidth, innerHeight);
  }

  render() {
    const canvas = document.querySelector('canvas#main');


    this.c.clearRect(0, 0, innerWidth, innerHeight);
    this.c.fillStyle = 'rgb(45,55,70)';
    this.c.fillRect(0, 0, this.grid.cellSize * this.grid.xCellsAmount, this.grid.cellSize * this.grid.yCellsAmount);

    const cellRenderer = this.cellRenderer;

    this.cellRenderer.cellSize = this.grid.cellSize;
    this.grid.cells.forEach((cell) => {
      cell.advect();
    });
    this.grid.cells.forEach((cell) => {
      cell.update();
    });
    this.grid.cells.forEach((cell) => {
      cell.diffuse();
    });
    this.grid.cells.forEach((cell) => {
      cell.update();
    });
    this.grid.cells.forEach((cell) => {
      cell.randomChange();
    });
    this.grid.cells.forEach((cell) => {
      cell.dissipate();
    });

    const curlGrid = new Grid(this.grid.xCellsAmount, this.grid.yCellsAmount, this.grid.cellSize);

    this.grid.cells.forEach((cell) => {
      const curlVectorX = {
        x: (cell.getTopCell() ? cell.getTopCell().velocityVector.x : 0)
          - (cell.getBottomCell() ? cell.getBottomCell().velocityVector.x : 0),
        y: (cell.getTopCell() ? cell.getTopCell().velocityVector.y : 0)
          - (cell.getBottomCell() ? cell.getBottomCell().velocityVector.y : 0),
      };


      const curlVectorY = {
        x: (cell.getLeftCell() ? cell.getLeftCell().velocityVector.x : 0)
          - (cell.getRightCell() ? cell.getRightCell().velocityVector.x : 0),
        y: (cell.getLeftCell() ? cell.getLeftCell().velocityVector.y : 0)
          - (cell.getRightCell() ? cell.getRightCell().velocityVector.y : 0),
      };

      curlGrid.getCellForCoordinates(cell.x, cell.y).velocityVector = {
        x: (curlVectorX.x + curlVectorY.x) / 2,
        y: (curlVectorX.y + curlVectorY.y) / 2,
      };
    })
    this.grid.cells.forEach((cell) => {
      let curlCell = curlGrid.getCellForCoordinates(cell.x, cell.y);
      // cell.velocityVector.x -= curlCell.velocityVector.x;
      // cell.velocityVector.y -= curlCell.velocityVector.y;
    })


    this.grid.cells.forEach((cell) => {
      this.cellRenderer.render(cell);
    });
  }
}

const canvas = document.querySelector('canvas#main');


const cellSize = 15;
const gridRenderer = new GridRenderer();

function init(cellSize) {

  canvas.width = Math.min(Math.floor((window.innerWidth - 20) / cellSize) * cellSize, cellSize * 90);
  canvas.height = Math.min(Math.floor(580 / cellSize) * cellSize, cellSize * 40);

  const xCellsAmount = Math.floor(canvas.width / cellSize);
  const yCellsAmount = Math.floor(canvas.height / cellSize);

  return new Grid(xCellsAmount, yCellsAmount, cellSize);
}

gridRenderer.grid = init(cellSize);

function animate() {
  gridRenderer.render();
  requestAnimationFrame(animate);
}

const diameter = 2;
window.addEventListener('mousemove', (e) => {
  if (e.target == canvas) {
    // console.log(e);
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.x - rect.x;
    const relativeY = e.y - rect.y;
    const radius = Math.floor(diameter / 2);
    for (let x = relativeX - (radius * gridRenderer.grid.cellSize); x <= relativeX + (radius * gridRenderer.grid.cellSize); x += gridRenderer.grid.cellSize) {
      for (let y = relativeY - (radius * gridRenderer.grid.cellSize); y <= relativeY + (radius * gridRenderer.grid.cellSize); y += gridRenderer.grid.cellSize) {
        let cell = gridRenderer.grid.getCellForCoordinates(x, y);
        if (cell) {
          cell.density = 255;
          cell.velocityVector.x = e.movementX * 2;
          cell.velocityVector.y = e.movementY * 2;
          gridRenderer.cellRenderer.render(cell);
        }
      }
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
document.querySelector('input#vectors_enabled').addEventListener('change', (e) => {
  if (e.target.checked) {
    gridRenderer.cellRenderer.renderVectors = true;
  } else {
    gridRenderer.cellRenderer.renderVectors = false;
  }
});
document.querySelector('input#cell_size').addEventListener('change', (e) => {
  gridRenderer.grid = init(e.target.value);
  gridRenderer.clear();
  gridRenderer.render();
});

animate();