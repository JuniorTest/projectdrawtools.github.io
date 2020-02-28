var DrawTools = function (canvas) {

    /** VARIABLES */

    this.canvas = canvas;

    var renderer;
    var camera;
    var scene;
    var orbitControls;
    var loader;
    var axesHelper;

    // var pointCode = 0;
    var LABELS = [];
    var POINTS = [];
    var LINES = [];
    var FACES = [];

    /** ADD A NEW POINT */

    function createPoint(type, x, y, z) {
        var coor = new THREE.Vector3(x, y, z);
        var pointsTemp = [];
        pointsTemp.push(coor);

        var loader = new THREE.TextureLoader();
        var texture = loader.load(type.toString());

        var pointsMaterial = new THREE.PointsMaterial({
            color: 0x698af1,
            map: texture,
            size: 0.5,
            alphaTest: 0.5
        });

        var pointsGeometry = new THREE.BufferGeometry().setFromPoints(pointsTemp);
        var points = new THREE.Points(pointsGeometry, pointsMaterial);

        return points;

    }

    function loadFont(url) {
        return new Promise((resolve, reject) => {
            loader.load(url.toString(), resolve, undefined, reject);
        });
    }

    async function createLabel(name, position, url, pointCode) {
        var font = await loadFont(url.toString());
        var geometry = new THREE.TextBufferGeometry(name, {
            font: font,
            size: 0.5,
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

        LABELS.push({
            parent: parent,
            name: name,
            pointCode: pointCode,
            coor: {
                X: position.x,
                Y: position.y,
                Z: position.z
            },
        });

        scene.add(parent);
    }

    this.drawPoint = function (name, url, texture, x, y, z) {

        if (x !== '' && y !== '' && z !== ''
            && x != undefined && y != undefined && z != undefined) {

            var pointCode = Math.floor(Math.random() * 100) + 1;

            var pointVal = createPoint(texture, Number(x), Number(y), Number(z));
            var lablePosition = { x: Number(x) - 0.5, y: Number(y), z: Number(z) }
            createLabel(name, lablePosition, url, pointCode);

            POINTS.push({
                pointObj: pointVal,
                code: pointCode,
                pointName: name,
                coordinates: { x: x, y: y, z: z }
            });

            scene.add(pointVal);
        }
    }

    /******************************/

    /** ADD A NEW LINE
     * type = 0: dashed,
     * type = 1: solid // default
     */
    this.drawLine = function (lineName, type = 1) {
        var pointLst = [];
        POINTS.forEach(function (point) {
            for (let i = 0; i < lineName.length; i++) {
                if (lineName[i] === point.pointName) {
                    pointLst.push(point.coordinates);
                }
            }
        });

        var geometry = new THREE.BufferGeometry().setFromPoints(pointLst);
        var material, line;
        if (type === 0) {
            material = new THREE.LineDashedMaterial({
                color: 0x000000,
                dashSize: 0.5,
                gapSize: 0.8
            });

            line = new THREE.LineSegments(geometry, material);
            line.computeLineDistances();

        } else if (type === 1) {
            material = new THREE.LineBasicMaterial({ color: 0x000000 });
            line = new THREE.LineSegments(geometry, material);
            line.computeLineDistances();
        }

        LINES.push({
            lineSegment: line,
            name: lineName
        });

        scene.add(line);
    }
    /*****************************/

    /** ADD NEW FACE */
    this.drawFace = function (faceName) {
        var geometry = new THREE.Geometry();
        var Indexs = [];

        POINTS.forEach(function (point, index) {
            var coor = new THREE.Vector3(point.coordinates.x, point.coordinates.y, point.coordinates.z);
            geometry.vertices.push(coor);
            for (var i = 0; i < faceName.length; i++) {
                if (faceName[i] === point.pointName) {
                    //console.log(i);
                    Indexs.push(index);
                    //console.log(index);
                }
            }
        });

        if (faceName.length > 0) {
            geometry.faces.push(new THREE.Face3(Indexs[0], Indexs[1], Indexs[2]));
        } else {
            geometry.faces = [
                new THREE.Face3(0, 1, 2),
            ];
        }

        var material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true,
            side: THREE.DoubleSide
        });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0);

        FACES.push({
            faceName: faceName,
            faceObj: mesh
        });

        scene.add(mesh);

        console.log('Match Point!');

    }
    /***************************/

    /** REMOVE ALL THING */
    function removePoint(name, code) {
        for (let i = 0; i < POINTS.length; i++) {
            if (POINTS[i].pointName.localeCompare(name) == 0
                && POINTS[i].code == code) {
                scene.remove(POINTS[i].pointObj);
                POINTS.splice(i, 1);
            }
        }
        for (let i = 0; i < LABELS.length; i++) {
            if (LABELS[i].name.localeCompare(name) == 0
                && LABELS[i].pointCode == code) {
                scene.remove(LABELS[i].parent);
                LABELS.splice(i, 1);
            }
        }

    }

    function removeLine(name) {
        for (let i = 0; i < LINES.length; i++) {
            if (LINES[i].name.localeCompare(name) == 0) {
                //console.log(LINES[i].name);
                scene.remove(LINES[i].lineSegment);
                LINES.splice(i, 1);
            }
        }
    }

    function removeFace(name) {
        for (let i = 0; i < FACES.length; i++) {
            if (FACES[i].faceName.localeCompare(name) == 0) {
                //console.log(FACES[i]);
                scene.remove(FACES[i].faceObj);
                FACES.splice(i, 1);
            }
        }
    }

    // code for point default 0
    this.delete = function (name, type, code = 0) {
        /* 0-delete Point 1-delete Line 2-delete Face */
        if (type === 0) {
            scene.dispose();
            removePoint(name, code);
        } else if (type === 1) {
            scene.dispose();
            removeLine(name);
        } else if (type === 2) {
            scene.dispose();
            removeFace(name);
        }

    }

    /*****************************/

    /** RETURN LIST POINT, LINE, FACE */

    this.getPointList = function () {
        return POINTS;
    }

    this.getLineList = function () {
        return LINES;
    }

    this.getFaceList = function () {
        return FACES;
    }

    this.getLabels = function () {
        return LABELS;
    }

    /*************************************/

    /** CREATE CANVAS */

    function resizeRendererToDisplaySize(renderer) {
        this.canvas = renderer.domElement;
        let width = this.canvas.clientWidth;
        let height = this.canvas.clientHeight;
        let needResize = this.canvas.width !== width || this.canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function create3DWindow(objCamera, orbitPos, color = 0xffffff, intensity = 1) {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(color);

        let fov = objCamera.fov || 45;
        let aspect = (this.canvas.width / this.canvas.height) || (16 / 9);
        let near = objCamera.near || 0.1;
        let far = objCamera.far || 1000;

        camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

        let camerPositionX = objCamera.position.x || 0;
        let cameraPositionY = objCamera.position.y || 0;
        let cameraPositionZ = objCamera.position.z || 0;

        camera.position.set(camerPositionX, cameraPositionY, cameraPositionZ);
        camera.lookAt(scene.position);

        // group = new THREE.Group();
        // scene.add(group);

        orbitControls = new THREE.OrbitControls(camera, this.canvas);

        let orbitPosX = orbitPos.x || 0;
        let orbitPosY = orbitPos.y || 0;
        let orbitPosZ = orbitPos.z || 0;

        orbitControls.target.set(orbitPosX, orbitPosY, orbitPosZ);
        orbitControls.update();

        scene.add(new THREE.AmbientLight(color));

        var light = new THREE.PointLight(color, intensity);
        camera.add(light);

        loader = new THREE.FontLoader();

        // axesHelper = new THREE.AxesHelper(5);
        // scene.add(axesHelper);
    }

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            this.canvas = renderer.domElement;
            camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
    }

    function animate() {
        render();
        requestAnimationFrame(animate);
    }

    this.init = function (renderObj) {
        try {
            //canvas = document.querySelector("canvas");
            renderer = new THREE.WebGLRenderer({ antialias: renderObj.antialias || true, canvas: this.canvas });
        } catch (e) {
            //document.body.appendChild("<p>Error. Please check again!<p>")
            console.log('Error');
            return;
        }

        create3DWindow(renderObj.objCamera, renderObj.orbitPos, renderObj.color, renderObj.intensity);
        animate();
    }

    /**************************/

    /** HELPER */

    this.addAxes = function (size = 1) {
        axesHelper = new THREE.AxesHelper(size);
        scene.add(axesHelper);
    }

    this.removeAxes = function () {
        scene.remove(axesHelper);
    }

    this.reset = function () {
        // scene.remove.apply(scene, scene.children);
    }

    /********************************/

};