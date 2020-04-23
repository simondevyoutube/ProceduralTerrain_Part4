import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js';


export const terrain_chunk = (function() {

  class TerrainChunk {
    constructor(params) {
      this._params = params;
      this._Init(params);
    }
    
    Destroy() {
      this._params.group.remove(this._plane);
    }

    Hide() {
      this._plane.visible = false;
    }

    Show() {
      this._plane.visible = true;
    }

    _Init(params) {
      this._geometry = new THREE.BufferGeometry();
      this._plane = new THREE.Mesh(this._geometry, params.material);
      this._plane.castShadow = false;
      this._plane.receiveShadow = true;
      this._params.group.add(this._plane);
    }

    _GenerateHeight(v) {
      return this._params.heightGenerators[0].Get(v.x, v.y, v.z)[0];
    }

    *_Rebuild() {
      const _D = new THREE.Vector3();
      const _D1 = new THREE.Vector3();
      const _D2 = new THREE.Vector3();
      const _P = new THREE.Vector3();
      const _H = new THREE.Vector3();
      const _W = new THREE.Vector3();
      const _C = new THREE.Vector3();
      const _S = new THREE.Vector3();

      const _N = new THREE.Vector3();
      const _N1 = new THREE.Vector3();
      const _N2 = new THREE.Vector3();
      const _N3 = new THREE.Vector3();

      const positions = [];
      const colors = [];
      const normals = [];
      const tangents = [];
      const uvs = [];
      const indices = [];

      const localToWorld = this._params.group.matrix;
      const resolution = this._params.resolution;
      const radius = this._params.radius;
      const offset = this._params.offset;
      const width = this._params.width;
      const half = width / 2;

      for (let x = 0; x < resolution + 1; x++) {
        const xp = width * x / resolution;
        for (let y = 0; y < resolution + 1; y++) {
          const yp = width * y / resolution;

          // Compute position
          _P.set(xp - half, yp - half, radius);
          _P.add(offset);
          _P.normalize();
          _D.copy(_P);
          _P.multiplyScalar(radius);
          _P.z -= radius;

          // Compute a world space position to sample noise
          _W.copy(_P);
          _W.applyMatrix4(localToWorld);

          const height = this._GenerateHeight(_W);
          const color = this._params.colourGenerator.Get(_W.x, _W.y, height);

          // Purturb height along z-vector
          _H.copy(_D);
          _H.multiplyScalar(height);
          _P.add(_H);

          positions.push(_P.x, _P.y, _P.z);
          colors.push(color.r, color.g, color.b);
          normals.push(_D.x, _D.y, _D.z);
          tangents.push(1, 0, 0, 1);
          uvs.push(_P.x / 10, _P.y / 10);
        }
      }
      yield;

      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          indices.push(
              i * (resolution + 1) + j,
              (i + 1) * (resolution + 1) + j + 1,
              i * (resolution + 1) + j + 1);
          indices.push(
              (i + 1) * (resolution + 1) + j,
              (i + 1) * (resolution + 1) + j + 1,
              i * (resolution + 1) + j);
        }
      }
      yield;

      for (let i = 0, n = indices.length; i < n; i+= 3) {
        const i1 = indices[i] * 3;
        const i2 = indices[i+1] * 3;
        const i3 = indices[i+2] * 3;

        _N1.fromArray(positions, i1);
        _N2.fromArray(positions, i2);
        _N3.fromArray(positions, i3);

        _D1.subVectors(_N3, _N2);
        _D2.subVectors(_N1, _N2);
        _D1.cross(_D2);

        normals[i1] += _D1.x;
        normals[i2] += _D1.x;
        normals[i3] += _D1.x;

        normals[i1+1] += _D1.y;
        normals[i2+1] += _D1.y;
        normals[i3+1] += _D1.y;

        normals[i1+2] += _D1.z;
        normals[i2+2] += _D1.z;
        normals[i3+2] += _D1.z;
      }
      yield;

      for (let i = 0, n = normals.length; i < n; i+=3) {
        _N.fromArray(normals, i);
        _N.normalize();
        normals[i] = _N.x;
        normals[i+1] = _N.y;
        normals[i+2] = _N.z;
      }
      yield;

      this._geometry.setAttribute(
          'position', new THREE.Float32BufferAttribute(positions, 3));
      this._geometry.setAttribute(
          'color', new THREE.Float32BufferAttribute(colors, 3));
      this._geometry.setAttribute(
          'normal', new THREE.Float32BufferAttribute(normals, 3));
      this._geometry.setAttribute(
          'tangent', new THREE.Float32BufferAttribute(tangents, 4));
      this._geometry.setAttribute(
          'uv', new THREE.Float32BufferAttribute(uvs, 2));
      this._geometry.setIndex(
          new THREE.BufferAttribute(new Uint32Array(indices), 1));
    }
  }

  return {
    TerrainChunk: TerrainChunk
  }
})();
