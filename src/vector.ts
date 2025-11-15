export class Vector {
    x: number;
    y: number;
    z: number;
    constructor (x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    getZ(): number {
        return this.z;
    }

    sub(v2: Vector): Vector {
        const x2 = v2.getX();
        const y2 = v2.getY();
        const z2 = v2.getZ();

        return new Vector(this.x - x2, this.y - y2, this.z - z2);
    }

    dot(v2: Vector): number {
        const x2 = v2.getX();
        const y2 = v2.getY();
        const z2 = v2.getZ();

        return this.x * x2 + this.y * y2 + this.z * z2;
    }

    norm(): number {
        return Math.sqrt(this.x**2 + this.y**2 + this.z**2)
    }
}

