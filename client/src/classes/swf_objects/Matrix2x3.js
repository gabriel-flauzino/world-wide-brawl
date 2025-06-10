import { Matrix } from "pixi.js";

export class Matrix2x3 {
    // constantes “estáticas”
    static PRECISE_MULTIPLIER = 65535;
    static DEFAULT_MULTIPLIER = 1024;
    static PRECISE_FLOAT = 0.0009765;
    static TWIP_MULTIPLIER = 20;
  
    constructor(a = 1, b = 0, c = 0, d = 1, x = 0, y = 0) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.x = x;
      this.y = y;
    }
  
    // fábricas parecidas aos construtores Java
    static fromMatrix(m) {
      return new Matrix2x3(m?.a, m?.b, m?.c, m?.d, m?.x, m?.y);
    }
  
    static fromFBMatrix(matrix) {
      const m = new Matrix2x3();
      m.initFromFlatBuffer(matrix);
      return m;
    }
  
    static fromFBShortMatrix(matrix) {
      const m = new Matrix2x3();
      m.initFromFlatBufferShort(matrix);
      return m;
    }
  
    initFromFlatBuffer(matrix) {
      this.a = matrix.a();
      this.b = matrix.b();
      this.c = matrix.c();
      this.d = matrix.d();
      this.x = matrix.x();
      this.y = matrix.y();
    }
  
    initFromFlatBufferShort(matrix) {
      this.a = matrix.a() / Matrix2x3.DEFAULT_MULTIPLIER;
      this.b = matrix.b() / Matrix2x3.DEFAULT_MULTIPLIER;
      this.c = matrix.c() / Matrix2x3.DEFAULT_MULTIPLIER;
      this.d = matrix.d() / Matrix2x3.DEFAULT_MULTIPLIER;
      this.x = matrix.x() / Matrix2x3.TWIP_MULTIPLIER;
      this.y = matrix.y() / Matrix2x3.TWIP_MULTIPLIER;
    }
  
    multiply(m) {
      const a = this.a * m.a + this.b * m.c;
      const b = this.a * m.b + this.b * m.d;
      const c = this.d * m.c + this.c * m.a;
      const d = this.d * m.d + this.c * m.b;
      const x = m.applyX(this.x, this.y);
      const y = m.applyY(this.x, this.y);
  
      this.a = a; this.b = b; this.c = c; this.d = d; this.x = x; this.y = y;
    }
  
    applyX(x, y) {
      return x * this.a + y * this.c + this.x;
    }
  
    applyY(x, y) {
      return y * this.d + x * this.b + this.y;
    }
  
    scaleMultiply(sx, sy) {
      this.a *= sx; this.b *= sy;
      this.c *= sx; this.d *= sy;
    }
  
    setRotation(angleDeg, sx = 1, sy = 1) {
      this.setRotationRadians((angleDeg * Math.PI) / 180, sx, sy);
    }
  
    setRotationRadians(angle, sx = 1, sy = 1) {
      const sin = Math.sin(angle),
            cos = Math.cos(angle);
      this.a = cos * sx;
      this.b = -sin * sy;
      this.c = sin * sx;
      this.d = cos * sy;
    }
  
    rotate(angleDeg) {
      this.rotateRadians((angleDeg * Math.PI) / 180);
    }
  
    rotateRadians(angle) {
      const sin = Math.sin(angle),
            cos = Math.cos(angle);
  
      const tmp00 = this.a * cos + this.b * sin;
      const tmp01 = this.a * -sin + this.b * cos;
      const tmp10 = this.c * cos + this.d * sin;
      const tmp11 = this.c * -sin + this.d * cos;
  
      this.a = tmp00; this.b = tmp01;
      this.c = tmp10; this.d = tmp11;
    }
  
    inverse() {
      const det = this._getDeterminant();
      if (det === 0) return;
      const { a, b, c, d, x, y } = this;
      this.x = (y * c - x * d) / det;
      this.y = (x * b - y * a) / det;
      this.a = d / det;
      this.b = -b / det;
      this.c = -c / det;
      this.d = a / det;
    }
  
    move(x, y) {
      this.x += x; this.y += y;
    }
  
    setXY(x, y) {
      this.x = x; this.y = y;
    }
  
    // getters/setters
    getA() { return this.a; }
    getB() { return this.b; }
    getC() { return this.c; }
    getD() { return this.d; }
    getX() { return this.x; }
    setX(v) { this.x = v; }
    getY() { return this.y; }
    setY(v) { this.y = v; }
  
    equals(o) {
      return (
        o instanceof Matrix2x3 &&
        this.a === o.a && this.b === o.b &&
        this.c === o.c && this.d === o.d &&
        this.x === o.x && this.y === o.y
      );
    }
  
    decompose() {
      const scaleX = Math.hypot(this.a, this.b);
      const theta = Math.atan2(this.b, this.a);
      const sin = Math.sin(theta),
            cos = Math.cos(theta);
      const scaleY = Math.abs(sin) > 0.01 ? this.c / sin : this.d / cos;
      return {
        scaleX,
        scaleY,
        rotationRadians: theta,
        rotationDegrees: theta * (180 / Math.PI),
        x: this.x,
        y: this.y
      };
    }

    toArray() {
      return new Matrix(this.a, this.b, this.c, this.d, this.x, this.y).toArray(true);
    }
  
    // métodos "privados"
    _getDeterminant() {
      return this.d * this.a - this.c * this.b;
    }
  
    _isPrecise() {
      return (
        (this.a !== 0 && Math.abs(this.a) < Matrix2x3.PRECISE_FLOAT) ||
        (this.d !== 0 && Math.abs(this.d) < Matrix2x3.PRECISE_FLOAT) ||
        (this.b !== 0 && Math.abs(this.b) < Matrix2x3.PRECISE_FLOAT) ||
        (this.c !== 0 && Math.abs(this.c) < Matrix2x3.PRECISE_FLOAT)
      );
    }
  }