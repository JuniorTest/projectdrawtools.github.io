var canvas, scene, renderer, camera;
var orbitControls;

var group;
var vertices = [];
var loader;

// CREATE FUNCTION //

function addPoint(name, x, y, z) {
    var coor = new THREE.Vector3(x, y, z);

    vertices.push({
        coordinates: coor,
        name: name
    });

    var pointTemp = [];
    vertices.forEach(function (vertice) {
        pointTemp.push(vertice.coordinates);
    });

    var pointsMaterial = new THREE.PointsMaterial({
        color: 0x698af1,
        size: 1,
        alphaTest: 0.5
    });

    var pointsGeometry = new THREE.BufferGeometry().setFromPoints(pointTemp);
    var points = new THREE.Points(pointsGeometry, pointsMaterial);

    addLabel(name, { x: x - 1, y: y, z: z });

    return points;

}

function loadFont(url) {
    return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
    });
}

var labels = [];

async function addLabel(name, position) {
    var font = await loadFont('../resource/fonts/gentilis_regular.typeface.json');
    var geometry = new THREE.TextBufferGeometry(name, {
        font: font,
        size: 0.8,
        height: 0,
        curveSegments: 0
    });

    var material = new THREE.MeshBasicMaterial({ color: 0x698af1 });

    var mesh = new THREE.Mesh(geometry, material);
    geometry.computeBoundingBox();
    geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

    parent = new THREE.Object3D();
    parent.add(mesh);
    parent.position.set(position.x, position.y, position.z);

    labels.push({
        parent: parent,
        name: name,
        coorParentX: position.x,
        coorParentY: position.y,
        coorParentZ: position.z
    });

    scene.add(parent);
}

var pointLst = [];

function showPointOnScreen() {
    var name = document.getElementById("name").value;
    var x = document.getElementById("x").value;
    var y = document.getElementById("y").value;
    var z = document.getElementById("z").value;

    if (x !== '' && y !== '' && z !== ''
        && x != undefined && y != undefined && z != undefined) {
        var pointVal = addPoint(name, Number(x), Number(y), Number(z));
        pointLst.push(pointVal);
        group.add(pointVal);
        //faces.push(name);
    }

    console.log(vertices);
}

function drawFace() {
    var faceStr = document.getElementById("face").value;

    // 3 point

    var geometry = new THREE.Geometry();
    var Indexs = [];

    vertices.forEach(function (vertice, index) {
        geometry.vertices.push(vertice.coordinates);
        // console.log(index);
        for (let i = 0; i < faceStr.length; i++) {
            if (faceStr[i] === vertice.name) {
                Indexs.push(index);
            }
        }
    });

    if (faceStr.length > 0) {
        geometry.faces.push(new THREE.Face3(Indexs[0], Indexs[1], Indexs[2]));
    } else {
        geometry.faces = [
            new THREE.Face3(0, 1, 2),
        ];
    }

    // geometry.faces = [
    //     new THREE.Face3(0,1,2),
    // ];

    var material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        side: THREE.DoubleSide
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);

    scene.add(mesh);

    console.log('match point');

}

function drawShape() {

}

var lines = [];

function drawLine() {
    var linePiece = document.getElementById("line").value;

    //console.log(linePiece[0]);

    var pointsLine = [];

    vertices.forEach(function (vertice) {
        for (let i = 0; i < linePiece.length; i++) {
            if (linePiece[i] === vertice.name) {
                pointsLine.push(vertice.coordinates);
            }
        }
    });

    var geometry = new THREE.BufferGeometry().setFromPoints(pointsLine);

    var dashed = document.getElementById("dashed").checked;
    var solid = document.getElementById("solid").checked;

    var material, line;
    if (dashed === true) {
        material = new THREE.LineDashedMaterial({
            color: 0x000000,
            dashSize: 0.5,
            gapSize: 0.8
        });

        line = new THREE.LineSegments(geometry, material);
        line.computeLineDistances();

    } else if (solid === true) {
        material = new THREE.LineBasicMaterial({ color: 0x000000 });
        line = new THREE.LineSegments(geometry, material);
        line.computeLineDistances();
    } else {
        material = new THREE.LineBasicMaterial({ color: 0x000000 });
        line = new THREE.LineSegments(geometry, material);
        line.computeLineDistances();
    }

    lines.push({
        lineSegment: line, name: linePiece
    });

    scene.add(line);
}

/*****************************/

// REMOVE FUNCTION

function removePoint(name) {

    for (let i = 0; i < vertices.length; i++) {
        if (vertices[i].name.localeCompare(name) == 0) {
            group.remove(pointLst[i]);
            vertices.splice(i, 1);        
        }
    }

    for (let i = 0; i < labels.length; i++) {
        if (labels[i].name.localeCompare(name) == 0) {
            scene.remove(labels[i].parent);
            labels.splice(i, 1);
        }
    }

}

function removeLine(name) {
    //removePoint(name);
    // for(let i = 0; i < name.length; i++) {
    //     removePoint(name[i]);
    // }

    for(let i = 0; i < lines.length; i++) {
        if (lines[i].name.localeCompare(name) == 0) {
            scene.remove(lines[i].lineSegment);
            lines.splice(i, 1);
        }
    }
}

function Remove() {
    var dataRemove = document.getElementById("remove").value;

    var point = document.getElementById("point").checked;
    var line = document.getElementById("lines").checked;

    console.log(line);

    if (point === true) {
        scene.dispose();
        removePoint(dataRemove);
    } else if (line === true) {
        scene.dispose();
        removeLine(dataRemove);
    }

    //scene.dispose();
    //scene.remove.apply(scene, scene.children);

    // console.log(labels[0]);
    // console.log(pointLst[0]);

    // group.remove(pointLst[0]);
    // scene.remove(labels[0].parent);

    //console.log(lines);
    //scene.remove(lines[0]);

    //removeLine(dataRemove);
}
/************************************/

// INIT WINDOW

function create3DWindow() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    let fov = 45;
    let aspect = canvas.width / canvas.height;
    let near = 1;
    let far = 100;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);
    camera.lookAt(scene.position);

    group = new THREE.Group();
    scene.add(group);

    orbitControls = new THREE.OrbitControls(camera, canvas);
    orbitControls.target.set(0, 0, 0);
    orbitControls.update();

    scene.add(new THREE.AmbientLight(0xffffff));

    var light = new THREE.PointLight(0xffffff, 1);
    camera.add(light);

    loader = new THREE.FontLoader();

    // var axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);

}

function init() {
    try {
        canvas = document.querySelector("canvas");
        renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
    } catch (e) {
        document.getElementById("canvas-holder").innerHTML = "<p>Sorry, an error occured</p>";
        return;
    }

    create3DWindow();
    animate();
}

function animate() {
    render();
    requestAnimationFrame(animate);
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function render() {
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
}

window.onload = init;

/************************************/
