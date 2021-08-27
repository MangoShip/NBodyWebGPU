class Point {
    constructor(x, y, index) {
        this.x = x;
        this.y = y;
        this.index = index;
    };
};

class Node {
    constructor(point){
        this.point = point;
    }
}

class QuadTree {
    constructor(topLeftPoint, botRightPoint, node, 
                topLeftTree, topRightTree, botLeftTree, botRightTree ) {
        this.topLeftPoint = topLeftPoint;
        this.botRightPoint = botRightPoint;
        this.node = node;
        this.topLeftTree = topLeftTree;
        this.topRightTree = topRightTree;
        this.botLeftTree = botLeftTree;
        this.botRightTree = botRightTree;
    }
    inBoundary(point) {
        return (point.x >= this.topLeftPoint.x &&
            point.x <= this.botRightPoint.x &&
            point.y >= this.topLeftPoint.y &&
            point.y <= this.botRightPoint.y);
    }
    insert(node) {
        if(node == undefined) {
            return;
        }

        // Check if current quad can contain this node
        if(!this.inBoundary(node.point)) {
            return;
        }

        // At quad of unit area, cannot subdivide anymore
        if(Math.abs(this.topLeftPoint.x - this.botRightPoint.x) <= 1 &&
            Math.abs(this.topLeftPoint.y - this.botRightPoint.y) <= 1) {
            //console.log("Entered");
            if(this.node == undefined) {
                this.node = node;
            }
            return;
        }

        if((this.topLeftPoint.x + this.botRightPoint.x) / 2 >= node.point.x) {
            // Indicates topLeftTree
            if ((this.topLeftPoint.y + this.botRightPoint.y) / 2 >= node.point.y) {
                if (this.topLeftTree == undefined) {
                    this.topLeftTree = new QuadTree(
                        new Point(this.topLeftPoint.x, this.topLeftPoint.y),
                        new Point((this.topLeftPoint.x + this.botRightPoint.x) / 2,
                            (this.topLeftPoint.y + this.botRightPoint.y) / 2));
                }
                this.topLeftTree.insert(node);
            }
            // Indicates botLeftTree
            else {
                if (this.botLeftTree == undefined) {
                    this.botLeftTree = new QuadTree(
                        new Point(this.topLeftPoint.x, (this.topLeftPoint.y + this.botRightPoint.y) / 2),
                        new Point((this.topLeftPoint.x + this.botRightPoint.x) / 2,
                            this.botRightPoint.y));
                }
                this.botLeftTree.insert(node);
            }
        }
        else {
            // Indicates topRightTree
            if ((this.topLeftPoint.y + this.botRightPoint.y) / 2 >= node.point.y) {
                if (this.topRightTree == undefined) {
                    this.topRightTree = new QuadTree(
                        new Point((this.topLeftPoint.x, this.botRightPoint.x) / 2, this.topLeftPoint.y),
                        new Point(this.botRightPoint.x,
                            (this.topLeftPoint.y + this.botRightPoint.y) / 2));
                }
                this.topRightTree.insert(node);
            }
            // Indicates botRightTree
            else {
                if (this.botRightTree == undefined) {
                    this.botRightTree = new QuadTree(
                        new Point((this.topLeftPoint.x + this.botRightPoint.x) / 2, 
                            (this.topLeftPoint.y + this.botRightPoint.y) / 2),
                        new Point(this.botRightPoint.x, this.botRightPoint.y));
                }
                this.botRightTree.insert(node);
            }
        }
    }
    query(range, node) {

    }
};

// Helper function for converting to canvas size position
function convertToCanvas(particlePos, canvasLength) {
    var halfCanvasLength = canvasLength / 2;
    return particlePos * halfCanvasLength + halfCanvasLength;
}

// Helper function for converting back to particlesdata
function convertToParticle(canvasPos, canvasLength) {
    var halfCanvasLength = canvasLength / 2;
    return canvasPos / halfCanvasLength - halfCanvasLength;
}

// Helper function for dot product
const dotProduct = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);

self.onmessage = function(event) {
    // Perform computation at specific start and end index
    var particlesData = new Float32Array(event.data.particlesBuffer);
    var simParams = event.data.simParams;
    var canvasSize = event.data.canvasSize;

    // Create a quadtree
    var quadTree = new QuadTree(new Point(0, 0), new Point(canvasSize[0], canvasSize[1]));

    // Insert particles to quadtree
    for(let i = 0; i < event.data.numParticles; ++i) {
        // Convert particlesData position to canvas size position
        quadTree.insert(new Node(new Point(
            convertToCanvas(particlesData[4 * i], canvasSize[0]), 
            convertToCanvas(particlesData[4 * i + 1], canvasSize[1],
            i))));
    }

    console.log(quadTree);

    // Go through every particle to compute
    for(let i = 0; i < event.data.numParticles; ++i) {

    }

    // Update new particle data

}