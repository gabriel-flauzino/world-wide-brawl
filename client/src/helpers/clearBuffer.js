/**
 * Clears a uint8array for optimizing memory usage.
 * @param {Uint8Array} buffer 
 */
export function clearBuffer(buffer) {
    for (let i = 0; i < buffer.length; i++) {
        buffer[i] = null;
    }
}