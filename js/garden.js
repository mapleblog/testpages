// Garden 类 - 用于创建和管理爱心花朵动画
function Garden(ctx, element) {
    this.ctx = ctx;
    this.element = element;
    this.plants = [];
    this.blooms = [];
    this.options = {
        petalCount: {
            min: 8,
            max: 15
        },
        petalStretch: {
            min: 0.1,
            max: 3
        },
        growFactor: {
            min: 0.1,
            max: 1
        },
        bloomRadius: {
            min: 8,
            max: 10
        },
        density: 10,
        growSpeed: 1000 / 60,
        color: {
            rmin: 128,
            rmax: 255,
            gmin: 0,
            gmax: 128,
            bmin: 0,
            bmax: 128,
            opacity: 0.1
        },
        tanAngle: 60
    };
    this.handle = null;
}

Garden.prototype = {
    // 渲染花朵
    render: function() {
        for (var i = 0; i < this.blooms.length; i++) {
            this.blooms[i].draw();
        }
    },
    
    // 添加花朵
    addBloom: function(b) {
        this.blooms.push(b);
    },
    
    // 移除花朵
    removeBloom: function(b) {
        var bloom;
        for (var i = 0; i < this.blooms.length; i++) {
            bloom = this.blooms[i];
            if (bloom === b) {
                this.blooms.splice(i, 1);
                return this;
            }
        }
    },
    
    // 创建随机花朵
    createRandomBloom: function(x, y) {
        this.createBloom(
            x, 
            y, 
            this.randomInt(this.options.petalCount.min, this.options.petalCount.max), 
            this.options.bloomRadius.min + Math.random() * (this.options.bloomRadius.max - this.options.bloomRadius.min), 
            this.randomrgba(
                this.options.color.rmin, 
                this.options.color.rmax, 
                this.options.color.gmin, 
                this.options.color.gmax, 
                this.options.color.bmin, 
                this.options.color.bmax, 
                this.options.color.opacity
            )
        );
    },
    
    // 创建花朵
    createBloom: function(x, y, petalCount, radius, color) {
        var bloom = new Bloom(
            new Vector(x, y), 
            radius, 
            color, 
            petalCount, 
            this
        );
        this.addBloom(bloom);
        return bloom;
    },
    
    // 清除画布
    clear: function() {
        this.blooms = [];
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    },
    
    // 生成随机整数
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // 生成随机RGBA颜色
    randomrgba: function(rmin, rmax, gmin, gmax, bmin, bmax, a) {
        var r = this.randomInt(rmin, rmax);
        var g = this.randomInt(gmin, gmax);
        var b = this.randomInt(bmin, bmax);
        var limit = 5;
        if (Math.abs(r - g) <= limit && Math.abs(g - b) <= limit && Math.abs(b - r) <= limit) {
            return this.randomrgba(rmin, rmax, gmin, gmax, bmin, bmax, a);
        } else {
            return "rgba(" + r + "," + g + "," + b + "," + a + ")";
        }
    }
};

// Vector 类 - 用于处理坐标
function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype = {
    rotate: function(theta) {
        var x = this.x;
        var y = this.y;
        this.x = Math.cos(theta) * x - Math.sin(theta) * y;
        this.y = Math.sin(theta) * x + Math.cos(theta) * y;
        return this;
    },
    
    mult: function(f) {
        this.x *= f;
        this.y *= f;
        return this;
    },
    
    clone: function() {
        return new Vector(this.x, this.y);
    },
    
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    
    subtract: function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    },
    
    set: function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
};

// Petal 类 - 花瓣
function Petal(stretchA, stretchB, startAngle, angle, growFactor, bloom) {
    this.stretchA = stretchA;
    this.stretchB = stretchB;
    this.startAngle = startAngle;
    this.angle = angle;
    this.bloom = bloom;
    this.growFactor = growFactor;
    this.r = 1;
    this.isFinished = false;
}

Petal.prototype = {
    // 绘制花瓣
    draw: function() {
        var ctx = this.bloom.garden.ctx;
        var v1, v2, v3, v4;
        v1 = new Vector(0, this.r).rotate(this.startAngle);
        v2 = v1.clone().rotate(this.angle);
        v3 = v1.clone().mult(this.stretchA);
        v4 = v2.clone().mult(this.stretchB);
        
        ctx.strokeStyle = this.bloom.color.replace("rgba", "rgba");
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.bezierCurveTo(v3.x, v3.y, v4.x, v4.y, v2.x, v2.y);
        ctx.stroke();
    },
    
    // 花瓣生长
    render: function() {
        if (this.r <= this.bloom.r) {
            this.r += this.growFactor; // 花瓣生长速度
            this.draw();
        } else {
            this.isFinished = true;
        }
    }
};

// Bloom 类 - 花朵
function Bloom(p, r, c, pc, garden) {
    this.p = p;
    this.r = r;
    this.c = c;
    this.pc = pc;
    this.petals = [];
    this.garden = garden;
    this.init();
    this.garden.addBloom(this);
}

Bloom.prototype = {
    // 初始化花朵
    init: function() {
        var angle = 360 / this.pc;
        var startAngle = (Math.random() * 360);
        
        for (var i = 0; i < this.pc; i++) {
            var petalStretch = this.garden.options.petalStretch;
            var petalStretchA = this.garden.randomInt(petalStretch.min, petalStretch.max);
            var petalStretchB = this.garden.randomInt(petalStretch.min, petalStretch.max);
            
            var growFactor = this.garden.options.growFactor;
            var petalGrowFactor = this.garden.randomInt(growFactor.min * 100, growFactor.max * 100) / 100;
            
            this.petals.push(
                new Petal(
                    petalStretchA, 
                    petalStretchB, 
                    startAngle + i * angle, 
                    angle, 
                    petalGrowFactor, 
                    this
                )
            );
        }
    },
    
    // 绘制花朵
    draw: function() {
        var isFinished = true;
        this.garden.ctx.save();
        this.garden.ctx.translate(this.p.x, this.p.y);
        
        for (var i = 0; i < this.petals.length; i++) {
            isFinished = isFinished && this.petals[i].isFinished;
            this.petals[i].render();
        }
        
        this.garden.ctx.restore();
        
        if (isFinished) {
            this.garden.removeBloom(this);
        }
    },
    
    // 获取花朵颜色
    get color() {
        return this.c;
    }
};

// 导出Garden类
window.Garden = Garden;