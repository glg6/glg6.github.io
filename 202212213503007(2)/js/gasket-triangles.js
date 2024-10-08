"use strict";

const { vec3 } = glMatrix;

var canvas;
var gl;

var points = [];
var numTimesToSubdivide = 3;

window.onload = function initTriangles() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        alert("WebGL isn't available");
    }

    drawTriangles(numTimesToSubdivide);

    // configure webgl
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // load shaders and initialise attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    initBuffers(program);

    // Add event listener for button
    document.getElementById("updateButton").addEventListener("click", updateTriangles);
};

function initBuffers(program) {
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    // associate shader variables with data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    renderTriangles();
}

function drawTriangles(level) {
    points = []; // Clear previous points
    numTimesToSubdivide = level;

    // Initialize triangle vertices
    var vertices = [
        -1, -1, 0,
         0,  1, 0,
         1, -1, 0
    ];

    var u = vec3.fromValues(vertices[0], vertices[1], vertices[2]);
    var v = vec3.fromValues(vertices[3], vertices[4], vertices[5]);
    var w = vec3.fromValues(vertices[6], vertices[7], vertices[8]);

    divideTriangle(u, v, w, numTimesToSubdivide);
}

function updateTriangles() {
    var level = parseInt(document.getElementById("level").value);
    level = Math.max(0, Math.min(7, level)); // Limit input range to 0-7
    drawTriangles(level);
    initBuffers(gl.getParameter(gl.CURRENT_PROGRAM)); // Reinitialize buffers with new points
}

function triangle(a, b, c) {
    points.push(a[0], a[1], a[2]);
    points.push(b[0], b[1], b[2]);
    points.push(c[0], c[1], c[2]);
}

function divideTriangle(a, b, c, count) {
    if (count === 0) {
        triangle(a, b, c);
    } else {
        var ab = vec3.create();
        vec3.lerp(ab, a, b, 0.5);
        var bc = vec3.create();
        vec3.lerp(bc, b, c, 0.5);
        var ca = vec3.create();
        vec3.lerp(ca, c, a, 0.5);

        divideTriangle(a, ab, ca, count - 1);
        divideTriangle(b, bc, ab, count - 1);
        divideTriangle(c, ca, bc, count - 1);
    }
}

function renderTriangles() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length / 3);
}

