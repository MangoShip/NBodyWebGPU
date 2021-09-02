class Point {
    constructor(x, y, index) {
        this.x = x;
        this.y = y;
        this.index = index;
    };
};

class QuadTree {
    constructor(topLeftPoint, botRightPoint, point, 
                topLeftTree, topRightTree, botLeftTree, botRightTree ) {
        this.topLeftPoint = topLeftPoint;
        this.botRightPoint = botRightPoint;
        this.centerPoint = new Point((this.topLeftPoint.x + this.botRightPoint.x) / 2,
                                     (this.topLeftPoint.y + this.botRightPoint.y) / 2);
        this.point = point;
        this.containNumPoints = 0;
        this.maxNumPoints = 1;
        this.averagePosition;
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
    subdivide(point) {
        if((this.topLeftPoint.x + this.botRightPoint.x) / 2 >= point.x) {
            // Indicates topLeftTree
            if ((this.topLeftPoint.y + this.botRightPoint.y) / 2 >= point.y) {
                if (this.topLeftTree == undefined) {
                    this.topLeftTree = new QuadTree(
                        new Point(this.topLeftPoint.x, this.topLeftPoint.y),
                        new Point((this.topLeftPoint.x + this.botRightPoint.x) / 2,
                            (this.topLeftPoint.y + this.botRightPoint.y) / 2));
                }
                this.topLeftTree.insert(point);
            }
            // Indicates botLeftTree
            else {
                if (this.botLeftTree == undefined) {
                    this.botLeftTree = new QuadTree(
                        new Point(this.topLeftPoint.x, (this.topLeftPoint.y + this.botRightPoint.y) / 2),
                        new Point((this.topLeftPoint.x + this.botRightPoint.x) / 2,
                            this.botRightPoint.y));
                }
                this.botLeftTree.insert(point);
            }
        }
        else {
            // Indicates topRightTree
            if ((this.topLeftPoint.y + this.botRightPoint.y) / 2 >= point.y) {
                if (this.topRightTree == undefined) {
                    this.topRightTree = new QuadTree(
                        new Point((this.topLeftPoint.x, this.botRightPoint.x) / 2, this.topLeftPoint.y),
                        new Point(this.botRightPoint.x,
                            (this.topLeftPoint.y + this.botRightPoint.y) / 2));
                }
                this.topRightTree.insert(point);
            }
            // Indicates botRightTree
            else {
                if (this.botRightTree == undefined) {
                    this.botRightTree = new QuadTree(
                        new Point((this.topLeftPoint.x + this.botRightPoint.x) / 2, 
                            (this.topLeftPoint.y + this.botRightPoint.y) / 2),
                        new Point(this.botRightPoint.x, this.botRightPoint.y));
                }
                this.botRightTree.insert(point);
            }
        }
    }
    insert(point) {
        if(point == undefined) {
            return;
        }

        // Check if current quad can contain this point
        if(!this.inBoundary(point)) {
            return;
        }

        // If only one point in quadtree
        if(this.containNumPoints < this.maxNumPoints) {
            this.point = point;
            this.averagePosition = new Point(point.x, point.y);
            this.containNumPoints++;
        }
        else { // If more than one point, subdivide
            if(this.point != undefined) {
                this.subdivide(this.point);
                this.point = undefined;
            }
            this.subdivide(point);
            this.containNumPoints++;

            this.averagePosition.x = ((this.averagePosition.x * (this.containNumPoints - 1)) + point.x) / this.containNumPoints;
            this.averagePosition.y = ((this.averagePosition.y * (this.containNumPoints - 1)) + point.y) / this.containNumPoints;
        }
    }
    delete(point) {
        if(point == undefined) {
            return;
        }

        // Check if current quad can contain this point
        if(!this.inBoundary(point)) {
            return;
        }

        this.containNumPoints--;

        if(this.containNumPoints == 0) {
            this.averagePosition.x = 0;
            this.averagePosition.y = 0;
        }
        else {
            this.averagePosition.x = ((this.averagePosition.x * (this.containNumPoints + 1)) - point.x) / this.containNumPoints;
            this.averagePosition.y = ((this.averagePosition.y * (this.containNumPoints + 1)) - point.y) / this.containNumPoints;
        }

        // Recurse through all existing quadrants
        if(this.topLeftTree != undefined) {
            // Look at point of topLeftTree, if identitcal then delete
            if(this.topLeftTree.point != undefined && this.topLeftTree.point == point) {
                this.topLeftTree.point = undefined;
                this.topLeftTree = undefined;
                return;
            }
            else {
                this.topLeftTree.delete(point);
            }
        }
        if(this.topRightTree != undefined) {
            // Look at point of topRightTree, if identitcal then delete
            if(this.topRightTree.point != undefined && this.topRightTree.point == point) {
                this.topRightTree.point = undefined;
                this.topRightTree = undefined;
                return;
            }
            else {
                this.topRightTree.delete(point);
            }
        }
        if(this.botLeftTree != undefined) {
            // Look at point of botLeftTree, if identitcal then delete
            if(this.botLeftTree.point != undefined && this.botLeftTree.point == point) {
                this.botLeftTree.point = undefined;
                this.botLeftTree = undefined;
                return;
            }
            else {
                this.botLeftTree.delete(point);
            }
        }
        if(this.botRightTree != undefined) {
            // Look at point of botRightTree, if identitcal then delete
            if(this.botRightTree.point != undefined && this.botRightTree.point == point) {
                this.botRightTree.point = undefined;
                this.botRightTree = undefined;
                return;
            }
            else {
                this.botRightTree.delete(point);
            }
        }
    }
    query(point, theta, computePointList) { 
        // Don't compute with itself
        if(this.point != undefined && point == this.point) {
            return;
        }
        
        // Get distance between point and quadrant's center point
        var distance = Math.sqrt(Math.pow((point.x - this.centerPoint.x), 2) + 
                                 Math.pow((point.y - this.centerPoint.y), 2));
        var width = this.botRightPoint.x - this.topLeftPoint.x;
        
        if(width/distance > theta) { // Get particle's exact value in that quadrant
            if(this.containNumPoints == 1 && this.point != undefined) {
                if(this.point == undefined) {
                    console.log("Particle = undefined");
                    console.log(this);
                }
                computePointList.push(this.point)
            }
            else {            
                // Recurse through all existing quadrants
                if(this.topLeftTree != undefined) {
                    this.topLeftTree.query(point, theta, computePointList);
                }
                if(this.topRightTree != undefined) {
                    this.topRightTree.query(point, theta, computePointList);
                }
                if(this.botLeftTree != undefined) {
                    this.botLeftTree.query(point, theta, computePointList);
                }
                if(this.botRightTree != undefined) {
                    this.botRightTree.query(point, theta, computePointList);
                }
            }
        } 
        else { // Use average position
            computePointList.push(this.averagePosition)
        }
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
    return (canvasPos - halfCanvasLength) / halfCanvasLength;
}

// Helper function for dot product
const dotProduct = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);

self.onmessage = function(event) {
    // Perform computation at specific start and end index
    var particlesData = new Float32Array(event.data.particlesBuffer);
    var simParams = event.data.simParams;
    var canvasSize = event.data.canvasSize;
    var pointList = [];
    var computePointList = [];

    // Create a quadtree
    var quadTree = new QuadTree(new Point(0, 0), new Point(canvasSize[0], canvasSize[1]));

    // Insert particles to quadtree
    for(let i = 0; i < event.data.numParticles; ++i) {
        // Convert particlesData position to canvas size position
        var point = new Point(
            convertToCanvas(particlesData[4 * i], canvasSize[0]), 
            convertToCanvas(particlesData[4 * i + 1], canvasSize[1]),
            i);
        
        quadTree.insert(point);
        pointList.push(point);
    }

    // Go through every points to compute
    for(let i = 0; i < pointList.length; ++i) {
        var vPos = [particlesData[4 * pointList[i].index + 0], particlesData[4 * pointList[i].index + 1]];
        var vVel = [particlesData[4 * pointList[i].index + 2], particlesData[4 * pointList[i].index + 3]];

        var pos, distance;
        var acc = [0.0, 0.0];

        computePointList = [];
        quadTree.query(pointList[i], event.data.thetaValue, computePointList);

        for(let j = 0; j < computePointList.length; ++j) { // log n 
            pos = [convertToParticle(computePointList[j].x, canvasSize[0]),
                   convertToParticle(computePointList[j].y, canvasSize[1])];

            distance = vPos.map((x, i) => x - pos[i]);

            var x = simParams.r0 / Math.sqrt(dotProduct(distance, distance) + simParams.eps);

            // Molecular force
            var molForce = simParams.eps * (Math.pow(x, 13.0) - Math.pow(x, 7.0));
            var molVec = distance.map((x) => x * molForce);
            acc = acc.map((x, i) => x + molVec[i]);

            // Long-distance gravity force
            var gravForce = simParams.G * (Math.pow(x, 3.0));
            var gravVec = distance.map((x) => x * gravForce);
            acc = acc.map((x, i) => x + gravVec[i]);
        }

        // Update new particle data
        var accTime = acc.map((x) => x * simParams.dt);
        vVel = vVel.map((x, i) => vVel[i] + accTime[i]);

        var velTime = vVel.map((x) => x * simParams.dt);
        vPos = vPos.map((x, i) => vPos[i] + velTime[i]);

        // Reflect if at boundary
        if (vPos[0] < -1.0) { // neg x
            vPos[0] = -1.0 - (vPos[0] + 1.0);
            vVel[0] = vVel[0] * -1.0;
        }
        if (vPos[0] > 1.0) { // pos x
            vPos[0] = 1.0 - (vPos[0] - 1.0);
            vVel[0] = vVel[0] * -1.0;
        }
        if (vPos[1] < -1.0) { // neg y
            vPos[1] = -1.0 - (vPos[1] + 1.0);
            vVel[1] = vVel[1] * -1.0;
        }
        if (vPos[1] > 1.0) { // pos y
            vPos[1] = 1.0 - (vPos[1] - 1.0);
            vVel[1] = vVel[1] * -1.0;
        }

        particlesData[4 * pointList[i].index + 0] = vPos[0]; // posX
        particlesData[4 * pointList[i].index + 1] = vPos[1]; // posY
        particlesData[4 * pointList[i].index + 2] = vVel[0]; // velX
        particlesData[4 * pointList[i].index + 3] = vVel[1]; // velY

        // Update in quadtree 
        quadTree.delete(pointList[i]);

        pointList[i] = new Point(
            convertToCanvas(particlesData[4 * i], canvasSize[0]), 
            convertToCanvas(particlesData[4 * i + 1], canvasSize[1]),
            i);
        quadTree.insert(pointList[i]);


    }

    // Send back data
    postMessage(particlesData);

}