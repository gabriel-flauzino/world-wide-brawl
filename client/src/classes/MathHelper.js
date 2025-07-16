export class MathHelper {
    static clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    static mod(n, m) {
        return ((n % m) + m) % m;
    }
}